import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all projects
  app.get("/api/projects", async (_req, res) => {
    try {
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
