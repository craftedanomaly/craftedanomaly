'use client';

import { useState, useEffect, useRef } from 'react';
// R2 storage is now used instead of Supabase
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Image as ImageIcon, 
  Video, 
  Folder, 
  Upload, 
  Trash2, 
  RefreshCw,
  Download,
  Copy,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Grid3X3,
  List
} from 'lucide-react';
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
      /* Autoplay guard */
    });
  };

  const handleMouseLeave = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  };

  return (
    <div
      className={cn('group relative h-full w-full overflow-hidden bg-muted', className)}
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

export default function MediaManagementPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>('all');

  useEffect(() => {
    loadFiles();
  }, [currentFolder]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const sanitizedFolder = currentFolder.replace(/\/$/, '');
      const params = new URLSearchParams({ maxKeys: '200' });

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
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
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
      }

      await loadFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Delete ${file.name}? This action cannot be undone.`)) return;

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

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const filteredFiles = files
    .filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = typeFilter === 'all' || file.type === typeFilter || file.type === 'folder';
      return matchesSearch && matchesFilter;
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

  const totalSize = files
    .filter(f => f.type !== 'folder')
    .reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Media Management</h1>
          <p className="text-muted-foreground">
            Manage and organize your media files
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Files</p>
            <p className="text-2xl font-bold">{files.filter(f => f.type !== 'folder').length}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Size</p>
            <p className="text-2xl font-bold">{formatBytes(totalSize)}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Current Path</p>
            <p className="text-2xl font-bold">{currentFolder ? currentFolder : 'Root'}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 mb-6">
          {/* Type Filter */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'image', 'video'] as const).map((option) => (
              <Button
                key={option}
                variant={typeFilter === option ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter(option)}
              >
                {option === 'all'
                  ? 'Tüm Dosyalar'
                  : option === 'image'
                  ? 'Sadece Görseller'
                  : 'Sadece Videolar'}
              </Button>
            ))}
          </div>

          {/* Breadcrumb */}
          {currentFolder && (
            <div className="flex items-center gap-2 text-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentFolder('')}
              >
                Root
              </Button>
              {currentFolder.split('/').map((part, index, arr) => (
                <span key={index} className="flex items-center gap-2">
                  <span className="text-muted-foreground">/</span>
                  {index === arr.length - 1 ? (
                    <span className="font-semibold">{part}</span>
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
                variant="outline"
                size="sm"
                onClick={handleBackClick}
              >
                ← Back
              </Button>
            </div>
          )}

          {/* Sort Controls */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">Sort by:</span>
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
              className="gap-2"
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
              className="gap-2"
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
              className="gap-2"
            >
              Name
              {sortBy === 'name' && (
                sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
              )}
            </Button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Search and Actions */}
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
              multiple
              accept="image/*,image/avif,image/webp,video/*"
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

        {/* Files Display */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex items-center justify-center h-64 border rounded-lg">
            <p className="text-muted-foreground">No files found</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted p-3 font-semibold grid grid-cols-12 gap-4 text-sm">
              <div className="col-span-1">Type</div>
              <div className="col-span-5">Name</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-2">Created</div>
              <div className="col-span-2">Actions</div>
            </div>
            <div className="divide-y">
              {filteredFiles.map((file) => (
                <div
                  key={file.path}
                  className="p-3 grid grid-cols-12 gap-4 items-center hover:bg-muted/50 transition-colors relative"
                  onMouseEnter={() => setHoveredFile(file.path)}
                  onMouseLeave={() => setHoveredFile(null)}
                >
                  <div className="col-span-1">
                    {file.type === 'folder' ? (
                      <Folder className="h-5 w-5 text-muted-foreground" />
                    ) : file.type === 'video' ? (
                      <Video className="h-5 w-5 text-purple-500" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div 
                    className="col-span-5 font-mono text-sm truncate cursor-pointer hover:text-accent"
                    onClick={() => file.type === 'folder' && handleFolderClick(file.path)}
                    title={file.name}
                  >
                    {file.name}
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {file.type === 'folder' ? '-' : formatBytes(file.size)}
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {new Date(file.created_at).toLocaleDateString()}
                  </div>
                  <div className="col-span-2 flex gap-1">
                    {/* Hover Preview */}
                    {hoveredFile === file.path && file.type !== 'folder' && (
                      <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                        <div className="bg-background border-2 border-accent rounded-lg shadow-2xl overflow-hidden">
                          {file.type === 'video' ? (
                            <video
                              src={file.url}
                              className="w-64 h-64 object-cover"
                              autoPlay
                              loop
                              muted
                            />
                          ) : (
                            <Image
                              src={file.url}
                              alt={file.name}
                              width={256}
                              height={256}
                              className="object-cover"
                            />
                          )}
                        </div>
                      </div>
                    )}
                    {file.type !== 'folder' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(file.url)}
                        >
                          {copiedUrl === file.url ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(file)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.path}
                className="group relative border rounded-lg overflow-hidden hover:border-accent transition-colors"
              >
                {/* Preview */}
                <div 
                  className="aspect-square bg-muted flex items-center justify-center cursor-pointer"
                  onClick={() => file.type === 'folder' && handleFolderClick(file.path)}
                >
                  {file.type === 'folder' ? (
                    <Folder className="h-12 w-12 text-muted-foreground" />
                  ) : file.type === 'video' ? (
                    <HoverVideoThumbnail src={file.url} />
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
                <div className="p-3 bg-background space-y-1">
                  <p className="text-sm font-medium truncate" title={file.name}>
                    {file.name}
                  </p>
                  <div className="flex items-center justify-between">
                    {file.type !== 'folder' && (
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(file.size)}
                      </p>
                    )}
                    {file.type !== 'folder' && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {file.type !== 'folder' && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(file.url)}
                    >
                      {copiedUrl === file.url ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(file)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
