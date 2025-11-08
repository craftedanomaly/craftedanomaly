'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// R2 storage is now used instead of Supabase
import { Search, Video, Folder, Upload, Trash2, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface MediaFile {
  name: string;
  path: string;
  url: string;
  size: number;
  created_at: string;
  type: 'image' | 'video' | 'folder';
}

function HoverVideoThumbnail({ src, className }: { src: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleMouseEnter = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {
      // Autoplay might be blocked; ignore silently
    });
  };

  const handleMouseLeave = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  };

  return (
    <div
      className={cn('group relative h-full w-full', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
        src={src}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 opacity-100 transition-opacity duration-200 group-hover:opacity-0">
        <Video className="h-8 w-8 text-white drop-shadow-lg" />
      </div>
    </div>
  );
}

interface MediaLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  accept?: 'image' | 'video' | 'all';
  currentPath?: string;
}

export function MediaLibraryModal({ 
  open, 
  onClose, 
  onSelect, 
  accept = 'all',
  currentPath = ''
}: MediaLibraryModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState(currentPath.replace(/\/$/, ''));
  const [uploading, setUploading] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>(accept === 'all' ? 'all' : accept);

  useEffect(() => {
    if (!open) {
      return;
    }

    setCurrentFolder(currentPath.replace(/\/$/, ''));
  }, [open, currentPath]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (accept === 'image' && typeFilter !== 'image') {
      setTypeFilter('image');
    }

    if (accept === 'video' && typeFilter !== 'video') {
      setTypeFilter('video');
    }
  }, [accept, open, typeFilter]);

  useEffect(() => {
    if (open) {
      loadFiles();
    }
  }, [open, currentFolder]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const sanitizedFolder = currentFolder.replace(/\/$/, '');
      const params = new URLSearchParams({ maxKeys: '100' });

      if (sanitizedFolder) {
        params.set('prefix', `${sanitizedFolder}/`);
      }

      const response = await fetch(`/api/r2/list?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to load files');
      }

      const data = await response.json();

      const mediaFiles: MediaFile[] = data.files.map((file: any) => ({
        name: file.name,
        path: file.key,
        url: file.url,
        size: file.size,
        created_at: file.lastModified,
        type: file.type,
      }));

      setFiles(mediaFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const sanitizedFolder = currentFolder.replace(/\/$/, '');
      if (sanitizedFolder) {
        formData.append('path', sanitizedFolder);
      }

      const response = await fetch('/api/r2/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      await loadFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Delete ${file.name}?`)) return;

    try {
      const response = await fetch('/api/r2/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: file.path }),
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      await loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };

  const handleFolderClick = (folderPath: string) => {
    const sanitized = folderPath.replace(/\/$/, '');
    setCurrentFolder(sanitized);
  };

  const handleBackClick = () => {
    const parts = currentFolder.split('/');
    parts.pop();
    setCurrentFolder(parts.join('/'));
  };

  const filteredFiles = files
    .filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAccept = accept === 'all' || file.type === accept || file.type === 'folder';
      const matchesFilter = typeFilter === 'all' || file.type === typeFilter || file.type === 'folder';
      return matchesSearch && matchesAccept && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'date') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'size') {
        comparison = a.size - b.size;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderVideoPreview = (url: string) => {
    return <HoverVideoThumbnail src={url} />;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="xl" className="h-[85vh] overflow-hidden flex flex-col p-6">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>

        {/* Controls */}
        <div className="space-y-4">
          {/* Type Filter */}
          {(() => {
            const options: Array<'all' | 'image' | 'video'> = accept === 'all' ? ['all', 'image', 'video'] : [accept];
            const labels: Record<'all' | 'image' | 'video', string> = {
              all: 'Tüm Dosyalar',
              image: 'Sadece Görseller',
              video: 'Sadece Videolar',
            };

            if (options.length <= 1) {
              return null;
            }

            return (
              <div className="flex gap-2">
                {options.map((option) => (
                  <Button
                    key={option}
                    variant={typeFilter === option ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTypeFilter(option)}
                  >
                    {labels[option]}
                  </Button>
                ))}
              </div>
            );
          })()}

          {/* Breadcrumb */}
          {currentFolder && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentFolder('')}
              >
                Root
              </Button>
              {currentFolder.split('/').map((part, index, arr) => (
                <span key={index} className="flex items-center gap-2">
                  <span>/</span>
                  {index === arr.length - 1 ? (
                    <span className="font-semibold text-foreground">{part}</span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newPath = arr.slice(0, index + 1).join('/');
                        setCurrentFolder(newPath);
                      }}
                    >
                      {part}
                    </Button>
                  )}
                </span>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
              >
                ← Back
              </Button>
            </div>
          )}

          {/* Sort Controls */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">Sort:</span>
            <Button
              variant={sortBy === 'date' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (sortBy === 'date') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('date');
                  setSortOrder('desc');
                }
              }}
              className="gap-1"
            >
              Date
              {sortBy === 'date' && (
                sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant={sortBy === 'size' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (sortBy === 'size') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('size');
                  setSortOrder('desc');
                }
              }}
              className="gap-1"
            >
              Size
              {sortBy === 'size' && (
                sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant={sortBy === 'name' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (sortBy === 'name') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('name');
                  setSortOrder('asc');
                }
              }}
              className="gap-1"
            >
              Name
              {sortBy === 'name' && (
                sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
              )}
            </Button>
          </div>

          {/* Search and Upload */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploading}
              className="gap-2"
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
            <input
              id="file-upload"
              type="file"
              accept={accept === 'image' ? 'image/*,image/avif,image/webp' : accept === 'video' ? 'video/*' : 'image/*,image/avif,image/webp,video/*'}
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={loadFiles}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Files Grid */}
        <div className="flex-1 overflow-y-auto border rounded-lg p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No files found
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.path}
                  className="group relative border rounded-lg overflow-hidden hover:border-accent transition-colors cursor-pointer"
                  onClick={() => {
                    if (file.type === 'folder') {
                      handleFolderClick(file.path);
                    } else {
                      onSelect(file.url);
                      onClose();
                    }
                  }}
                >
                  {/* Preview */}
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    {file.type === 'folder' ? (
                      <Folder className="h-12 w-12 text-muted-foreground" />
                    ) : file.type === 'video' ? (
                      renderVideoPreview(file.url)
                    ) : (
                      <Image
                        src={file.url}
                        alt={file.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2 bg-background">
                    <p className="text-xs font-medium truncate" title={file.name}>
                      {file.name}
                    </p>
                    {file.type !== 'folder' && (
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(file.size)}
                      </p>
                    )}
                  </div>

                  {/* Delete Button */}
                  {file.type !== 'folder' && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
