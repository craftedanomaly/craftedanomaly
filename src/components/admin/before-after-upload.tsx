'use client';

import { useState } from 'react';
import { Upload, X, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BeforeAfterSlider } from '@/components/ui/before-after-slider';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface BeforeAfterUploadProps {
  onBeforeAfterChange: (beforeUrl: string, afterUrl: string) => void;
  initialBefore?: string;
  initialAfter?: string;
  className?: string;
}

export function BeforeAfterUpload({ 
  onBeforeAfterChange, 
  initialBefore = '', 
  initialAfter = '',
  className = '' 
}: BeforeAfterUploadProps) {
  const [beforeUrl, setBeforeUrl] = useState(initialBefore);
  const [afterUrl, setAfterUrl] = useState(initialAfter);
  const [dragActive, setDragActive] = useState<'before' | 'after' | null>(null);

  const handleBeforeChange = (url: string) => {
    setBeforeUrl(url);
    onBeforeAfterChange(url, afterUrl);
  };

  const handleAfterChange = (url: string) => {
    setAfterUrl(url);
    onBeforeAfterChange(beforeUrl, url);
  };

  const handleDrop = (e: React.DragEvent, type: 'before' | 'after') => {
    e.preventDefault();
    setDragActive(null);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      // Upload to Supabase Storage and use public URL
      void (async () => {
        try {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
          const path = fileName;
          const bucket = 'project-images';

          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(path, imageFile, { cacheControl: '3600', upsert: false });
          if (uploadError) throw uploadError;

          const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
          const publicUrl = pub.publicUrl;

          if (type === 'before') {
            handleBeforeChange(publicUrl);
          } else {
            handleAfterChange(publicUrl);
          }
          toast.success('Image uploaded');
        } catch (err: any) {
          console.error('Upload error:', err);
          toast.error(err.message || 'Failed to upload image');
        }
      })();
    }
  };

  const handleDragOver = (e: React.DragEvent, type: 'before' | 'after') => {
    e.preventDefault();
    setDragActive(type);
  };

  const handleDragLeave = () => {
    setDragActive(null);
  };

  const clearImage = (type: 'before' | 'after') => {
    if (type === 'before') {
      handleBeforeChange('');
    } else {
      handleAfterChange('');
    }
  };

  const UploadArea = ({ type, url, onUrlChange }: { 
    type: 'before' | 'after', 
    url: string, 
    onUrlChange: (url: string) => void 
  }) => (
    <div className="space-y-3">
      <Label className="text-sm font-medium capitalize">{type} Image</Label>
      
      {/* URL Input */}
      <div className="flex gap-2">
        <Input
          placeholder={`Enter ${type} image URL...`}
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          className="flex-1"
        />
        {url && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => clearImage(type)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Drag & Drop Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive === type 
            ? 'border-accent bg-accent/5' 
            : 'border-border hover:border-accent/50'
        }`}
        onDrop={(e) => handleDrop(e, type)}
        onDragOver={(e) => handleDragOver(e, type)}
        onDragLeave={handleDragLeave}
      >
        {url ? (
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image
              src={url}
              alt={`${type} image`}
              fill
              className="object-cover"
            />
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs capitalize">
              {type}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-1">
              Drop {type} image here or paste URL above
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WebP up to 10MB
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadArea 
          type="before" 
          url={beforeUrl} 
          onUrlChange={handleBeforeChange} 
        />
        <UploadArea 
          type="after" 
          url={afterUrl} 
          onUrlChange={handleAfterChange} 
        />
      </div>

      {/* Preview */}
      {beforeUrl && afterUrl && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-accent" />
            <Label className="text-sm font-medium">Before/After Preview</Label>
          </div>
          
          <div className="border border-border rounded-lg p-4 bg-card">
            <BeforeAfterSlider
              beforeImage={beforeUrl}
              afterImage={afterUrl}
              beforeAlt="Before image"
              afterAlt="After image"
              className="max-w-2xl mx-auto"
            />
            <p className="text-xs text-muted-foreground text-center mt-3">
              Drag the slider to test the before/after comparison
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-muted/30 border border-border rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-2">Tips for Best Results:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Use images with the same dimensions and aspect ratio</li>
          <li>• Ensure both images show the same subject/area</li>
          <li>• High contrast between before/after makes the effect more dramatic</li>
          <li>• Consider the composition - important elements should be visible on both sides</li>
        </ul>
      </div>
    </div>
  );
}
