import postgres from 'postgres';

async function addMissingColumns() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    // Handle URL encoding for special characters
    let encodedUrl = databaseUrl;
    const urlMatch = databaseUrl.match(/^postgresql:\/\/([^:]+):([^@]+)@(.+)$/);
    if (urlMatch) {
      const [, username, password, hostPart] = urlMatch;
      const encodedPassword = encodeURIComponent(password);
      encodedUrl = `postgresql://${username}:${encodedPassword}@${hostPart}`;
    }
    
    const sql = postgres(encodedUrl, {
      ssl: 'require',
      max: 1,
      prepare: false,
      onnotice: () => {},
    });
    
    console.log('🔄 Adding missing columns to contacts table...');
    
    // Add what_in_mind column
    try {
      await sql`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS what_in_mind TEXT`;
      console.log('✅ what_in_mind column added');
    } catch (e) {
      console.log('✅ what_in_mind column already exists');
    }
    
    // Add down_payment column 
    try {
      await sql`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS down_payment TEXT`;
      console.log('✅ down_payment column added');
    } catch (e) {
      console.log('✅ down_payment column already exists');
    }
    
    // Verify final table structure
    console.log('\n🔄 Final contacts table structure:');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'contacts' 
      ORDER BY ordinal_position
    `;
    
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    await sql.end();
    console.log('\n✅ All columns added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding columns:', error.message);
  }
}

addMissingColumns();