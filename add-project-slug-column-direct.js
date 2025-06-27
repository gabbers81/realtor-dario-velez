import postgres from 'postgres';

async function addProjectSlugColumn() {
  console.log('🔄 Adding project_slug column to contacts table...');
  
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    // Handle URL encoding for special characters (like # in password)
    let encodedUrl = databaseUrl;
    const urlMatch = databaseUrl.match(/^postgresql:\/\/([^:]+):([^@]+)@(.+)$/);
    if (urlMatch) {
      const [, username, password, hostPart] = urlMatch;
      const encodedPassword = encodeURIComponent(password);
      encodedUrl = `postgresql://${username}:${encodedPassword}@${hostPart}`;
      console.log('✅ URL encoded for special characters');
    }
    
    const sql = postgres(encodedUrl, {
      ssl: 'require',
      max: 1,
      idle_timeout: 20,
      connect_timeout: 30,
      prepare: false,
      onnotice: () => {},
    });
    
    console.log('🔄 Testing connection...');
    const testResult = await sql`SELECT NOW() as current_time`;
    console.log('✅ Connection successful!');
    
    // Check if project_slug column exists
    console.log('🔄 Checking if project_slug column exists...');
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'contacts' AND column_name = 'project_slug'
    `;
    
    if (columnCheck.length > 0) {
      console.log('✅ project_slug column already exists');
    } else {
      console.log('🔄 Adding project_slug column...');
      await sql`ALTER TABLE contacts ADD COLUMN project_slug TEXT`;
      console.log('✅ project_slug column added successfully');
    }
    
    // Also check if budget column allows NULL
    console.log('🔄 Checking budget column constraints...');
    const budgetCheck = await sql`
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'contacts' AND column_name = 'budget'
    `;
    
    if (budgetCheck.length > 0 && budgetCheck[0].is_nullable === 'NO') {
      console.log('🔄 Making budget column nullable...');
      await sql`ALTER TABLE contacts ALTER COLUMN budget DROP NOT NULL`;
      console.log('✅ budget column is now nullable');
    } else {
      console.log('✅ budget column is already nullable');
    }
    
    // Show final table structure
    console.log('🔄 Final contacts table structure:');
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
    console.log('\n✅ Database schema updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating database schema:', error.message);
    
    if (error.message.includes('SASL_SIGNATURE_MISMATCH')) {
      console.log('\n💡 Authentication error detected. This usually means:');
      console.log('1. The password contains special characters that need encoding');
      console.log('2. The password might be incorrect');
      console.log('3. The connection string format might be wrong');
    }
  }
}

addProjectSlugColumn();