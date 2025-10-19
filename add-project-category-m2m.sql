-- Migration: Add many-to-many support for project categories
-- Date: 2025-10-19

BEGIN;

-- Create join table for project categories if it does not exist
CREATE TABLE IF NOT EXISTS project_categories (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    PRIMARY KEY(project_id, category_id)
);

-- Backfill join table from existing category_id column
INSERT INTO project_categories (project_id, category_id)
SELECT id, category_id
FROM projects
WHERE category_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Optional: keep a trigger to maintain primary category column if desired (not included)

COMMIT;
