async function setupSupabaseDatabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('Setting up Supabase database via direct HTTP calls...');
  console.log('Supabase URL:', supabaseUrl);
  
  // Function to make HTTP requests to Supabase
  async function supabaseRequest(endpoint, method = 'GET', body = null) {
    const url = `${supabaseUrl}/rest/v1/${endpoint}`;
    const headers = {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
    
    const options = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) })
    };
    
    const response = await fetch(url, options);
    const data = await response.text();
    
    try {
      return {
        success: response.ok,
        status: response.status,
        data: data ? JSON.parse(data) : null,
        error: response.ok ? null : data
      };
    } catch (e) {
      return {
        success: response.ok,
        status: response.status,
        data: data,
        error: response.ok ? null : data
      };
    }
  }
  
  // First, let's test connection by trying to access any existing table
  console.log('Testing Supabase connection...');
  const testResult = await supabaseRequest('projects?limit=1');
  console.log('Test result:', testResult);
  
  if (testResult.status === 406 || (testResult.error && testResult.error.includes('does not exist'))) {
    console.log('Tables do not exist yet - this is expected for initial setup');
  }
  
  // Now let's create the projects data using INSERT (tables should be created via SQL editor)
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
  
  // Try to insert projects one by one to see detailed errors
  console.log('Attempting to insert projects via REST API...');
  
  for (const project of projects) {
    console.log(`Inserting: ${project.title}...`);
    const result = await supabaseRequest('projects', 'POST', project);
    
    if (result.success) {
      console.log(`✅ Successfully inserted: ${project.title}`);
    } else {
      console.log(`❌ Failed to insert ${project.title}:`, result.error);
      
      // If it's a table not found error, we need to create tables first
      if (result.error && (result.error.includes('does not exist') || result.error.includes('relation') || result.status === 406)) {
        console.log('⚠️  Tables need to be created first. Please run the SQL script in Supabase dashboard.');
        break;
      }
    }
  }
  
  // Test final connection
  console.log('\nTesting final connection...');
  const finalTest = await supabaseRequest('projects?limit=3');
  if (finalTest.success) {
    console.log('✅ Database setup successful! Found projects:', finalTest.data?.length || 0);
    if (finalTest.data && finalTest.data.length > 0) {
      console.log('Sample projects:', finalTest.data.map(p => p.title));
    }
  } else {
    console.log('❌ Database not ready:', finalTest.error);
  }
}

setupSupabaseDatabase().catch(console.error);