import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Project image mappings
const projectImageMappings = {
  'aura-boulevard': [
    '/images/aura-boulevard-1.jpg',
    '/images/aura-boulevard-2.jpg'
  ],
  'las-cayas-residences': [
    '/images/las-cayas-residences-1.jpg',
    '/images/las-cayas-residences-2.jpg'
  ],
  'tropical-beach-3-0': [
    '/images/tropical-beach-1.jpg',
    '/images/tropical-beach-2.jpg'
  ],
  'palm-beach-residences': [
    '/images/palm-beach-residences-1.jpg',
    '/images/palm-beach-residences-2.jpg'
  ],
  'the-reef': [
    '/images/the-reef-1.jpg',
    '/images/the-reef-2.jpg'
  ],
  'secret-garden': [
    '/images/secret-garden-1.jpg',
    '/images/secret-garden-2.jpg'
  ],
  'solvamar-macao': [
    '/images/solvamar-macao-1.jpg',
    '/images/solvamar-macao-2.jpg'
  ],
  'amares-unique-homes': [
    '/images/amares-unique-homes-1.jpg',
    '/images/amares-unique-homes-2.jpg'
  ]
};

async function updateProjectImages() {
  try {
    console.log('🔄 Updating project images...');
    
    // First, add the images column if it doesn't exist
    try {
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE projects ADD COLUMN IF NOT EXISTS images text[] DEFAULT \'{}\';'
      });
      
      if (alterError) {
        console.log('Using direct SQL alter (expected if column exists):', alterError.message);
      }
    } catch (error) {
      console.log('Column may already exist or permission issue:', error.message);
    }
    
    // Get all projects
    const { data: projects, error: fetchError } = await supabase
      .from('projects')
      .select('*');
    
    if (fetchError) {
      throw new Error(`Error fetching projects: ${fetchError.message}`);
    }
    
    console.log(`Found ${projects.length} projects to update`);
    
    // Update each project with its images
    for (const project of projects) {
      const images = projectImageMappings[project.slug];
      
      if (images) {
        console.log(`Updating ${project.slug} with ${images.length} images`);
        
        const { error: updateError } = await supabase
          .from('projects')
          .update({ images })
          .eq('slug', project.slug);
        
        if (updateError) {
          console.error(`Error updating ${project.slug}:`, updateError.message);
        } else {
          console.log(`✅ Updated ${project.slug}`);
        }
      } else {
        console.log(`⚠️ No images found for ${project.slug}`);
      }
    }
    
    console.log('✅ Project images update completed');
    
  } catch (error) {
    console.error('Error updating project images:', error);
    process.exit(1);
  }
}

updateProjectImages();