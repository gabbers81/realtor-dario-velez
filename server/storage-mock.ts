import { type Contact, type InsertContact, type Project, type InsertProject } from "@shared/schema";
import { CalendlyWebhookData, IStorage } from "./storage";

// Mock data for local development
const mockProjects: Project[] = [
  {
    id: 1,
    title: "Amares Unique Homes",
    slug: "amares-unique-homes",
    description: "Proyecto residencial de lujo con vista al mar",
    price: "US$85,000", // Renamed from price_from
    location: "Cap Cana",
    completion: "Listo para entrega", // Added
    features: ["Vista al mar", "Piscina", "Gimnasio", "Seguridad 24/7"],
    imageUrl: "/images/amares-unique-homes-1.jpg", // Renamed from image_url
    images: ["/images/amares-unique-homes-1.jpg", "/images/amares-unique-homes-2.jpg"], // Added
    pdfUrl: "/pdfs/amares-unique-homes.pdf" // Renamed from pdf_url
    // created_at and updated_at removed
  },
  {
    id: 2,
    title: "Aura Boulevard",
    slug: "aura-boulevard",
    description: "Apartamentos modernos en el corazón de Bávaro",
    price: "US$120,000", // Renamed from price_from
    location: "Bávaro",
    completion: "En construcción", // Added
    features: ["Cerca de la playa", "Área comercial", "Parqueo techado"],
    imageUrl: "/images/aura-boulevard-1.jpg", // Renamed from image_url
    images: ["/images/aura-boulevard-1.jpg", "/images/aura-boulevard-2.jpg"], // Added
    pdfUrl: "/pdfs/aura-boulevard.pdf" // Renamed from pdf_url
    // created_at and updated_at removed
  },
  {
    id: 3,
    title: "Las Cayas Residences",
    slug: "las-cayas-residences",
    description: "Villas exclusivas frente al mar",
    price: "US$295,000", // Renamed from price_from
    location: "Playa Nueva Romana",
    completion: "Sobre planos", // Added
    features: ["Frente al mar", "Villas privadas", "Club de playa"],
    imageUrl: "/images/las-cayas-residences-1.jpg", // Renamed from image_url
    images: ["/images/las-cayas-residences-1.jpg", "/images/las-cayas-residences-2.jpg"], // Added
    pdfUrl: "/pdfs/las-cayas-residences.pdf" // Renamed from pdf_url
    // created_at and updated_at removed
  }
];

const mockContacts: Contact[] = [];

export class MockStorage implements IStorage {
  async createContact(contact: InsertContact): Promise<Contact> {
    const newContact: Contact = {
      id: mockContacts.length + 1,
      fullName: contact.fullName, // Already required in InsertContact
      email: contact.email,       // Already required in InsertContact
      phone: contact.phone,       // Already required in InsertContact
      budget: contact.budget || null,
      downPayment: contact.downPayment || null,
      whatInMind: contact.whatInMind || null,
      projectSlug: contact.projectSlug || null,
      createdAt: new Date(),
      appointmentDate: contact.appointmentDate || null,
      calendlyEventId: contact.calendlyEventId || null,
      calendlyStatus: contact.calendlyStatus || "pending",
      calendlyInviteeName: contact.calendlyInviteeName || null,
      calendlyRawPayload: contact.calendlyRawPayload || null,
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
      // contact.updated_at = new Date(); // updated_at removed, not in Contact schema
      // Note: The Contact schema in shared/schema.ts does not have an updatedAt field.
      // If it's needed, it should be added to the schema. For now, removing its assignment.
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
      images: project.images || [], // Ensure images is string[]
      // Ensure other potentially optional fields from InsertProject that are non-nullable in Project are handled
      // For example, if any of these were optional in InsertProject but required in Project:
      title: project.title, // Already required
      slug: project.slug,   // Already required
      description: project.description, // Already required
      price: project.price, // Already required
      location: project.location, // Already required
      completion: project.completion, // Already required
      features: project.features || [], // Already required, but good practice if it could be undefined
      imageUrl: project.imageUrl, // Already required
      pdfUrl: project.pdfUrl || null, // pdfUrl is nullable
    };
    mockProjects.push(newProject);
    return newProject;
  }

  getProductionReadiness() {
    // Mock storage is for development, so it's generally "not production ready" in a real sense
    return {
      isReady: false,
      warnings: ["Using mock storage, not suitable for production."],
      recommendations: ["Switch to a real database provider for production."],
      connection_type: 'mock',
      rls_compatible: false, // Mock doesn't deal with RLS
      current_url_info: {
        uses_pooler: false,
        ssl_required: false
      }
    };
  }
}