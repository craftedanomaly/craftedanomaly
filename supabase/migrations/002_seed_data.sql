-- Insert categories
INSERT INTO categories (slug, name_en, name_tr, desc_en, desc_tr, "order") VALUES
('films', 'Films', 'Filmler', 'Cinematic storytelling through visual narratives', 'Görsel anlatılar aracılığıyla sinematik hikaye anlatımı', 1),
('mekan-tasarimi', 'Spatial Design', 'Mekan Tasarımı', 'Transforming spaces into immersive experiences', 'Mekanları sürükleyici deneyimlere dönüştürme', 2),
('gorsel-tasarim', 'Visual Design', 'Görsel Tasarım', 'Crafting visual identities that resonate', 'Yankı uyandıran görsel kimlikler yaratma', 3),
('afis-jenerik', 'Poster & Title Design', 'Afiş ve Jenerik Tasarımı', 'Creating compelling visual communications', 'Etkileyici görsel iletişim yaratma', 4),
('uygulama-tasarimi', 'App Design', 'Uygulama Tasarımı', 'Designing intuitive digital experiences', 'Sezgisel dijital deneyimler tasarlama', 5),
('games', 'Games', 'Oyunlar', 'Interactive experiences that engage and delight', 'İlgi çeken ve memnun eden etkileşimli deneyimler', 6),
('books', 'Books', 'Kitaplar', 'Editorial design that brings stories to life', 'Hikayeleri hayata geçiren editöryal tasarım', 7);

-- Insert sample media (placeholder URLs - replace with actual media)
INSERT INTO media (type, url, alt_en, alt_tr, width, height) VALUES
('image', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=800', 'Hero image 1', 'Ana görsel 1', 1200, 800),
('image', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=800', 'Hero image 2', 'Ana görsel 2', 1200, 800),
('video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'Hero video', 'Ana video', 1920, 1080),
('image', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600', 'Film project 1', 'Film projesi 1', 800, 600),
('image', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600', 'Film project 2', 'Film projesi 2', 800, 600),
('image', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600', 'Spatial design 1', 'Mekan tasarımı 1', 800, 600),
('image', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600', 'Spatial design 2', 'Mekan tasarımı 2', 800, 600),
('image', 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=600', 'Visual design 1', 'Görsel tasarım 1', 800, 600),
('image', 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&h=600', 'Visual design 2', 'Görsel tasarım 2', 800, 600);

-- Insert home hero slides
INSERT INTO hero_slides (scope, media_id, title_en, title_tr, cta_label_en, cta_label_tr, cta_href, "order")
SELECT 
  'home',
  m.id,
  CASE 
    WHEN m.alt_en = 'Hero image 1' THEN 'Crafting Dreams'
    WHEN m.alt_en = 'Hero image 2' THEN 'Visual Storytelling'
    WHEN m.alt_en = 'Hero video' THEN 'Immersive Experiences'
  END,
  CASE 
    WHEN m.alt_en = 'Hero image 1' THEN 'Hayalleri Şekillendiriyoruz'
    WHEN m.alt_en = 'Hero image 2' THEN 'Görsel Hikaye Anlatımı'
    WHEN m.alt_en = 'Hero video' THEN 'Sürükleyici Deneyimler'
  END,
  'Explore',
  'Keşfet',
  '/',
  CASE 
    WHEN m.alt_en = 'Hero image 1' THEN 1
    WHEN m.alt_en = 'Hero image 2' THEN 2
    WHEN m.alt_en = 'Hero video' THEN 3
  END
FROM media m
WHERE m.alt_en IN ('Hero image 1', 'Hero image 2', 'Hero video');

-- Insert sample tags
INSERT INTO tags (label_en, label_tr, category_id)
SELECT 
  'Documentary',
  'Belgesel',
  c.id
FROM categories c WHERE c.slug = 'films'
UNION ALL
SELECT 
  'Commercial',
  'Reklam',
  c.id
FROM categories c WHERE c.slug = 'films'
UNION ALL
SELECT 
  'Interior',
  'İç Mekan',
  c.id
FROM categories c WHERE c.slug = 'mekan-tasarimi'
UNION ALL
SELECT 
  'Exhibition',
  'Sergi',
  c.id
FROM categories c WHERE c.slug = 'mekan-tasarimi'
UNION ALL
SELECT 
  'Branding',
  'Marka Kimliği',
  c.id
FROM categories c WHERE c.slug = 'gorsel-tasarim'
UNION ALL
SELECT 
  'Typography',
  'Tipografi',
  c.id
FROM categories c WHERE c.slug = 'gorsel-tasarim';

-- Insert sample projects
INSERT INTO projects (
  slug, title_en, title_tr, blurb_en, blurb_tr, year, role_en, role_tr, 
  client, category_id, cover_media_id, gallery_media_ids, tags, 
  tech_stack, external_links, is_published, "order"
)
SELECT 
  'cinematic-journey',
  'Cinematic Journey',
  'Sinematik Yolculuk',
  'A documentary exploring the intersection of art and technology in modern filmmaking.',
  'Modern film yapımında sanat ve teknolojinin kesişimini keşfeden bir belgesel.',
  2024,
  'Director, Editor',
  'Yönetmen, Editör',
  'Independent',
  c.id,
  m.id,
  jsonb_build_array(m.id),
  jsonb_build_array('Documentary'),
  jsonb_build_array('Adobe Premiere', 'DaVinci Resolve', 'After Effects'),
  jsonb_build_array(jsonb_build_object('label', 'Watch Trailer', 'url', 'https://example.com')),
  true,
  1
FROM categories c, media m
WHERE c.slug = 'films' AND m.alt_en = 'Film project 1'
UNION ALL
SELECT 
  'brand-evolution',
  'Brand Evolution',
  'Marka Evrimi',
  'Complete visual identity redesign for a tech startup.',
  'Bir teknoloji girişimi için tam görsel kimlik yeniden tasarımı.',
  2024,
  'Creative Director',
  'Kreatif Direktör',
  'TechCorp',
  c.id,
  m.id,
  jsonb_build_array(m.id),
  jsonb_build_array('Branding'),
  jsonb_build_array('Adobe Illustrator', 'Figma', 'Photoshop'),
  jsonb_build_array(jsonb_build_object('label', 'View Case Study', 'url', 'https://example.com')),
  true,
  1
FROM categories c, media m
WHERE c.slug = 'gorsel-tasarim' AND m.alt_en = 'Visual design 1'
UNION ALL
SELECT 
  'immersive-gallery',
  'Immersive Gallery',
  'Sürükleyici Galeri',
  'Interactive exhibition space design for contemporary art.',
  'Çağdaş sanat için etkileşimli sergi alanı tasarımı.',
  2023,
  'Spatial Designer',
  'Mekan Tasarımcısı',
  'Modern Art Museum',
  c.id,
  m.id,
  jsonb_build_array(m.id),
  jsonb_build_array('Exhibition'),
  jsonb_build_array('SketchUp', 'Rhino', 'V-Ray'),
  jsonb_build_array(jsonb_build_object('label', 'Virtual Tour', 'url', 'https://example.com')),
  true,
  1
FROM categories c, media m
WHERE c.slug = 'mekan-tasarimi' AND m.alt_en = 'Spatial design 1';

-- Insert main menu
INSERT INTO menus (key, items) VALUES
('main', jsonb_build_array(
  jsonb_build_object('label_en', 'Home', 'label_tr', 'Ana Sayfa', 'href', '/'),
  jsonb_build_object('label_en', 'Films', 'label_tr', 'Filmler', 'href', '/films'),
  jsonb_build_object('label_en', 'Spatial Design', 'label_tr', 'Mekan Tasarımı', 'href', '/mekan-tasarimi'),
  jsonb_build_object('label_en', 'Visual Design', 'label_tr', 'Görsel Tasarım', 'href', '/gorsel-tasarim'),
  jsonb_build_object('label_en', 'Poster & Title Design', 'label_tr', 'Afiş ve Jenerik Tasarımı', 'href', '/afis-jenerik'),
  jsonb_build_object('label_en', 'App Design', 'label_tr', 'Uygulama Tasarımı', 'href', '/uygulama-tasarimi'),
  jsonb_build_object('label_en', 'Games', 'label_tr', 'Oyunlar', 'href', '/games'),
  jsonb_build_object('label_en', 'Books', 'label_tr', 'Kitaplar', 'href', '/books'),
  jsonb_build_object('label_en', 'Contact', 'label_tr', 'İletişim', 'href', '/contact')
));

-- Insert sample admin user (replace with your email)
INSERT INTO admin_users (email, role) VALUES
('admin@craftedanomaly.com', 'admin');
