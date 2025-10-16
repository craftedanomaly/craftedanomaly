'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Edit, Plus, X } from 'lucide-react';
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
  category: z.string().min(1, 'Category is required'),
  blurb: z.string().min(10, 'Description must be at least 10 characters'),
  year: z.number().min(2000).max(new Date().getFullYear() + 1),
  role: z.string().optional(),
  client: z.string().optional(),
  tags: z.string(),
  coverImage: z.string()
    .url('Must be a valid URL')
    .refine(
      (url) => {
        return url.includes('images.unsplash.com') || 
               url.includes('supabase.co') || 
               url.includes('antalyaff.com') ||
               /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
      },
      'Must be a valid image URL'
    ),
  status: z.enum(['draft', 'published']),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const categories = [
  { value: 'films', label: 'Films' },
  { value: 'games', label: 'Games' },
  { value: 'books', label: 'Books' },
  { value: 'mekan-tasarimi', label: 'Spatial Design' },
  { value: 'gorsel-tasarim', label: 'Visual Design' },
  { value: 'afis-jenerik', label: 'Poster & Title' },
  { value: 'uygulama-tasarimi', label: 'App Design' },
];

interface EditProjectFormProps {
  project: any;
  onProjectUpdated?: (project: any) => void;
}

export function EditProjectForm({ project, onProjectUpdated }: EditProjectFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [externalLinks, setExternalLinks] = useState<{ label: string; url: string }[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [mediaType, setMediaType] = useState<'standard' | 'before_after'>('standard');
  const [beforeAfterImages, setBeforeAfterImages] = useState({ before: '', after: '' });
  // sticky section nav
  const sectionNav = [
    { id: "basic", label: "Basic" },
    { id: "media", label: "Media" },
    { id: "details", label: "Details" },
    { id: "content", label: "Content" },
    { id: "publish", label: "Publish" },
  ];
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (open && project.id) {
      fetchProjectExtras();
    }
  }, [open, project.id]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order');
    
    if (data) {
      setCategoriesData(data);
    }
  };

  const fetchProjectExtras = async () => {
    setIsLoadingData(true);
    try {
      // Fetch tech stack
      const { data: techData } = await supabase
        .from('tech_stack')
        .select('name')
        .eq('project_id', project.id)
        .order('display_order');
      
      if (techData) {
        setTechStack(techData.map((t: any) => t.name));
      }

      // Fetch external links
      const { data: linksData } = await supabase
        .from('external_links')
        .select('label_en, url')
        .eq('project_id', project.id)
        .order('display_order');
      
      if (linksData) {
        setExternalLinks(linksData.map((l: any) => ({ label: l.label_en, url: l.url })));
      }

      // Fetch media (gallery images and before/after)
      const { data: mediaData } = await supabase
        .from('media')
        .select('*')
        .eq('project_id', project.id)
        .order('display_order');
      
      if (mediaData) {
        // Separate standard images from before/after
        const standardImages = mediaData.filter((m: any) => m.media_type === 'image');
        const beforeAfterMedia = mediaData.find((m: any) => m.media_type === 'before_after');
        
        setGalleryImages(standardImages.map((m: any) => m.url));
        
        if (beforeAfterMedia) {
          setMediaType('before_after');
          setBeforeAfterImages({
            before: beforeAfterMedia.before_url || '',
            after: beforeAfterMedia.after_url || ''
          });
          // Set cover image to after image
          setValue('coverImage', beforeAfterMedia.after_url || beforeAfterMedia.url);
        }
      }

      // Fetch content blocks
      const { data: blocksData } = await supabase
        .from('project_content_blocks')
        .select('*')
        .eq('project_id', project.id)
        .order('display_order');
      
      if (blocksData) {
        setContentBlocks(blocksData.map((b: any) => ({
          id: b.id,
          block_type: b.block_type,
          content_en: b.content_en || '',
          content_tr: b.content_tr || '',
          media_url: b.media_url || '',
          media_urls: b.media_urls || [],
          display_order: b.display_order,
        })));
      }
    } catch (error) {
      console.error('Error fetching project extras:', error);
    } finally {
      setIsLoadingData(false);
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
      title: project.title || '',
      slug: project.slug || '',
      category: project.categoryId || '',
      blurb: project.blurb || '',
      year: project.year || new Date().getFullYear(),
      role: project.role || '',
      client: project.client || '',
      tags: Array.isArray(project.tags) ? project.tags.join(', ') : '',
      coverImage: project.image || '',
      status: project.status || 'draft',
    },
  });

  // Update form when project changes
  useEffect(() => {
    reset({
      title: project.title || '',
      slug: project.slug || '',
      category: project.categoryId || '',
      blurb: project.blurb || '',
      year: project.year || new Date().getFullYear(),
      role: project.role || '',
      client: project.client || '',
      tags: Array.isArray(project.tags) ? project.tags.join(', ') : '',
      coverImage: project.image || '',
      status: project.status || 'draft',
    });
  }, [project, reset]);

  const categoryValue = watch('category');
  const statusValue = watch('status');

  const onSubmit = async (data: ProjectFormData) => {
    console.log('Updating project with data:', data);
    console.log('Project ID:', project.id);
    
    setIsSubmitting(true);

    try {
      const { data: updatedData, error } = await supabase
        .from('projects')
        .update({
          slug: data.slug,
          category_id: data.category,
          title_en: data.title,
          blurb_en: data.blurb,
          cover_image: data.coverImage,
          year: data.year,
          role_en: data.role || null,
          client: data.client || null,
          status: data.status,
          published_at: data.status === 'published' && !project.published_at 
            ? new Date().toISOString() 
            : project.published_at,
        })
        .eq('id', project.id)
        .select(`
          *,
          categories (
            id,
            slug,
            name_en
          )
        `)
        .single();

      if (error) throw error;

      const projectId = project.id;

      // Update tech stack
      await supabase.from('tech_stack').delete().eq('project_id', projectId);
      if (techStack.length > 0) {
        await supabase.from('tech_stack').insert(
          techStack.map((tech, index) => ({
            project_id: projectId,
            name: tech,
            display_order: index,
          }))
        );
      }

      // Update external links
      await supabase.from('external_links').delete().eq('project_id', projectId);
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

      // Update media
      await supabase.from('media').delete().eq('project_id', projectId);
      if (mediaType === 'before_after') {
        // Save a single before/after record
        if (beforeAfterImages.before && beforeAfterImages.after) {
          await supabase.from('media').insert([
            {
              project_id: projectId,
              media_type: 'before_after',
              before_url: beforeAfterImages.before,
              after_url: beforeAfterImages.after,
              // keep a url value (after image) for convenience where needed
              url: beforeAfterImages.after,
              display_order: 0,
            },
          ]);
        }
      } else {
        // Save standard gallery images
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
      }

      // Update tags
      try {
        await supabase.from('project_tags').delete().eq('project_id', projectId);
        const tagsArray = data.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
        
        for (const tagName of tagsArray) {
          if (!tagName) continue; // Skip empty tags
          
          try {
            // Check if tag exists
            let { data: existingTag, error: tagError } = await supabase
              .from('tags')
              .select('id')
              .eq('name', tagName)
              .maybeSingle(); // Use maybeSingle instead of single to avoid error when not found

            let tagId;
            
            if (!existingTag) {
              // Create new tag
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
                continue; // Skip this tag if creation fails
              }
              tagId = newTag?.id;
            } else {
              tagId = existingTag.id;
            }

            // Link tag to project
            if (tagId) {
              const { error: linkError } = await supabase.from('project_tags').insert([{ 
                project_id: projectId, 
                tag_id: tagId 
              }]);
              
              if (linkError) {
                console.error('Error linking tag to project:', linkError);
              }
            }
          } catch (tagErr) {
            console.error(`Error processing tag "${tagName}":`, tagErr);
            // Continue with other tags
          }
        }
      } catch (tagsError) {
        console.error('Error updating tags:', tagsError);
        // Don't throw - continue with other updates
      }

      // Update content blocks
      await supabase.from('project_content_blocks').delete().eq('project_id', projectId);
      if (contentBlocks.length > 0) {
        await supabase.from('project_content_blocks').insert(
          contentBlocks.map((block) => ({
            project_id: projectId,
            block_type: block.block_type,
            content_en: block.content_en || null,
            content_tr: block.content_tr || null,
            media_url: block.media_url || null,
            media_urls: block.media_urls || null,
            display_order: block.display_order,
          }))
        );
      }

      toast.success('Project updated successfully!');

      if (onProjectUpdated && updatedData) {
        const formattedProject = {
          id: updatedData.id,
          title: updatedData.title_en,
          slug: updatedData.slug,
          category: updatedData.categories?.name_en || 'Uncategorized',
          categoryId: updatedData.category_id,
          blurb: updatedData.blurb_en,
          year: updatedData.year,
          role: updatedData.role_en,
          client: updatedData.client,
          image: updatedData.cover_image,
          status: updatedData.status,
          date: new Date(updatedData.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        };
        onProjectUpdated(formattedProject);
      }

      setOpen(false);
    } catch (error: any) {
      console.error('Error updating project:', error);
      console.error('Error details:', error);
      
      // More specific error messages
      if (error.message?.includes('tags')) {
        toast.error('Error updating tags. Please check tag names and try again.');
      } else if (error.message?.includes('406')) {
        toast.error('Invalid request format. Please check your input data.');
      } else {
        toast.error(error.message || 'Failed to update project');
      }
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
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent size="xl" className="max-w-7xl w-[95vw] h-[95vh] p-0 gap-0 flex flex-col">
        <DialogHeader className="px-8 py-6 border-b border-border shrink-0">
          <DialogTitle className="text-2xl">Edit Project</DialogTitle>
          <DialogDescription>
            Update project details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {/* Sticky section nav (mobile only) */}
            <div className="md:hidden sticky top-0 z-10 -mx-8 px-8 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-background/80 border-b">
              <div className="max-w-5xl mx-auto flex flex-wrap gap-2">
                {sectionNav.map((s) => (
                  <Button key={s.id} type="button" variant="secondary" size="sm" onClick={() => scrollTo(s.id)}>
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>
            {/* Desktop layout with left sidebar */}
            <div className="max-w-7xl mx-auto flex gap-8">
              <aside className="hidden md:block w-52 shrink-0 sticky top-4 self-start">
                <div className="rounded-lg border bg-card/50 p-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground px-2 pb-2">Sections</div>
                  <div className="flex flex-col gap-2">
                    {sectionNav.map((s) => (
                      <Button key={s.id} type="button" variant="ghost" className="justify-start" onClick={() => scrollTo(s.id)}>
                        {s.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </aside>
              <div className="flex-1 space-y-8">
          
          {/* Basic Information */}
          <div id="basic" className="space-y-6 rounded-lg border bg-card/50 p-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              {...register('title')}
              onChange={(e) => {
                register('title').onChange(e);
                handleTitleChange(e);
              }}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input id="slug" {...register('slug')} />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          {/* Category & Year */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={categoryValue}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoriesData.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                {...register('year', { valueAsNumber: true })}
              />
              {errors.year && (
                <p className="text-sm text-destructive">{errors.year.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="blurb">Description *</Label>
            <Textarea
              id="blurb"
              {...register('blurb')}
              rows={4}
            />
            {errors.blurb && (
              <p className="text-sm text-destructive">{errors.blurb.message}</p>
            )}
          </div>

          {/* Role & Client */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Your Role</Label>
              <Input id="role" {...register('role')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Input id="client" {...register('client')} />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags *</Label>
            <Input id="tags" {...register('tags')} />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas
            </p>
            {errors.tags && (
              <p className="text-sm text-destructive">{errors.tags.message}</p>
            )}
          </div>

          {/* Media & Gallery */}
          <div id="media" className="space-y-6 rounded-lg border bg-card/50 p-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="h-8 w-1 bg-accent rounded-full"></div>
              Media & Gallery
            </h3>
            <div className="space-y-6">
              {/* Media Type Selection */}
              <div className="space-y-3">
                <Label>Media Type</Label>
                <Tabs value={mediaType} onValueChange={(value) => setMediaType(value as 'standard' | 'before_after')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="standard">Standard Media</TabsTrigger>
                    <TabsTrigger value="before_after">Before/After Comparison</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="standard" className="space-y-4 mt-4">
                    {/* Cover Image */}
                    <div className="space-y-2">
                      <Label>Cover Image *</Label>
                      <Tabs defaultValue="upload" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="upload">Upload Image</TabsTrigger>
                          <TabsTrigger value="url">Image URL</TabsTrigger>
                        </TabsList>
                        <TabsContent value="upload" className="space-y-4">
                          <ImageUpload
                            value={watch('coverImage')}
                            onChange={(url) => setValue('coverImage', url)}
                          />
                        </TabsContent>
                        <TabsContent value="url" className="space-y-4">
                          <Input
                            id="coverImage"
                            {...register('coverImage')}
                            placeholder="https://images.unsplash.com/photo-..."
                          />
                          <p className="text-xs text-muted-foreground">
                            Or paste an image URL
                          </p>
                        </TabsContent>
                      </Tabs>
                      {errors.coverImage && (
                        <p className="text-sm text-destructive">{errors.coverImage.message}</p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="before_after" className="space-y-4 mt-4">
                    <BeforeAfterUpload
                      onBeforeAfterChange={(before, after) => {
                        setBeforeAfterImages({ before, after });
                        // Set the cover image to the "after" image for thumbnails
                        setValue('coverImage', after);
                      }}
                      initialBefore={beforeAfterImages.before}
                      initialAfter={beforeAfterImages.after}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Tech Stack */}
              <div className="space-y-2">
                <Label>Tech Stack</Label>
                <div className="space-y-2">
                  {techStack.map((tech, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={tech}
                        onChange={(e) => {
                          const newStack = [...techStack];
                          newStack[index] = e.target.value;
                          setTechStack(newStack);
                        }}
                        placeholder="e.g., React, Figma"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setTechStack(techStack.filter((_, i) => i !== index))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setTechStack([...techStack, ''])}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tech
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* External Links */}
          <div className="space-y-2">
            <Label>External Links</Label>
            <div className="space-y-2">
              {externalLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={link.label}
                    onChange={(e) => {
                      const newLinks = [...externalLinks];
                      newLinks[index].label = e.target.value;
                      setExternalLinks(newLinks);
                    }}
                    placeholder="Label (e.g., Live Demo)"
                    className="flex-1"
                  />
                  <Input
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...externalLinks];
                      newLinks[index].url = e.target.value;
                      setExternalLinks(newLinks);
                    }}
                    placeholder="https://..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setExternalLinks(externalLinks.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setExternalLinks([...externalLinks, { label: '', url: '' }])}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>
          </div>

          {/* Gallery Images */}
          <div className="space-y-2">
            <Label>Gallery Images</Label>
            <div className="space-y-2">
              {galleryImages.map((img, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={img}
                    onChange={(e) => {
                      const newImages = [...galleryImages];
                      newImages[index] = e.target.value;
                      setGalleryImages(newImages);
                    }}
                    placeholder="https://images.unsplash.com/..."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setGalleryImages([...galleryImages, ''])}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Add additional images to project gallery
            </p>
          </div>
          </div>

          {/* Technical Details & Links */}
          <div id="details" className="space-y-6 rounded-lg border bg-card/50 p-6">
          {/* Tech Stack & External Links already here */}
          </div>

          {/* Content Blocks */}
          <div id="content" className="space-y-6 rounded-lg border bg-card/50 p-6">
            {isLoadingData ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Loading content blocks...</p>
              </div>
            ) : (
              <ContentBlocksBuilder 
                blocks={contentBlocks} 
                onChange={setContentBlocks}
              />
            )}
          </div>

          {/* Status */}
          <div id="publish" className="space-y-6 rounded-lg border bg-card/50 p-6">
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
        </div>
      </div>
            </div>
          </div>

          {/* Sticky Footer Actions */}
      <div className="shrink-0 flex justify-end gap-3 px-8 py-4 border-t border-border bg-muted/30">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? 'Updating...' : 'Update Project'}
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>
  );
}
