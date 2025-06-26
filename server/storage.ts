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
        pdfUrl: "/pdfs/aura-boulevard.pdf"
      },
      {
        title: "Secret Garden",
        slug: "secret-garden",
        description: "Proyecto cerrado exclusivo en el corazón de Bávaro con área comercial, viviendas unifamiliares y condos.",
        price: "Desde US$160,000",
        location: "Bávaro",
        completion: "Marzo 2026",
        features: [
          "327 unidades: 19 duplex, 64 estudios y 278 condos",
          "1, 2 y 3 habitaciones disponibles",
          "Área comercial integrada",
          "Piscina de 1,800m² con pool bar",
          "Gimnasio, coworking y mini-golf",
          "Pista de volley-playa",
          "Restaurante y amplias zonas ajardinadas",
          "A pasos de Playa Bávaro"
        ],
        imageUrl: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
        pdfUrl: "/pdfs/secret-garden.pdf"
      },
      {
        title: "The Reef",
        slug: "the-reef",
        description: "Complejo de lujo en primera línea de playa con hotel, residencias y piscinas naturales en Las Terrenas.",
        price: "Desde US$165,000",
        location: "Las Terrenas, Samaná",
        completion: "Marzo 2026",
        features: [
          "435 apartamentos de 2 y 3 habitaciones",
          "Hotel de 81 habitaciones integrado",
          "4 piscinas naturales conectadas",
          "Club de playa exclusivo",
          "Spa y gimnasio completo",
          "Zona comercial y restaurantes",
          "Sendero ecológico y bosque frutal",
          "Canchas de tenis y pádel"
        ],
        imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
        pdfUrl: "/pdfs/the-reef.pdf"
      },
      {
        title: "Palm Beach Residences",
        slug: "palm-beach-residences",
        description: "Torre residencial de lujo con amenidades resort en el prestigioso Cap Cana.",
        price: "Desde US$225,000",
        location: "Cap Cana",
        completion: "Noviembre 2025",
        features: [
          "Apartamentos de 1 y 2 habitaciones",
          "Vestíbulo de doble altura",
          "Piscina infinity con bar",
          "Área de juegos para niños",
          "Zona para mascotas",
          "Salón de juegos nivel 3",
          "Mobiliario italiano incluido",
          "Acceso a golf y marina de Cap Cana"
        ],
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
        pdfUrl: "/pdfs/palm-beach-residences.pdf"
      },
      {
        title: "Solvamar Macao",
        slug: "solvamar-macao",
        description: "Townhouses y villas familiares cerca de la famosa Playa Macao con amenidades completas.",
        price: "Desde US$145,000",
        location: "Macao, Punta Cana",
        completion: "Julio 2026",
        features: [
          "Townhouses de 60m² y villas hasta 120m²",
          "2 habitaciones con closets",
          "Piscina comunitaria opcional",
          "Cancha multiusos y gazebo",
          "Área BBQ y zona para niños",
          "A 5 minutos de Playa Macao",
          "Terminaciones de alta calidad",
          "Parqueo techado incluido"
        ],
        imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
        pdfUrl: "/pdfs/solvamar-macao.pdf"
      },
      {
        title: "Amares Unique Homes",
        slug: "amares-unique-homes",
        description: "Villas exclusivas con diseño curvilíneo frente al mar en la península de Samaná.",
        price: "Desde US$285,000",
        location: "Las Terrenas, Samaná",
        completion: "Octubre 2026",
        features: [
          "36 villas únicas de 1 y 2 habitaciones",
          "Primera línea de playa",
          "Beach club privado",
          "Piscina privada por villa",
          "Restaurante lounge",
          "Centro wellness y spa",
          "Tienda boutique",
          "Más de 750m² de áreas comunes"
        ],
        imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
        pdfUrl: "/pdfs/amares-unique-homes.pdf"
      },
      {
        title: "Tropical Beach 3.0",
        slug: "tropical-beach-3-0",
        description: "Proyecto residencial familiar con diseño moderno a 4 minutos del centro de Bávaro.",
        price: "Desde US$125,000",
        location: "Bávaro",
        completion: "Septiembre 2025",
        features: [
          "Casas familiares de 2 y 3 habitaciones",
          "Área recreacional completa",
          "Piscina comunitaria",
          "Zona de BBQ y gazebo",
          "Parqueo techado",
          "Seguridad 24 horas",
          "A 4 minutos del downtown",
          "Construcción con materiales de calidad"
        ],
        imageUrl: "https://images.unsplash.com/photo-1592595896616-c37162298647?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
        pdfUrl: "/pdfs/tropical-beach-3-0.pdf"
      },
      {
        title: "Las Cayas Residences",
        slug: "las-cayas-residences",
        description: "Urbanización cerrada de lujo con villas de 1 y 2 niveles, casa club y amenidades premium.",
        price: "Desde US$255,200",
        location: "Punta Cana",
        completion: "Diciembre 2025",
        features: [
          "Villas de 3 habitaciones en 2 niveles",
          "175m² de construcción",
          "Casa club con área lounge",
          "Piscinas para niños y adultos",
          "Gimnasio y área BBQ",
          "Parque para perros",
          "Gazebo y área infantil",
          "Piscina privada opcional"
        ],
        imageUrl: "https://images.unsplash.com/photo-1605146769289-440113cc3d00?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
        pdfUrl: "/pdfs/las-cayas-residences.pdf"
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
