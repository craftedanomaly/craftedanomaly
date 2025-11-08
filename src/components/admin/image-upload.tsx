'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
// R2 storage is now used instead of Supabase
import { toast } from 'sonner';
import Image from 'next/image';
import { MediaLibraryModal } from './media-library-modal';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  bucket?: string;
}

export function ImageUpload({ 
  value, 
  onChange, 
  bucket = '' // R2'de bucket klasörü yok, direkt root'ta
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(value || '');
  const [showLibrary, setShowLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Image size must be less than 50MB');
      return;
    }

    setUploading(true);

    try {
      // Upload to R2 via API route
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', bucket); // Use bucket as folder path

      const response = await fetch('/api/r2/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();

      setPreview(data.url);
      onChange(data.url);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleLibrarySelect = (url: string) => {
    setPreview(url);
    onChange(url);
    toast.success('Image selected from library!');
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,image/avif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="space-y-2">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border bg-muted">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowLibrary(true)}
            className="w-full gap-2"
          >
            <FolderOpen className="h-4 w-4" />
            Change from Library
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className="w-full h-48 rounded-lg border-2 border-dashed border-border hover:border-accent transition-colors bg-muted/30 hover:bg-muted/50 flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Click to upload image
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, GIF, WebP, AVIF up to 50MB
                </p>
              </div>
            </>
          )}
        </button>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowLibrary(true)}
          className="flex-1 gap-2"
        >
          <FolderOpen className="h-4 w-4" />
          Choose from Library
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Upload new or choose from existing media library
      </p>

      <MediaLibraryModal
        open={showLibrary}
        onClose={() => setShowLibrary(false)}
        onSelect={handleLibrarySelect}
        accept="image"
      />
    </div>
  );
}
