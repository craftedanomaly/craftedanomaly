'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Upload, X, Image as ImageIcon } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const slideSchema = z.object({
  titleEn: z.string().min(3, 'Title must be at least 3 characters'),
  titleTr: z.string().optional(),
  subtitleEn: z.string().optional(),
  subtitleTr: z.string().optional(),
  mediaUrl: z.string().optional(),
  mediaType: z.enum(['image', 'video']),
  isActive: z.boolean(),
  displayOrder: z.number().min(0),
});

type SlideFormData = z.infer<typeof slideSchema>;

interface AddHeroSlideFormProps {
  onSlideAdded?: () => void;
}

export function AddHeroSlideForm({ onSlideAdded }: AddHeroSlideFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
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
      titleEn: '',
      titleTr: '',
      subtitleEn: '',
      subtitleTr: '',
      mediaUrl: '',
      mediaType: 'image',
      isActive: true,
      displayOrder: 0,
    },
  });

  const mediaTypeValue = watch('mediaType');
  const isActiveValue = watch('isActive');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = mediaTypeValue === 'image' 
      ? ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      : ['video/mp4', 'video/webm', 'video/ogg'];

    if (!validTypes.includes(file.type)) {
      toast.error(`Please select a valid ${mediaTypeValue} file`);
      return;
    }

    // Validate file size (10MB for images, 50MB for videos)
    const maxSize = mediaTypeValue === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${mediaTypeValue === 'image' ? '10MB' : '50MB'}`);
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `hero-slides/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return publicUrl;
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
      let mediaUrl = data.mediaUrl;

      // If file upload method is selected and file exists, upload it
      if (uploadMethod === 'file' && selectedFile) {
        setIsUploading(true);
        mediaUrl = await uploadFile(selectedFile);
      }

      // Validate that we have a media URL
      if (!mediaUrl) {
        throw new Error('Please provide a media URL or upload a file');
      }

      const { error } = await supabase.from('hero_slides').insert([
        {
          title_en: data.titleEn,
          title_tr: data.titleTr || null,
          subtitle_en: data.subtitleEn || null,
          subtitle_tr: data.subtitleTr || null,
          url: mediaUrl,
          type: data.mediaType,
          active: data.isActive,
          display_order: data.displayOrder,
        },
      ]);

      if (error) throw error;

      toast.success('Slide added successfully!');
      reset();
      clearFile();
      setOpen(false);
      if (onSlideAdded) onSlideAdded();
    } catch (error: any) {
      console.error('Error adding slide:', error);
      toast.error(error.message || 'Failed to add slide');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Slide
        </Button>
      </DialogTrigger>
      <DialogContent size="xl" className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Hero Slide</DialogTitle>
          <DialogDescription>
            Create a new hero carousel slide for the homepage.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-6">
          {/* English Title */}
          <div className="space-y-2">
            <Label htmlFor="titleEn">Title (English) *</Label>
            <Input
              id="titleEn"
              {...register('titleEn')}
              placeholder="Welcome to Crafted Anomaly"
            />
            {errors.titleEn && (
              <p className="text-sm text-destructive">{errors.titleEn.message}</p>
            )}
          </div>

          {/* Turkish Title */}
          <div className="space-y-2">
            <Label htmlFor="titleTr">Title (Turkish)</Label>
            <Input
              id="titleTr"
              {...register('titleTr')}
              placeholder="Crafted Anomaly'ye Hoş Geldiniz"
            />
          </div>

          {/* English Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="subtitleEn">Subtitle (English)</Label>
            <Textarea
              id="subtitleEn"
              {...register('subtitleEn')}
              placeholder="Crafting Dreams..."
              rows={2}
            />
          </div>

          {/* Turkish Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="subtitleTr">Subtitle (Turkish)</Label>
            <Textarea
              id="subtitleTr"
              {...register('subtitleTr')}
              placeholder="Hayaller Yaratıyoruz..."
              rows={2}
            />
          </div>

          {/* Media Type & URL */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mediaType">Media Type *</Label>
              <Select
                value={mediaTypeValue}
                onValueChange={(value: 'image' | 'video') =>
                  setValue('mediaType', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order *</Label>
              <Input
                id="displayOrder"
                type="number"
                {...register('displayOrder', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
          </div>

          {/* Upload Method Selection */}
          <div className="space-y-4">
            <Label>Media Source *</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={uploadMethod === 'url' ? 'default' : 'outline'}
                onClick={() => setUploadMethod('url')}
                className="flex-1"
              >
                URL
              </Button>
              <Button
                type="button"
                variant={uploadMethod === 'file' ? 'default' : 'outline'}
                onClick={() => setUploadMethod('file')}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </div>
          </div>

          {/* URL Input */}
          {uploadMethod === 'url' && (
            <div className="space-y-2">
              <Label htmlFor="mediaUrl">Media URL</Label>
              <Input
                id="mediaUrl"
                {...register('mediaUrl')}
                placeholder="https://images.unsplash.com/..."
              />
              {errors.mediaUrl && (
                <p className="text-sm text-destructive">{errors.mediaUrl.message}</p>
              )}
            </div>
          )}

          {/* File Upload */}
          {uploadMethod === 'file' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Upload {mediaTypeValue}</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6">
                  {!selectedFile ? (
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Choose a {mediaTypeValue} file to upload
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {mediaTypeValue === 'image' 
                            ? 'PNG, JPG, WEBP up to 10MB' 
                            : 'MP4, WEBM up to 50MB'
                          }
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Preview */}
                      {previewUrl && mediaTypeValue === 'image' && (
                        <div className="relative">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      
                      {/* File Info */}
                      <div className="flex items-center justify-between bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={clearFile}
                        >
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
              </div>
            </div>
          )}

          {/* Active Status */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active</Label>
              <p className="text-sm text-muted-foreground">
                Show this slide on the homepage
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActiveValue}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isUploading ? 'Uploading...' : isSubmitting ? 'Adding...' : 'Add Slide'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
