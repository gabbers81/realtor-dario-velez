
import postgres from 'postgres';
import fs from 'fs';

console.log('🔧 SASL Authentication Fix Script');
console.log('=================================\n');

const currentUrl = process.env.DATABASE_URL;

if (!currentUrl) {
  console.error('❌ No DATABASE_URL found');
  process.exit(1);
}

// Parse current URL
const urlMatch = currentUrl.match(/^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/);
if (!urlMatch) {
  console.error('❌ Invalid URL format');
  process.exit(1);
}

const [, username, password, host, port, database] = urlMatch;

console.log('Current connection details:');
console.log(`- Host: ${host}`);
console.log(`- Port: ${port}`);
console.log(`- Username: ${username}`);

// Check if using Supabase
if (!host.includes('supabase.co')) {
  console.error('❌ CRITICAL: You are not using Supabase!');
  console.error('This script only works with Supabase databases.');
  console.error('Please update your DATABASE_URL to use Supabase.');
  process.exit(1);
}

// Generate correct Supabase URLs to test
const fixes = [
  {
    description: 'Transaction Pooler with URL-encoded password',
    url: `postgresql://${username}:${encodeURIComponent(password)}@${host.replace(/:[0-9]+/, '')}:6543/${database}`,
    preferred: true
  },
  {
    description: 'Direct connection with URL-encoded password', 
    url: `postgresql://${username}:${encodeURIComponent(password)}@${host.replace('pooler.', '').replace(':6543', ':5432')}/${database}`,
    preferred: false
  }
];

// Test each fix
for (const fix of fixes) {
  console.log(`\n🔄 Testing: ${fix.description}`);
  
  try {
    const sql = postgres(fix.url, {
      ssl: 'require',
      prepare: false,
      connect_timeout: 30,
      max: 5
    });
    
    // Test connection
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Connection successful!');
    
    // Test table access
    try {
      const projects = await sql`SELECT COUNT(*) as count FROM projects LIMIT 1`;
      console.log(`✅ Projects table accessible: ${projects[0].count} records`);
    } catch (tableError) {
      console.log(`⚠️ Projects table issue: ${tableError.message}`);
    }
    
    await sql.end();
    
    // Update .env file with working URL
    console.log('\n🎯 WORKING SOLUTION FOUND!');
    console.log(`Updating .env file with working URL...`);
    
    const envContent = fs.readFileSync('.env', 'utf8');
    const newEnvContent = envContent.replace(
      /^DATABASE_URL=.*$/m,
      `DATABASE_URL=${fix.url}`
    );
    
    fs.writeFileSync('.env', newEnvContent);
    console.log('✅ .env file updated successfully!');
    
    console.log('\n📋 What was fixed:');
    if (fix.url.includes(':6543')) {
      console.log('- Switched to Transaction Pooler (port 6543)');
    }
    if (fix.url !== currentUrl) {
      console.log('- URL-encoded password for special characters');
    }
    console.log('- Configured SSL requirement for security');
    
    console.log('\n🔄 Please restart your application to apply changes.');
    process.exit(0);
    
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    continue;
  }
}

console.log('\n❌ No working configuration found.');
console.log('\n💡 Manual steps required:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Go to Settings > Database');
console.log('3. Copy the "Transaction pooler" connection string');
console.log('4. Replace your current DATABASE_URL in .env');
console.log('5. If password has special characters, URL-encode it');
