
import postgres from 'postgres';

async function testAndFixConnection() {
  console.log('🔍 Diagnosing database connection issue...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found');
    return;
  }
  
  console.log('📋 Original URL structure check...');
  console.log('- Length:', databaseUrl.length);
  console.log('- Starts with postgresql://', databaseUrl.startsWith('postgresql://'));
  
  // Extract parts and check for encoding issues
  const urlPattern = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
  const match = databaseUrl.match(urlPattern);
  
  if (!match) {
    console.error('❌ URL format is invalid');
    return;
  }
  
  const [, username, password, host, port, database] = match;
  console.log('📊 Connection details:');
  console.log('- Username:', username);
  console.log('- Host:', host);
  console.log('- Port:', port);
  console.log('- Database:', database);
  console.log('- Password has special chars:', /[^a-zA-Z0-9]/.test(password));
  
  // Try with properly encoded password
  const encodedPassword = encodeURIComponent(password);
  const fixedUrl = `postgresql://${username}:${encodedPassword}@${host}:${port}/${database}`;
  
  console.log('\n🔧 Testing with URL-encoded password...');
  
  try {
    const sql = postgres(fixedUrl, {
      ssl: 'require',
      max: 5,
      idle_timeout: 20,
      connect_timeout: 30,
      prepare: false,
      onnotice: () => {}, // Suppress notices
    });
    
    console.log('🔄 Testing basic connectivity...');
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log('✅ Connection successful!');
    console.log('📊 Database info:', {
      time: result[0].current_time,
      version: result[0].pg_version.split(' ')[0] + ' ' + result[0].pg_version.split(' ')[1]
    });
    
    // Test tables
    console.log('\n🔄 Testing table access...');
    try {
      const projects = await sql`SELECT COUNT(*) as count FROM projects`;
      console.log(`✅ Projects table: ${projects[0].count} records`);
    } catch (error) {
      console.log('❌ Projects table access failed:', error.message);
    }
    
    try {
      const contacts = await sql`SELECT COUNT(*) as count FROM contacts`;
      console.log(`✅ Contacts table: ${contacts[0].count} records`);
    } catch (error) {
      console.log('❌ Contacts table access failed:', error.message);
    }
    
    await sql.end();
    
    // Output the fixed URL for use in .env
    console.log('\n🎯 SOLUTION FOUND:');
    console.log('The password in your DATABASE_URL contains special characters that need URL encoding.');
    console.log('Replace your current DATABASE_URL with:');
    console.log(fixedUrl);
    
    return fixedUrl;
    
  } catch (error) {
    console.error('❌ Fixed URL still fails:', error.message);
    
    if (error.message.includes('SASL_SIGNATURE_MISMATCH')) {
      console.log('\n💡 Additional troubleshooting needed:');
      console.log('1. Verify the password is correct in Supabase dashboard');
      console.log('2. Try regenerating the database password');
      console.log('3. Check if the connection string format has changed');
    }
    
    return null;
  }
}

testAndFixConnection().then(fixedUrl => {
  if (fixedUrl) {
    console.log('\n✅ Connection test completed successfully!');
    console.log('Update your .env file with the fixed URL to resolve the issue.');
  } else {
    console.log('\n❌ Connection test failed. Manual intervention required.');
  }
});
