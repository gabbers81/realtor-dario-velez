async function createTablesInSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('Creating tables in Supabase via SQL execution...');
  
  // Function to execute SQL via Supabase Edge Functions or direct RPC
  async function executeSQL(sql) {
    const url = `${supabaseUrl}/rest/v1/rpc/exec_sql`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql })
    });
    
    const result = await response.text();
    return {
      success: response.ok,
      status: response.status,
      result: result
    };
  }
  
  // Create contacts table
  const createContactsSQL = `
    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      budget TEXT NOT NULL,
      down_payment TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  
  console.log('Creating contacts table...');
  const contactsResult = await executeSQL(createContactsSQL);
  console.log('Contacts table result:', contactsResult);
  
  // Create projects table
  const createProjectsSQL = `
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
  `;
  
  console.log('Creating projects table...');
  const projectsResult = await executeSQL(createProjectsSQL);
  console.log('Projects table result:', projectsResult);
  
  // If RPC doesn't work, let's try a direct REST API approach
  if (!contactsResult.success && !projectsResult.success) {
    console.log('RPC approach failed, trying direct REST API manipulation...');
    
    // Alternative: Try to create tables by attempting operations that would trigger table creation
    const testUrl = `${supabaseUrl}/rest/v1/projects`;
    const testResponse = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('Direct REST test status:', testResponse.status);
    const testResult = await testResponse.text();
    console.log('Direct REST test result:', testResult);
  }
  
  return contactsResult.success && projectsResult.success;
}

async function insertProjectsIfTablesExist() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const projects = [
    {
      title: "Aura Boulevard",
      slug: "aura-boulevard",
      description: "Moderno complejo residencial ubicado estratégicamente en Punta Cana Design District con plaza comercial exclusiva.",
      price: "Desde US$89,000",
      location: "Punta Cana Design District",
      completion: "Diciembre 2025",
      features: ["Suite hotelera y apartamentos de 1-2 habitaciones", "Plaza comercial exclusiva en la entrada", "Piscinas, jacuzzis climatizados y parque acuático"],
      image_url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      pdf_url: "/pdfs/aura-boulevard.pdf"
    }
  ];
  
  // Try to insert a single project to test if tables exist
  const url = `${supabaseUrl}/rest/v1/projects`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(projects[0])
  });
  
  const result = await response.text();
  console.log('Insert test result:', response.status, result);
  
  if (response.ok) {
    console.log('✅ Successfully inserted test project - tables exist and working!');
    return true;
  } else {
    console.log('❌ Insert failed - tables might not exist yet');
    return false;
  }
}

async function main() {
  console.log('=== Supabase Database Setup via REST API ===');
  
  // Step 1: Try to create tables
  const tablesCreated = await createTablesInSupabase();
  
  // Step 2: Test if we can insert data
  const canInsertData = await insertProjectsIfTablesExist();
  
  console.log('\n=== Results ===');
  console.log('Tables creation:', tablesCreated ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Data insertion test:', canInsertData ? '✅ SUCCESS' : '❌ FAILED');
  
  if (canInsertData) {
    console.log('\n🎉 Database is ready! You can now run the full data insertion script.');
  } else {
    console.log('\n⚠️  Tables need to be created manually in Supabase dashboard first.');
    console.log('Please use the SQL script provided in supabase-setup.sql');
  }
}

main().catch(console.error);