'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { VideoUpload } from '@/components/admin/video-upload';
import { ImageUpload } from '@/components/admin/image-upload';

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  cover_image?: string | null;
  video_url?: string | null;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface EditCategoryFormProps {
  category: Category;
  onCategoryUpdated?: (category: Category) => void;
  onBack?: () => void;
}

export function EditCategoryForm({ category, onCategoryUpdated, onBack }: EditCategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    slug: category.slug,
    name: category.name,
    description: category.description || '',
    cover_image: category.cover_image || '',
    video_url: category.video_url || '',
    active: category.active,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('categories')
        .update({
          slug: formData.slug,
          name: formData.name,
          description: formData.description,
          icon: formData.cover_image,
          video_url: formData.video_url,
          active: formData.active,
        })
        .eq('id', category.id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Category updated successfully!');
      
      if (onCategoryUpdated) {
        onCategoryUpdated(data);
      }

      if (onBack) onBack();
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast.error(error.message || 'Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setFormData(prev => ({ ...prev, name, slug }));
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
              Back to Categories
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-xl font-semibold">Edit Category</h1>
              <p className="text-sm text-muted-foreground">Update category information</p>
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
              form="category-form"
              disabled={isSubmitting}
              className="min-w-32"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Category'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <form id="category-form" onSubmit={handleSubmit} className="max-w-4xl mx-auto p-8 space-y-8">
        
        {/* Basic Info Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">📁</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Basic Information</h2>
              <p className="text-sm text-muted-foreground">Essential category details</p>
            </div>
          </div>
          
          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Films"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="films"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Used in URLs: /{formData.slug}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Category description..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Cover Image</Label>
              <ImageUpload
                value={formData.cover_image}
                onChange={(url) => setFormData(prev => ({ ...prev, cover_image: url }))}
                bucket="media"
              />
              <p className="text-xs text-muted-foreground">
                Upload a cover image for this category
              </p>
            </div>

            <div className="space-y-2">
              <Label>Hover Video (Desktop Only)</Label>
              <VideoUpload
                value={formData.video_url}
                onChange={(url) => setFormData(prev => ({ ...prev, video_url: url }))}
                maxSizeMB={100}
              />
              <p className="text-xs text-muted-foreground">
                Video that plays when hovering over this category on desktop. Auto-plays muted on hover.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
        </section>
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
            form="category-form"
            disabled={isSubmitting}
            className="min-w-32"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              'Update Category'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
