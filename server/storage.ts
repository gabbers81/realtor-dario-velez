import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { contacts, projects, type Contact, type InsertContact, type Project, type InsertProject } from "@shared/schema";
import { MockStorage } from './storage-mock';

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

  // Production readiness assessment
  getProductionReadiness(): {
    isReady: boolean;
    warnings: string[];
    recommendations: string[];
    connection_type: string;
    rls_compatible: boolean;
    current_url_info: any; // Keeping it simple for the interface
  };
}

// Production-aware database connection initialization
const databaseUrl = process.env.DATABASE_URL?.trim();

// Production RLS compatibility check and connection string optimization
let encodedUrl = databaseUrl || '';
let isProductionReady = true;
let connectionWarnings: string[] = [];
let isTransactionPooler: boolean = false; // Define at module scope

// Only process database URL if it exists
if (databaseUrl) {
  // Check if using transaction pooler (required for RLS in production)
  isTransactionPooler = databaseUrl.includes(':5432'); // Assign to module-scoped variable
  if (process.env.NODE_ENV === 'production' && !isTransactionPooler) {
    console.warn('⚠️ Production Warning: Not using transaction pooler. RLS policies may not work correctly.');
    connectionWarnings.push('Transaction pooler recommended for production RLS compatibility');
    isProductionReady = false;
  }

  // Handle special characters in password by URL encoding
  const urlMatch = databaseUrl.match(/^postgresql:\/\/([^:]+):([^@]+)@(.+)$/);
  if (urlMatch) {
    const [, username, password, hostPart] = urlMatch;
    const encodedPassword = encodeURIComponent(password);
    encodedUrl = `postgresql://${username}:${encodedPassword}@${hostPart}`;
  
    // Log connection details for production debugging
    if (process.env.NODE_ENV === 'production') {
      console.log('🔍 Production Database Connection:', {
        host: hostPart.split('@')[1]?.split(':')[0] || 'unknown',
        port: hostPart.includes(':5432') ? '5432 (transaction pooler)' : hostPart.split(':')[1]?.split('/')[0] || 'unknown',
        database: hostPart.split('/')[1] || 'postgres',
        ssl: 'required',
        rls_compatible: isTransactionPooler
      });
    }
  }
}

// Only initialize database if we have a valid URL
let sql: any;
let db: any;

if (databaseUrl && databaseUrl !== 'postgresql://username:password@localhost:5432/propiedades_turisticas') {
  sql = postgres(encodedUrl, {
    ssl: process.env.NODE_ENV === 'production' ? 'require' : 'prefer',
    max: 20,
    idle_timeout: 20,
    connect_timeout: 60,
    prepare: false,
    onnotice: () => {}, // Suppress notices
    transform: {
      undefined: null // Handle undefined values properly
    },
    onparameter: (key, value) => {
      // Log parameter issues in production
      if (process.env.NODE_ENV === 'production' && value === undefined) {
        console.warn(`⚠️ Undefined parameter detected: ${key}`);
      }
    },
    debug: process.env.NODE_ENV === 'production' ? (connection, query, parameters) => {
      if (query.includes('ERROR') || query.includes('FAILED')) {
        console.error('🔍 Database query error:', { query: query.substring(0, 100), parameters });
      }
    } : false
  });

  db = drizzle(sql);
}

export class SupabaseStorage implements IStorage {
  constructor() {
    if (!db) {
      throw new Error('Database not initialized. Please provide a valid DATABASE_URL.');
    }
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
    try {
      const [contact] = await db.insert(contacts).values(insertContact).returning();
      return contact;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'production') {
        if (error?.message?.includes('policy') || error?.message?.includes('permission')) {
          console.error('🔒 RLS Policy Error in createContact:', error.message);
          throw new Error(`Access denied: RLS policies may be blocking contact creation. ${isProductionReady ? '' : 'Consider using transaction pooler connection.'}`);
        }
        if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
          console.error('🔌 Database Connection Error in createContact:', error.message);
          throw new Error(`Database connection failed: ${error.message}`);
        }
      }
      throw error;
    }
  }

  async getContacts(): Promise<Contact[]> {
    try {
      return await db.select().from(contacts);
    } catch (error: any) {
      if (process.env.NODE_ENV === 'production') {
        if (error?.message?.includes('policy') || error?.message?.includes('permission')) {
          console.error('🔒 RLS Policy Error in getContacts:', error.message);
          throw new Error(`Access denied: RLS policies may be blocking contacts table access. ${isProductionReady ? '' : 'Consider using transaction pooler connection.'}`);
        }
        if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
          console.error('🔌 Database Connection Error in getContacts:', error.message);
          throw new Error(`Database connection failed: ${error.message}`);
        }
      }
      throw error;
    }
  }

  async getProjects(): Promise<Project[]> {
    try {
      return await db.select().from(projects);
    } catch (error: any) {
      // Enhanced error handling for production RLS issues
      if (process.env.NODE_ENV === 'production') {
        if (error?.message?.includes('policy') || error?.message?.includes('permission')) {
          console.error('🔒 RLS Policy Error in getProjects:', error.message);
          throw new Error(`Access denied: RLS policies may be blocking projects table access. ${isProductionReady ? '' : 'Consider using transaction pooler connection.'}`);
        }
        if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
          console.error('🔌 Database Connection Error in getProjects:', error.message);
          throw new Error(`Database connection failed: ${error.message}`);
        }
      }
      throw error;
    }
  }

  async getProject(id: number): Promise<Project | undefined> {
    try {
      const [project] = await db.select().from(projects).where(eq(projects.id, id));
      return project;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'production' && (error?.message?.includes('policy') || error?.message?.includes('permission'))) {
        console.error('🔒 RLS Policy Error in getProject:', error.message);
        throw new Error(`Access denied: RLS policies may be blocking project access. ${isProductionReady ? '' : 'Consider using transaction pooler connection.'}`);
      }
      throw error;
    }
  }

  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    try {
      const [project] = await db.select().from(projects).where(eq(projects.slug, slug));
      return project;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'production' && (error?.message?.includes('policy') || error?.message?.includes('permission'))) {
        console.error('🔒 RLS Policy Error in getProjectBySlug:', error.message);
        throw new Error(`Access denied: RLS policies may be blocking project access. ${isProductionReady ? '' : 'Consider using transaction pooler connection.'}`);
      }
      throw error;
    }
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    try {
      const [project] = await db.insert(projects).values(insertProject).returning();
      return project;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'production' && (error?.message?.includes('policy') || error?.message?.includes('permission'))) {
        console.error('🔒 RLS Policy Error in createProject:', error.message);
        throw new Error(`Access denied: RLS policies may be blocking project creation. ${isProductionReady ? '' : 'Consider using transaction pooler connection.'}`);
      }
      throw error;
    }
  }

  async getContactByEmail(email: string): Promise<Contact | null> {
    try {
      const [contact] = await db.select().from(contacts).where(eq(contacts.email, email.toLowerCase()));
      return contact || null;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'production' && (error?.message?.includes('policy') || error?.message?.includes('permission'))) {
        console.error('🔒 RLS Policy Error in getContactByEmail:', error.message);
        throw new Error(`Access denied: RLS policies may be blocking contact access. ${isProductionReady ? '' : 'Consider using transaction pooler connection.'}`);
      }
      throw error;
    }
  }

  async updateContactCalendlyInfo(email: string, calendlyData: CalendlyWebhookData): Promise<Contact | null> {
    try {
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
    } catch (error: any) {
      if (process.env.NODE_ENV === 'production') {
        if (error?.message?.includes('policy') || error?.message?.includes('permission')) {
          console.error('🔒 RLS Policy Error in updateContactCalendlyInfo:', error.message);
          throw new Error(`Access denied: RLS policies may be blocking contact updates. ${isProductionReady ? '' : 'Consider using transaction pooler connection.'}`);
        }
        if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
          console.error('🔌 Database Connection Error in updateContactCalendlyInfo:', error.message);
          throw new Error(`Database connection failed: ${error.message}`);
        }
      }
      console.error('Error updating contact Calendly info:', error);
      return null;
    }
  }

  // Production readiness assessment
  getProductionReadiness() {
    return {
      isReady: isProductionReady,
      warnings: connectionWarnings,
      recommendations: !isProductionReady ? [
        'Use transaction pooler connection string (port 5432) for RLS compatibility',
        'Format: postgresql://postgres.xxx:[PASSWORD]@db.xxx.supabase.co:5432/postgres',
        'Verify RLS policies are properly configured for anonymous access if needed'
      ] : [],
      connection_type: isTransactionPooler ? 'transaction_pooler' : 'direct',
      rls_compatible: isTransactionPooler,
      current_url_info: {
        uses_pooler: isTransactionPooler,
        ssl_required: process.env.NODE_ENV === 'production'
      }
    };
  }


}

// Export appropriate storage based on database availability
export const storage: IStorage = (() => {
  if (!databaseUrl || databaseUrl === 'postgresql://username:password@localhost:5432/propiedades_turisticas') {
    console.log('⚠️  No valid DATABASE_URL found, using mock storage for local development');
    return new MockStorage();
  }
  return new SupabaseStorage();
})();