'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { VideoUpload } from '@/components/admin/video-upload';
import { ImageUpload } from '@/components/admin/image-upload';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
  onCancel?: () => void;
  className?: string;
}

export function EditCategoryForm({ category, onCategoryUpdated, onCancel, className }: EditCategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    slug: category.slug,
    name: category.name,
    description: category.description || '',
    cover_image: category.cover_image || '',
    video_url: category.video_url || '',
    active: category.active,
  });

  useEffect(() => {
    setFormData({
      slug: category.slug,
      name: category.name,
      description: category.description || '',
      cover_image: category.cover_image || '',
      video_url: category.video_url || '',
      active: category.active,
    });
  }, [category]);

  const formId = `edit-category-form-${category.id}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Re-sanitize before submit to satisfy DB varchar(50)
      const cleanedName = (formData.name || '').slice(0, 50);
      const cleanedSlug = (formData.slug || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50);

      const { data, error } = await supabase
        .from('categories')
        .update({
          slug: cleanedSlug,
          name: cleanedName,
          description: formData.description,
          cover_image: formData.cover_image,
          video_url: formData.video_url,
          active: formData.active,
        })
        .eq('id', category.id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Kategori güncellendi');

      onCategoryUpdated?.(data);
      onCancel?.();
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast.error(error.message || 'Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value.slice(0, 50);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);
    setFormData(prev => ({ ...prev, name, slug }));
  };

  const handleCancel = () => {
    setFormData({
      slug: category.slug,
      name: category.name,
      description: category.description || '',
      cover_image: category.cover_image || '',
      video_url: category.video_url || '',
      active: category.active,
    });
    onCancel?.();
  };

  return (
    <div className={cn('rounded-xl border bg-card shadow-sm', className)}>
      <div className="border-b bg-muted/40 px-6 py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
              <span>Kategori ID</span>
              <Badge variant="outline" className="uppercase">#{category.display_order + 1}</Badge>
            </div>
            <h2 className="text-lg font-semibold">{formData.name || 'Kategori Güncelle'}</h2>
            <p className="text-sm text-muted-foreground">/{formData.slug || 'kategori-slug'} — bilgileri güncelleyin.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={formData.active ? 'default' : 'secondary'} className="uppercase">
              {formData.active ? 'Aktif' : 'Pasif'}
            </Badge>
            {category.video_url && (
              <Badge variant="outline" className="gap-1 text-xs">
                Hover Video
              </Badge>
            )}
          </div>
        </div>
      </div>

      <form
        id={formId}
        onSubmit={handleSubmit}
        className="max-h-[70vh] overflow-y-auto px-6 py-6 space-y-10"
      >
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg">
              ✏️
            </div>
            <div>
              <h3 className="text-base font-semibold">Temel Bilgiler</h3>
              <p className="text-sm text-muted-foreground">Ad, slug ve açıklamayı güncelleyin.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">Kategori Adı *</Label>
              <Input
                id="edit-category-name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Filmler"
                required
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">En fazla 50 karakter, otomatik slug üretimi sağlar.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category-slug">URL Slug *</Label>
              <Input
                id="edit-category-slug"
                value={formData.slug}
                onChange={(event) => {
                  const raw = event.target.value;
                  const cleaned = raw
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '')
                    .slice(0, 50);
                  setFormData((prev) => ({ ...prev, slug: cleaned }));
                }}
                placeholder="filmler"
                required
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">/{formData.slug || 'kategori-adi'} olarak yayınlanır.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category-description">Açıklama</Label>
            <Textarea
              id="edit-category-description"
              value={formData.description}
              onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Kategoriye dair kısa bir açıklama yazın..."
              rows={3}
            />
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Kapak Görseli</Label>
              <ImageUpload
                value={formData.cover_image}
                onChange={(url) => setFormData((prev) => ({ ...prev, cover_image: url }))}
                bucket="categories"
              />
              <p className="text-xs text-muted-foreground">Kategori kartı için önerilen ölçüler: 1600x900px.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Hover Videosu (İsteğe Bağlı)</Label>
              <VideoUpload
                value={formData.video_url}
                onChange={(url) => setFormData((prev) => ({ ...prev, video_url: url }))}
                maxSizeMB={50}
              />
              <p className="text-xs text-muted-foreground">Masaüstünde kart üzerine gelince otomatik oynatılır.</p>
            </div>

            <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
              <div>
                <h4 className="text-sm font-semibold">Yayın Durumu</h4>
                <p className="text-xs text-muted-foreground">Aktif kategoriler vitrinde listelenir.</p>
              </div>
              <div className="flex items-center justify-between rounded-md border bg-background px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Kategori aktif</p>
                  <p className="text-xs text-muted-foreground">/{formData.slug || 'kategori-adi'}</p>
                </div>
                <Switch
                  id="edit-category-active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, active: checked }))}
                />
              </div>
            </div>
          </div>
        </section>
      </form>

      <div className="flex flex-col gap-3 border-t bg-muted/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Vazgeç
        </Button>
        <Button type="submit" form={formId} disabled={isSubmitting} className="gap-2">
          {isSubmitting ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
        </Button>
      </div>
    </div>
  );
}
