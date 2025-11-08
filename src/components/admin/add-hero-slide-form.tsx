'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client'; // Only for database operations
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MediaLibraryModal } from '@/components/admin/media-library-modal';
import { toast } from 'sonner';

const slideSchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalı'),
  subtitle: z.string().optional(),
  mediaUrl: z.string().optional(),
  mediaType: z.enum(['image', 'video']),
  isActive: z.boolean(),
  displayOrder: z.number().min(0),
});

type SlideFormData = z.infer<typeof slideSchema>;

interface AddHeroSlideFormProps {
  onSlideAdded?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function AddHeroSlideForm({ onSlideAdded, onCancel, className }: AddHeroSlideFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file' | 'library'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      title: '',
      subtitle: '',
      mediaUrl: '',
      mediaType: 'image',
      isActive: true,
      displayOrder: 0,
    },
  });

  const mediaTypeValue = watch('mediaType');
  const mediaUrlValue = watch('mediaUrl');
  const isActiveValue = watch('isActive');
  const displayOrderValue = watch('displayOrder');

  const previewSource =
    uploadMethod === 'file' && previewUrl
      ? previewUrl
      : mediaUrlValue?.trim() ?? '';

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes =
      mediaTypeValue === 'image'
        ? ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
        : ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

    if (!validTypes.includes(file.type)) {
      toast.error(`Lütfen geçerli bir ${mediaTypeValue === 'image' ? 'görsel' : 'video'} dosyası seçin.`);
      return;
    }

    const maxSize = mediaTypeValue === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`Dosya boyutu ${mediaTypeValue === 'image' ? '10MB' : '50MB'} sınırını aşmamalı.`);
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleLibrarySelect = (url: string) => {
    setSelectedFile(null);
    setPreviewUrl('');
    setUploadMethod('library');
    setValue('mediaUrl', url);
    toast.success('Medya kütüphanesinden seçildi');
    setShowLibrary(false);
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', 'hero-slides');

    const response = await fetch('/api/r2/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Yükleme başarısız oldu');
    }

    const data = await response.json();
    return data.url as string;
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: SlideFormData) => {
    setIsSubmitting(true);

    try {
      let mediaUrl = data.mediaUrl?.trim() ?? '';

      if (uploadMethod === 'file' && selectedFile) {
        setIsUploading(true);
        mediaUrl = await uploadFile(selectedFile);
        setValue('mediaUrl', mediaUrl);
      }

      if (!mediaUrl) {
        throw new Error('Lütfen bir medya URL’si girin veya dosya yükleyin.');
      }

      const { error } = await supabase.from('hero_slides').insert([
        {
          title: data.title,
          subtitle: data.subtitle || null,
          url: mediaUrl,
          type: data.mediaType,
          active: data.isActive,
          display_order: data.displayOrder,
        },
      ]);

      if (error) throw error;

      toast.success('Slide başarıyla eklendi');
      reset();
      clearFile();
      setUploadMethod('url');
      setPreviewUrl('');
      if (onSlideAdded) onSlideAdded();
      if (onCancel) onCancel();
    } catch (error: any) {
      console.error('Error adding slide:', error);
      toast.error(error.message || 'Slide eklenemedi');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    reset();
    clearFile();
    setUploadMethod('url');
    setPreviewUrl('');
    onCancel?.();
  };

  return (
    <div className={className}>
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b bg-muted/40 px-6 py-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Hero Slide Ekle</h2>
            <p className="text-sm text-muted-foreground">
              Ana sayfadaki hero carousel’e yeni bir slide ekleyin.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 p-6 lg:grid-cols-[2fr_1fr] lg:p-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Temel Bilgiler</CardTitle>
                <CardDescription>Hero üzerinde yer alacak metinleri düzenleyin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Başlık *</Label>
                  <Input
                    id="title"
                    placeholder="Hayallerinizi tasarlıyoruz"
                    {...register('title')}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Alt Başlık</Label>
                  <Textarea
                    id="subtitle"
                    rows={3}
                    placeholder="Crafted Anomaly ile tanışın..."
                    {...register('subtitle')}
                  />
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
                <CardDescription>Hero için görsel veya video seçin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs
                  value={uploadMethod}
                  onValueChange={(value) => {
                    const method = value as 'url' | 'file' | 'library';
                    setUploadMethod(method);
                    if (method === 'url') {
                      clearFile();
                    }
                    if (method === 'library') {
                      setShowLibrary(true);
                    }
                  }}
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="url">URL</TabsTrigger>
                    <TabsTrigger value="file">Dosya Yükle</TabsTrigger>
                    <TabsTrigger value="library">Kütüphaneden Seç</TabsTrigger>
                  </TabsList>
                  <TabsContent value="url" className="space-y-2 pt-4">
                    <Label htmlFor="mediaUrl">Medya URL&apos;si</Label>
                    <Input
                      id="mediaUrl"
                      placeholder="https://cdn.craftedanomaly.com/hero-slides/..."
                      {...register('mediaUrl')}
                    />
                    {errors.mediaUrl && (
                      <p className="text-sm text-destructive">{errors.mediaUrl.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      R2 kütüphanesinden bir URL yapıştırabilir veya Media Library&apos;den kopyalayabilirsiniz.
                    </p>
                  </TabsContent>
                  <TabsContent value="file" className="space-y-4 pt-4">
                    <div className="rounded-lg border-2 border-dashed border-border p-6">
                      {!selectedFile ? (
                        <div className="flex flex-col items-center text-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                          <p className="mt-4 text-sm text-muted-foreground">
                            {mediaTypeValue === 'image'
                              ? 'PNG, JPG, WEBP, AVIF • Maksimum 10MB'
                              : 'MP4, WEBM, MOV • Maksimum 50MB'}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-4"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="mr-2 h-4 w-4" /> Dosya Seç
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {previewUrl && mediaTypeValue === 'image' && (
                            <img
                              src={previewUrl}
                              alt="Önizleme"
                              className="h-40 w-full rounded-lg object-cover"
                            />
                          )}
                          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                            <div className="flex items-center gap-3">
                              <ImageIcon className="h-8 w-8 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{selectedFile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button type="button" size="icon" variant="ghost" onClick={clearFile}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={mediaTypeValue === 'image' ? 'image/*' : 'video/*'}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground">
                      Dosya yüklediğinizde kaydettiğiniz anda R2’ye aktarılır ve URL otomatik kaydedilir.
                    </p>
                  </TabsContent>
                  <TabsContent value="library" className="space-y-4 pt-4">
                    <p className="text-sm text-muted-foreground">
                      Mevcut R2 kütüphanesinden bir medya seçin. İlgili klasörden URL otomatik olarak eklenir.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      onClick={() => setShowLibrary(true)}
                    >
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
                <CardDescription>Kaydetmeden önce slide görünümünü kontrol edin.</CardDescription>
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
                      <p className="text-sm">Önizleme için medya seçin</p>
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
                <CardDescription>Slide’ın ana sayfada görünüp görünmeyeceğini seçin.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-md bg-muted/60 p-4">
                  <div>
                    <p className="text-sm font-medium">Aktif</p>
                    <p className="text-xs text-muted-foreground">
                      Ana sayfa hero alanında gösterilsin.
                    </p>
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
            <Button type="button" variant="outline" onClick={handleCancel}>
              Vazgeç
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isUploading ? 'Yükleniyor...' : isSubmitting ? 'Kaydediliyor...' : 'Slide Ekle'}
            </Button>
          </div>
        </form>
      </div>

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
