import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;

console.log('Testing Supabase connection...');
console.log('URL format:', databaseUrl ? 'present' : 'missing');

if (!databaseUrl) {
  console.log('❌ DATABASE_URL not found');
  process.exit(1);
}

// Test 1: Basic connection
console.log('\n🔄 Test 1: Basic connection');
try {
  const sql = postgres(databaseUrl, {
    ssl: 'require',
    max: 1,
    connect_timeout: 30,
    prepare: false,
    debug: false
  });
  
  console.log('✅ Connection object created');
  const result = await sql`SELECT 1 as test`;
  console.log('✅ Basic query successful:', result);
  await sql.end();
} catch (error) {
  console.log('❌ Basic connection failed:', error.message);
  
  // Test 2: With different SSL settings
  console.log('\n🔄 Test 2: SSL rejectUnauthorized false');
  try {
    const sql2 = postgres(databaseUrl, {
      ssl: { rejectUnauthorized: false },
      max: 1,
      connect_timeout: 30,
      prepare: false,
      debug: false
    });
    
    const result2 = await sql2`SELECT 1 as test`;
    console.log('✅ SSL flexible connection successful:', result2);
    await sql2.end();
  } catch (error2) {
    console.log('❌ SSL flexible connection failed:', error2.message);
    
    // Test 3: With no SSL
    console.log('\n🔄 Test 3: No SSL');
    try {
      const sql3 = postgres(databaseUrl, {
        ssl: false,
        max: 1,
        connect_timeout: 30,
        prepare: false,
        debug: false
      });
      
      const result3 = await sql3`SELECT 1 as test`;
      console.log('✅ No SSL connection successful:', result3);
      await sql3.end();
    } catch (error3) {
      console.log('❌ No SSL connection failed:', error3.message);
    }
  }
}

process.exit(0);