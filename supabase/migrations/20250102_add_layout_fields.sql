-- Add layout_type and background_color columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS layout_type VARCHAR(50) DEFAULT 'default',
ADD COLUMN IF NOT EXISTS background_color VARCHAR(20) DEFAULT '#ffffff';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_layout_type ON projects(layout_type);

-- Add comments
COMMENT ON COLUMN projects.layout_type IS 'Layout type for project detail page: "default" or "visual_design"';
COMMENT ON COLUMN projects.background_color IS 'Background color for visual design layout (hex color code)';

-- Update existing projects to have default layout
UPDATE projects SET layout_type = 'default' WHERE layout_type IS NULL;
