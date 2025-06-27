import { createClient } from '@supabase/supabase-js';

async function debugContactsTable() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('Checking contacts table structure...');
    
    // First, check if we can query existing contacts to see table structure
    const { data: existingContacts, error: fetchError } = await supabase
      .from('contacts')
      .select('*')
      .limit(1);

    if (fetchError) {
      console.error('Error fetching contacts:', fetchError);
    } else {
      console.log('Existing contacts:', existingContacts);
      if (existingContacts && existingContacts.length > 0) {
        console.log('Table columns:', Object.keys(existingContacts[0]));
      }
    }

    // Try inserting a minimal contact to see what fails
    console.log('Attempting minimal contact insertion...');
    const minimalContact = {
      full_name: 'Debug Test',
      email: 'debug@test.com',
      phone: '8291234567'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('contacts')
      .insert(minimalContact)
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
    } else {
      console.log('✅ Insert successful:', insertData);
      
      // Clean up
      await supabase.from('contacts').delete().eq('id', insertData.id);
      console.log('✅ Test record cleaned up');
    }

  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugContactsTable();