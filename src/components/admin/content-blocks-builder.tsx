'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical, Image as ImageIcon, Video, Type, Grid3x3, Quote, Code, Tv, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ImageUpload } from '@/components/admin/image-upload';
import { VideoUpload } from '@/components/admin/video-upload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface ContentBlock {
  id: string;
  block_type: 'text' | 'image' | 'video' | 'gallery' | 'quote' | 'code' | 'embed' | 'before_after';
  content: string;
  media_url?: string;
  media_urls?: string[];
  display_order: number;
}

interface ContentBlocksBuilderProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

const blockTypeIcons = {
  text: Type,
  image: ImageIcon,
  video: Video,
  gallery: Grid3x3,
  quote: Quote,
  code: Code,
  embed: Tv,
  before_after: ArrowLeftRight,
};

const blockTypeLabels = {
  text: 'Rich Text',
  image: 'Single Image',
  video: 'Video',
  gallery: 'Image Gallery',
  quote: 'Quote',
  code: 'Code Snippet',
  embed: 'Embed (YouTube/Vimeo)',
  before_after: 'Before/After Images',
};

export function ContentBlocksBuilder({ blocks, onChange }: ContentBlocksBuilderProps) {
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);

  const addBlock = (type: ContentBlock['block_type']) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      block_type: type,
      content: '',
      media_url: type === 'image' || type === 'video' ? '' : undefined,
      media_urls: type === 'gallery' ? [] : type === 'before_after' ? ['', ''] : undefined,
      display_order: blocks.length,
    };
    onChange([...blocks, newBlock]);
    setExpandedBlock(newBlock.id);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    const updatedBlocks = blocks.map(block => {
      if (block.id === id) {
        return { ...block, ...updates };
      }
      return block;
    });
    onChange(updatedBlocks);
  };

  const deleteBlock = (id: string) => {
    const updatedBlocks = blocks.filter(block => block.id !== id);
    // Reorder display_order after deletion
    const reorderedBlocks = updatedBlocks.map((block, index) => ({
      ...block,
      display_order: index
    }));
    onChange(reorderedBlocks);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    
    // Update display_order
    newBlocks.forEach((block, idx) => {
      block.display_order = idx;
    });
    
    onChange(newBlocks);
  };

  const addGalleryImage = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || block.block_type !== 'gallery') return;
    
    updateBlock(blockId, {
      media_urls: [...(block.media_urls || []), '']
    });
  };

  const updateGalleryImage = (blockId: string, imageIndex: number, url: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || block.block_type !== 'gallery') return;
    
    const newUrls = [...(block.media_urls || [])];
    newUrls[imageIndex] = url;
    
    updateBlock(blockId, { media_urls: newUrls });
  };

  const removeGalleryImage = (blockId: string, imageIndex: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || block.block_type !== 'gallery') return;
    
    updateBlock(blockId, {
      media_urls: (block.media_urls || []).filter((_, idx) => idx !== imageIndex)
    });
  };

  const renderBlockEditor = (block: ContentBlock, index: number) => {
    const Icon = blockTypeIcons[block.block_type];
    const isExpanded = expandedBlock === block.id;

    return (
      <Card key={block.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveBlock(index, 'up')}
                  disabled={index === 0}
                >
                  <GripVertical className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveBlock(index, 'down')}
                  disabled={index === blocks.length - 1}
                >
                  <GripVertical className="h-4 w-4" />
                </Button>
              </div>
              <Icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">
                  {blockTypeLabels[block.block_type]}
                </CardTitle>
                <CardDescription>Block #{index + 1}</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setExpandedBlock(isExpanded ? null : block.id)}
              >
                {isExpanded ? 'Collapse' : 'Expand'}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => deleteBlock(block.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4">
            {/* Text Block */}
            {block.block_type === 'text' && (
              <div className="space-y-2">
                <Label>Content</Label>
                <RichTextEditor
                  value={block.content}
                  onChange={(content) => updateBlock(block.id, { content })}
                  placeholder="Enter rich text content..."
                  rows={8}
                />
              </div>
            )}

            {/* Image Block */}
            {block.block_type === 'image' && (
              <>
                <div className="space-y-2">
                  <Label>Image</Label>
                  <ImageUpload
                    value={block.media_url || ''}
                    onChange={(url) => updateBlock(block.id, { media_url: url })}
                    bucket="media"
                  />
                  <Input
                    value={block.media_url || ''}
                    onChange={(e) => updateBlock(block.id, { media_url: e.target.value })}
                    placeholder="Or paste image URL"
                    className="mt-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Caption</Label>
                  <Input
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder="Image caption"
                  />
                </div>
              </>
            )}

            {/* Video Block */}
            {block.block_type === 'video' && (
              <>
                <div className="space-y-2">
                  <Label>Video</Label>
                  <VideoUpload
                    value={block.media_url || ''}
                    onChange={(url) => updateBlock(block.id, { media_url: url })}
                    maxSizeMB={200}
                  />
                  <Input
                    value={block.media_url || ''}
                    onChange={(e) => updateBlock(block.id, { media_url: e.target.value })}
                    placeholder="Or paste video URL"
                    className="mt-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder="Video description"
                  />
                </div>
              </>
            )}

            {/* Gallery Block */}
            {block.block_type === 'gallery' && (
              <div className="space-y-3">
                <Label>Gallery Images</Label>
                <div className="grid gap-3 md:grid-cols-2">
                  {(block.media_urls || []).map((url, imgIndex) => (
                    <div key={imgIndex} className="space-y-2">
                      <ImageUpload
                        value={url}
                        onChange={(newUrl) => updateGalleryImage(block.id, imgIndex, newUrl)}
                        bucket="media"
                      />
                      <Input
                        value={url}
                        onChange={(e) => updateGalleryImage(block.id, imgIndex, e.target.value)}
                        placeholder={`Image ${imgIndex + 1} URL`}
                        className="text-xs"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => removeGalleryImage(block.id, imgIndex)}
                      >
                        Remove Image
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addGalleryImage(block.id)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
              </div>
            )}

            {/* Quote Block */}
            {block.block_type === 'quote' && (
              <div className="space-y-2">
                <Label>Quote</Label>
                <Textarea
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  placeholder="Enter quote text"
                  rows={3}
                />
              </div>
            )}

            {/* Code Block */}
            {block.block_type === 'code' && (
              <div className="space-y-2">
                <Label>Code</Label>
                <Textarea
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  placeholder="Enter code snippet"
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
            )}

            {/* Embed Block */}
            {block.block_type === 'embed' && (
              <div className="space-y-2">
                <Label>Embed Code (iframe/HTML)</Label>
                <Textarea
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  placeholder='<iframe src="https://youtube.com/embed/..." ...></iframe>'
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Paste YouTube, Vimeo embed code or custom HTML
                </p>
              </div>
            )}

            {/* Before/After Block */}
            {block.block_type === 'before_after' && (
              <div className="space-y-4">
                <Label>Before/After Images</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Before Image</Label>
                    <ImageUpload
                      value={(block.media_urls && block.media_urls[0]) || ''}
                      onChange={(url) => {
                        const currentUrls = Array.isArray(block.media_urls) && block.media_urls.length >= 2 
                          ? [...block.media_urls] 
                          : ['', ''];
                        const newUrls = [...currentUrls];
                        newUrls[0] = url;
                        updateBlock(block.id, { media_urls: newUrls });
                      }}
                      bucket="media"
                    />
                    <Input
                      value={(block.media_urls && block.media_urls[0]) || ''}
                      onChange={(e) => {
                        const currentUrls = Array.isArray(block.media_urls) && block.media_urls.length >= 2 
                          ? [...block.media_urls] 
                          : ['', ''];
                        const newUrls = [...currentUrls];
                        newUrls[0] = e.target.value;
                        updateBlock(block.id, { media_urls: newUrls });
                      }}
                      placeholder="Before image URL"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">After Image</Label>
                    <ImageUpload
                      value={(block.media_urls && block.media_urls[1]) || ''}
                      onChange={(url) => {
                        const currentUrls = Array.isArray(block.media_urls) && block.media_urls.length >= 2 
                          ? [...block.media_urls] 
                          : ['', ''];
                        const newUrls = [...currentUrls];
                        newUrls[1] = url;
                        updateBlock(block.id, { media_urls: newUrls });
                      }}
                      bucket="media"
                    />
                    <Input
                      value={(block.media_urls && block.media_urls[1]) || ''}
                      onChange={(e) => {
                        const currentUrls = Array.isArray(block.media_urls) && block.media_urls.length >= 2 
                          ? [...block.media_urls] 
                          : ['', ''];
                        const newUrls = [...currentUrls];
                        newUrls[1] = e.target.value;
                        updateBlock(block.id, { media_urls: newUrls });
                      }}
                      placeholder="After image URL"
                      className="text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder="Before/After description"
                  />
                </div>
              </div>
            )}

          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">Content Blocks</Label>
        <Select onValueChange={(value) => addBlock(value as ContentBlock['block_type'])}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Add Block" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Rich Text
              </div>
            </SelectItem>
            <SelectItem value="image">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Single Image
              </div>
            </SelectItem>
            <SelectItem value="video">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Video
              </div>
            </SelectItem>
            <SelectItem value="gallery">
              <div className="flex items-center gap-2">
                <Grid3x3 className="h-4 w-4" />
                Image Gallery
              </div>
            </SelectItem>
            <SelectItem value="quote">
              <div className="flex items-center gap-2">
                <Quote className="h-4 w-4" />
                Quote
              </div>
            </SelectItem>
            <SelectItem value="code">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Code Snippet
              </div>
            </SelectItem>
            <SelectItem value="embed">
              <div className="flex items-center gap-2">
                <Tv className="h-4 w-4" />
                Embed
              </div>
            </SelectItem>
            <SelectItem value="before_after">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4" />
                Before/After Images
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {blocks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No content blocks yet. Add your first block using the dropdown above.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {blocks
            .sort((a, b) => a.display_order - b.display_order)
            .map((block, index) => renderBlockEditor(block, index))}
        </div>
      )}
    </div>
  );
}
