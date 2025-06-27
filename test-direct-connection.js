import postgres from 'postgres';

async function testDirectConnection() {
  console.log('🔍 Testing direct database connection with updated pooler URL...');
  
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL not found');
      return;
    }
    
    console.log('📡 Connecting to database...');
    
    const sql = postgres(databaseUrl, {
      host_type: 'tcp',
      idle_timeout: 20,
      max_lifetime: 60 * 30,
      connect_timeout: 60,
      prepare: false,
      onnotice: () => {}, // Suppress notices
    });
    
    // Test basic connectivity
    console.log('🔄 Testing basic query...');
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log('✅ Connection successful!');
    console.log('📊 Database info:', {
      time: result[0].current_time,
      version: result[0].pg_version.split(' ')[0] + ' ' + result[0].pg_version.split(' ')[1]
    });
    
    // Test existing table access
    console.log('\n🔄 Testing table access...');
    const contacts = await sql`SELECT COUNT(*) as count FROM contacts`;
    console.log(`✅ Contacts table: ${contacts[0].count} records`);
    
    const projects = await sql`SELECT COUNT(*) as count FROM projects`;
    console.log(`✅ Projects table: ${projects[0].count} records`);
    
    // Test if project_slug column exists
    console.log('\n🔄 Checking contacts table structure...');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'contacts' 
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Contacts table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    const hasProjectSlug = columns.some(col => col.column_name === 'project_slug');
    console.log(`\n📊 project_slug column exists: ${hasProjectSlug ? '✅ YES' : '❌ NO'}`);
    
    await sql.end();
    
    return {
      connected: true,
      hasProjectSlug: hasProjectSlug,
      contactCount: parseInt(contacts[0].count),
      projectCount: parseInt(projects[0].count)
    };
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return {
      connected: false,
      error: error.message
    };
  }
}

testDirectConnection().then(result => {
  console.log('\n📋 CONNECTION TEST RESULTS:');
  console.log(JSON.stringify(result, null, 2));
});