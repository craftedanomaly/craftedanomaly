-- Check if media table exists and fix it
DO $$
BEGIN
    -- Check if media table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'media') THEN
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'media_type') THEN
            ALTER TABLE media ADD COLUMN media_type VARCHAR(20);
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'before_url') THEN
            ALTER TABLE media ADD COLUMN before_url VARCHAR(500);
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'after_url') THEN
            ALTER TABLE media ADD COLUMN after_url VARCHAR(500);
        END IF;
        
        -- Drop existing constraint if it exists
        IF EXISTS (SELECT FROM information_schema.table_constraints WHERE table_name = 'media' AND constraint_name = 'media_media_type_check') THEN
            ALTER TABLE media DROP CONSTRAINT media_media_type_check;
        END IF;
        
        -- Add the constraint
        ALTER TABLE media ADD CONSTRAINT media_media_type_check 
        CHECK (media_type IN ('image', 'video', 'document', 'before_after'));
        
        -- Set default media_type for existing records
        UPDATE media SET media_type = 'image' WHERE media_type IS NULL;
        
        RAISE NOTICE 'Media table updated successfully';
    ELSE
        -- Create the table if it doesn't exist
        CREATE TABLE media (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
            media_type VARCHAR(20) CHECK (media_type IN ('image', 'video', 'document', 'before_after')),
            url VARCHAR(500) NOT NULL,
            before_url VARCHAR(500),
            after_url VARCHAR(500),
            thumbnail_url VARCHAR(500),
            title VARCHAR(255),
            caption_en TEXT,
            caption_tr TEXT,
            display_order INTEGER DEFAULT 0,
            size_bytes BIGINT,
            mime_type VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX idx_media_project_id ON media(project_id);
        CREATE INDEX idx_media_type ON media(media_type);
        CREATE INDEX idx_media_display_order ON media(display_order);
        
        RAISE NOTICE 'Media table created successfully';
    END IF;
END
$$;
