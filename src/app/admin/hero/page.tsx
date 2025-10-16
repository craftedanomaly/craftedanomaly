'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, GripVertical, Settings, Save } from 'lucide-react';
import { toast } from 'sonner';
import { AddHeroSlideForm } from '@/components/admin/add-hero-slide-form';
import { EditHeroSlideForm } from '@/components/admin/edit-hero-slide-form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface CarouselSettings {
  autoPlay: boolean;
  slideInterval: number;
  videoAutoPlay: boolean;
}

export default function HeroManagement() {
  const [slides, setSlides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [carouselSettings, setCarouselSettings] = useState<CarouselSettings>({
    autoPlay: true,
    slideInterval: 5000,
    videoAutoPlay: true
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    fetchSlides();
    fetchCarouselSettings();
  }, []);

  const fetchSlides = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('display_order');

    if (error) {
      console.error('Error fetching slides:', error);
      toast.error('Failed to load slides');
    } else {
      setSlides(data || []);
    }
    setIsLoading(false);
  };

  const fetchCarouselSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('carousel_autoplay, carousel_interval, video_autoplay')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching carousel settings:', error);
        // Use defaults if fetch fails
        return;
      }

      if (data) {
        setCarouselSettings({
          autoPlay: data.carousel_autoplay ?? true,
          slideInterval: data.carousel_interval ?? 5000,
          videoAutoPlay: data.video_autoplay ?? true
        });
      }
    } catch (error) {
      console.error('Error fetching carousel settings:', error);
    }
  };

  const saveCarouselSettings = async () => {
    setIsSavingSettings(true);
    try {
      // Get existing record first
      const { data: existingData } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1)
        .single();

      let error;
      if (existingData?.id) {
        // Update existing record
        const result = await supabase
          .from('site_settings')
          .update({
            carousel_autoplay: carouselSettings.autoPlay,
            carousel_interval: carouselSettings.slideInterval,
            video_autoplay: carouselSettings.videoAutoPlay
          })
          .eq('id', existingData.id);
        error = result.error;
      } else {
        // Insert new record with carousel settings
        const result = await supabase
          .from('site_settings')
          .insert({
            carousel_autoplay: carouselSettings.autoPlay,
            carousel_interval: carouselSettings.slideInterval,
            video_autoplay: carouselSettings.videoAutoPlay,
            site_name: 'Crafted Anomaly',
            site_description: 'Museum-Grade Portfolio - Design Studio',
            company_name: 'Crafted Anomaly'
          });
        error = result.error;
      }

      if (error) {
        console.error('Error saving carousel settings:', error);
        toast.error(`Failed to save carousel settings: ${error.message}`);
        return;
      }
      
      toast.success('Carousel settings saved successfully');
    } catch (error) {
      console.error('Error saving carousel settings:', error);
      toast.error('Failed to save carousel settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    const { error } = await supabase
      .from('hero_slides')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete slide');
    } else {
      toast.success('Slide deleted successfully');
      fetchSlides();
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Hero Carousel</h1>
          <p className="text-muted-foreground mt-2">
            Manage homepage hero slides
          </p>
        </div>
        <AddHeroSlideForm onSlideAdded={fetchSlides} />
      </div>

      {/* Carousel Settings */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-semibold">Carousel Settings</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Auto Play */}
          <div className="space-y-2">
            <Label htmlFor="autoPlay">Auto Play Slides</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="autoPlay"
                checked={carouselSettings.autoPlay}
                onCheckedChange={(checked) => 
                  setCarouselSettings(prev => ({ ...prev, autoPlay: checked }))
                }
              />
              <span className="text-sm text-muted-foreground">
                {carouselSettings.autoPlay ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Slide Interval */}
          <div className="space-y-2">
            <Label htmlFor="slideInterval">Slide Duration (ms)</Label>
            <Input
              id="slideInterval"
              type="number"
              min="1000"
              max="30000"
              step="500"
              value={carouselSettings.slideInterval}
              onChange={(e) => 
                setCarouselSettings(prev => ({ 
                  ...prev, 
                  slideInterval: parseInt(e.target.value) || 5000 
                }))
              }
              placeholder="5000"
            />
            <p className="text-xs text-muted-foreground">
              {(carouselSettings.slideInterval / 1000).toFixed(1)} seconds per slide
            </p>
          </div>

          {/* Video Auto Play */}
          <div className="space-y-2">
            <Label htmlFor="videoAutoPlay">Auto Play Videos</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="videoAutoPlay"
                checked={carouselSettings.videoAutoPlay}
                onCheckedChange={(checked) => 
                  setCarouselSettings(prev => ({ ...prev, videoAutoPlay: checked }))
                }
              />
              <span className="text-sm text-muted-foreground">
                {carouselSettings.videoAutoPlay ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button 
            onClick={saveCarouselSettings}
            disabled={isSavingSettings}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSavingSettings ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading slides...</p>
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No slides yet</p>
          <AddHeroSlideForm onSlideAdded={fetchSlides} />
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Order</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slides.map((slide) => (
                <TableRow key={slide.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      {slide.display_order}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {slide.title_en || slide.title_tr}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {slide.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={slide.active ? 'default' : 'secondary'}>
                      {slide.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <EditHeroSlideForm slide={slide} onSlideUpdated={fetchSlides} />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(slide.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
