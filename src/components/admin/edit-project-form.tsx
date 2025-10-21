'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, X, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/admin/image-upload';
import { VideoUpload } from '@/components/admin/video-upload';
import { ContentBlocksBuilder, ContentBlock } from '@/components/admin/content-blocks-builder';

// Validation Schema
const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
  blurb: z.string().min(10, 'Description must be at least 10 characters'),
  year: z.number().min(2000).max(new Date().getFullYear() + 1),
  role: z.string().optional(),
  client: z.string().optional(),
  liveUrl: z.string().optional(),
  tags: z.string(),
  coverImage: z.string()
    .min(1, 'Cover image is required')
    .refine(
      (url) => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      'Must be a valid URL'
    ),
  status: z.enum(['draft', 'published']),
  coverVideo: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface EditProjectFormProps {
  project: any;
  onProjectUpdated?: (project: any) => void;
  onBack?: () => void;
}

export function EditProjectForm({ project, onProjectUpdated, onBack }: EditProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  type GalleryItem = { url: string; layout: 'single' | 'masonry' };
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [testimonials, setTestimonials] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
    loadProjectData();
  }, [project]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order');
    
    if (data) {
      setCategoriesData(data);
    }
  };

  const loadProjectData = async () => {
    try {
      // Load gallery images
      const { data: mediaData } = await supabase
        .from('media')
        .select('id, url, media_type, display_order, layout')
        .eq('project_id', project.id)
        .order('display_order');
      
      if (mediaData) {
        setGalleryImages(mediaData.map((m: any) => ({ url: m.url, layout: (m.layout as any) || 'masonry' })));
      }

      // Load testimonials
      if (project.testimonials && Array.isArray(project.testimonials)) {
        setTestimonials(project.testimonials);
      }

      // Load content blocks
      const { data: blocksData } = await supabase
        .from('project_content_blocks')
        .select('*')
        .eq('project_id', project.id)
        .order('display_order');
      
      if (blocksData) {
        setContentBlocks(blocksData.map(block => {
          const isBeforeAfterMarker = block.block_type === 'gallery' && block.content === '__before_after__';
          return {
            id: block.id,
            block_type: isBeforeAfterMarker ? 'before_after' : block.block_type,
            content: isBeforeAfterMarker ? '' : (block.content || ''),
            media_url: block.media_url,
            media_urls: block.media_urls,
            display_order: block.display_order,
          };
        }));
      }

      // Load project categories
      const { data: projectCats } = await supabase
        .from('project_categories')
        .select('category_id')
        .eq('project_id', project.id);
      
      const categoryIds = projectCats?.map(pc => pc.category_id) || [];
      setValue('categories', categoryIds);

      // Load tags
      const { data: projectTags } = await supabase
        .from('project_tags')
        .select('tags(name)')
        .eq('project_id', project.id);
      
      const tagNames = ((projectTags as any[]) || [])
        .map((t: any) => t?.tags?.name)
        .filter(Boolean)
        .join(', ');
      setValue('tags', tagNames);


    } catch (error) {
      console.error('Error loading project data:', error);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project.title || '',
      slug: project.slug || '',
      blurb: project.blurb || '',
      year: project.year || new Date().getFullYear(),
      role: project.role_en || project.role || '',
      client: project.client || '',
      liveUrl: project.live_url || '',
      tags: '',
      coverImage: project.cover_image || '',
      coverVideo: (project as any).cover_video_url || '',
      status: project.status || 'draft',
      categories: [],
    },
  });

  const categoriesValue = watch('categories');
  const statusValue = watch('status');

  const onSubmit = async (data: ProjectFormData) => {
    if (Object.keys(errors).length > 0) {
      toast.error(`Please fix ${Object.keys(errors).length} validation error${Object.keys(errors).length > 1 ? 's' : ''} before submitting`);
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Update project
      const { data: updatedProject, error } = await supabase
        .from('projects')
        .update({
          slug: data.slug,
          title: data.title,
          blurb: data.blurb,
          cover_image: data.coverImage,
          cover_video_url: data.coverVideo || null,
          testimonials: testimonials.filter(url => url.trim().length > 0),
          year: data.year,
          role_en: data.role || null,
          client: data.client || null,
          status: data.status,
          published_at: data.status === 'published' && !project.published_at 
            ? new Date().toISOString() 
            : project.published_at,
        })
        .eq('id', project.id)
        .select()
        .single();

      if (error) throw error;

      // Update categories
      await supabase.from('project_categories').delete().eq('project_id', project.id);
      if (data.categories.length > 0) {
        await supabase.from('project_categories').insert(
          data.categories.map((catId) => ({
            project_id: project.id,
            category_id: catId,
          }))
        );
      }

      // Update tags
      await supabase.from('project_tags').delete().eq('project_id', project.id);
      const tagsArray = data.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
      
      for (const tagName of tagsArray) {
        let { data: existingTag } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .maybeSingle();

        let tagId;
        
        if (!existingTag) {
          const { data: newTag, error: createError } = await supabase
            .from('tags')
            .insert([{ 
              name: tagName, 
              slug: tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') 
            }])
            .select('id')
            .single();
          
          if (createError) {
            console.error('Error creating tag:', createError);
            continue;
          }
          tagId = newTag?.id;
        } else {
          tagId = existingTag.id;
        }

        if (tagId) {
          await supabase.from('project_tags').insert([{ 
            project_id: project.id, 
            tag_id: tagId 
          }]);
        }
      }

      // Update gallery images
      await supabase.from('media').delete().eq('project_id', project.id);
      if (galleryImages.length > 0) {
        await supabase.from('media').insert(
          galleryImages.map((item, index) => ({
            project_id: project.id,
            media_type: 'image',
            url: item.url,
            layout: item.layout,
            display_order: index,
          }))
        );
      }

      // Update content blocks (diff-based, no mass delete)
      // Load existing
      const { data: existingBlocks } = await supabase
        .from('project_content_blocks')
        .select('id, block_type, content, media_url, media_urls, display_order')
        .eq('project_id', project.id)
        .order('display_order');

      // Build sanitized UI rows with original IDs
      const existingIdSet = new Set((existingBlocks || []).map((b: any) => String(b.id)));
      const preserveIds = new Set<string>();
      const sanitizedUI = contentBlocks
        .map((block, idx) => {
          const isBeforeAfter = block.block_type === 'before_after';
          const sanitizedMediaUrls = Array.isArray(block.media_urls)
            ? block.media_urls.filter((u) => typeof u === 'string' && u.trim().length > 0)
            : null;
          if (isBeforeAfter && (!sanitizedMediaUrls || sanitizedMediaUrls.length < 2)) {
            if (block.id) preserveIds.add(String(block.id));
            return null; // skip incomplete BA but preserve existing DB row
          }
          const row = {
            project_id: project.id,
            block_type: isBeforeAfter ? 'gallery' : block.block_type,
            content: isBeforeAfter ? '__before_after__' : (block.content || null),
            media_url: isBeforeAfter ? null : (block.media_url || null),
            media_urls: sanitizedMediaUrls && sanitizedMediaUrls.length > 0 ? sanitizedMediaUrls : null,
            display_order: idx,
          };
          return { originId: block.id, row };
        })
        .filter(Boolean) as Array<{ originId: any; row: any }>;

      // Partition into updates/inserts based on whether originId matches an existing DB id
      const updates = sanitizedUI.filter(b => b.originId && existingIdSet.has(String(b.originId)));
      const inserts = sanitizedUI.filter(b => !b.originId || !existingIdSet.has(String(b.originId)));

      // Compute deletes: existing ids not present in updates' originIds
      const uiExistingIds = new Set([
        ...updates.map(b => String(b.originId)),
        ...Array.from(preserveIds.values()),
      ]);
      const deleteIds = (existingBlocks || [])
        .map((b: any) => String(b.id))
        .filter(id => !uiExistingIds.has(id));

      // Apply updates (one by one)
      for (const u of updates) {
        const { error: upErr } = await supabase
          .from('project_content_blocks')
          .update(u.row)
          .eq('id', u.originId as any);
        if (upErr) throw upErr;
      }

      // Apply inserts (bulk)
      if (inserts.length > 0) {
        const { error: insErr } = await supabase
          .from('project_content_blocks')
          .insert(inserts.map(i => i.row));
        if (insErr) throw insErr;
      }

      // Apply deletes
      if (deleteIds.length > 0) {
        const { error: delErr } = await supabase
          .from('project_content_blocks')
          .delete()
          .in('id', deleteIds as any);
        if (delErr) throw delErr;
      }

      if (preserveIds.size > 0) {
        toast.warning('Before/After block incomplete (needs two images). Existing one was preserved.');
      }

      toast.success('Project updated successfully!');

      if (onProjectUpdated && updatedProject) {
        const formattedProject = {
          id: updatedProject.id,
          title: updatedProject.title,
          slug: updatedProject.slug,
          category: 'Updated',
          categoryId: data.categories[0] || null,
          blurb: updatedProject.blurb,
          year: updatedProject.year,
          role: updatedProject.role,
          client: updatedProject.client,
          image: updatedProject.cover_image,
          status: updatedProject.status,
          date: new Date(updatedProject.updated_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        };
        onProjectUpdated(formattedProject);
      }

      if (onBack) onBack();
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast.error(error.message || 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setValue('slug', slug);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-xl font-semibold">Edit Project</h1>
              <p className="text-sm text-muted-foreground">Update your portfolio project</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onBack}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              form="project-form"
              disabled={isSubmitting}
              className="min-w-32"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Project'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <form id="project-form" onSubmit={handleSubmit(onSubmit)} className="flex overflow-hidden min-h-[calc(100vh-4rem)]">
        {/* Left Sidebar Navigation */}
        <aside className="w-64 border-r bg-muted/30 p-6 overflow-y-auto">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-4">
              Project Sections
            </div>
            {[
              { id: "basic", label: "📝 Basic Info", desc: "Title, category, description" },
              { id: "media", label: "🎨 Media", desc: "Images and gallery" },
              { id: "testimonials", label: "🏆 Awards", desc: "Testimonials and laurels" },
              { id: "content", label: "📄 Content", desc: "Rich content blocks" },
              { id: "publish", label: "🚀 Publish", desc: "Status and visibility" }
            ].map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full text-left p-3 rounded-lg hover:bg-accent/50 transition-colors group"
              >
                <div className="font-medium text-sm group-hover:text-accent-foreground">
                  {section.label}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {section.desc}
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8 space-y-8">
            
            {/* Basic Info Section */}
            <section id="basic" className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">📝</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Basic Information</h2>
                  <p className="text-sm text-muted-foreground">Essential project details</p>
                </div>
              </div>
              
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    onChange={(e) => {
                      register('title').onChange(e);
                      handleTitleChange(e);
                    }}
                    placeholder="Project Title"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    {...register('slug')}
                    placeholder="project-slug"
                  />
                  {errors.slug && (
                    <p className="text-sm text-destructive">{errors.slug.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Categories *</Label>
                  <div className="flex flex-wrap gap-2">
                    {categoriesData.map((cat) => {
                      const checked = categoriesValue.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            const value = checked
                              ? categoriesValue.filter((id) => id !== cat.id)
                              : [...categoriesValue, cat.id];
                            setValue('categories', value, { shouldValidate: true });
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                            checked
                              ? 'bg-primary text-primary-foreground shadow-sm border-primary'
                              : 'bg-background hover:bg-accent text-foreground border-border hover:border-accent-foreground/20'
                          }`}
                        >
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                  {errors.categories && (
                    <p className="text-sm text-destructive">{errors.categories.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blurb">Description *</Label>
                  <Textarea
                    id="blurb"
                    {...register('blurb')}
                    placeholder="Project description..."
                    rows={3}
                  />
                  {errors.blurb && (
                    <p className="text-sm text-destructive">{errors.blurb.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      type="number"
                      {...register('year', { valueAsNumber: true })}
                      placeholder="2024"
                    />
                    {errors.year && (
                      <p className="text-sm text-destructive">{errors.year.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      {...register('role')}
                      placeholder="Designer, Developer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <Input
                    id="client"
                    {...register('client')}
                    placeholder="Company Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="liveUrl">Live URL</Label>
                  <Input
                    id="liveUrl"
                    type="url"
                    {...register('liveUrl')}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    {...register('tags')}
                    placeholder="UI/UX, Mobile, React"
                  />
                </div>
              </div>
            </section>

            {/* Media Section */}
            <section id="media" className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">🎨</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Media & Gallery</h2>
                  <p className="text-sm text-muted-foreground">Visual content for your project</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Cover Image *</Label>
                  <ImageUpload
                    value={watch('coverImage')}
                    onChange={(url) => setValue('coverImage', url)}
                    bucket="media"
                  />
                  {errors.coverImage && (
                    <p className="text-sm text-destructive">{errors.coverImage.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Cover Video (optional)</Label>
                  <VideoUpload
                    value={watch('coverVideo') as any}
                    onChange={(url) => setValue('coverVideo', url)}
                    maxSizeMB={50}
                  />
                  <p className="text-xs text-muted-foreground">Shown on project hero when Play is clicked.</p>
                </div>

                <div className="space-y-2">
                  <Label>Gallery Images</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    {galleryImages.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <ImageUpload
                          value={item.url}
                          onChange={(url) => {
                            const next = [...galleryImages];
                            next[index] = { ...next[index], url };
                            setGalleryImages(next);
                          }}
                          bucket="media"
                        />
                        <div className="flex items-center gap-2">
                          <Label className="text-xs">Layout</Label>
                          <Select
                            value={item.layout}
                            onValueChange={(value: 'single' | 'masonry') => {
                              const next = [...galleryImages];
                              next[index] = { ...next[index], layout: value };
                              setGalleryImages(next);
                            }}
                          >
                            <SelectTrigger className="h-8 w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">Single</SelectItem>
                              <SelectItem value="masonry">Masonry</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== index))}
                        >
                          Remove Image
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setGalleryImages([...galleryImages, { url: '', layout: 'masonry' }])}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Gallery Image
                  </Button>
                </div>
              </div>
            </section>

            {/* Testimonials/Awards Section */}
            <section id="testimonials" className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">🏆</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Awards & Testimonials</h2>
                  <p className="text-sm text-muted-foreground">Laurels and recognition images</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Testimonial Images</Label>
                  
                  {/* Multiple file upload */}
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-6">
                      <input
                        type="file"
                        multiple
                        accept="image/*,.gif"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length === 0) return;
                          
                          const uploadPromises = files.map(async (file) => {
                            const formData = new FormData();
                            formData.append('file', file);
                            
                            try {
                              const response = await fetch('/api/upload', {
                                method: 'POST',
                                body: formData,
                              });
                              
                              if (response.ok) {
                                const data = await response.json();
                                return data.url;
                              }
                            } catch (error) {
                              console.error('Upload error:', error);
                            }
                            return null;
                          });
                          
                          const uploadedUrls = await Promise.all(uploadPromises);
                          const validUrls = uploadedUrls.filter(Boolean);
                          
                          if (validUrls.length > 0) {
                            setTestimonials([...testimonials, ...validUrls]);
                          }
                        }}
                        className="w-full"
                      />
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mt-2">
                          Select multiple images (PNG, JPG, GIF supported)
                        </p>
                      </div>
                    </div>
                    
                    {/* Display uploaded testimonials */}
                    {testimonials.length > 0 && (
                      <div className="grid gap-4 md:grid-cols-3">
                        {testimonials.map((img, index) => (
                          <div key={index} className="space-y-2">
                            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                              {img && (
                                <img 
                                  src={img} 
                                  alt={`Testimonial ${index + 1}`}
                                  className="w-full h-full object-contain"
                                />
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => setTestimonials(testimonials.filter((_, i) => i !== index))}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Add laurel images or testimonial graphics. These will scroll horizontally on the project page with orange overlay.
                  </p>
                </div>
              </div>
            </section>

            {/* Content Blocks Section */}
            <section id="content" className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">📄</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Content Blocks</h2>
                  <p className="text-sm text-muted-foreground">Rich content for your project</p>
                </div>
              </div>
              
              <ContentBlocksBuilder 
                blocks={contentBlocks} 
                onChange={setContentBlocks}
              />
            </section>

            {/* Publish Section */}
            <section id="publish" className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">🚀</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Publish Settings</h2>
                  <p className="text-sm text-muted-foreground">Control visibility and status</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={statusValue}
                  onValueChange={(value: 'draft' | 'published') => setValue('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>
          </div>
        </div>
      </form>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-end gap-3 px-6 py-4">
          <Button
            variant="outline"
            onClick={onBack}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            form="project-form"
            disabled={isSubmitting}
            className="min-w-32"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              'Update Project'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
