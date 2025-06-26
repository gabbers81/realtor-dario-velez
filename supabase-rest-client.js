import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('Creating tables via Supabase REST API...');
  
  try {
    // Create contacts table
    const { error: contactsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS contacts (
          id SERIAL PRIMARY KEY,
          full_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          budget TEXT NOT NULL,
          down_payment TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    });
    
    if (contactsError) {
      console.log('Contacts table might already exist or using direct SQL...');
    }
    
    // Create projects table
    const { error: projectsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS projects (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          description TEXT NOT NULL,
          price TEXT NOT NULL,
          location TEXT NOT NULL,
          completion TEXT NOT NULL,
          features TEXT[] NOT NULL,
          image_url TEXT NOT NULL,
          pdf_url TEXT
        );
      `
    });
    
    if (projectsError) {
      console.log('Projects table might already exist or using direct SQL...');
    }
    
    console.log('✅ Tables creation attempted via REST API');
    return true;
    
  } catch (error) {
    console.error('REST API table creation failed:', error);
    return false;
  }
}

async function insertProjects() {
  console.log('Inserting projects via Supabase REST API...');
  
  const projects = [
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
      image_url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      pdf_url: "/pdfs/aura-boulevard.pdf"
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
      image_url: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      pdf_url: "/pdfs/secret-garden.pdf"
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
      image_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      pdf_url: "/pdfs/the-reef.pdf"
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
        "Gimnasio y spa",
        "Salón de eventos",
        "Acceso directo a la playa"
      ],
      image_url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      pdf_url: "/pdfs/palm-beach-residences.pdf"
    },
    {
      title: "Solvamar Macao", 
      slug: "solvamar-macao",
      description: "Desarrollo de apartamentos de lujo con vista al mar en la exótica playa de Macao.",
      price: "Desde US$180,000",
      location: "Playa Macao",
      completion: "Abril 2026",
      features: [
        "Apartamentos de 1, 2 y 3 habitaciones",
        "Vista panorámica al océano",
        "Piscina infinity en la azotea",
        "Acceso directo a Playa Macao",
        "Restaurante gourmet",
        "Centro de bienestar y spa",
        "Concierge 24/7",
        "Estacionamiento privado"
      ],
      image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      pdf_url: "/pdfs/solvamar-macao.pdf"
    },
    {
      title: "Amares Unique Homes",
      slug: "amares-unique-homes", 
      description: "Villas exclusivas de diseño único en entorno natural privilegiado con amenidades de lujo.",
      price: "Desde US$320,000",
      location: "Punta Cana",
      completion: "Junio 2026",
      features: [
        "Villas de 3 y 4 habitaciones",
        "Diseño arquitectónico único",
        "Piscina privada en cada villa",
        "Jardines tropicales privados",
        "Club house exclusivo",
        "Campo de golf a 18 hoyos",
        "Servicio de mayordomo",
        "Helipuerto privado"
      ],
      image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      pdf_url: "/pdfs/amares-unique-homes.pdf"
    },
    {
      title: "Tropical Beach 3.0",
      slug: "tropical-beach-3-0",
      description: "Moderna torre residencial con tecnología sostenible y amenidades de resort en primera línea de playa.",
      price: "Desde US$195,000",
      location: "Playa Bavaro",
      completion: "Enero 2027",
      features: [
        "Apartamentos de 1, 2 y 3 habitaciones",
        "Tecnología domótica integrada", 
        "Energía solar y sistemas eco-friendly",
        "Piscina climatizada todo el año",
        "Spa y centro de wellness",
        "Co-working space",
        "Roof-top bar y restaurante",
        "Acceso directo a la playa"
      ],
      image_url: "https://images.unsplash.com/photo-1592595896551-12b371d546d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      pdf_url: "/pdfs/tropical-beach-3-0.pdf"
    },
    {
      title: "Las Cayas Residences",
      slug: "las-cayas-residences",
      description: "Complejo residencial tropical con lagunas artificiales y amenidades familiares en entorno natural.",
      price: "Desde US$145,000",
      location: "Bávaro",
      completion: "Octubre 2026",
      features: [
        "Apartamentos y villas familiares",
        "Lagunas artificiales navegables",
        "Parque acuático para niños",
        "Senderos ecológicos",
        "Centro ecuestre", 
        "Marina privada",
        "Restaurantes temáticos",
        "Seguridad 24/7"
      ],
      image_url: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      pdf_url: "/pdfs/las-cayas-residences.pdf"
    }
  ];

  try {
    // Check if projects already exist
    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id')
      .limit(1);
    
    if (existingProjects && existingProjects.length > 0) {
      console.log('✅ Projects already exist in Supabase');
      return true;
    }
    
    // Insert all projects
    const { data, error } = await supabase
      .from('projects')
      .insert(projects)
      .select();
    
    if (error) {
      console.error('Error inserting projects:', error);
      return false;
    }
    
    console.log(`✅ Successfully inserted ${data.length} projects via REST API`);
    return true;
    
  } catch (error) {
    console.error('REST API project insertion failed:', error);
    return false;
  }
}

async function testConnection() {
  try {
    console.log('Testing Supabase REST API connection...');
    
    const { data, error } = await supabase
      .from('projects')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('REST API test query result:', error.message);
      return false;
    }
    
    console.log('✅ Supabase REST API connection successful');
    return true;
    
  } catch (error) {
    console.error('REST API connection test failed:', error);
    return false;
  }
}

async function setupDatabase() {
  console.log('=== Supabase Database Setup via REST API ===');
  
  const connectionTest = await testConnection();
  if (!connectionTest) {
    console.error('❌ Cannot connect to Supabase REST API');
    return false;
  }
  
  const tablesCreated = await createTables();
  const projectsInserted = await insertProjects();
  
  console.log('\n=== Setup Results ===');
  console.log('Tables creation:', tablesCreated ? 'SUCCESS' : 'FAILED');
  console.log('Projects insertion:', projectsInserted ? 'SUCCESS' : 'FAILED');
  
  return tablesCreated && projectsInserted;
}

// Run the setup
setupDatabase().then(success => {
  if (success) {
    console.log('\n🎉 Database setup completed successfully!');
  } else {
    console.log('\n❌ Database setup encountered issues');
  }
  process.exit(success ? 0 : 1);
});