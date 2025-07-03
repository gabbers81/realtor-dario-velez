-- Add images column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Update projects with their image arrays
UPDATE projects SET images = ARRAY[
  '/images/aura-boulevard-1.jpg',
  '/images/aura-boulevard-2.jpg'
] WHERE slug = 'aura-boulevard';

UPDATE projects SET images = ARRAY[
  '/images/las-cayas-residences-1.jpg',
  '/images/las-cayas-residences-2.jpg'
] WHERE slug = 'las-cayas-residences';

UPDATE projects SET images = ARRAY[
  '/images/tropical-beach-1.jpg',
  '/images/tropical-beach-2.jpg'
] WHERE slug = 'tropical-beach-3-0';

UPDATE projects SET images = ARRAY[
  '/images/palm-beach-residences-1.jpg',
  '/images/palm-beach-residences-2.jpg'
] WHERE slug = 'palm-beach-residences';

UPDATE projects SET images = ARRAY[
  '/images/the-reef-1.jpg',
  '/images/the-reef-2.jpg'
] WHERE slug = 'the-reef';

UPDATE projects SET images = ARRAY[
  '/images/secret-garden-1.jpg',
  '/images/secret-garden-2.jpg'
] WHERE slug = 'secret-garden';

UPDATE projects SET images = ARRAY[
  '/images/solvamar-macao-1.jpg',
  '/images/solvamar-macao-2.jpg'
] WHERE slug = 'solvamar-macao';

UPDATE projects SET images = ARRAY[
  '/images/amares-unique-homes-1.jpg',
  '/images/amares-unique-homes-2.jpg'
] WHERE slug = 'amares-unique-homes';