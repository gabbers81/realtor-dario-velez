// Test the REST API fallback functionality
import { createClient } from '@supabase/supabase-js';

async function testRestApiFallback() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('Testing Supabase REST API functionality...');
  
  const supabase = createClient(supabaseUrl, serviceKey);
  
  // Test 1: Check if we can connect to Supabase
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('count')
      .limit(1);
    
    console.log('Connection test result:', { data, error });
    
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('✅ Connection successful - tables need to be created');
        
        // Let's create a script that you can run manually in Supabase SQL editor
        console.log('\n=== SQL Script for Supabase Dashboard ===');
        console.log('Copy and paste this into your Supabase SQL Editor:');
        console.log('');
        console.log('-- Create contacts table');
        console.log(`CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  budget TEXT NOT NULL,
  down_payment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);`);
        console.log('');
        console.log('-- Create projects table');
        console.log(`CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price TEXT NOT NULL,
  location TEXT NOT NULL,
  completion TEXT NOT NULL,
  features TEXT[] NOT NULL,
  image_url TEXT NOT NULL,
  pdf_url TEXT
);`);
        console.log('');
        console.log('-- Insert sample project to test');
        console.log(`INSERT INTO projects (title, slug, description, price, location, completion, features, image_url, pdf_url) VALUES 
('Test Project', 'test-project', 'A test project for validation', 'US$100,000', 'Test Location', 'Test Date', ARRAY['Feature 1', 'Feature 2'], 'https://example.com/image.jpg', '/test.pdf');`);
        
        console.log('\n=== End SQL Script ===');
        
        return { success: true, needsSetup: true };
      } else {
        console.log('❌ Unexpected error:', error.message);
        return { success: false, error: error.message };
      }
    } else {
      console.log('✅ Tables exist and accessible via REST API');
      return { success: true, needsSetup: false };
    }
    
  } catch (error) {
    console.error('❌ REST API test failed:', error);
    return { success: false, error: error.message };
  }
}

async function testInsertion() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const supabase = createClient(supabaseUrl, serviceKey);
  
  console.log('\nTesting data insertion...');
  
  const testProject = {
    title: "REST API Test Project",
    slug: "rest-api-test",
    description: "Testing REST API insertion",
    price: "Test Price",
    location: "Test Location",
    completion: "Test Date",
    features: ["Test Feature"],
    image_url: "https://example.com/test.jpg",
    pdf_url: "/test.pdf"
  };
  
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert(testProject)
      .select()
      .single();
    
    if (error) {
      console.log('❌ Insertion failed:', error.message);
      if (error.message.includes('does not exist')) {
        console.log('ℹ️  Tables need to be created first');
      }
      return false;
    } else {
      console.log('✅ Insertion successful:', data.title);
      
      // Clean up test data
      await supabase
        .from('projects')
        .delete()
        .eq('slug', 'rest-api-test');
      
      console.log('✅ Test data cleaned up');
      return true;
    }
  } catch (error) {
    console.error('❌ Insertion test error:', error);
    return false;
  }
}

async function main() {
  console.log('=== Supabase REST API Test ===');
  
  const connectionResult = await testRestApiFallback();
  
  if (connectionResult.success) {
    if (!connectionResult.needsSetup) {
      const insertionResult = await testInsertion();
      console.log('\nInsertion test:', insertionResult ? '✅ SUCCESS' : '❌ FAILED');
    }
  }
  
  console.log('\n=== Test Complete ===');
}

main().catch(console.error);