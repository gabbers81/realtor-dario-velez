import "./env.js";
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { body, validationResult } from "express-validator";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Trust proxy for rate limiting in production environments
app.set('trust proxy', 1);

// Force HTTP/1.1 for large file compatibility in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // Disable HTTP/2 server push and force HTTP/1.1 behavior
    res.set({
      'Connection': 'keep-alive',
      'HTTP2-Settings': undefined, // Remove HTTP/2 settings
      'Upgrade': undefined, // Prevent protocol upgrades
    });
    next();
  });
  log('🔧 Configured server for HTTP/1.1 compatibility in production');
}

// Security middleware - more permissive in development
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      objectSrc: ["'self'"], // Allow PDF objects
      frameSrc: ["'self'", "https://calendly.com"],
      childSrc: ["'self'"], // Allow PDF embedding in iframes
      mediaSrc: ["'self'"], // Allow PDF media content
    }
  } : false, // Disable CSP in development for Vite
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false // Disable HSTS in development
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://dariovelez.com.do', 'https://*.replit.app', 'https://*.repl.co'] 
    : ['http://localhost:5000', 'http://127.0.0.1:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - more permissive for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 200 : 1000, // More permissive in development
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for static assets in development
    if (process.env.NODE_ENV === 'development') {
      return req.path.startsWith('/@') || req.path.includes('node_modules') || req.path.includes('.js') || req.path.includes('.css');
    }
    return false;
  }
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 contact submissions per hour
  message: {
    error: 'Too many contact submissions, please try again later.'
  }
});

// Only apply general rate limiting to API routes, not static assets or PDFs
app.use('/api', limiter);
app.use('/api/contacts', contactLimiter);

// Skip rate limiting for PDF requests entirely
app.use('/pdfs', (req, res, next) => {
  // Bypass all rate limiting for PDF requests
  next();
});

// Compression middleware for better performance - exclude PDFs
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    // Never compress PDFs as they're already compressed and it causes issues with large files
    if (req.path.startsWith('/pdfs/') || req.path.endsWith('.pdf')) {
      return false;
    }
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Serve PDFs with proper headers for iframe embedding and caching
// Use correct path based on environment
const pdfPath = process.env.NODE_ENV === 'production' 
  ? 'dist/public/pdfs'  // Production: serve from build directory
  : 'client/public/pdfs';  // Development: serve from source directory

// Production logging for PDF path verification
if (process.env.NODE_ENV === 'production') {
  log(`PDF serving configured from: ${pdfPath}`);
}

// Enhanced PDF serving with streaming support for large files
app.get('/pdfs/:filename', async (req, res) => {
  const filename = req.params.filename;
  const filePath = `${pdfPath}/${filename}`;
  
  try {
    // Check if file exists and get stats
    const fs = await import('fs');
    const path = await import('path');
    
    if (!fs.existsSync(filePath)) {
      console.error(`PDF not found: ${filePath}`);
      return res.status(404).json({ error: 'PDF not found' });
    }
    
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    const fileSizeMB = Math.round(fileSize / 1024 / 1024);
    
    // Production logging for large files
    if (process.env.NODE_ENV === 'production') {
      log(`Serving PDF: ${filename} (${fileSizeMB}MB)`);
    }
    
    // Set headers for PDF serving with CDN optimization overrides
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Last-Modified', stats.mtime.toUTCString());
    res.setHeader('ETag', `"${stats.size}-${stats.mtime.getTime()}"`);
    
    // For large files in production, use different caching and connection strategies
    if (fileSizeMB > 30 && process.env.NODE_ENV === 'production') {
      // Disable CDN optimizations that cause issues with large files
      res.setHeader('Cache-Control', 'no-transform, max-age=3600'); // Shorter cache, no transform
      res.setHeader('Connection', 'keep-alive'); // Force persistent connection
      res.setHeader('Transfer-Encoding', 'chunked'); // Force chunked encoding
      res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering
      res.setHeader('X-Sendfile-Type', 'X-Accel-Redirect'); // Bypass proxy for large files
      log(`Large PDF optimization headers set for ${filename} (${fileSizeMB}MB)`);
    } else {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable'); // 7 days for smaller files
    }
    
    // Handle range requests for large files
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', chunkSize);
      
      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
    } else {
      // Production-safe PDF serving with streaming for large files
      if (process.env.NODE_ENV === 'production') {
        log(`Production PDF request: ${filename} (${fileSizeMB}MB)`);
      }
      
      // For large files (>30MB), always use streaming to avoid memory issues
      if (fileSizeMB > 30) {
        if (process.env.NODE_ENV === 'production') {
          log(`Large PDF detected (${fileSizeMB}MB), using streaming approach`);
        }
        
        // Create read stream with smaller chunk size for better HTTP/2 compatibility
        const stream = fs.createReadStream(filePath, {
          highWaterMark: 64 * 1024 // 64KB chunks for HTTP/2 compatibility
        });
        
        // Handle stream errors
        stream.on('error', (streamError: any) => {
          console.error(`Stream error for PDF ${filename}:`, streamError.message);
          if (!res.headersSent) {
            res.status(500).json({ 
              error: 'PDF streaming failed',
              details: process.env.NODE_ENV === 'development' ? streamError.message : 'Internal server error'
            });
          }
        });
        
        // Pipe the stream to response
        stream.pipe(res);
        
        stream.on('end', () => {
          if (process.env.NODE_ENV === 'production') {
            log(`Successfully streamed large PDF: ${filename}`);
          }
        });
      } else {
        // For smaller files, use sendFile for simplicity
        res.sendFile(path.resolve(filePath), (sendError) => {
          if (sendError) {
            console.error(`Error sending PDF ${filename}:`, sendError.message);
            if (!res.headersSent) {
              res.status(500).json({ 
                error: 'PDF serving failed',
                details: process.env.NODE_ENV === 'development' ? sendError.message : 'Internal server error'
              });
            }
          } else {
            if (process.env.NODE_ENV === 'production') {
              log(`Successfully served PDF: ${filename}`);
            }
          }
        });
      }
    }
    
  } catch (error: any) {
    console.error(`Error serving PDF ${filename}:`, error.message);
    res.status(500).json({ 
      error: 'Internal server error serving PDF',
      message: process.env.NODE_ENV === 'development' ? error.message : 'PDF serving failed'
    });
  }
});

// Fallback static serving for any remaining static files
app.use('/pdfs', express.static(pdfPath, {
  maxAge: '7d',
  etag: true,
  lastModified: true
}));

// Serve assets with aggressive caching
app.use('/assets', express.static('client/public/assets', {
  maxAge: '30d', // 30 days cache for assets
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(path);
    if (isImage) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable'); // 30 days
    }
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use port 3000 for local development, 5000 for production
  const port = process.env.PORT || (process.env.NODE_ENV === 'production' ? 5000 : 3000);
  server.listen(port, () => {
    log(`serving on http://localhost:${port}`);
  });
})();
