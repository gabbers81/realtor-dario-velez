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

  // Get all projects
  app.get("/api/projects", async (_req, res) => {
    try {
      // Add caching headers for API responses
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // 1 hour
      res.setHeader('ETag', `"projects-${Date.now()}"`);
      
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error: any) {
      console.error('API Error - fetching projects:', error);
      if (error?.code === 'ENOTFOUND') {
        res.status(503).json({ 
          message: "Database connection unavailable", 
          details: "DNS resolution issue with Supabase hostname. Please create tables in Supabase dashboard first." 
        });
      } else if (error?.message?.includes('REST API error')) {
        res.status(503).json({ 
          message: "Database tables not found", 
          details: "Please create tables using the SQL script in Supabase dashboard" 
        });
      } else {
        res.status(500).json({ message: "Error fetching projects" });
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

  const httpServer = createServer(app);
  return httpServer;
}
