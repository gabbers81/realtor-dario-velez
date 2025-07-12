import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;

// Test with direct connection (port 5432 instead of 6543)
const directUrl = databaseUrl.replace(':6543/', ':5432/');

console.log('Testing direct connection (port 5432)...');
console.log('Original URL has port 6543:', databaseUrl.includes(':6543'));
console.log('Direct URL has port 5432:', directUrl.includes(':5432'));

console.log('\n🔄 Testing with direct connection (port 5432)...');
try {
  const sql = postgres(directUrl, {
    ssl: 'require',
    max: 1,
    connect_timeout: 30,
    prepare: false,
    debug: false
  });
  
  const result = await sql`SELECT 1 as test`;
  console.log('✅ Direct connection (5432) successful:', result);
  await sql.end();
} catch (error) {
  console.log('❌ Direct connection (5432) failed:', error.message);
  
  // Try with different SSL settings
  console.log('\n🔄 Testing direct connection with SSL prefer...');
  try {
    const sql2 = postgres(directUrl, {
      ssl: 'prefer',
      max: 1,
      connect_timeout: 30,
      prepare: false,
      debug: false
    });
    
    const result2 = await sql2`SELECT 1 as test`;
    console.log('✅ Direct connection (SSL prefer) successful:', result2);
    await sql2.end();
  } catch (error2) {
    console.log('❌ Direct connection (SSL prefer) failed:', error2.message);
  }
}

process.exit(0);