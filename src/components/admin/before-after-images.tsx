'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/admin/image-upload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftRight } from 'lucide-react';

export interface BeforeAfterImages {
  before_image: string;
  after_image: string;
  description: string;
}

interface BeforeAfterImagesProps {
  beforeAfter: BeforeAfterImages;
  onChange: (beforeAfter: BeforeAfterImages) => void;
}

export function BeforeAfterImages({ beforeAfter, onChange }: BeforeAfterImagesProps) {
  const updateBeforeAfter = (updates: Partial<BeforeAfterImages>) => {
    onChange({ ...beforeAfter, ...updates });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5" />
          Before/After Images
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Before Image</Label>
            <ImageUpload
              value={beforeAfter.before_image}
              onChange={(url) => updateBeforeAfter({ before_image: url })}
              bucket="media"
            />
            <Input
              value={beforeAfter.before_image}
              onChange={(e) => updateBeforeAfter({ before_image: e.target.value })}
              placeholder="Before image URL"
              className="text-xs"
            />
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm font-medium">After Image</Label>
            <ImageUpload
              value={beforeAfter.after_image}
              onChange={(url) => updateBeforeAfter({ after_image: url })}
              bucket="media"
            />
            <Input
              value={beforeAfter.after_image}
              onChange={(e) => updateBeforeAfter({ after_image: e.target.value })}
              placeholder="After image URL"
              className="text-xs"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="before-after-description">Description</Label>
          <Textarea
            id="before-after-description"
            value={beforeAfter.description}
            onChange={(e) => updateBeforeAfter({ description: e.target.value })}
            placeholder="Describe the transformation or changes..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
