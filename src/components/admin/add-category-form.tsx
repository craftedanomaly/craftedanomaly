'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { VideoUpload } from '@/components/admin/video-upload';
import { ImageUpload } from '@/components/admin/image-upload';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AddCategoryFormProps {
  onCategoryAdded?: (category: any) => void;
  onCancel?: () => void;
  className?: string;
}

const initialFormState = {
  slug: '',
  name: '',
  description: '',
  cover_image: '',
  video_url: '',
  active: true,
};

export function AddCategoryForm({ onCategoryAdded, onCancel, className }: AddCategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  const formId = 'add-category-form';

  const resetForm = () => {
    setFormData(initialFormState);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value.slice(0, 50);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);

    setFormData((prev) => ({ ...prev, name, slug }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const cleanedName = (formData.name || '').slice(0, 50);
      const cleanedSlug = (formData.slug || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50);

      const { data, error } = await supabase
        .from('categories')
        .insert([
          {
            slug: cleanedSlug,
            name: cleanedName,
            description: formData.description,
            cover_image: formData.cover_image,
            video_url: formData.video_url,
            active: formData.active,
            display_order: 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('Kategori oluşturuldu');

      resetForm();
      onCategoryAdded?.(data);
      onCancel?.();
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast.error(error.message || 'Kategori oluşturulamadı');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel?.();
  };

  return (
    <div className={cn('rounded-xl border bg-card shadow-sm', className)}>
      <div className="border-b bg-muted/40 px-6 py-5">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Yeni Kategori</h2>
            <p className="text-sm text-muted-foreground">
              Kategori bilgilerini girin, kapak görselini ve hover videosunu isteğe göre ekleyin.
            </p>
          </div>
          <Badge variant={formData.active ? 'default' : 'secondary'} className="uppercase">
            {formData.active ? 'Aktif' : 'Pasif'}
          </Badge>
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
              📁
            </div>
            <div>
              <h3 className="text-base font-semibold">Temel Bilgiler</h3>
              <p className="text-sm text-muted-foreground">
                Kategori adı, URL slug ve açıklama ile aramalarda kolay bulunmasını sağlayın.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category-name">Kategori Adı *</Label>
              <Input
                id="category-name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Filmler"
                required
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">En fazla 50 karakter, otomatik olarak slug üretilir.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-slug">URL Slug *</Label>
              <Input
                id="category-slug"
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
              <p className="text-xs text-muted-foreground">Adres çubuğunda /{formData.slug || 'kategori-adi'} olarak görünür.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description">Açıklama</Label>
            <Textarea
              id="category-description"
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
              <p className="text-xs text-muted-foreground">
                Ana sayfadaki kategori kartı için önerilen ölçüler: 1600x900px.
              </p>
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
              <p className="text-xs text-muted-foreground">
                Masaüstünde kategori kartı üzerine gelindiğinde otomatik oynatılır (MP4/WebM önerilir).
              </p>
            </div>

            <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
              <div>
                <h4 className="text-sm font-semibold">Yayın Durumu</h4>
                <p className="text-xs text-muted-foreground">
                  Aktif kategoriler hemen vitrinde görünür. Taslak olarak tutmak için pasif bırakın.
                </p>
              </div>
              <div className="flex items-center justify-between rounded-md border bg-background px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Kategori aktif</p>
                  <p className="text-xs text-muted-foreground">/{formData.slug || 'kategori-adi'}</p>
                </div>
                <Switch
                  id="category-active"
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
          {isSubmitting ? 'Kaydediliyor...' : 'Kategori Ekle'}
        </Button>
      </div>
    </div>
  );
}
