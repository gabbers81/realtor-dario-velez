
import postgres from 'postgres';

console.log('🔍 SASL_SIGNATURE_MISMATCH Diagnostic Tool');
console.log('=========================================\n');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}

// Parse the URL to check components
const urlMatch = databaseUrl.match(/^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/);
if (!urlMatch) {
  console.error('❌ Invalid DATABASE_URL format');
  process.exit(1);
}

const [, username, password, host, port, database] = urlMatch;

console.log('📊 Connection Analysis:');
console.log(`- Username: ${username}`);
console.log(`- Host: ${host}`);
console.log(`- Port: ${port}`);
console.log(`- Database: ${database}`);
console.log(`- Password length: ${password.length} chars`);
console.log(`- Contains special chars: ${/[^a-zA-Z0-9]/.test(password)}`);

// Check for common SASL issues
const diagnostics = {
  url_encoding: false,
  connection_type: '',
  ssl_config: '',
  potential_issues: []
};

// 1. Check if it's using correct Supabase pooler
if (host.includes('pooler.supabase.com')) {
  diagnostics.connection_type = 'Supabase Transaction Pooler';
  console.log('✅ Using Supabase Transaction Pooler');
} else if (host.includes('supabase.co')) {
  diagnostics.connection_type = 'Supabase Direct Connection';
  console.log('⚠️ Using Supabase Direct Connection (may cause issues)');
  diagnostics.potential_issues.push('Direct connection instead of pooler');
} else {
  diagnostics.connection_type = 'Non-Supabase';
  console.log('❌ Not using Supabase!');
  diagnostics.potential_issues.push('Using non-Supabase database');
}

// 2. Check for password encoding issues
if (/[^a-zA-Z0-9]/.test(password)) {
  console.log('⚠️ Password contains special characters - testing encoding...');
  const encodedPassword = encodeURIComponent(password);
  if (encodedPassword !== password) {
    diagnostics.url_encoding = true;
    diagnostics.potential_issues.push('Password needs URL encoding');
  }
}

// 3. Test different connection configurations
const testConfigs = [
  {
    name: 'Current URL (as-is)',
    url: databaseUrl,
    options: { ssl: 'require', prepare: false, connect_timeout: 30 }
  },
  {
    name: 'URL-encoded password',
    url: `postgresql://${username}:${encodeURIComponent(password)}@${host}:${port}/${database}`,
    options: { ssl: 'require', prepare: false, connect_timeout: 30 }
  },
  {
    name: 'Relaxed SSL',
    url: databaseUrl,
    options: { ssl: 'prefer', prepare: false, connect_timeout: 30 }
  },
  {
    name: 'No SSL (if allowed)',
    url: databaseUrl,
    options: { ssl: false, prepare: false, connect_timeout: 30 }
  }
];

console.log('\n🔄 Testing connection configurations...\n');

for (const config of testConfigs) {
  console.log(`Testing: ${config.name}`);
  try {
    const sql = postgres(config.url, config.options);
    
    // Try a simple query
    const result = await sql`SELECT NOW() as test_time`;
    console.log(`✅ ${config.name}: SUCCESS`);
    console.log(`   Time: ${result[0].test_time}`);
    
    // Test table access
    try {
      const projects = await sql`SELECT COUNT(*) as count FROM projects`;
      console.log(`   Projects table: ${projects[0].count} records`);
    } catch (tableError) {
      console.log(`   ⚠️ Projects table error: ${tableError.message}`);
    }
    
    await sql.end();
    
    // If this configuration works, show the solution
    console.log(`\n🎯 WORKING CONFIGURATION FOUND:`);
    console.log(`URL: ${config.url}`);
    console.log(`Options:`, JSON.stringify(config.options, null, 2));
    break;
    
  } catch (error) {
    console.log(`❌ ${config.name}: ${error.message}`);
    
    // Analyze specific error types
    if (error.message.includes('SASL_SIGNATURE_MISMATCH')) {
      console.log('   → SASL authentication failed');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('   → DNS resolution failed');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('   → Connection refused');
    } else if (error.message.includes('timeout')) {
      console.log('   → Connection timeout');
    }
  }
  console.log('');
}

// 4. Check environment for conflicting variables
console.log('🔍 Checking for conflicting environment variables...');
const pgVars = Object.keys(process.env).filter(key => key.startsWith('PG'));
if (pgVars.length > 0) {
  console.log('⚠️ Found PostgreSQL environment variables:');
  pgVars.forEach(varName => {
    console.log(`   ${varName}=${process.env[varName]}`);
  });
  diagnostics.potential_issues.push('Conflicting PostgreSQL environment variables');
} else {
  console.log('✅ No conflicting PostgreSQL environment variables');
}

// 5. Final recommendations
console.log('\n📋 DIAGNOSTIC SUMMARY:');
console.log('=====================');
console.log(`Connection Type: ${diagnostics.connection_type}`);
console.log(`URL Encoding Needed: ${diagnostics.url_encoding ? 'YES' : 'NO'}`);

if (diagnostics.potential_issues.length > 0) {
  console.log('\n⚠️ POTENTIAL ISSUES:');
  diagnostics.potential_issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue}`);
  });
}

console.log('\n🔧 RECOMMENDED FIXES:');

if (diagnostics.potential_issues.includes('Using non-Supabase database')) {
  console.log('1. ❗ CRITICAL: You must use ONLY Supabase. Remove any other database connections.');
  console.log('   Update your .env to use only the Supabase connection string.');
}

if (diagnostics.potential_issues.includes('Direct connection instead of pooler')) {
  console.log('2. Use Transaction Pooler connection string from Supabase:');
  console.log('   Format: postgresql://postgres.PROJECT_ID:PASSWORD@aws-0-us-east-2.pooler.supabase.com:6543/postgres');
}

if (diagnostics.potential_issues.includes('Password needs URL encoding')) {
  console.log('3. URL-encode your password in the connection string:');
  console.log(`   Encoded password: ${encodeURIComponent(password)}`);
}

if (diagnostics.potential_issues.includes('Conflicting PostgreSQL environment variables')) {
  console.log('4. Remove conflicting PostgreSQL environment variables');
}

console.log('\n🎯 NEXT STEPS:');
console.log('1. Get fresh Transaction Pooler connection string from Supabase dashboard');
console.log('2. Update .env with the new connection string');
console.log('3. Ensure password is URL-encoded if it contains special characters');
console.log('4. Remove any conflicting PostgreSQL environment variables');
console.log('5. Restart your application');
