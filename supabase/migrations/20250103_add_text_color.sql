-- Add text_color column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS text_color VARCHAR(20) DEFAULT '#ffffff';

-- Add comment
COMMENT ON COLUMN projects.text_color IS 'Text color for visual design layout (hex color code)';

-- Update existing visual design projects to have white text
UPDATE projects SET text_color = '#ffffff' WHERE layout_type = 'visual_design' AND text_color IS NULL;
