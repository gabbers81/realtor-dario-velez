import { contacts, projects, type Contact, type InsertContact, type Project, type InsertProject } from "@shared/schema";

export interface IStorage {
  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
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
        title: "Paradise Bay Resort",
        description: "Condominios de lujo frente al mar en Bávaro con amenidades de clase mundial.",
        price: "Desde US$180,000",
        location: "Bávaro, Punta Cana",
        completion: "Diciembre 2025",
        features: [
          "Vista panorámica al mar Caribe",
          "Piscina infinita y área de spa",
          "Acceso directo a playa privada",
          "Seguridad 24/7 con concierge",
          "Gimnasio y áreas recreativas",
          "Programa de alquiler garantizado"
        ],
        imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
        pdfUrl: "/pdfs/paradise-bay-resort.pdf"
      },
      {
        title: "Tropical Villas Cap Cana",
        description: "Villas exclusivas con acceso al prestigioso campo de golf de Cap Cana.",
        price: "Desde US$350,000",
        location: "Cap Cana",
        completion: "Junio 2026",
        features: [
          "3-4 habitaciones con acabados premium",
          "Acceso a campo de golf Jack Nicklaus",
          "Marina privada y club de playa",
          "Arquitectura tropical contemporánea",
          "Jardines paisajísticos privados",
          "ROI proyectado del 8-12% anual"
        ],
        imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
        pdfUrl: "/pdfs/tropical-villas-cap-cana.pdf"
      },
      {
        title: "Ocean View Residences",
        description: "Apartamentos modernos con vistas espectaculares del océano Atlántico.",
        price: "Desde US$120,000",
        location: "Punta Cana Village",
        completion: "Marzo 2025",
        features: [
          "1-3 habitaciones con balcón privado",
          "Lobby y áreas comunes de lujo",
          "Piscina en la azotea con bar",
          "Ubicación céntrica en Punta Cana",
          "Fácil acceso a restaurantes y vida nocturna",
          "Excelente potencial de alquiler vacacional"
        ],
        imageUrl: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
        pdfUrl: "/pdfs/ocean-view-residences.pdf"
      },
      {
        title: "Boutique Hotel Samaná",
        description: "Oportunidad de inversión en hotel boutique en la hermosa península de Samaná.",
        price: "Desde US$85,000",
        location: "Las Terrenas, Samaná",
        completion: "Septiembre 2025",
        features: [
          "Unidades de hotel completamente equipadas",
          "Gestión profesional incluida",
          "Ubicación privilegiada cerca de playa",
          "Programa de intercambio internacional",
          "Retorno de inversión garantizado",
          "Uso personal de 4 semanas al año"
        ],
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
        pdfUrl: "/pdfs/boutique-hotel-samana.pdf"
      },
      {
        title: "Golf & Beach Community",
        description: "Residencias exclusivas en comunidad cerrada con acceso a golf y playa privada.",
        price: "Desde US$250,000",
        location: "Costa del Coco",
        completion: "Agosto 2026",
        features: [
          "Casas de 2-4 habitaciones",
          "Campo de golf de 18 hoyos",
          "Club de playa exclusivo para residentes",
          "Centro comercial dentro de la comunidad",
          "Escuela internacional nearby",
          "Apreciación del 15-20% proyectada"
        ],
        imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
        pdfUrl: "/pdfs/golf-beach-community.pdf"
      },
      {
        title: "Eco Paradise Resort",
        description: "Desarrollo eco-sostenible que combina lujo con responsabilidad ambiental.",
        price: "Desde US$95,000",
        location: "Las Terrenas",
        completion: "Noviembre 2025",
        features: [
          "Construcción 100% eco-sostenible",
          "Energía solar y sistemas de reciclaje",
          "Preservación de flora y fauna local",
          "Certificación LEED Gold",
          "Spa natural y centro de bienestar",
          "Programa de compensación de carbono"
        ],
        imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
        pdfUrl: "/pdfs/eco-paradise-resort.pdf"
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
      budget: insertContact.budget || null,
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
