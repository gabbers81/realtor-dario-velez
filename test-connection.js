import postgres from 'postgres';

async function testConnection() {
  try {
    const databaseUrl = process.env.DATABASE_URL.trim();
    console.log('Testing connection to:', databaseUrl.replace(/:[^:@]+@/, ':***@'));
    
    // Encode special characters in password
    const encodedUrl = databaseUrl.replace(/(:)([^:@]+)(@)/, (match, colon, password, at) => {
      return colon + encodeURIComponent(password) + at;
    });
    
    const sql = postgres(encodedUrl, {
      ssl: 'require',
      max: 1,
      idle_timeout: 5,
      connect_timeout: 30,
    });
    
    // Test basic connection
    const result = await sql`SELECT version() as version, current_database() as db`;
    console.log('Connection successful:', result[0]);
    
    // Test table creation
    await sql`CREATE TABLE IF NOT EXISTS test_table (id serial primary key, name text)`;
    console.log('Table creation successful');
    
    // Clean up
    await sql`DROP TABLE IF EXISTS test_table`;
    console.log('Cleanup successful');
    
    await sql.end();
    console.log('All tests passed!');
    
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testConnection();