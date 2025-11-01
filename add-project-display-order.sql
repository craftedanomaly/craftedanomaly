-- Add display_order column to project_categories junction table
ALTER TABLE project_categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Update existing project_categories to have sequential display_order based on project created_at
WITH ordered_project_categories AS (
  SELECT 
    pc.project_id,
    pc.category_id,
    ROW_NUMBER() OVER (PARTITION BY pc.category_id ORDER BY p.created_at DESC) as row_num
  FROM project_categories pc
  JOIN projects p ON pc.project_id = p.id
)
UPDATE project_categories pc
SET display_order = opc.row_num
FROM ordered_project_categories opc
WHERE pc.project_id = opc.project_id AND pc.category_id = opc.category_id;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_project_categories_display_order ON project_categories(category_id, display_order);
