// Test URL encoding issues that might be causing the Invalid URL error
const databaseUrl = process.env.DATABASE_URL;

console.log('🔍 Testing URL encoding and special characters...');

if (databaseUrl) {
  // Check for hidden characters
  console.log('Raw URL analysis:');
  for (let i = 0; i < Math.min(50, databaseUrl.length); i++) {
    const char = databaseUrl[i];
    const code = char.charCodeAt(0);
    if (code < 32 || code > 126) {
      console.log(`❌ Found non-printable character at position ${i}: code ${code}`);
    }
  }
  
  // Test different encoding approaches
  console.log('\n🔄 Testing different URL approaches...');
  
  try {
    // Method 1: Try with encodeURI
    const encodedUrl = encodeURI(databaseUrl);
    console.log('✅ encodeURI succeeded');
    
    // Method 2: Try manual parsing and reconstruction
    const urlPattern = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
    const match = databaseUrl.match(urlPattern);
    
    if (match) {
      const [, username, password, host, port, database] = match;
      console.log('✅ URL pattern match succeeded');
      console.log('- Username:', username);
      console.log('- Password length:', password.length);
      console.log('- Host:', host);
      console.log('- Port:', port);
      console.log('- Database:', database);
      
      // Check for special characters in password that might need encoding
      const hasSpecialChars = /[^a-zA-Z0-9]/.test(password);
      console.log('- Password has special chars:', hasSpecialChars);
      
      if (hasSpecialChars) {
        console.log('🔧 Trying URL-encoded password...');
        const encodedPassword = encodeURIComponent(password);
        const newUrl = `postgresql://${username}:${encodedPassword}@${host}:${port}/${database}`;
        
        // Test this reconstructed URL
        try {
          const testUrl = new URL(newUrl);
          console.log('✅ Reconstructed URL is valid');
          
          // Try postgres connection with encoded URL
          import('postgres').then(async ({ default: postgres }) => {
            try {
              const sql = postgres(newUrl, { prepare: false, connect_timeout: 5 });
              console.log('✅ postgres() accepts reconstructed URL');
              await sql.end();
            } catch (error) {
              console.log('❌ postgres() still fails with reconstructed URL:', error.message);
            }
          });
          
        } catch (error) {
          console.log('❌ Reconstructed URL still invalid:', error.message);
        }
      }
    } else {
      console.log('❌ URL does not match expected PostgreSQL pattern');
      console.log('Expected: postgresql://username:password@host:port/database');
    }
    
  } catch (error) {
    console.log('❌ URL encoding failed:', error.message);
  }
  
  // Show safe version for debugging
  const safeUrl = databaseUrl.replace(/:[^@]+@/, ':***@');
  console.log('\n🔍 Safe URL for debugging:', safeUrl);
  
} else {
  console.log('❌ DATABASE_URL not found');
}