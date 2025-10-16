# Content Blocks System - Complete Guide

## 🎨 Overview

The Content Blocks system allows you to create rich, flexible content for project detail pages. Each project can have multiple content blocks of different types.

## 📦 Block Types

### 1. **Text Block** (`text`)
- Rich HTML content support
- Bilingual (EN/TR)
- Use for: Articles, descriptions, case studies
- Example: `<p>This is <strong>bold</strong> text</p>`

### 2. **Image Block** (`image`)
- Single image with caption
- Bilingual captions
- Use for: Screenshots, hero images, diagrams
- Fields:
  - `media_url`: Image URL
  - `content_en/tr`: Caption text

### 3. **Video Block** (`video`)
- Native video player
- MP4, WebM support
- Bilingual descriptions
- Fields:
  - `media_url`: Video file URL
  - `content_en/tr`: Video description

### 4. **Gallery Block** (`gallery`)
- Multiple images in grid layout
- 2-3 columns responsive
- Hover zoom effect
- Fields:
  - `media_urls`: Array of image URLs

### 5. **Quote Block** (`quote`)
- Styled blockquote
- Accent border
- Large quote icon
- Bilingual
- Use for: Testimonials, important statements

### 6. **Code Block** (`code`)
- Monospace font
- Dark background
- Syntax highlighting ready
- Use for: Code snippets, terminal output

### 7. **Embed Block** (`embed`)
- Custom HTML/iframe
- YouTube/Vimeo embeds
- Any external content
- Use for: Videos, maps, interactive content

## 🚀 Admin Usage

### Adding Content Blocks

1. **Open Admin Panel**: `/admin`
2. **Create/Edit Project**
3. **Scroll to "Content Blocks" section**
4. **Click dropdown**: "Add Block"
5. **Select block type**
6. **Fill in content**
7. **Reorder with ↑↓ buttons**
8. **Expand/Collapse** for editing
9. **Delete** unwanted blocks

### Gallery Block Example

```
Block Type: Gallery
Images:
  - https://images.unsplash.com/photo-1.jpg
  - https://images.unsplash.com/photo-2.jpg
  - https://images.unsplash.com/photo-3.jpg
```

### Embed Block Example

```html
<iframe width="560" height="315" 
  src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
  frameborder="0" allowfullscreen>
</iframe>
```

### Text Block Example

```html
<h2>Project Overview</h2>
<p>This project demonstrates our expertise in <strong>modern web development</strong>.</p>
<ul>
  <li>React & Next.js</li>
  <li>TypeScript</li>
  <li>TailwindCSS</li>
</ul>
```

## 📊 Database Schema

```sql
CREATE TABLE project_content_blocks (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  block_type VARCHAR(50), -- 'text', 'image', 'video', etc.
  content_en TEXT,        -- English content
  content_tr TEXT,        -- Turkish content
  media_url VARCHAR(500), -- Single media URL
  media_urls TEXT[],      -- Multiple URLs (for gallery)
  metadata JSONB,         -- Extra settings
  display_order INTEGER,  -- Block position
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## 🎯 Frontend Display

Content blocks are automatically rendered on project detail pages:
- Responsive design
- Scroll animations (fade in on view)
- Bilingual content (auto-switches with locale)
- Styled with brand colors

### Example URL:
```
http://localhost:3000/en/films/cinematic-journey
```

## 💡 Best Practices

### Do's ✅
- Use Text blocks for long-form content
- Gallery for multiple related images
- Quote for testimonials/key statements
- Embed for YouTube/Vimeo videos
- Order blocks logically (intro → details → media → conclusion)

### Don'ts ❌
- Don't leave blocks empty
- Don't use Gallery for single images (use Image block)
- Don't forget Turkish translations
- Don't use large video files (use embeds instead)

## 🔧 Customization

### Adding New Block Types

1. Update schema: `supabase-schema.sql`
2. Add type to `ContentBlock` interface
3. Add icon in `blockTypeIcons`
4. Add label in `blockTypeLabels`
5. Add render case in `ContentBlock` component
6. Add editor UI in builder

### Styling Blocks

Edit `project-detail-page.tsx`:
```tsx
case 'text':
  return (
    <motion.div className="prose prose-lg">
      // Your custom styling
    </motion.div>
  );
```

## 🎨 Content Block Examples

### Case Study Structure

```
1. Text: Introduction
2. Image: Hero shot
3. Text: Problem statement
4. Gallery: Before/after comparison
5. Quote: Client testimonial
6. Text: Solution approach
7. Video: Demo walkthrough
8. Code: Implementation snippet
9. Text: Results & conclusion
```

### Film Project Structure

```
1. Text: Synopsis
2. Video: Trailer
3. Gallery: Behind the scenes
4. Quote: Director's statement
5. Text: Production details
6. Embed: Full film (Vimeo)
```

## 🚀 Performance Tips

- Optimize images before uploading
- Use Unsplash/CDN for large images
- Keep text blocks under 1000 words
- Use embeds for videos (don't upload large files)
- Limit gallery to 6-9 images max

## 📱 Mobile Responsiveness

All blocks are fully responsive:
- Gallery: 2 columns on mobile, 3 on desktop
- Text: Readable line length
- Videos: Aspect ratio maintained
- Embeds: Responsive iframe wrappers

---

**Created**: 2025-01-09  
**Version**: 1.0  
**Tech Stack**: Next.js 15, TypeScript, Supabase, TailwindCSS
