'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, X, ArrowLeft, GripVertical, Trash2 } from 'lucide-react';
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
  projectType: z.string().optional(),
  liveUrl: z.string().optional(),
  layoutType: z.enum(['default', 'visual_design']),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
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
  price: z.string().optional(),
  shopUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface AddProjectFormProps {
  onProjectAdded?: (project: any) => void;
  onBack?: () => void;
}

export function AddProjectForm({ onProjectAdded, onBack }: AddProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  type GalleryItem = { url: string; layout: 'single' | 'masonry'; title?: string; price?: string; shopUrl?: string };
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [testimonials, setTestimonials] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order');

    if (data) {
      setCategoriesData(data);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: 'draft',
      year: new Date().getFullYear(),
      categories: [],
      layoutType: 'default',
      backgroundColor: '#ffffff',
      textColor: '#ffffff',
      title: '',
      slug: '',
      blurb: '',
      tags: '',
      coverImage: '',
      liveUrl: '',
      coverVideo: '',
      price: '',
      shopUrl: '',
    },
  });

  const categoriesValue = watch('categories');
  const statusValue = watch('status');
  const layoutTypeValue = watch('layoutType');

  const onSubmit = async (data: ProjectFormData) => {
    if (Object.keys(errors).length > 0) {
      toast.error(`Please fix ${Object.keys(errors).length} validation error${Object.keys(errors).length > 1 ? 's' : ''} before submitting`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert project into Supabase
      const { data: project, error } = await supabase
        .from('projects')
        .insert([
          {
            slug: data.slug,
            title: data.title,
            blurb: data.blurb,
            cover_image: data.coverImage,
            cover_video_url: data.coverVideo || null,
            testimonials: testimonials.filter(url => url.trim().length > 0),
            year: data.year,
            role_en: data.role || null,
            client: data.client || null,
            project_type: data.projectType || null,
            layout_type: data.layoutType,
            background_color: data.backgroundColor || '#ffffff',
            text_color: data.textColor || '#ffffff',
            status: data.status,
            published_at: data.status === 'published' ? new Date().toISOString() : null,
            price: data.price || null,
            shop_url: data.shopUrl || null,
          },
        ])
        .select(`
          *,
          project_categories (
            categories (
              id,
              slug,
              name
            )
          )
        `)
        .single();

      if (error) throw error;

      const projectId = project.id;

      // Handle categories (many-to-many)
      if (data.categories.length > 0) {
        await supabase.from('project_categories').insert(
          data.categories.map((catId) => ({
            project_id: projectId,
            category_id: catId,
          }))
        );
      }

      // Handle tags
      const tagsArray = data.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
      console.log('Processing tags:', tagsArray);

      for (const tagName of tagsArray) {
        let { data: existingTag, error: findError } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .maybeSingle();

        if (findError) {
          console.error('Error finding tag:', findError);
          continue;
        }

        let tagId;

        if (!existingTag) {
          console.log('Creating new tag:', tagName);
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
          console.log('Created tag with id:', tagId);
        } else {
          tagId = existingTag.id;
          console.log('Using existing tag with id:', tagId);
        }

        if (tagId) {
          const { error: linkError } = await supabase.from('project_tags').insert([{
            project_id: projectId,
            tag_id: tagId
          }]);

          if (linkError) {
            console.error('Error linking tag to project:', linkError);
          } else {
            console.log('Successfully linked tag to project');
          }
        }
      }

      console.log('Finished processing tags');

      // Handle gallery images
      if (galleryImages.length > 0) {
        await supabase.from('media').insert(
          galleryImages.map((item, index) => ({
            project_id: projectId,
            media_type: 'image',
            url: item.url,
            layout: item.layout,
            title: item.title || null,
            price: item.price || null,
            shop_url: item.shopUrl || null,
            display_order: index,
          }))
        );
      }

      // Handle content blocks
      if (contentBlocks.length > 0) {
        const blocksToInsert = contentBlocks
          .map((block) => {
            const isBeforeAfter = block.block_type === 'before_after';
            const sanitizedMediaUrls = Array.isArray(block.media_urls)
              ? block.media_urls.filter((u) => typeof u === 'string' && u.trim().length > 0)
              : null;
            // If before/after has less than 2 valid URLs, skip inserting that block entirely
            if (isBeforeAfter && (!sanitizedMediaUrls || sanitizedMediaUrls.length < 2)) {
              return null;
            }
            return {
              project_id: projectId,
              block_type: isBeforeAfter ? 'gallery' : block.block_type,
              content: isBeforeAfter ? '__before_after__' : (block.content || null),
              media_url: isBeforeAfter ? null : (block.media_url || null),
              media_urls: sanitizedMediaUrls && sanitizedMediaUrls.length > 0 ? sanitizedMediaUrls : null,
              display_order: block.display_order,
            };
          })
          .filter(Boolean) as any[];
        // Re-index display_order sequentially
        blocksToInsert.forEach((b, idx) => { b.display_order = idx; });
        const { error: blocksError } = await supabase.from('project_content_blocks').insert(blocksToInsert);
        if (blocksError) throw blocksError;
      }


      // Trigger on-demand revalidation
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: ['/', '/projects'] })
      }).catch(() => { });

      toast.success('Project created successfully!');

      if (onProjectAdded && project) {
        const formattedProject = {
          id: project.id,
          title: project.title,
          slug: project.slug,
          category: 'Uncategorized', // Will be updated with proper category logic
          categoryId: data.categories[0] || null,
          blurb: project.blurb,
          year: project.year,
          role: project.role,
          client: project.client,
          image: project.cover_image,
          status: project.status,
          date: new Date(project.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        };
        onProjectAdded(formattedProject);
      }

      reset();
      setGalleryImages([]);
      setContentBlocks([]);
      setTestimonials([]);
      if (onBack) onBack();
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(error.message || 'Failed to create project');
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
              <h1 className="text-xl font-semibold">Create New Project</h1>
              <p className="text-sm text-muted-foreground">Build your next portfolio masterpiece</p>
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
                  Creating...
                </>
              ) : (
                'Create Project'
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
                {/* Layout Type Selector */}
                <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/30">
                  <Label className="text-base font-semibold">Layout Type *</Label>
                  <p className="text-sm text-muted-foreground mb-3">Choose how this project will be displayed</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setValue('layoutType', 'default', { shouldValidate: true })}
                      className={`p-4 rounded-lg border-2 transition-all ${layoutTypeValue === 'default'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <div className="text-left">
                        <div className="font-semibold mb-1">Poster Layout</div>
                        <div className="text-xs text-muted-foreground">
                          Standard project layout with left info panel and right media gallery
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('layoutType', 'visual_design', { shouldValidate: true })}
                      className={`p-4 rounded-lg border-2 transition-all ${layoutTypeValue === 'visual_design'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <div className="text-left">
                        <div className="font-semibold mb-1">Visual Design Layout</div>
                        <div className="text-xs text-muted-foreground">
                          Horizontal scrolling with parallax effect for poster/graphic work
                        </div>
                      </div>
                    </button>
                  </div>
                  {errors.layoutType && (
                    <p className="text-sm text-destructive">{errors.layoutType.message}</p>
                  )}
                </div>

                {/* Background Color - Only for Visual Design Layout */}
                {layoutTypeValue === 'visual_design' && (
                  <>
                    <div className="space-y-2 p-4 border border-amber-500/20 rounded-lg bg-amber-500/5">
                      <Label htmlFor="backgroundColor">Background Color</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Choose the background color for the visual design layout
                      </p>
                      <div className="flex gap-3 items-center">
                        <Input
                          id="backgroundColor"
                          type="color"
                          value={watch('backgroundColor') || '#ffffff'}
                          onChange={(e) => setValue('backgroundColor', e.target.value, { shouldValidate: true })}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          {...register('backgroundColor')}
                          placeholder="#ffffff"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 p-4 border border-blue-500/20 rounded-lg bg-blue-500/5">
                      <Label htmlFor="textColor">Text Color</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Choose the text color for the visual design layout
                      </p>
                      <div className="flex gap-3 items-center">
                        <Input
                          id="textColor"
                          type="color"
                          value={watch('textColor') || '#ffffff'}
                          onChange={(e) => setValue('textColor', e.target.value, { shouldValidate: true })}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          {...register('textColor')}
                          placeholder="#ffffff"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </>
                )}

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
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${checked
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Client</Label>
                    <Input
                      id="client"
                      {...register('client')}
                      placeholder="Company Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projectType">Project Type</Label>
                    <Input
                      id="projectType"
                      {...register('projectType')}
                      placeholder="e.g., IN DEVELOPMENT, BOARDGAME"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="liveUrl">Live URL</Label>
                  <Input
                    id="liveUrl"
                    type="url"
                    {...register('liveUrl')}
                    placeholder="https://example.com"
                  />
                  {errors.liveUrl && (
                    <p className="text-sm text-destructive">{errors.liveUrl.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (for Poster Layout)</Label>
                    <Input
                      id="price"
                      {...register('price')}
                      placeholder="$29.99"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shopUrl">Shop URL (for Poster Layout)</Label>
                    <Input
                      id="shopUrl"
                      type="url"
                      {...register('shopUrl')}
                      placeholder="https://shop.com/product"
                    />
                    {errors.shopUrl && (
                      <p className="text-sm text-destructive">{errors.shopUrl.message}</p>
                    )}
                  </div>
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
                  <Label>Gallery Images (drag to reorder)</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    {galleryImages.map((item, index) => (
                      <div
                        key={index}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('text/plain', index.toString());
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                          if (fromIndex !== index) {
                            const newImages = [...galleryImages];
                            const [removed] = newImages.splice(fromIndex, 1);
                            newImages.splice(index, 0, removed);
                            setGalleryImages(newImages);
                          }
                        }}
                        className="space-y-2 p-3 border rounded-lg cursor-move hover:border-accent transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Image {index + 1}</span>
                        </div>
                        <div className="space-y-2 mb-3">
                          <Label className="text-xs">Image Name (optional)</Label>
                          <Input
                            placeholder="Poster Name"
                            value={item.title || ''}
                            onChange={(e) => {
                              const next = [...galleryImages];
                              next[index] = { ...next[index], title: e.target.value };
                              setGalleryImages(next);
                            }}
                            className="h-8"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Price</Label>
                            <Input
                              placeholder="$99"
                              value={item.price || ''}
                              onChange={(e) => {
                                const next = [...galleryImages];
                                next[index] = { ...next[index], price: e.target.value };
                                setGalleryImages(next);
                              }}
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Link</Label>
                            <Input
                              placeholder="https://..."
                              value={item.shopUrl || ''}
                              onChange={(e) => {
                                const next = [...galleryImages];
                                next[index] = { ...next[index], shopUrl: e.target.value };
                                setGalleryImages(next);
                              }}
                              className="h-8"
                            />
                          </div>
                        </div>
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
                          <Trash2 className="h-4 w-4 mr-2" />
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
                  <h2 className="text-xl font-semibold">Content</h2>
                  <p className="text-sm text-muted-foreground">Rich content blocks and before/after images</p>
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
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
