-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  budget TEXT NOT NULL,
  down_payment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
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
);

-- Insert sample projects
INSERT INTO projects (title, slug, description, price, location, completion, features, image_url, pdf_url) VALUES
('Aura Boulevard', 'aura-boulevard', 'Moderno complejo residencial ubicado estratégicamente en Punta Cana Design District con plaza comercial exclusiva.', 'Desde US$89,000', 'Punta Cana Design District', 'Diciembre 2025', 
 ARRAY['Suite hotelera y apartamentos de 1-2 habitaciones', 'Plaza comercial exclusiva en la entrada', 'Piscinas, jacuzzis climatizados y parque acuático', 'Cancha de padel y baloncesto', 'Hotel boutique y centro de convenciones', 'A 5 minutos del aeropuerto internacional'], 
 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500', 
 '/pdfs/aura-boulevard.pdf'),

('Secret Garden', 'secret-garden', 'Proyecto cerrado exclusivo en el corazón de Bávaro con área comercial, viviendas unifamiliares y condos.', 'Desde US$160,000', 'Bávaro', 'Marzo 2026',
 ARRAY['327 unidades: 19 duplex, 64 estudios y 278 condos', '1, 2 y 3 habitaciones disponibles', 'Área comercial integrada', 'Piscina de 1,800m² con pool bar', 'Gimnasio, coworking y mini-golf', 'Pista de volley-playa', 'Restaurante y amplias zonas ajardinadas', 'A pasos de Playa Bávaro'],
 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500',
 '/pdfs/secret-garden.pdf'),

('The Reef', 'the-reef', 'Complejo de lujo en primera línea de playa con hotel, residencias y piscinas naturales en Las Terrenas.', 'Desde US$165,000', 'Las Terrenas, Samaná', 'Marzo 2026',
 ARRAY['435 apartamentos de 2 y 3 habitaciones', 'Hotel de 81 habitaciones integrado', '4 piscinas naturales conectadas', 'Club de playa exclusivo', 'Spa y gimnasio completo', 'Zona comercial y restaurantes', 'Sendero ecológico y bosque frutal', 'Canchas de tenis y pádel'],
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500',
 '/pdfs/the-reef.pdf'),

('Palm Beach Residences', 'palm-beach-residences', 'Torre residencial de lujo con amenidades resort en el prestigioso Cap Cana.', 'Desde US$225,000', 'Cap Cana', 'Noviembre 2025',
 ARRAY['Apartamentos de 1 y 2 habitaciones', 'Vestíbulo de doble altura', 'Piscina infinity con bar', 'Área de juegos para niños', 'Zona para mascotas', 'Gimnasio y spa', 'Salón de eventos', 'Acceso directo a la playa'],
 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500',
 '/pdfs/palm-beach-residences.pdf'),

('Solvamar Macao', 'solvamar-macao', 'Desarrollo de apartamentos de lujo con vista al mar en la exótica playa de Macao.', 'Desde US$180,000', 'Playa Macao', 'Abril 2026',
 ARRAY['Apartamentos de 1, 2 y 3 habitaciones', 'Vista panorámica al océano', 'Piscina infinity en la azotea', 'Acceso directo a Playa Macao', 'Restaurante gourmet', 'Centro de bienestar y spa', 'Concierge 24/7', 'Estacionamiento privado'],
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500',
 '/pdfs/solvamar-macao.pdf'),

('Amares Unique Homes', 'amares-unique-homes', 'Villas exclusivas de diseño único en entorno natural privilegiado con amenidades de lujo.', 'Desde US$320,000', 'Punta Cana', 'Junio 2026',
 ARRAY['Villas de 3 y 4 habitaciones', 'Diseño arquitectónico único', 'Piscina privada en cada villa', 'Jardines tropicales privados', 'Club house exclusivo', 'Campo de golf a 18 hoyos', 'Servicio de mayordomo', 'Helipuerto privado'],
 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500',
 '/pdfs/amares-unique-homes.pdf'),

('Tropical Beach 3.0', 'tropical-beach-3-0', 'Moderna torre residencial con tecnología sostenible y amenidades de resort en primera línea de playa.', 'Desde US$195,000', 'Playa Bavaro', 'Enero 2027',
 ARRAY['Apartamentos de 1, 2 y 3 habitaciones', 'Tecnología domótica integrada', 'Energía solar y sistemas eco-friendly', 'Piscina climatizada todo el año', 'Spa y centro de wellness', 'Co-working space', 'Roof-top bar y restaurante', 'Acceso directo a la playa'],
 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500',
 '/pdfs/tropical-beach-3-0.pdf'),

('Las Cayas Residences', 'las-cayas-residences', 'Complejo residencial tropical con lagunas artificiales y amenidades familiares en entorno natural.', 'Desde US$145,000', 'Bávaro', 'Octubre 2026',
 ARRAY['Apartamentos y villas familiares', 'Lagunas artificiales navegables', 'Parque acuático para niños', 'Senderos ecológicos', 'Centro ecuestre', 'Marina privada', 'Restaurantes temáticos', 'Seguridad 24/7'],
 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500',
 '/pdfs/las-cayas-residences.pdf');