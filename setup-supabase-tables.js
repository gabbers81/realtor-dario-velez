import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Connecting to:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTablesDirectly() {
  console.log('Creating tables via Supabase REST API...');
  
  try {
    // Create contacts table using raw SQL
    const { data: contactsResult, error: contactsError } = await supabase.rpc('exec_sql', {
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
      console.log('Contacts table creation - trying direct method...');
      // If rpc doesn't work, try direct schema manipulation
      const { error: directError } = await supabase
        .schema('public')
        .from('contacts')
        .select('*')
        .limit(0);
      
      if (directError && directError.message.includes('does not exist')) {
        console.log('Need to create contacts table manually');
      }
    } else {
      console.log('✅ Contacts table created successfully');
    }
    
    // Create projects table using raw SQL
    const { data: projectsResult, error: projectsError } = await supabase.rpc('exec_sql', {
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
      console.log('Projects table creation - trying direct method...');
    } else {
      console.log('✅ Projects table created successfully');
    }
    
    return !contactsError && !projectsError;
    
  } catch (error) {
    console.error('Table creation failed:', error);
    return false;
  }
}

async function insertProjectsData() {
  console.log('Inserting projects data...');
  
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
    }
    // Add more projects as needed
  ];

  try {
    const { data, error } = await supabase
      .from('projects')
      .insert(projects)
      .select();
    
    if (error) {
      console.error('Error inserting projects:', error.message);
      return false;
    }
    
    console.log(`✅ Successfully inserted ${data.length} projects`);
    return true;
    
  } catch (error) {
    console.error('Project insertion failed:', error);
    return false;
  }
}

async function main() {
  console.log('=== Supabase Table Setup ===');
  
  // Step 1: Create tables
  const tablesCreated = await createTablesDirectly();
  
  if (tablesCreated) {
    console.log('✅ Tables created, now inserting data...');
    
    // Step 2: Insert projects
    const dataInserted = await insertProjectsData();
    
    if (dataInserted) {
      console.log('🎉 Database setup completed successfully!');
      
      // Test the setup
      const { data: testData, error: testError } = await supabase
        .from('projects')
        .select('id, title')
        .limit(3);
      
      if (!testError && testData) {
        console.log('✅ Test query successful, found projects:', testData.map(p => p.title));
      }
      
    } else {
      console.log('❌ Data insertion failed');
    }
  } else {
    console.log('❌ Table creation failed');
  }
}

main().catch(console.error);