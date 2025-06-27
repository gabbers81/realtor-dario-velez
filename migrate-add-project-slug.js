import { createClient } from '@supabase/supabase-js';

async function addProjectSlugColumn() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('Adding project_slug column to contacts table...');
  
  try {
    // Method 1: Use a simple SQL query through Supabase's built-in SQL runner
    // This uses the REST API to execute raw SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: 'ALTER TABLE contacts ADD COLUMN IF NOT EXISTS project_slug TEXT;'
      })
    });

    if (response.ok) {
      console.log('✅ Successfully added project_slug column');
    } else {
      const errorText = await response.text();
      console.log('Direct SQL failed:', errorText);
      
      // Method 2: Try through the management API
      console.log('Trying alternative approach...');
      
      const managementResponse = await fetch(`${supabaseUrl}/database/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: 'ALTER TABLE contacts ADD COLUMN IF NOT EXISTS project_slug TEXT;'
        })
      });

      if (managementResponse.ok) {
        console.log('✅ Successfully added project_slug column via management API');
      } else {
        console.log('Management API also failed:', await managementResponse.text());
        console.log('❌ Unable to add column automatically. Manual intervention required.');
        console.log('Please add the column manually in Supabase dashboard:');
        console.log('ALTER TABLE contacts ADD COLUMN project_slug TEXT;');
      }
    }

    // Test if the column was added successfully
    setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('project_slug')
          .limit(1);
          
        if (error) {
          console.log('Column verification failed:', error.message);
        } else {
          console.log('✅ Column verification successful');
        }
      } catch (e) {
        console.log('Column verification error:', e.message);
      }
    }, 2000);

  } catch (error) {
    console.error('Migration error:', error);
  }
}

addProjectSlugColumn();