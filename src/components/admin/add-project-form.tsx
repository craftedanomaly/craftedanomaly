'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { BeforeAfterUpload } from '@/components/admin/before-after-upload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
}

export function AddProjectForm({ onProjectAdded }: AddProjectFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [externalLinks, setExternalLinks] = useState<{ label: string; url: string }[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [mediaType, setMediaType] = useState<'standard' | 'before_after'>('standard');
  const [beforeAfterImages, setBeforeAfterImages] = useState({ before: '', after: '' });

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
    
    if (mediaType === 'before_after') {
      if (!beforeAfterImages.before || !beforeAfterImages.after) {
        toast.error('Both before and after images are required for before/after comparison');
        return;
      }
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
            role_en: data.role || null,
            client: data.client || null,
            status: data.status,
            published_at: data.status === 'published' ? new Date().toISOString() : null,
          },
        ])
        .select(`
          *,
          categories (
            id,
            slug,
            name
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

      // Handle tech stack
      if (techStack.length > 0) {
        await supabase.from('tech_stack').insert(
          techStack.map((tech, index) => ({
            project_id: projectId,
            name: tech,
            display_order: index,
          }))
        );
      }

      // Handle external links
      if (externalLinks.length > 0) {
        await supabase.from('external_links').insert(
          externalLinks.map((link, index) => ({
            project_id: projectId,
            label_en: link.label,
            url: link.url,
            display_order: index,
          }))
        );
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

      // Handle before/after media
      if (mediaType === 'before_after' && beforeAfterImages.before && beforeAfterImages.after) {
        await supabase.from('media').insert([{
          project_id: projectId,
          media_type: 'before_after',
          url: beforeAfterImages.after,
          before_url: beforeAfterImages.before,
          after_url: beforeAfterImages.after,
          display_order: 0,
          title: 'Before/After Comparison'
        }]);
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
          category: project.categories?.name || 'Uncategorized',
          categoryId: project.category_id,
          blurb: project.blurb,
          year: project.year,
          role: project.role_en,
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
      setTechStack([]);
      setExternalLinks([]);
      setGalleryImages([]);
      setContentBlocks([]);
      setMediaType('standard');
      setBeforeAfterImages({ before: '', after: '' });
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
          <DialogDescription>
            Create a new portfolio project. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 overflow-y-auto max-h-[70vh] pr-2">
          {/* Basic Info */}
          <div className="space-y-4">
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
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                {categoriesData.map((cat) => {
                  const checked = categoriesValue.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{cat.name}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const value = e.target.checked
                            ? [...categoriesValue, cat.id]
                            : categoriesValue.filter((id) => id !== cat.id);
                          setValue('categories', value, { shouldValidate: true });
                        }}
                        className="h-4 w-4"
                      />
                    </label>
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

          {/* Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Media</h3>
            
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
              <div className="space-y-2">
                {galleryImages.map((img, index) => (
                  <div key={index} className="flex gap-2">
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
                      onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== index))}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
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
          </div>

          {/* Content Blocks */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Content Blocks</h3>
            <ContentBlocksBuilder 
              blocks={contentBlocks} 
              onChange={setContentBlocks}
            />
          </div>

          {/* Status */}
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

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
