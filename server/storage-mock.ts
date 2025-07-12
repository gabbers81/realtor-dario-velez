import { type Contact, type InsertContact, type Project, type InsertProject } from "@shared/schema";
import { CalendlyWebhookData, IStorage } from "./storage";

// Mock data for local development
const mockProjects: Project[] = [
  {
    id: 1,
    title: "Amares Unique Homes",
    description: "Proyecto residencial de lujo con vista al mar",
    price_from: "US$85,000",
    location: "Cap Cana",
    features: ["Vista al mar", "Piscina", "Gimnasio", "Seguridad 24/7"],
    image_url: "/images/amares-unique-homes-1.jpg",
    pdf_url: "/pdfs/amares-unique-homes.pdf",
    slug: "amares-unique-homes",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    title: "Aura Boulevard",
    description: "Apartamentos modernos en el corazón de Bávaro",
    price_from: "US$120,000",
    location: "Bávaro",
    features: ["Cerca de la playa", "Área comercial", "Parqueo techado"],
    image_url: "/images/aura-boulevard-1.jpg",
    pdf_url: "/pdfs/aura-boulevard.pdf",
    slug: "aura-boulevard",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    title: "Las Cayas Residences",
    description: "Villas exclusivas frente al mar",
    price_from: "US$295,000",
    location: "Playa Nueva Romana",
    features: ["Frente al mar", "Villas privadas", "Club de playa"],
    image_url: "/images/las-cayas-residences-1.jpg",
    pdf_url: "/pdfs/las-cayas-residences.pdf",
    slug: "las-cayas-residences",
    created_at: new Date(),
    updated_at: new Date()
  }
];

const mockContacts: Contact[] = [];

export class MockStorage implements IStorage {
  async createContact(contact: InsertContact): Promise<Contact> {
    const newContact: Contact = {
      ...contact,
      id: mockContacts.length + 1,
      created_at: new Date(),
      updated_at: new Date()
    };
    mockContacts.push(newContact);
    console.log('Mock: Contact created', newContact);
    return newContact;
  }

  async getContacts(): Promise<Contact[]> {
    return mockContacts;
  }

  async updateContactCalendlyInfo(email: string, calendlyData: CalendlyWebhookData): Promise<Contact | null> {
    const contact = mockContacts.find(c => c.email === email);
    if (contact) {
      Object.assign(contact, calendlyData);
      contact.updated_at = new Date();
      console.log('Mock: Contact updated with Calendly info', contact);
      return contact;
    }
    return null;
  }

  async getContactByEmail(email: string): Promise<Contact | null> {
    return mockContacts.find(c => c.email === email) || null;
  }

  async getProjects(): Promise<Project[]> {
    return mockProjects;
  }

  async getProject(id: number): Promise<Project | undefined> {
    return mockProjects.find(p => p.id === id);
  }

  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    return mockProjects.find(p => p.slug === slug);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const newProject: Project = {
      ...project,
      id: mockProjects.length + 1,
      created_at: new Date(),
      updated_at: new Date()
    };
    mockProjects.push(newProject);
    return newProject;
  }
}