-- Crafted Anomaly Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_tr VARCHAR(255) NOT NULL,
  description_en TEXT,
  description_tr TEXT,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title_en VARCHAR(255) NOT NULL,
  title_tr VARCHAR(255),
  blurb_en TEXT NOT NULL,
  blurb_tr TEXT,
  content_en TEXT,
  content_tr TEXT,
  cover_image VARCHAR(500),
  year INTEGER,
  role_en VARCHAR(255),
  role_tr VARCHAR(255),
  client VARCHAR(255),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Tags Junction Table
CREATE TABLE IF NOT EXISTS project_tags (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);

-- Media/Gallery Table
CREATE TABLE IF NOT EXISTS media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  media_type VARCHAR(20) CHECK (media_type IN ('image', 'video', 'document', 'before_after')),
  url VARCHAR(500) NOT NULL,
  before_url VARCHAR(500), -- For before/after comparisons
  after_url VARCHAR(500),  -- For before/after comparisons
  thumbnail_url VARCHAR(500),
  title VARCHAR(255),
  caption_en TEXT,
  caption_tr TEXT,
  display_order INTEGER DEFAULT 0,
  size_bytes BIGINT,
  mime_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tech Stack Table (tools/technologies used in project)
CREATE TABLE IF NOT EXISTS tech_stack (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- External Links Table (live demo, case study, etc.)
CREATE TABLE IF NOT EXISTS external_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  label_en VARCHAR(100) NOT NULL,
  label_tr VARCHAR(100),
  url VARCHAR(500) NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Content Blocks (flexible content sections)
CREATE TABLE IF NOT EXISTS project_content_blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  block_type VARCHAR(50) CHECK (block_type IN ('text', 'image', 'video', 'gallery', 'quote', 'code', 'embed')) NOT NULL,
  content_en TEXT,
  content_tr TEXT,
  media_url VARCHAR(500),
  media_urls TEXT[], -- For galleries
  metadata JSONB, -- For additional settings (alignment, size, etc.)
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hero Slides Table
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type VARCHAR(20) CHECK (type IN ('image', 'video')),
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  title_en VARCHAR(255),
  title_tr VARCHAR(255),
  subtitle_en TEXT,
  subtitle_tr TEXT,
  cta_text_en VARCHAR(100),
  cta_text_tr VARCHAR(100),
  cta_link VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
  consent_given BOOLEAN DEFAULT FALSE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Admin Users Table (for authentication)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url VARCHAR(500),
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'text',
  category VARCHAR(50) DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_projects_category ON projects(category_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_site_settings_setting_key ON site_settings(setting_key);
CREATE INDEX idx_projects_published ON projects(published_at);
CREATE INDEX idx_media_project ON media(project_id);
CREATE INDEX idx_tech_stack_project ON tech_stack(project_id);
CREATE INDEX idx_external_links_project ON external_links(project_id);
CREATE INDEX idx_content_blocks_project ON project_content_blocks(project_id);
CREATE INDEX idx_project_tags_project ON project_tags(project_id);
CREATE INDEX idx_project_tags_tag ON project_tags(tag_id);
CREATE INDEX idx_contact_status ON contact_messages(status);
CREATE INDEX idx_contact_created ON contact_messages(created_at DESC);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_slides_updated_at BEFORE UPDATE ON hero_slides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_blocks_updated_at BEFORE UPDATE ON project_content_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample categories
INSERT INTO categories (slug, name_en, name_tr, description_en, description_tr, icon, display_order) VALUES
  ('films', 'Films', 'Filmler', 'Cinematic storytelling and visual narratives', 'Sinematik hikaye anlatımı ve görsel anlatılar', 'Film', 1),
  ('games', 'Games', 'Oyunlar', 'Interactive experiences and game design', 'İnteraktif deneyimler ve oyun tasarımı', 'Gamepad2', 2),
  ('books', 'Books', 'Kitaplar', 'Written stories and publications', 'Yazılı hikayeler ve yayınlar', 'BookOpen', 3),
  ('mekan-tasarimi', 'Spatial Design', 'Mekan Tasarımı', 'Physical space and environmental design', 'Fiziksel mekan ve çevre tasarımı', 'Home', 4),
  ('gorsel-tasarim', 'Visual Design', 'Görsel Tasarım', 'Graphic design and visual identity', 'Grafik tasarım ve görsel kimlik', 'Palette', 5),
  ('afis-jenerik', 'Poster & Title', 'Afiş & Jenerik', 'Promotional materials and title sequences', 'Tanıtım materyalleri ve jenerik dizileri', 'Layout', 6),
  ('uygulama-tasarimi', 'App Design', 'Uygulama Tasarımı', 'Digital interfaces and user experience', 'Dijital arayüzler ve kullanıcı deneyimi', 'Smartphone', 7)
ON CONFLICT (slug) DO NOTHING;

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public can view published projects"
  ON projects FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public can view categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Public can view tags"
  ON tags FOR SELECT
  USING (true);

CREATE POLICY "Public can view media for published projects"
  ON media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = media.project_id
      AND projects.status = 'published'
    )
  );

CREATE POLICY "Public can view active hero slides"
  ON hero_slides FOR SELECT
  USING (active = true);

CREATE POLICY "Public can view tech stack for published projects"
  ON tech_stack FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tech_stack.project_id
      AND projects.status = 'published'
    )
  );

CREATE POLICY "Public can view external links for published projects"
  ON external_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = external_links.project_id
      AND projects.status = 'published'
    )
  );

CREATE POLICY "Public can view content blocks for published projects"
  ON project_content_blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_content_blocks.project_id
      AND projects.status = 'published'
    )
  );

CREATE POLICY "Public can view project tags for published projects"
  ON project_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tags.project_id
      AND projects.status = 'published'
    )
  );

-- Admin full access (authenticated users only)
CREATE POLICY "Authenticated users can do everything on projects"
  ON projects FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage tags"
  ON tags FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage media"
  ON media FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage hero slides"
  ON hero_slides FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage contact messages"
  ON contact_messages FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage tech stack"
  ON tech_stack FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage external links"
  ON external_links FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage content blocks"
  ON project_content_blocks FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage project tags"
  ON project_tags FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Public can insert contact messages
CREATE POLICY "Anyone can insert contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

-- Site settings policies
CREATE POLICY "Public can view site settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage site settings"
  ON site_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, category, description) VALUES
  ('site_name', 'Crafted Anomaly', 'text', 'general', 'Website name displayed in browser title'),
  ('site_description', 'Museum-Grade Portfolio - Design Studio', 'text', 'general', 'Website description for SEO'),
  ('company_name', 'Crafted Anomaly', 'text', 'general', 'Company name'),
  ('company_tagline', 'Crafting Dreams Into Reality', 'text', 'general', 'Company tagline'),
  ('contact_email', 'hello@craftedanomaly.com', 'email', 'contact', 'Primary contact email'),
  ('contact_phone', '+90 xxx xxx xx xx', 'text', 'contact', 'Contact phone number'),
  ('contact_address', 'Istanbul, Turkey', 'text', 'contact', 'Company address'),
  ('social_instagram', '', 'url', 'social', 'Instagram profile URL'),
  ('social_twitter', '', 'url', 'social', 'Twitter profile URL'),
  ('social_linkedin', '', 'url', 'social', 'LinkedIn profile URL'),
  ('social_behance', '', 'url', 'social', 'Behance profile URL'),
  ('social_dribbble', '', 'url', 'social', 'Dribbble profile URL'),
  ('social_youtube', '', 'url', 'social', 'YouTube channel URL')
ON CONFLICT (setting_key) DO NOTHING;
