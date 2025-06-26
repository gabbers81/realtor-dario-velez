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

export class MemStorage implements IStorage {
  private contacts: Map<number, Contact>;
  private projects: Map<number, Project>;
  private currentContactId: number;
  private currentProjectId: number;

  constructor() {
    this.contacts = new Map();
    this.projects = new Map();
    this.currentContactId = 1;
    this.currentProjectId = 1;
    
    // Initialize with sample projects
    this.initializeProjects();
  }

  private initializeProjects() {
    const sampleProjects: InsertProject[] = [
      {
        title: "Aura Boulevard",
        slug: "aura-boulevard",
        description: "Moderno complejo residencial ubicado estratégicamente en Punta Cana Design District con plaza comercial exclusiva.",
        price: "Desde US$89,000",
        location: "Punta Cana Design District",
        completion: "Diciembre 2025",
        features: [
          "Suite hotelera y apartamentos de 1-2 habitaciones",
          "Plaza comercial exclusiva en la entrada",
          "Piscinas, jacuzzis climatizados y parque acuático", 
          "Cancha de padel y baloncesto",
          "Hotel boutique y centro de convenciones",
          "A 5 minutos del aeropuerto internacional"
        ],
        imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
        pdfUrl: "/assets/pdfs/aura-boulevard.pdf"
      }
    ];

    sampleProjects.forEach(project => {
      this.createProject(project);
    });
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const contact: Contact = { 
      ...insertContact, 
      id,
      budget: insertContact.budget,
      downPayment: insertContact.downPayment || null,
      createdAt: new Date()
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    return Array.from(this.projects.values()).find(project => project.slug === slug);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = { 
      ...insertProject, 
      id,
      pdfUrl: insertProject.pdfUrl || null
    };
    this.projects.set(id, project);
    return project;
  }
}

export const storage = new MemStorage();
