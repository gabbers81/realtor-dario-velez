import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';
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

// Initialize both direct Postgres connection and Supabase REST API client
let sql: any;
let db: any;
let supabaseClient: any;
let useRestAPI = false;

try {
  const databaseUrl = process.env.DATABASE_URL!.trim();
  console.log('Attempting to connect to Supabase with URL:', databaseUrl.replace(/:[^:@]+@/, ':***@'));
  
  // Handle special characters in password by URL encoding
  let encodedUrl = databaseUrl;
  const urlMatch = databaseUrl.match(/^postgresql:\/\/([^:]+):([^@]+)@(.+)$/);
  if (urlMatch) {
    const [, username, password, hostPart] = urlMatch;
    const encodedPassword = encodeURIComponent(password);
    encodedUrl = `postgresql://${username}:${encodedPassword}@${hostPart}`;
  }
  
  console.log('Using encoded URL for connection');
  
  sql = postgres(encodedUrl, {
    ssl: 'require',
    max: 20,
    idle_timeout: 20,
    connect_timeout: 60,
    prepare: false,
    onnotice: () => {}, // Suppress notices
  });
  
  db = drizzle(sql);
  console.log('Supabase client initialized successfully with encoded URL');
  
  // Initialize Supabase REST API client as fallback with service role key (bypasses RLS)
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    console.log('✅ Supabase REST API client initialized with service role (bypasses RLS)');
  }
} catch (error) {
  console.error('Error initializing Supabase connection:', error);
  throw error;
}

export class SupabaseStorage implements IStorage {
  constructor() {
    // Initialize projects on first run if needed
    void this.initializeProjects();
  }

  private async initializeProjects() {
    try {
      // Test connection first with a simple query
      console.log('Testing Supabase connection...');
      const testResult = await sql`SELECT 1 as test`;
      console.log('✅ Supabase connection successful, test result:', testResult);
      
      // Test projects table accessibility
      console.log('Testing projects table accessibility...');
      try {
        const existingProjects = await db.select().from(projects).limit(1);
        console.log(`✅ Projects table accessible, found ${existingProjects.length} projects`);
        if (existingProjects.length > 0) {
          console.log('✅ Projects already exist in Supabase');
          return; // Projects already initialized
        }
      } catch (error: any) {
        console.error('❌ Storage: Projects table access failed during initialization:', {
          message: error.message,
          code: error.code,
          errno: error.errno
        });
        
        if (error?.code === 'ENOTFOUND' && supabaseClient) {
          console.log('⚠️ Direct connection failed, checking via REST API...');
          try {
            const { data } = await supabaseClient.from('projects').select('id').limit(1);
            if (data && data.length > 0) {
              console.log('✅ Projects exist in Supabase (verified via REST API)');
              useRestAPI = true;
              return;
            }
          } catch (restError) {
            console.log('REST API check also failed:', restError);
          }
        }
        console.error('Error initializing projects in Supabase:', error);
        console.log('ℹ️  Note: DNS resolution issues may prevent connection to Supabase from this environment');
        console.log('ℹ️  Please ensure tables are created manually in Supabase dashboard using supabase-setup.sql');
        return;
      }
    } catch (initError) {
      console.error('Failed to initialize Supabase storage:', initError);
    }
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    try {
      // Handle missing projectSlug column gracefully for direct DB connection
      const contactData = { ...insertContact };
      
      const [contact] = await db.insert(contacts).values(contactData).returning();
      return contact;
    } catch (error: any) {
      // Handle missing project_slug column in direct connection
      if (error?.code === '42703' && error?.message?.includes('project_slug')) {
        console.log('⚠️ project_slug column does not exist in direct connection, creating contact without it...');
        const contactWithoutSlug = { ...insertContact };
        delete contactWithoutSlug.projectSlug;
        
        const [retryContact] = await db.insert(contacts).values(contactWithoutSlug).returning();
        return retryContact;
      }

      // Check for RLS permission errors
      if (error.message?.includes('permission denied') || 
          error.message?.includes('row level security') ||
          error.message?.includes('policy')) {
        console.error('🚫 RLS Error: Row Level Security is blocking contact creation');
        console.log('💡 Solution: Trying REST API with service role key to bypass RLS...');
      }

      if ((error?.code === 'ENOTFOUND' || error?.errno === -3007 || 
           error.message?.includes('permission denied')) && supabaseClient) {
        console.log('🔄 Direct connection failed, using REST API fallback for contact creation...');
        
        // Transform camelCase to snake_case for REST API
        const restApiData = {
          full_name: insertContact.fullName,
          email: insertContact.email,
          phone: insertContact.phone,
          budget: insertContact.budget,
          down_payment: insertContact.downPayment,
          what_in_mind: insertContact.whatInMind,
          project_slug: insertContact.projectSlug,
        };
        
        const { data, error: restError } = await supabaseClient
          .from('contacts')
          .insert(restApiData)
          .select()
          .single();
        
        if (restError) {
          console.error('REST API error details:', restError);
          console.log('Checking error conditions:');
          console.log('- restError.code:', restError.code);
          console.log('- message includes column:', restError.message.includes('column'));
          console.log('- message includes schema cache:', restError.message.includes('schema cache'));
          
          // Handle case where new columns don't exist yet - create minimal contact
          if (restError.code === 'PGRST204' || restError.code === '42703' || restError.message.includes('column') || restError.message.includes('schema cache')) {
            console.log('⚠️ Some columns do not exist, creating contact with basic fields only...');
            
            const minimalData = {
              full_name: insertContact.fullName,
              email: insertContact.email,
              phone: insertContact.phone,
              budget: insertContact.budget || 'No especificado'
            };
            
            const { data: retryData, error: retryError } = await supabaseClient
              .from('contacts')
              .insert(minimalData)
              .select()
              .single();
            
            if (retryError) {
              console.error('REST API retry error:', retryError);
              throw new Error(`REST API retry error: ${retryError.message}`);
            }
            
            console.log('✅ Contact created successfully with basic fields');
            return retryData;
          }
          throw new Error(`REST API error: ${restError.message}`);
        }
        
        return data;
      }
      throw error;
    }
  }

  async getContacts(): Promise<Contact[]> {
    try {
      return await db.select().from(contacts);
    } catch (error: any) {
      // Check for RLS permission errors
      if (error.message?.includes('permission denied') || 
          error.message?.includes('row level security') ||
          error.message?.includes('policy')) {
        console.error('🚫 RLS Error: Row Level Security is blocking contacts access');
        console.log('💡 Solution: Using REST API with service role key to bypass RLS...');
      }

      if ((error?.code === 'ENOTFOUND' || error?.errno === -3007 || 
           error.message?.includes('permission denied')) && supabaseClient) {
        console.log('🔄 Direct connection failed, using REST API fallback for contacts...');
        const { data, error: restError } = await supabaseClient
          .from('contacts')
          .select('*');
        
        if (restError) {
          throw new Error(`REST API error: ${restError.message}`);
        }
        
        return data || [];
      }
      throw error;
    }
  }

  async getProjects(): Promise<Project[]> {
    try {
      console.log('💾 Storage: Attempting direct database query for projects...');
      const result = await db.select().from(projects);
      console.log(`✅ Storage: Direct query successful, found ${result.length} projects`);
      return result;
    } catch (error: any) {
      console.error('❌ Storage: Direct database query failed:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        hasSupabaseClient: !!supabaseClient,
        environment: {
          DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
          SUPABASE_URL: process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing', 
          SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'
        }
      });

      // Check for RLS permission errors
      if (error.message?.includes('permission denied') || 
          error.message?.includes('row level security') ||
          error.message?.includes('policy')) {
        console.error('🚫 RLS Error: Row Level Security is blocking database access');
        console.log('💡 Solution: Ensure you are using the service role key which bypasses RLS');
      }

      // Try REST API fallback for network issues or RLS permission problems
      if (((error?.code === 'ENOTFOUND' || error?.errno === -3007) || 
           error.message?.includes('permission denied') || 
           error.message?.includes('row level security')) && supabaseClient) {
        
        const fallbackReason = error?.code === 'ENOTFOUND' ? 'network connectivity' : 
                              error.message?.includes('permission') ? 'RLS permission' : 'database connection';
        
        console.log(`🔄 Storage: Direct connection failed (${fallbackReason}), using REST API fallback for projects...`);
        try {
          const { data, error: restError } = await supabaseClient
            .from('projects')
            .select('*');
          
          if (restError) {
            console.error('❌ Storage: REST API fallback failed:', restError);
            
            // Check if REST API also has RLS issues
            if (restError.message?.includes('permission denied') || 
                restError.message?.includes('policy')) {
              console.error('🚫 RLS Error: Both direct and REST API connections blocked by Row Level Security');
              console.log('💡 Fix: Check that SUPABASE_SERVICE_ROLE_KEY is the correct service role key that bypasses RLS');
            }
            
            throw new Error(`REST API error: ${restError.message}`);
          }
          
          console.log(`✅ Storage: Retrieved ${data?.length || 0} projects via REST API (service role bypasses RLS)`);
          // Map snake_case to camelCase for API consistency
          return (data || []).map((project: any) => ({
            ...project,
            imageUrl: project.image_url,
            pdfUrl: project.pdf_url,
            images: project.images || []
          }));
        } catch (restError: any) {
          console.error('❌ Storage: REST API fallback completely failed:', restError);
          throw restError;
        }
      } else if (!supabaseClient) {
        console.error('❌ Storage: No Supabase REST client available for fallback');
        throw new Error('Database connection failed and no REST API fallback available');
      }
      
      console.error('❌ Storage: Throwing original error:', error);
      throw error;
    }
  }

  async getProject(id: number): Promise<Project | undefined> {
    try {
      const [project] = await db.select().from(projects).where(eq(projects.id, id));
      return project;
    } catch (error: any) {
      // Check for RLS permission errors
      if (error.message?.includes('permission denied') || 
          error.message?.includes('row level security') ||
          error.message?.includes('policy')) {
        console.error('🚫 RLS Error: Row Level Security is blocking project access');
        console.log('💡 Solution: Using REST API with service role key to bypass RLS...');
      }

      if ((error?.code === 'ENOTFOUND' || error?.errno === -3007 || 
           error.message?.includes('permission denied')) && supabaseClient) {
        console.log('🔄 Direct connection failed, using REST API fallback for single project...');
        const { data, error: restError } = await supabaseClient
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();
        
        if (restError) {
          if (restError.code === 'PGRST116') {
            return undefined; // Not found
          }
          throw new Error(`REST API error: ${restError.message}`);
        }
        
        // Map snake_case to camelCase for API consistency
        return {
          ...data,
          imageUrl: data.image_url,
          pdfUrl: data.pdf_url,
          images: data.images || []
        };
      }
      throw error;
    }
  }

  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    try {
      const [project] = await db.select().from(projects).where(eq(projects.slug, slug));
      return project;
    } catch (error: any) {
      // Check for RLS permission errors
      if (error.message?.includes('permission denied') || 
          error.message?.includes('row level security') ||
          error.message?.includes('policy')) {
        console.error('🚫 RLS Error: Row Level Security is blocking project slug access');
        console.log('💡 Solution: Using REST API with service role key to bypass RLS...');
      }

      if ((error?.code === 'ENOTFOUND' || error?.errno === -3007 || 
           error.message?.includes('permission denied')) && supabaseClient) {
        console.log('🔄 Direct connection failed, using REST API fallback for project by slug...');
        const { data, error: restError } = await supabaseClient
          .from('projects')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (restError) {
          if (restError.code === 'PGRST116') {
            return undefined; // Not found
          }
          throw new Error(`REST API error: ${restError.message}`);
        }
        
        // Map snake_case to camelCase for API consistency
        return {
          ...data,
          imageUrl: data.image_url,
          pdfUrl: data.pdf_url,
          images: data.images || []
        };
      }
      throw error;
    }
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    try {
      const [project] = await db.insert(projects).values(insertProject).returning();
      return project;
    } catch (error: any) {
      if ((error?.code === 'ENOTFOUND' || error?.errno === -3007) && supabaseClient) {
        console.log('🔄 Direct connection failed, using REST API fallback for project creation...');
        const { data, error: restError } = await supabaseClient
          .from('projects')
          .insert(insertProject)
          .select()
          .single();
        
        if (restError) {
          throw new Error(`REST API error: ${restError.message}`);
        }
        
        return data;
      }
      throw error;
    }
  }

  async getContactByEmail(email: string): Promise<Contact | null> {
    try {
      const [contact] = await db.select().from(contacts).where(eq(contacts.email, email.toLowerCase()));
      return contact || null;
    } catch (error: any) {
      // Check for RLS permission errors
      if (error.message?.includes('permission denied') || 
          error.message?.includes('row level security') ||
          error.message?.includes('policy')) {
        console.error('🚫 RLS Error: Row Level Security is blocking contact email lookup');
        console.log('💡 Solution: Using REST API with service role key to bypass RLS...');
      }

      if ((error?.code === 'ENOTFOUND' || error?.errno === -3007 || 
           error.message?.includes('permission denied')) && supabaseClient) {
        console.log('🔄 Direct connection failed, using REST API fallback for contact lookup by email...');
        const { data, error: restError } = await supabaseClient
          .from('contacts')
          .select('*')
          .eq('email', email.toLowerCase())
          .maybeSingle();
        
        if (restError) {
          throw new Error(`REST API error: ${restError.message}`);
        }
        
        return data || null;
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
      // Check for RLS permission errors
      if (error.message?.includes('permission denied') || 
          error.message?.includes('row level security') ||
          error.message?.includes('policy')) {
        console.error('🚫 RLS Error: Row Level Security is blocking contact update');
        console.log('💡 Solution: Using REST API with service role key to bypass RLS...');
      }

      if ((error?.code === 'ENOTFOUND' || error?.errno === -3007 || 
           error.message?.includes('permission denied')) && supabaseClient) {
        console.log('🔄 Direct connection failed, using REST API fallback for contact update...');
        
        // Transform camelCase to snake_case for REST API
        const restApiData = {
          appointment_date: calendlyData.appointmentDate.toISOString(),
          calendly_event_id: calendlyData.calendlyEventId,
          calendly_status: calendlyData.calendlyStatus,
          calendly_invitee_name: calendlyData.calendlyInviteeName,
          calendly_raw_payload: calendlyData.calendlyRawPayload,
        };
        
        const { data, error: restError } = await supabaseClient
          .from('contacts')
          .update(restApiData)
          .eq('email', email.toLowerCase())
          .select()
          .single();
        
        if (restError) {
          if (restError.code === 'PGRST116') {
            console.log(`No contact found for email: ${email}`);
            return null;
          }
          // If columns don't exist yet, log and return null without error
          if (restError.code === '42703' || restError.message.includes('column')) {
            console.log('⚠️ Calendly columns do not exist yet in database, skipping update...');
            return null;
          }
          throw new Error(`REST API error: ${restError.message}`);
        }
        
        return data;
      }
      throw error;
    }
  }

  // RLS Health Check Method
  async checkRLSPermissions(): Promise<{
    status: 'healthy' | 'rls_blocked' | 'error';
    details: {
      projects: { accessible: boolean; count?: number; error?: string };
      contacts: { accessible: boolean; count?: number; error?: string };
      direct_connection: boolean;
      rest_api_fallback: boolean;
    };
  }> {
    const result = {
      status: 'healthy' as 'healthy' | 'rls_blocked' | 'error',
      details: {
        projects: { accessible: false } as { accessible: boolean; count?: number; error?: string },
        contacts: { accessible: false } as { accessible: boolean; count?: number; error?: string },
        direct_connection: false,
        rest_api_fallback: !!supabaseClient
      }
    };

    // Test projects table access
    try {
      const projectsResult = await db.select().from(projects).limit(1);
      result.details.projects = { accessible: true, count: projectsResult.length };
      result.details.direct_connection = true;
    } catch (error: any) {
      if (error.message?.includes('permission denied') || 
          error.message?.includes('row level security') ||
          error.message?.includes('policy')) {
        result.details.projects = { 
          accessible: false, 
          error: 'RLS blocking access - trying REST API fallback' 
        };
        result.status = 'rls_blocked';
        
        // Test REST API fallback
        if (supabaseClient) {
          try {
            const { data, error: restError } = await supabaseClient
              .from('projects')
              .select('*')
              .limit(1);
            if (!restError) {
              result.details.projects = { 
                accessible: true, 
                count: data?.length || 0,
                error: 'Direct blocked, REST API working (service role bypasses RLS)'
              };
            }
          } catch (restFallbackError) {
            result.details.projects = {
              ...result.details.projects,
              error: `Both direct and REST API failed: ${restFallbackError}`
            };
            result.status = 'error';
          }
        }
      } else {
        result.details.projects = { accessible: false, error: error.message };
        result.status = 'error';
      }
    }

    // Test contacts table access
    try {
      const contactsResult = await db.select().from(contacts).limit(1);
      result.details.contacts = { accessible: true, count: contactsResult.length };
    } catch (error: any) {
      if (error.message?.includes('permission denied') || 
          error.message?.includes('row level security') ||
          error.message?.includes('policy')) {
        result.details.contacts = { 
          accessible: false, 
          error: 'RLS blocking access - trying REST API fallback' 
        };
        
        // Test REST API fallback for contacts
        if (supabaseClient) {
          try {
            const { data, error: restError } = await supabaseClient
              .from('contacts')
              .select('*')
              .limit(1);
            if (!restError) {
              result.details.contacts = { 
                accessible: true, 
                count: data?.length || 0,
                error: 'Direct blocked, REST API working (service role bypasses RLS)'
              };
            }
          } catch (restFallbackError) {
            result.details.contacts = {
              ...result.details.contacts,
              error: `Both direct and REST API failed: ${restFallbackError}`
            };
          }
        }
      } else {
        result.details.contacts = { accessible: false, error: error.message };
      }
    }

    return result;
  }
}

export const storage = new SupabaseStorage();