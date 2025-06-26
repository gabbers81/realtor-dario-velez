import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';
import { contacts, projects, type Contact, type InsertContact, type Project, type InsertProject } from "@shared/schema";

export interface IStorage {
  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  
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
  const encodedUrl = databaseUrl.replace(/(:)([^:@]+)(@)/, (match, colon, password, at) => {
    return colon + encodeURIComponent(password) + at;
  });
  
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
  
  // Initialize Supabase REST API client as fallback
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    console.log('✅ Supabase REST API client initialized as fallback');
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
      
      // Check if projects already exist
      const existingProjects = await db.select().from(projects).limit(1);
      if (existingProjects.length > 0) {
        console.log('✅ Projects already exist in Supabase');
        return; // Projects already initialized
      }
    } catch (error: any) {
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
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    try {
      const [contact] = await db.insert(contacts).values(insertContact).returning();
      return contact;
    } catch (error: any) {
      if ((error?.code === 'ENOTFOUND' || error?.errno === -3007) && supabaseClient) {
        console.log('🔄 Direct connection failed, using REST API fallback for contact creation...');
        const { data, error: restError } = await supabaseClient
          .from('contacts')
          .insert(insertContact)
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

  async getContacts(): Promise<Contact[]> {
    try {
      return await db.select().from(contacts);
    } catch (error: any) {
      if ((error?.code === 'ENOTFOUND' || error?.errno === -3007) && supabaseClient) {
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
      return await db.select().from(projects);
    } catch (error: any) {
      if ((error?.code === 'ENOTFOUND' || error?.errno === -3007) && supabaseClient) {
        console.log('🔄 Direct connection failed, using REST API fallback for projects...');
        const { data, error: restError } = await supabaseClient
          .from('projects')
          .select('*');
        
        if (restError) {
          throw new Error(`REST API error: ${restError.message}`);
        }
        
        console.log(`✅ Retrieved ${data?.length || 0} projects via REST API`);
        return data || [];
      }
      throw error;
    }
  }

  async getProject(id: number): Promise<Project | undefined> {
    try {
      const [project] = await db.select().from(projects).where(eq(projects.id, id));
      return project;
    } catch (error: any) {
      if ((error?.code === 'ENOTFOUND' || error?.errno === -3007) && supabaseClient) {
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
        
        return data;
      }
      throw error;
    }
  }

  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    try {
      const [project] = await db.select().from(projects).where(eq(projects.slug, slug));
      return project;
    } catch (error: any) {
      if ((error?.code === 'ENOTFOUND' || error?.errno === -3007) && supabaseClient) {
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
          pdfUrl: data.pdf_url
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
}

export const storage = new SupabaseStorage();