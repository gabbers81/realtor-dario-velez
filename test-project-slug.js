import { createClient } from '@supabase/supabase-js';

async function testProjectSlugColumn() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('Testing if project_slug column exists...');
    
    // Try to insert a test contact with project_slug
    const testContact = {
      full_name: 'Test User',
      email: 'test@example.com',
      phone: '+1 (829) 123-4567',
      budget: 'US$80k-120k',
      project_slug: 'las-cayas-residences'
    };

    const { data, error } = await supabase
      .from('contacts')
      .insert(testContact)
      .select()
      .single();

    if (error) {
      if (error.code === '42703') {
        console.log('❌ project_slug column does not exist yet');
        console.log('Error:', error.message);
      } else {
        console.log('✅ project_slug column exists, but insertion failed for another reason:', error.message);
      }
    } else {
      console.log('✅ project_slug column exists and working!');
      console.log('Test contact created with ID:', data.id);
      
      // Clean up test contact
      const { error: deleteError } = await supabase
        .from('contacts')
        .delete()
        .eq('id', data.id);
      
      if (deleteError) {
        console.log('Warning: Could not delete test contact:', deleteError.message);
      } else {
        console.log('✅ Test contact cleaned up');
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testProjectSlugColumn();