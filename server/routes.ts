import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { z } from "zod";

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
        ? 'https://dominican-real-estate.replit.app' 
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
  ? 'https://dominican-real-estate.replit.app' 
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
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Error creating contact" });
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

  const httpServer = createServer(app);
  return httpServer;
}
