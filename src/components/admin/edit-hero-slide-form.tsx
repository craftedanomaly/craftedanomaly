'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Edit } from 'lucide-react';
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
  mediaUrl: z.string().url('Must be a valid URL'),
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
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      titleEn: slide.title || '',
      titleTr: '',
      subtitleEn: slide.subtitle || '',
      subtitleTr: '',
      mediaUrl: slide.url || '',
      mediaType: slide.type || 'image',
      isActive: slide.active ?? true,
      displayOrder: slide.display_order || 0,
    },
  });

  useEffect(() => {
    reset({
      titleEn: slide.title || '',
      titleTr: '',
      subtitleEn: slide.subtitle || '',
      subtitleTr: '',
      mediaUrl: slide.url || '',
      mediaType: slide.type || 'image',
      isActive: slide.active ?? true,
      displayOrder: slide.display_order || 0,
    });
  }, [slide, reset]);

  const mediaTypeValue = watch('mediaType');
  const isActiveValue = watch('isActive');

  const onSubmit = async (data: SlideFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('hero_slides')
        .update({
          title: data.titleEn,
          subtitle: data.subtitleEn || null,
          url: data.mediaUrl,
          type: data.mediaType,
          active: data.isActive,
          display_order: data.displayOrder,
        })
        .eq('id', slide.id);

      if (error) throw error;

      toast.success('Slide updated successfully!');
      setOpen(false);
      if (onSlideUpdated) onSlideUpdated();
    } catch (error: any) {
      console.error('Error updating slide:', error);
      toast.error(error.message || 'Failed to update slide');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent size="xl" className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Hero Slide</DialogTitle>
          <DialogDescription>
            Update hero carousel slide details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-6">
          {/* English Title */}
          <div className="space-y-2">
            <Label htmlFor="titleEn">Title (English) *</Label>
            <Input id="titleEn" {...register('titleEn')} />
            {errors.titleEn && (
              <p className="text-sm text-destructive">{errors.titleEn.message}</p>
            )}
          </div>

          {/* Turkish Title */}
          <div className="space-y-2">
            <Label htmlFor="titleTr">Title (Turkish)</Label>
            <Input id="titleTr" {...register('titleTr')} />
          </div>

          {/* English Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="subtitleEn">Subtitle (English)</Label>
            <Textarea id="subtitleEn" {...register('subtitleEn')} rows={2} />
          </div>

          {/* Turkish Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="subtitleTr">Subtitle (Turkish)</Label>
            <Textarea id="subtitleTr" {...register('subtitleTr')} rows={2} />
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
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mediaUrl">Media URL *</Label>
            <Input id="mediaUrl" {...register('mediaUrl')} />
            {errors.mediaUrl && (
              <p className="text-sm text-destructive">{errors.mediaUrl.message}</p>
            )}
          </div>

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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Slide'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
