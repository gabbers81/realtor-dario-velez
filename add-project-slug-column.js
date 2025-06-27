import { createClient } from '@supabase/supabase-js';

async function addProjectSlugColumn() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Use RPC to execute SQL - Supabase supports this for service role
    const { data, error } = await supabase.rpc('exec_sql', {
      query: 'ALTER TABLE contacts ADD COLUMN IF NOT EXISTS project_slug TEXT;'
    });

    if (error) {
      console.error('Error adding project_slug column:', error);
      // Try alternative method via REST API header
      console.log('Attempting alternative method...');
      
      // Use the REST API with custom headers to execute raw SQL
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({
          query: 'ALTER TABLE contacts ADD COLUMN IF NOT EXISTS project_slug TEXT;'
        })
      });

      if (!response.ok) {
        console.error('Alternative method also failed:', await response.text());
        return;
      }
    }

    console.log('✅ Successfully added project_slug column to contacts table');

    // Test by fetching a contact to see the new schema
    const { data: testData, error: testError } = await supabase
      .from('contacts')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('Error testing new column:', testError);
    } else {
      console.log('✅ Table schema updated successfully');
      if (testData && testData.length > 0) {
        console.log('Sample record structure:', Object.keys(testData[0]));
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

addProjectSlugColumn();