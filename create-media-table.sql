-- Create media table if it doesn't exist
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_project_id ON media(project_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(media_type);
CREATE INDEX IF NOT EXISTS idx_media_display_order ON media(display_order);
