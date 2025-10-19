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
        // Check if it's a valid URL
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      'Must be a valid URL'
    )
    .refine(
      (url) => {
        // Check if it's an image URL
        return url.includes('images.unsplash.com') || 
               url.includes('supabase.co') || 
               url.includes('antalyaff.com') ||
               /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url) ||
               url.includes('blob:'); // Allow blob URLs for before/after
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

  // Scroll to first error
  const scrollToFirstError = () => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
    }
  };

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
    // Check for validation errors
    if (Object.keys(errors).length > 0) {
      toast.error(`Please fix ${Object.keys(errors).length} validation error${Object.keys(errors).length > 1 ? 's' : ''} before submitting`);
      scrollToFirstError();
      return;
    }
    
    // Custom validation for before/after
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
      await supabase.from('project_categories').delete().eq('project_id', projectId);
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
          url: beforeAfterImages.after, // Use after image as main URL
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
        // Transform to UI format
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

  // Auto-generate slug from title
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
      <DialogContent size="xl" className="max-w-7xl w-[95vw] h-[95vh] p-0 gap-0 flex flex-col">
        <DialogHeader className="px-8 py-6 border-b border-border shrink-0">
          <DialogTitle className="text-2xl">Add New Project</DialogTitle>
          <DialogDescription>
            Create a new portfolio project. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 py-6">
            
            {/* Validation Errors Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-sm font-medium text-destructive">
                    {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''} found:
                  </h4>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={scrollToFirstError}
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    Fix First Error
                  </Button>
                </div>
                <ul className="text-sm text-destructive space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-destructive rounded-full"></span>
                      <strong className="capitalize">{field.replace(/([A-Z])/g, ' $1').toLowerCase()}:</strong> {error?.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
          
          {/* Basic Information Section */}
          <div id="basic" className="space-y-6 rounded-lg border bg-card/50 p-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="h-8 w-1 bg-accent rounded-full"></div>
              Basic Information
            </h3>
            <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-1">
              Project Title 
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              {...register('title')}
              onChange={(e) => {
                register('title').onChange(e);
                handleTitleChange(e);
              }}
              placeholder="Cinematic Journey"
              className={errors.title ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <span className="w-1 h-1 bg-destructive rounded-full"></span>
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug" className="flex items-center gap-1">
              Slug 
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="slug"
              {...register('slug')}
              placeholder="cinematic-journey"
              className={errors.slug ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {errors.slug && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <span className="w-1 h-1 bg-destructive rounded-full"></span>
                {errors.slug.message}
              </p>
            )}
          </div>

          {/* Categories & Year */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label className="flex items-center gap-1">
                Categories
                <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border border-border/60 bg-muted/30 p-3">
                {categoriesData.length === 0 && (
                  <p className="text-sm text-muted-foreground">No categories available. Create one first.</p>
                )}
                {categoriesData.map((cat) => {
                  const checked = categoriesValue.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className="flex items-center justify-between rounded-md border border-border/60 bg-background px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-foreground">{cat.name}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => {
                          const value = event.target.checked
                            ? [...categoriesValue, cat.id]
                            : categoriesValue.filter((id) => id !== cat.id);
                          setValue('categories', value, { shouldValidate: true });
                        }}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                    </label>
                  );
                })}
              </div>
              {errors.categories && (
                <p className="text-xs text-destructive">{errors.categories.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                {...register('year', { valueAsNumber: true })}

{/* Role & Client */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div className="space-y-2">
<Label htmlFor="role">Your Role</Label>
<Input
id="role"
{...register('role')}
placeholder="Designer, Developer"
/>
</div>
        <Textarea
          id="blurb"
          {...register('blurb')}
          placeholder="A brief description of your project..."
          rows={4}
          className={errors.blurb ? 'border-destructive focus-visible:ring-destructive' : ''}
        />
        {errors.blurb && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <span className="w-1 h-1 bg-destructive rounded-full"></span>
            {errors.blurb.message}
          </p>
        )}
      </div>

      {/* Role & Client */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Your Role</Label>
          <Input
            id="role"
            {...register('role')}
            placeholder="Designer, Developer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client">Client</Label>
          <Input
            id="client"
            {...register('client')}
            placeholder="Company Name"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags *</Label>
        <Input
          id="tags"
          {...register('tags')}
          placeholder="UI/UX, Mobile, React (comma separated)"
        />
        <p className="text-xs text-muted-foreground">
          Separate tags with commas
        </p>
        {errors.tags && (
          <p className="text-sm text-destructive">{errors.tags.message}</p>
        )}
          </div>

          {/* Media Section */}
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
                  <Label className="flex items-center gap-1">
                    Cover Image 
                    <span className="text-destructive">*</span>
                  </Label>
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
                        className={errors.coverImage ? 'border-destructive focus-visible:ring-destructive' : ''}
                      />
                      <p className="text-xs text-muted-foreground">
                        Or paste an image URL from Unsplash, etc.
                      </p>
                    </TabsContent>
                  </Tabs>
                  {errors.coverImage && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <span className="w-1 h-1 bg-destructive rounded-full"></span>
                      {errors.coverImage.message}
                    </p>
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

          {/* Gallery Images */}
          <div className="space-y-3">
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
            <p className="text-xs text-muted-foreground">
              Upload high-quality visuals. Images are stored in Supabase Storage.
            </p>
          </div>

        </div>
      </div>

      {/* Technical Details Section */}
      <div id="details" className="space-y-6 rounded-lg border bg-card/50 p-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className="h-8 w-1 bg-accent rounded-full"></div>
          Technical Details & Links
        </h3>
        <div className="space-y-6">
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
            </div>
          </div>

          {/* Content Blocks Section */}
          <div id="content" className="space-y-6 rounded-lg border bg-card/50 p-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="h-8 w-1 bg-accent rounded-full"></div>
              Content Blocks
            </h3>
            <ContentBlocksBuilder 
              blocks={contentBlocks} 
              onChange={setContentBlocks}
            />
          </div>

          {/* Publish Settings Section */}
          <div id="publish" className="space-y-6 rounded-lg border bg-card/50 p-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="h-8 w-1 bg-accent rounded-full"></div>
              Publish Settings
            </h3>
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
              onClick={() => {
                reset();
                setTechStack([]);
                setExternalLinks([]);
                setGalleryImages([]);
                setContentBlocks([]);
                setMediaType('standard');
                setBeforeAfterImages({ before: '', after: '' });
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || Object.keys(errors).length > 0} 
              size="lg"
              className={Object.keys(errors).length > 0 ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                `Create Project ${Object.keys(errors).length > 0 ? `(${Object.keys(errors).length} errors)` : ''}`
              )}
            </Button>
          </div>
        </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
