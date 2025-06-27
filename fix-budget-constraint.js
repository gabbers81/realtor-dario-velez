import { createClient } from '@supabase/supabase-js';

async function fixBudgetConstraint() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables');
    return;
  }

  console.log('The database budget column has a NOT NULL constraint that needs to be removed.');
  console.log('This needs to be done manually in the Supabase dashboard.');
  console.log('');
  console.log('To fix this issue:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to the SQL Editor');
  console.log('3. Run this SQL command:');
  console.log('');
  console.log('ALTER TABLE contacts ALTER COLUMN budget DROP NOT NULL;');
  console.log('');
  console.log('This will make the budget field optional, allowing contacts to be created without specifying a budget.');
  
  // Test current state
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    console.log('\nTesting current state...');
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        full_name: 'Test User',
        email: 'test@example.com',
        phone: '8291234567',
        budget: 'US$121k-200k' // Including budget to test
      })
      .select()
      .single();

    if (error) {
      console.log('Insert with budget failed:', error.message);
    } else {
      console.log('✅ Insert with budget successful');
      // Clean up
      await supabase.from('contacts').delete().eq('id', data.id);
    }

    // Test without budget
    const { data: data2, error: error2 } = await supabase
      .from('contacts')
      .insert({
        full_name: 'Test User 2',
        email: 'test2@example.com',
        phone: '8291234568'
        // No budget field
      })
      .select()
      .single();

    if (error2) {
      console.log('❌ Insert without budget failed:', error2.message);
      console.log('This confirms the NOT NULL constraint needs to be removed.');
    } else {
      console.log('✅ Insert without budget successful - constraint is already fixed!');
      // Clean up
      await supabase.from('contacts').delete().eq('id', data2.id);
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

fixBudgetConstraint();