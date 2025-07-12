import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;

// Extract components manually
const match = databaseUrl.match(/^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/);
if (!match) {
  console.log('❌ URL format invalid');
  process.exit(1);
}

const [, username, password, host, port, database] = match;

console.log('Connection components:');
console.log('- Username:', username);
console.log('- Password length:', password.length);
console.log('- Host:', host);
console.log('- Port:', port);
console.log('- Database:', database);

// Test with manual connection parameters
console.log('\n🔄 Testing with manual parameters...');
try {
  const sql = postgres({
    host: host,
    port: parseInt(port),
    database: database,
    username: username,
    password: password,
    ssl: 'require',
    max: 1,
    connect_timeout: 30,
    prepare: false,
    debug: false
  });
  
  const result = await sql`SELECT 1 as test`;
  console.log('✅ Manual parameters successful:', result);
  await sql.end();
} catch (error) {
  console.log('❌ Manual parameters failed:', error.message);
  
  // Try with SSL disabled
  console.log('\n🔄 Testing manual parameters with SSL disabled...');
  try {
    const sql2 = postgres({
      host: host,
      port: parseInt(port),
      database: database,
      username: username,
      password: password,
      ssl: false,
      max: 1,
      connect_timeout: 30,
      prepare: false,
      debug: false
    });
    
    const result2 = await sql2`SELECT 1 as test`;
    console.log('✅ Manual parameters (no SSL) successful:', result2);
    await sql2.end();
  } catch (error2) {
    console.log('❌ Manual parameters (no SSL) failed:', error2.message);
  }
}

process.exit(0);