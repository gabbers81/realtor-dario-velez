// Debug URL format issues
const databaseUrl = process.env.DATABASE_URL;

console.log('🔍 Debugging DATABASE_URL format...');

if (databaseUrl) {
  console.log('✅ DATABASE_URL exists');
  console.log('📏 Length:', databaseUrl.length);
  
  // Check for common URL issues
  console.log('\n🔍 URL Structure Analysis:');
  console.log('- Starts with postgresql://', databaseUrl.startsWith('postgresql://'));
  console.log('- Contains @:', databaseUrl.includes('@'));
  console.log('- Contains :', databaseUrl.includes(':'));
  
  // Show first and last parts (hiding sensitive info)
  const visibleStart = databaseUrl.substring(0, 20);
  const visibleEnd = databaseUrl.substring(databaseUrl.length - 20);
  console.log('- Start:', visibleStart + '...');
  console.log('- End:', '...' + visibleEnd);
  
  // Try parsing with URL constructor
  try {
    const url = new URL(databaseUrl);
    console.log('\n✅ URL is valid according to URL constructor');
    console.log('- Protocol:', url.protocol);
    console.log('- Host:', url.host);
    console.log('- Port:', url.port);
    console.log('- Username:', url.username);
    console.log('- Database:', url.pathname);
  } catch (error) {
    console.log('\n❌ URL parsing failed:', error.message);
    
    // Check for common issues
    if (databaseUrl.includes(' ')) {
      console.log('🔍 Found spaces in URL - this could be the issue');
    }
    if (databaseUrl.includes('\n')) {
      console.log('🔍 Found newlines in URL - this could be the issue');
    }
    if (!databaseUrl.includes('://')) {
      console.log('🔍 Missing protocol - this could be the issue');
    }
  }
  
  // Try the old working connection to see if it's a format issue
  console.log('\n🔄 Testing with manual URL construction...');
  
  // Extract parts manually
  const parts = databaseUrl.split('@');
  if (parts.length === 2) {
    const userPart = parts[0];
    const hostPart = parts[1];
    
    console.log('- User part detected:', userPart.includes('postgresql://'));
    console.log('- Host part detected:', hostPart.length > 10);
    
    // Try constructing a clean URL
    const cleanUrl = `${userPart}@${hostPart}`.trim();
    console.log('- Clean URL length:', cleanUrl.length);
    console.log('- Original length:', databaseUrl.length);
    console.log('- Lengths match:', cleanUrl.length === databaseUrl.length);
  }
  
} else {
  console.log('❌ DATABASE_URL not found in environment');
}

// Also test with basic postgres connection
import postgres from 'postgres';

console.log('\n🔄 Testing with postgres library directly...');
try {
  // Try with minimal options first
  const sql = postgres(databaseUrl, {
    prepare: false,
    connect_timeout: 10
  });
  
  console.log('✅ postgres() constructor succeeded');
  await sql.end();
} catch (error) {
  console.log('❌ postgres() constructor failed:', error.message);
  
  if (error.message.includes('Invalid URL')) {
    console.log('\n💡 SOLUTION: The URL format is invalid.');
    console.log('Please ensure the DATABASE_URL follows this exact format:');
    console.log('postgresql://username:password@host:port/database');
    console.log('\nFor Supabase Transaction Pooler, it should be:');
    console.log('postgresql://postgres.PROJECT_ID:PASSWORD@aws-0-us-east-2.pooler.supabase.com:6543/postgres');
  }
}