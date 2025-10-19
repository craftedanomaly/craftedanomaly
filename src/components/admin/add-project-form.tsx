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
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface AddProjectFormProps {
  onProjectAdded?: (project: any) => void;
  onBack?: () => void;
}

export function AddProjectForm({ onProjectAdded, onBack }: AddProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);

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
      title: '',
      slug: '',
      blurb: '',
      tags: '',
      coverImage: '',
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
      // Insert project into Supabase
      const { data: project, error } = await supabase
        .from('projects')
        .insert([
          {
            slug: data.slug,
            title: data.title,
            blurb: data.blurb,
            cover_image: data.coverImage,
            year: data.year,
            role: data.role || null,
            client: data.client || null,
            status: data.status,
            published_at: data.status === 'published' ? new Date().toISOString() : null,
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
            project_id: projectId, 
            tag_id: tagId 
          }]);
        }
      }

      // Handle gallery images
      if (galleryImages.length > 0) {
        await supabase.from('media').insert(
          galleryImages.map((url, index) => ({
            project_id: projectId,
            media_type: 'image',
            url: url,
            display_order: index,
          }))
        );
      }

      // Handle content blocks
      if (contentBlocks.length > 0) {
        await supabase.from('project_content_blocks').insert(
          contentBlocks.map((block) => ({
            project_id: projectId,
            block_type: block.block_type,
            content: block.content || null,
            media_url: block.media_url || null,
            media_urls: block.media_urls || null,
            display_order: block.display_order,
          }))
        );
      }

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
                  />
                  {errors.coverImage && (
                    <p className="text-sm text-destructive">{errors.coverImage.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Gallery Images</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    {galleryImages.map((img, index) => (
                      <div key={index} className="space-y-2">
                        <ImageUpload
                          value={img}
                          onChange={(url) => {
                            const newImages = [...galleryImages];
                            newImages[index] = url;
                            setGalleryImages(newImages);
                          }}
                          bucket="project-gallery"
                        />
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
                    onClick={() => setGalleryImages([...galleryImages, ''])}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Gallery Image
                  </Button>
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
