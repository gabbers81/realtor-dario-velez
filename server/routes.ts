import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

// Calendly webhook data types
interface CalendlyWebhookPayload {
  created_at: string;
  created_by: string;
  event: string;
  payload: {
    event_type: {
      uuid: string;
      name: string;
    };
    event: {
      uuid: string;
      start_time: string;
      end_time: string;
    };
    invitee: {
      uuid: string;
      email: string;
      name: string;
      first_name: string;
      last_name: string;
    };
  };
}

// Verify Calendly v2 webhook signature
function verifyWebhookSignature(payload: string, signature: string, signingKey: string): boolean {
  try {
    // Calendly v2 format: "t=1720258074,s=6f7e9..."
    const parts = signature.split(',');
    if (parts.length !== 2) {
      console.log('Invalid signature format, expected t=timestamp,s=signature');
      return false;
    }
    
    const [timePart, sigPart] = parts;
    const timestamp = timePart.split('=')[1];
    const suppliedSignature = sigPart.split('=')[1];
    
    if (!timestamp || !suppliedSignature) {
      console.log('Missing timestamp or signature in header');
      return false;
    }
    
    // Calendly v2 signs: "timestamp.JSON_PAYLOAD"
    const baseString = `${timestamp}.${payload}`;
    const expectedSignature = crypto
      .createHmac('sha256', signingKey)
      .update(baseString, 'utf8')
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(suppliedSignature)
    );
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.status(200).json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      service: "dominican-real-estate-api"
    });
  });

  // Sitemap XML endpoint with multilingual support
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const projects = await storage.getProjects();
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://dariovelez.com.do' 
        : 'http://localhost:5000';
      
      const languages = ['es', 'en', 'ru', 'fr', 'de', 'pt'];
      const currentDate = new Date().toISOString();

      let urls = '';

      // Add home page for each language
      languages.forEach(lang => {
        const langUrl = lang === 'es' ? baseUrl : `${baseUrl}/${lang}`;
        urls += `
  <url>
    <loc>${langUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${lang === 'es' ? '1.0' : '0.9'}</priority>
  </url>`;
      });

      // Add project pages for each language
      projects.forEach(project => {
        languages.forEach(lang => {
          const langPrefix = lang === 'es' ? '' : `/${lang}`;
          const projectUrl = `${baseUrl}${langPrefix}/proyecto/${project.slug}`;
          urls += `
  <url>
    <loc>${projectUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${lang === 'es' ? '0.8' : '0.7'}</priority>
  </url>`;
        });
      });

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;

      res.header('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      res.status(500).send('Error generating sitemap');
    }
  });

  // Robots.txt endpoint
  app.get("/robots.txt", (_req, res) => {
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${process.env.NODE_ENV === 'production' 
  ? 'https://dariovelez.com.do' 
  : 'http://localhost:5000'}/sitemap.xml`;

    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  // Test endpoint to verify API is working
  app.get("/api/test", async (_req, res) => {
    console.log('🧪 Test endpoint called');
    res.json({ 
      status: "API working", 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      hasDB: !!process.env.DATABASE_URL
    });
  });

  // Comprehensive production diagnostics endpoint
  app.get("/api/diagnostics", async (_req, res) => {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      status: "unknown" as string,
      database: {
        connection: "unknown" as string,
        url_present: !!process.env.DATABASE_URL,
        url_format: process.env.DATABASE_URL ? "valid" : "missing" as string,
        host: process.env.DATABASE_URL?.match(/@([^:]+)/)?.[1] || "unknown",
        ssl_config: process.env.NODE_ENV === 'production' ? "require" : "prefer",
        projects_test: null as any,
        contacts_test: null as any,
        rls_info: null as any
      },
      errors: [] as any[]
    };

    // Test database URL format
    if (process.env.DATABASE_URL) {
      const urlMatch = process.env.DATABASE_URL.match(/^postgresql:\/\/([^:]+):([^@]+)@(.+)$/);
      diagnostics.database.url_format = urlMatch ? "valid_postgresql" : "invalid_format";
      
      // Check if using transaction pooler (recommended for production)
      const isTransactionPooler = process.env.DATABASE_URL.includes(':5432');
      diagnostics.database.rls_info = {
        using_transaction_pooler: isTransactionPooler,
        recommended: isTransactionPooler ? "✅" : "⚠️ Consider using transaction pooler for RLS compatibility"
      };
    }

    // Test projects API
    try {
      console.log('🔍 Testing projects API...');
      const projects = await storage.getProjects();
      diagnostics.database.projects_test = {
        status: "success",
        count: projects.length,
        sample: projects[0]?.title || "no_projects",
        has_data: projects.length > 0
      };
      console.log(`✅ Projects test: ${projects.length} projects found`);
    } catch (error: any) {
      console.error('❌ Projects API failed:', error);
      diagnostics.database.projects_test = {
        status: "failed",
        error: error.message,
        code: error.code,
        errno: error.errno,
        name: error.name,
        is_rls_error: error.message?.includes('policy') || error.message?.includes('permission'),
        is_connection_error: error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED'
      };
      diagnostics.errors.push({
        type: "projects_api",
        message: error.message,
        code: error.code,
        errno: error.errno,
        potential_cause: error.message?.includes('policy') ? "RLS_POLICY" : 
                        error.code === 'ENOTFOUND' ? "DNS_RESOLUTION" :
                        error.code === 'ECONNREFUSED' ? "CONNECTION_REFUSED" : "UNKNOWN"
      });
    }

    // Test contacts API
    try {
      console.log('🔍 Testing contacts API...');
      const contacts = await storage.getContacts();
      diagnostics.database.contacts_test = {
        status: "success",
        count: contacts.length,
        has_data: contacts.length > 0
      };
      console.log(`✅ Contacts test: ${contacts.length} contacts found`);
    } catch (error: any) {
      console.error('❌ Contacts API failed:', error);
      diagnostics.database.contacts_test = {
        status: "failed",
        error: error.message,
        code: error.code,
        is_rls_error: error.message?.includes('policy') || error.message?.includes('permission'),
        is_connection_error: error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED'
      };
      diagnostics.errors.push({
        type: "contacts_api",
        message: error.message,
        code: error.code,
        potential_cause: error.message?.includes('policy') ? "RLS_POLICY" : 
                        error.code === 'ENOTFOUND' ? "DNS_RESOLUTION" :
                        error.code === 'ECONNREFUSED' ? "CONNECTION_REFUSED" : "UNKNOWN"
      });
    }

    // Determine overall status
    diagnostics.status = diagnostics.errors.length === 0 ? "healthy" : "unhealthy";
    diagnostics.database.connection = diagnostics.errors.length === 0 ? "success" : "failed";

    // Add production-specific recommendations
    if (process.env.NODE_ENV === 'production' && diagnostics.errors.length > 0) {
      const rlsErrors = diagnostics.errors.filter(e => e.potential_cause === "RLS_POLICY");
      const connectionErrors = diagnostics.errors.filter(e => e.potential_cause === "DNS_RESOLUTION" || e.potential_cause === "CONNECTION_REFUSED");
      
      if (rlsErrors.length > 0) {
        diagnostics.database.rls_info.issue = "RLS policies may be blocking access. Check Supabase RLS settings.";
      }
      if (connectionErrors.length > 0) {
        diagnostics.database.rls_info.issue = "Network connectivity issues. Check database URL and SSL configuration.";
      }
    }

    if (diagnostics.status === "healthy") {
      res.json(diagnostics);
    } else {
      res.status(503).json(diagnostics);
    }
  });

  // Production readiness endpoint
  app.get("/api/production-readiness", async (_req, res) => {
    try {
      const readiness = storage.getProductionReadiness();
      const environment = {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_present: !!process.env.DATABASE_URL,
        CORS_domains: process.env.NODE_ENV === 'production' 
          ? ['https://dariovelez.com.do', 'https://*.replit.app', 'https://*.repl.co']
          : ['http://localhost:5000', 'http://127.0.0.1:5000']
      };

      const productionIssues = [];
      
      // Check for production-specific issues
      if (process.env.NODE_ENV === 'production') {
        if (!readiness.rls_compatible) {
          productionIssues.push({
            type: 'RLS_COMPATIBILITY',
            severity: 'HIGH',
            issue: 'Database connection may not support RLS policies properly',
            solution: 'Switch to transaction pooler connection string (port 5432)'
          });
        }
        
        if (!environment.DATABASE_URL_present) {
          productionIssues.push({
            type: 'MISSING_DATABASE_URL',
            severity: 'CRITICAL',
            issue: 'DATABASE_URL environment variable not set',
            solution: 'Configure DATABASE_URL in production environment'
          });
        }
      }

      const response = {
        timestamp: new Date().toISOString(),
        environment: environment.NODE_ENV,
        readiness: readiness,
        production_issues: productionIssues,
        deployment_recommendations: [
          'Ensure DATABASE_URL uses transaction pooler (port 5432) for RLS compatibility',
          'Verify RLS policies allow appropriate access for your application role',
          'Test all API endpoints in production environment before going live',
          'Monitor database connection logs for RLS policy errors',
          'Use https://dariovelez.com.do domain for CORS origin in production'
        ]
      };

      if (productionIssues.length > 0) {
        res.status(422).json(response);
      } else {
        res.json(response);
      }
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to assess production readiness',
        message: error.message
      });
    }
  });

  // Get all projects
  app.get("/api/projects", async (_req, res) => {
    try {
      // Add caching headers for API responses
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // 1 hour
      res.setHeader('ETag', `"projects-${Date.now()}"`);
      
      console.log('🔍 API: Fetching projects...');
      const projects = await storage.getProjects();
      console.log(`✅ API: Successfully retrieved ${projects.length} projects`);
      res.json(projects);
    } catch (error: any) {
      console.error('❌ API Error - fetching projects:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        stack: error.stack?.split('\n').slice(0, 3).join('\n'), // First 3 lines of stack
        environment: {
          DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
          SUPABASE_URL: process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing',
          SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
          NODE_ENV: process.env.NODE_ENV
        }
      });
      
      // Production-specific error handling with RLS awareness
      if (process.env.NODE_ENV === 'production') {
        // RLS Policy Errors
        if (error?.message?.includes('policy') || error?.message?.includes('permission') || 
            error?.message?.includes('access') || error?.message?.includes('denied')) {
          console.error('🔒 RLS Policy blocking access');
          res.status(503).json({ 
            message: "Access denied by security policy", 
            details: "Row Level Security (RLS) policies may be blocking data access.",
            error_code: "RLS_POLICY_ERROR",
            suggestion: "Check Supabase RLS policies for projects table or use transaction pooler connection string."
          });
        }
        // Network/Connection Errors
        else if (error?.code === 'ENOTFOUND' || error?.errno === -3007) {
          console.error('🔌 Production DNS/Network issue');
          res.status(503).json({ 
            message: "Service temporarily unavailable", 
            details: "Database connection failed - DNS or network issue.",
            error_code: "NETWORK_ERROR",
            suggestion: "Verify Supabase database URL and network connectivity."
          });
        }
        // Connection Refused
        else if (error?.code === 'ECONNREFUSED' || error?.errno === -3008) {
          console.error('🔌 Production connection refused');
          res.status(503).json({ 
            message: "Service temporarily unavailable", 
            details: "Database server refused connection.",
            error_code: "CONNECTION_REFUSED",
            suggestion: "Check Supabase database status and credentials."
          });
        }
        // SSL/TLS Errors
        else if (error?.message?.includes('SSL') || error?.message?.includes('ssl') || 
                 error?.message?.includes('TLS') || error?.message?.includes('certificate')) {
          console.error('🔒 Production SSL issue');
          res.status(503).json({ 
            message: "Service temporarily unavailable", 
            details: "SSL/TLS connection issue with database.",
            error_code: "SSL_ERROR",
            suggestion: "Verify SSL configuration and certificate validity."
          });
        }
        // Table/Schema Errors
        else if (error?.message?.includes('relation') || error?.message?.includes('table') || 
                 error?.message?.includes('does not exist')) {
          console.error('📋 Production schema issue');
          res.status(503).json({ 
            message: "Service temporarily unavailable", 
            details: "Database schema or table access issue.",
            error_code: "SCHEMA_ERROR",
            suggestion: "Verify projects table exists and is accessible in production database."
          });
        }
        // Authentication/Authorization Errors
        else if (error?.message?.includes('authentication') || error?.message?.includes('password') || 
                 error?.message?.includes('credentials')) {
          console.error('🔐 Production authentication issue');
          res.status(503).json({ 
            message: "Service temporarily unavailable", 
            details: "Database authentication failed.",
            error_code: "AUTH_ERROR",
            suggestion: "Verify DATABASE_URL credentials in production environment."
          });
        }
        // Generic Production Error
        else {
          console.error('❓ Production unknown database error');
          res.status(503).json({ 
            message: "Service temporarily unavailable", 
            details: "An unexpected database error occurred.",
            error_code: "DATABASE_ERROR",
            suggestion: "Check production database configuration and connectivity."
          });
        }
      } else {
        // Development detailed error response
        res.status(500).json({ 
          message: "Error fetching projects", 
          error: error.message,
          code: error.code,
          errno: error.errno,
          stack: error.stack?.split('\n').slice(0, 5)
        });
      }
    }
  });

  // Get single project by ID
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Error fetching project" });
    }
  });

  // Get single project by slug
  app.get("/api/project/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      
      const project = await storage.getProjectBySlug(slug);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Error fetching project" });
    }
  });

  // Create contact
  app.post("/api/contacts", async (req, res) => {
    try {
      // Transform and validate required fields
      if (!req.body.fullName || !req.body.email || !req.body.phone) {
        return res.status(400).json({ 
          message: "Missing required fields", 
          errors: [{
            path: [],
            message: "fullName, email, and phone are required"
          }]
        });
      }

      // Keep camelCase for schema validation (Drizzle will handle the database mapping)
      const transformedData = {
        fullName: req.body.fullName?.trim(),
        email: req.body.email?.trim(),
        phone: req.body.phone?.trim(),
        budget: req.body.budget && req.body.budget.trim() !== '' ? req.body.budget.trim() : null,
        downPayment: req.body.downPayment && req.body.downPayment.trim() !== '' ? req.body.downPayment.trim() : null,
        whatInMind: req.body.whatInMind && req.body.whatInMind.trim() !== '' ? req.body.whatInMind.trim() : null,
        projectSlug: req.body.projectSlug && req.body.projectSlug.trim() !== '' ? req.body.projectSlug.trim() : null,
      };

      const validatedData = insertContactSchema.parse(transformedData);
      const contact = await storage.createContact(validatedData);
      
      res.status(201).json(contact);
    } catch (error) {
      console.error('Contact creation error:', error);
      if (error instanceof z.ZodError) {
        console.log('Validation errors:', error.errors);
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Error creating contact", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Get all contacts (for admin purposes)
  app.get("/api/contacts", async (_req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching contacts" });
    }
  });

  // Calendly webhook endpoint
  app.post("/api/webhooks/calendly", async (req, res) => {
    try {
      const signature = req.headers['calendly-webhook-signature'] as string;
      const signingKey = process.env.CALENDLY_SIGNING_KEY;

      // Verify webhook signature for security
      if (!signingKey) {
        console.error('CALENDLY_SIGNING_KEY environment variable not set');
        res.status(500).json({ error: 'Webhook signing key not configured' });
        return;
      }

      if (!signature) {
        console.error('Missing Calendly webhook signature');
        res.status(401).json({ error: 'Missing signature' });
        return;
      }

      const payload = JSON.stringify(req.body);
      const isValid = verifyWebhookSignature(payload, signature, signingKey);
      
      if (!isValid) {
        console.error('Invalid Calendly webhook signature');
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }

      const webhookData = req.body as CalendlyWebhookPayload;
      
      // Log webhook receipt
      console.log(`Calendly webhook received: ${webhookData.event} for ${webhookData.payload?.invitee?.email || 'unknown'}`);

      // Skip processing if this is a test webhook or incomplete data
      if (!webhookData.payload?.invitee?.email || !webhookData.payload?.event?.uuid) {
        console.log('ℹ️ Skipping webhook processing - test webhook or incomplete data');
        res.status(200).json({ message: 'Webhook received but skipped (test or incomplete data)' });
        return;
      }

      // Extract relevant data
      const inviteeEmail = webhookData.payload.invitee.email.toLowerCase();
      const calendlyEventId = webhookData.payload.event.uuid;
      const appointmentDate = new Date(webhookData.payload.event.start_time);
      const inviteeName = webhookData.payload.invitee.name;
      
      // Determine status based on event type
      let calendlyStatus = 'pending';
      switch (webhookData.event) {
        case 'invitee.created':
          calendlyStatus = 'scheduled';
          break;
        case 'invitee.canceled':
          calendlyStatus = 'cancelled';
          break;
        case 'invitee_event_updated':
          calendlyStatus = 'rescheduled';
          break;
      }

      // Update contact record
      const updatedContact = await storage.updateContactCalendlyInfo(inviteeEmail, {
        calendlyEventId,
        appointmentDate,
        calendlyStatus,
        calendlyInviteeName: inviteeName,
        calendlyRawPayload: webhookData
      });

      if (updatedContact) {
        console.log(`Contact updated for ${inviteeEmail}: appointment ${calendlyStatus} for ${appointmentDate}`);
      } else {
        console.log(`No contact found for email ${inviteeEmail}, logging webhook data`);
        // Note: We still return 200 to prevent Calendly retries
      }

      // Always return 200 OK to prevent retries
      res.status(200).json({ 
        message: 'Webhook processed successfully',
        contact_updated: !!updatedContact 
      });

    } catch (error) {
      console.error('Calendly webhook processing error:', error);
      
      // Return 200 even on error to prevent retries for this webhook
      res.status(200).json({ 
        message: 'Webhook acknowledged, but processing failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PDF availability diagnostic endpoint
  app.get("/api/pdf-diagnostics", async (_req, res) => {
    try {
      const pdfPath = process.env.NODE_ENV === 'production' 
        ? 'dist/public/pdfs'
        : 'client/public/pdfs';
      
      const fs = await import('fs');
      const path = await import('path');
      
      const pdfDiagnostics = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        pdf_path: pdfPath,
        pdf_directory_exists: false,
        available_pdfs: [] as string[],
        missing_pdfs: [] as string[],
        expected_pdfs: [
          'secret-garden.pdf',
          'the-reef.pdf', 
          'palm-beach-residences.pdf',
          'solvamar-macao.pdf',
          'amares-unique-homes.pdf',
          'tropical-beach-3-0.pdf',
          'las-cayas-residences.pdf',
          'aura-boulevard.pdf'
        ]
      };

      // Check if PDF directory exists
      if (fs.existsSync(pdfPath)) {
        pdfDiagnostics.pdf_directory_exists = true;
        
        // List all PDF files in directory
        const files = fs.readdirSync(pdfPath);
        pdfDiagnostics.available_pdfs = files.filter(f => f.endsWith('.pdf'));
        
        // Check for missing expected PDFs
        pdfDiagnostics.missing_pdfs = pdfDiagnostics.expected_pdfs.filter(
          expectedPdf => !pdfDiagnostics.available_pdfs.includes(expectedPdf)
        );
      }

      const status = pdfDiagnostics.pdf_directory_exists && pdfDiagnostics.missing_pdfs.length === 0 
        ? 'healthy' 
        : 'unhealthy';

      if (status === 'healthy') {
        res.json({ status, ...pdfDiagnostics });
      } else {
        res.status(503).json({ status, ...pdfDiagnostics });
      }
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        error: 'Failed to check PDF availability',
        message: error.message
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
