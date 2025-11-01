-- Add project_type column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS project_type VARCHAR(100);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_project_type ON projects(project_type);

-- Add comment
COMMENT ON COLUMN projects.project_type IS 'Type/category label for the project (e.g., "IN DEVELOPMENT", "BOARDGAME", etc.)';
