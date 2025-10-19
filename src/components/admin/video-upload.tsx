'use client';

import { useState, useRef } from 'react';
import { Upload, X, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { getVideoType, isDirectVideoUrl } from '@/lib/video-utils';

interface VideoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  maxSizeMB?: number;
}

export function VideoUpload({ value, onChange, maxSizeMB = 50 }: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setIsUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `category-videos/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(data.path);

      onChange(publicUrl);
      setUrlInput(publicUrl);
      toast.success('Video uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload video: ' + (error.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    
    // Validate video URL type
    const videoType = getVideoType(url);
    if (url && videoType !== 'direct') {
      toast.warning(`${videoType.toUpperCase()} videos are not supported for hover effects. Please use direct video files (MP4, WebM) or upload a video file.`);
    }
    
    onChange(url);
  };

  const clearVideo = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* URL Input */}
      <div className="space-y-2">
        <Label htmlFor="video-url">Video URL</Label>
        <div className="flex gap-2">
          <Input
            id="video-url"
            value={urlInput}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com/video.mp4 or upload below"
            type="url"
          />
          {value && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearVideo}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Upload Section */}
      <div className="space-y-2">
        <Label>Or Upload Video</Label>
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className="hidden"
          />
          
          <div className="text-center">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Uploading video...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Video File
                </Button>
                <p className="text-xs text-muted-foreground">
                  MP4, WebM, MOV up to {maxSizeMB}MB
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview */}
      {value && !isUploading && (
        <div className="space-y-2">
          <Label>Preview</Label>
          {isDirectVideoUrl(value) ? (
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden max-w-sm">
              <video
                src={value}
                controls
                muted
                className="w-full h-full object-cover"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
              <div className="absolute top-2 right-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={clearVideo}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden max-w-sm flex items-center justify-center">
              <div className="text-center p-4">
                <Play className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {getVideoType(value).toUpperCase()} video detected
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Not supported for hover effects
                </p>
              </div>
              <div className="absolute top-2 right-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={clearVideo}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {isDirectVideoUrl(value) 
              ? "✅ Video will auto-play on hover (muted)" 
              : "⚠️ Only direct video files (MP4, WebM) work for hover effects"
            }
          </p>
        </div>
      )}
    </div>
  );
}
