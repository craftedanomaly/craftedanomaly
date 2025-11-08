'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Edit, Image as ImageIcon } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MediaLibraryModal } from '@/components/admin/media-library-modal';
import { toast } from 'sonner';

const slideSchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalı'),
  subtitle: z.string().optional(),
  mediaUrl: z.string().url('Geçerli bir URL olmalı'),
  mediaType: z.enum(['image', 'video']),
  isActive: z.boolean(),
  displayOrder: z.number().min(0),
});

type SlideFormData = z.infer<typeof slideSchema>;

interface EditHeroSlideFormProps {
  slide: any;
  onSlideUpdated?: () => void;
}

export function EditHeroSlideForm({ slide, onSlideUpdated }: EditHeroSlideFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'library'>('url');
  const [showLibrary, setShowLibrary] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SlideFormData>({
    resolver: zodResolver(slideSchema),
    defaultValues: {
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      mediaUrl: slide.url || '',
      mediaType: slide.type || 'image',
      isActive: slide.active ?? true,
      displayOrder: slide.display_order || 0,
    },
  });

  useEffect(() => {
    reset({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      mediaUrl: slide.url || '',
      mediaType: slide.type || 'image',
      isActive: slide.active ?? true,
      displayOrder: slide.display_order || 0,
    });
  }, [slide, reset]);

  const mediaTypeValue = watch('mediaType');
  const mediaUrlValue = watch('mediaUrl');
  const isActiveValue = watch('isActive');
  const displayOrderValue = watch('displayOrder');

  const previewSource = mediaUrlValue?.trim() ?? '';

  useEffect(() => {
    if (!expanded) {
      setUploadMethod('url');
      setShowLibrary(false);
    }
  }, [expanded]);

  const handleLibrarySelect = (url: string) => {
    setUploadMethod('library');
    setValue('mediaUrl', url);
    toast.success('Medya kütüphanesinden seçildi');
    setShowLibrary(false);
  };

  const onSubmit = async (data: SlideFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('hero_slides')
        .update({
          title: data.title,
          subtitle: data.subtitle || null,
          url: data.mediaUrl,
          type: data.mediaType,
          active: data.isActive,
          display_order: data.displayOrder,
        })
        .eq('id', slide.id);

      if (error) throw error;

      toast.success('Slide güncellendi');
      setExpanded(false);
      if (onSlideUpdated) onSlideUpdated();
    } catch (error: any) {
      console.error('Error updating slide:', error);
      toast.error(error.message || 'Slide güncellenemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <Edit className="h-4 w-4" />
          <div>
            <p className="text-sm font-medium">{slide.title || 'İsimsiz Slide'}</p>
            <p className="text-xs text-muted-foreground">#{slide.display_order} • {slide.type}</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{expanded ? 'Kapat' : 'Düzenle'}</span>
      </button>

      {expanded && (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 px-6 pb-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Temel Bilgiler</CardTitle>
                <CardDescription>Hero alanında gösterilecek içerik.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Başlık *</Label>
                  <Input id="title" placeholder="Hero başlığı" {...register('title')} />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Alt Başlık</Label>
                  <Textarea id="subtitle" rows={3} {...register('subtitle')} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="displayOrder">Gösterim Sırası</Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      min={0}
                      {...register('displayOrder', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mediaType">Medya Türü</Label>
                    <Select
                      value={mediaTypeValue}
                      onValueChange={(value: 'image' | 'video') => setValue('mediaType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Görsel</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medya Kaynağı</CardTitle>
                <CardDescription>URL R2’deki dosyayı işaret etmelidir.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs
                  value={uploadMethod}
                  onValueChange={(value) => {
                    const method = value as 'url' | 'library';
                    setUploadMethod(method);
                    if (method === 'library') {
                      setShowLibrary(true);
                    }
                  }}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">URL</TabsTrigger>
                    <TabsTrigger value="library">Kütüphaneden Seç</TabsTrigger>
                  </TabsList>
                  <TabsContent value="url" className="space-y-2 pt-4">
                    <Label htmlFor="mediaUrl">Medya URL&apos;si *</Label>
                    <Input
                      id="mediaUrl"
                      placeholder="https://cdn.craftedanomaly.com/hero-slides/..."
                      {...register('mediaUrl')}
                    />
                    {errors.mediaUrl && (
                      <p className="text-sm text-destructive">{errors.mediaUrl.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      URL&apos;i Media Management sayfasından kopyalayabilirsiniz.
                    </p>
                  </TabsContent>
                  <TabsContent value="library" className="space-y-4 pt-4">
                    <p className="text-xs text-muted-foreground">
                      R2 kütüphanesinden mevcut bir medya seçin. Seçildiğinde URL otomatik olarak güncellenir.
                    </p>
                    <Button type="button" variant="outline" onClick={() => setShowLibrary(true)}>
                      Kütüphaneyi Aç
                    </Button>
                    {mediaUrlValue && (
                      <div className="rounded-md border bg-muted/70 p-3 text-xs">
                        <p className="font-medium text-foreground">Seçilen URL</p>
                        <p className="break-all text-muted-foreground">{mediaUrlValue}</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Önizleme</CardTitle>
                <CardDescription>Güncel medya ile görünüm.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted">
                  {previewSource ? (
                    mediaTypeValue === 'image' ? (
                      <img src={previewSource} alt="Slide önizleme" className="h-full w-full object-cover" />
                    ) : (
                      <video
                        src={previewSource}
                        className="h-full w-full object-cover"
                        autoPlay
                        loop
                        muted
                        controls
                      />
                    )
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                      <ImageIcon className="h-10 w-10" />
                      <p className="text-sm">Medya URL&apos;i girildiğinde önizleme görünür.</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="uppercase tracking-wide">
                      {mediaTypeValue === 'image' ? 'Görsel' : 'Video'}
                    </Badge>
                    <span>Gösterim Sırası: {displayOrderValue ?? 0}</span>
                  </div>
                  <span>Önerilen oran 16:9</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Yayın Durumu</CardTitle>
                <CardDescription>Slide ana sayfada aktif olsun mu?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-md bg-muted/60 p-4">
                  <div>
                    <p className="text-sm font-medium">Aktif</p>
                    <p className="text-xs text-muted-foreground">Hero alanında görüntülensin.</p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={isActiveValue}
                    onCheckedChange={(checked) => setValue('isActive', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 flex items-center justify-end gap-3 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => setExpanded(false)}>
              Vazgeç
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
            </Button>
          </div>
        </form>
      )}

      <MediaLibraryModal
        open={showLibrary}
        onClose={() => {
          setShowLibrary(false);
          if (uploadMethod === 'library' && !mediaUrlValue) {
            setUploadMethod('url');
          }
        }}
        onSelect={handleLibrarySelect}
        accept={mediaTypeValue === 'video' ? 'video' : 'image'}
      />
    </div>
  );
}
