import postgres from 'postgres';
import { createConnection } from 'net';

async function testIPv6Connection() {
  try {
    console.log('Testing IPv6 connection to Supabase...');
    
    const databaseUrl = process.env.DATABASE_URL.trim();
    console.log('Original URL:', databaseUrl.replace(/:[^:@]+@/, ':***@'));
    
    // Try with explicit IPv6 configuration
    const sql = postgres(databaseUrl, {
      ssl: 'require',
      max: 1,
      idle_timeout: 5,
      connect_timeout: 30,
      // Force IPv6 resolution
      host_type: 'tcp',
      transform: {
        ...postgres.defaultOptions.transform,
        column: {
          from: postgres.camel,
          to: postgres.camel
        }
      }
    });
    
    console.log('Attempting database query...');
    const result = await sql`SELECT version() as version, current_database() as db, inet_server_addr() as server_ip`;
    console.log('Success! Database info:', result[0]);
    
    await sql.end();
    return true;
    
  } catch (error) {
    console.error('IPv6 connection failed:', error.message);
    return false;
  }
}

async function testDirectSocket() {
  return new Promise((resolve) => {
    console.log('Testing direct socket connection...');
    
    const socket = createConnection({
      host: '2600:1f16:1cd0:3316:e643:b606:3da4:31d3',
      port: 5432,
      family: 6 // Force IPv6
    });
    
    socket.setTimeout(10000);
    
    socket.on('connect', () => {
      console.log('Direct IPv6 socket connection successful!');
      socket.destroy();
      resolve(true);
    });
    
    socket.on('error', (err) => {
      console.log('Direct socket error:', err.message);
      resolve(false);
    });
    
    socket.on('timeout', () => {
      console.log('Direct socket timeout');
      socket.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log('=== Testing Supabase IPv6 Connectivity ===');
  
  const socketResult = await testDirectSocket();
  const dbResult = await testIPv6Connection();
  
  console.log('\n=== Results ===');
  console.log('Direct socket:', socketResult ? 'SUCCESS' : 'FAILED');
  console.log('Database connection:', dbResult ? 'SUCCESS' : 'FAILED');
  
  if (!socketResult && !dbResult) {
    console.log('\nIPv6 connectivity is not available in this environment.');
    console.log('Consider using Supabase REST API as an alternative.');
  }
}

main();