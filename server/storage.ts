import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { contacts, projects, type Contact, type InsertContact, type Project, type InsertProject } from "@shared/schema";

// Calendly webhook data interface
export interface CalendlyWebhookData {
  calendlyEventId: string;
  appointmentDate: Date;
  calendlyStatus: string;
  calendlyInviteeName: string;
  calendlyRawPayload: any;
}

export interface IStorage {
  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  updateContactCalendlyInfo(email: string, calendlyData: CalendlyWebhookData): Promise<Contact | null>;
  getContactByEmail(email: string): Promise<Contact | null>;
  
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectBySlug(slug: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
}

// Initialize database connection
const databaseUrl = process.env.DATABASE_URL!.trim();

// Handle special characters in password by URL encoding
let encodedUrl = databaseUrl;
const urlMatch = databaseUrl.match(/^postgresql:\/\/([^:]+):([^@]+)@(.+)$/);
if (urlMatch) {
  const [, username, password, hostPart] = urlMatch;
  const encodedPassword = encodeURIComponent(password);
  encodedUrl = `postgresql://${username}:${encodedPassword}@${hostPart}`;
}

const sql = postgres(encodedUrl, {
  ssl: 'require',
  max: 20,
  idle_timeout: 20,
  connect_timeout: 60,
  prepare: false,
  onnotice: () => {}, // Suppress notices
});

const db = drizzle(sql);

export class SupabaseStorage implements IStorage {
  constructor() {
    // Initialize projects on first run if needed
    void this.initializeProjects();
  }

  private async initializeProjects() {
    try {
      // Test connection and projects table accessibility
      const existingProjects = await db.select().from(projects).limit(1);
      console.log(`✅ Database connected, found ${existingProjects.length} projects`);
    } catch (error: any) {
      console.error('Database connection or projects table access failed:', error.message);
    }
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.slug, slug));
    return project;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async getContactByEmail(email: string): Promise<Contact | null> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.email, email.toLowerCase()));
    return contact || null;
  }

  async updateContactCalendlyInfo(email: string, calendlyData: CalendlyWebhookData): Promise<Contact | null> {
    // First, get the contact by email
    const existingContact = await this.getContactByEmail(email);
    if (!existingContact) {
      console.log(`No contact found for email: ${email}`);
      return null;
    }

    // Update using direct DB connection
    const [updatedContact] = await db
      .update(contacts)
      .set({
        appointmentDate: calendlyData.appointmentDate,
        calendlyEventId: calendlyData.calendlyEventId,
        calendlyStatus: calendlyData.calendlyStatus,
        calendlyInviteeName: calendlyData.calendlyInviteeName,
        calendlyRawPayload: calendlyData.calendlyRawPayload,
      })
      .where(eq(contacts.email, email.toLowerCase()))
      .returning();

    return updatedContact;
  }


}

export const storage = new SupabaseStorage();