'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, RotateCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BeforeAfterSlider } from '@/components/ui/before-after-slider';
import Image from 'next/image';

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'before_after';
  url: string;
  before_url?: string; // For before/after comparisons
  after_url?: string;  // For before/after comparisons
  alt_text?: string;
  caption?: string;
  width?: number;
  height?: number;
}

interface MediaViewerProps {
  media: MediaItem[];
  className?: string;
}

export function MediaViewer({ media, className = '' }: MediaViewerProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (item: MediaItem, index: number) => {
    setSelectedMedia(item);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
  };

  const nextMedia = () => {
    const nextIndex = (currentIndex + 1) % media.length;
    setSelectedMedia(media[nextIndex]);
    setCurrentIndex(nextIndex);
  };

  const prevMedia = () => {
    const prevIndex = currentIndex === 0 ? media.length - 1 : currentIndex - 1;
    setSelectedMedia(media[prevIndex]);
    setCurrentIndex(prevIndex);
  };

  const renderMediaItem = (item: MediaItem, index: number) => {
    const commonClasses = "w-full h-full object-cover transition-transform duration-300 hover:scale-105 cursor-pointer";
    
    switch (item.type) {
      case 'before_after':
        return (
          <div 
            key={item.id}
            className="relative aspect-video rounded-lg overflow-hidden group"
            onClick={() => openLightbox(item, index)}
          >
            <BeforeAfterSlider
              beforeImage={item.before_url!}
              afterImage={item.after_url!}
              beforeAlt={`${item.alt_text} - Before`}
              afterAlt={`${item.alt_text} - After`}
              className="cursor-pointer"
            />
            
            {/* Overlay for lightbox indication */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
              <Maximize2 className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
            </div>
          </div>
        );
        
      case 'image':
        return (
          <div 
            key={item.id}
            className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer"
            onClick={() => openLightbox(item, index)}
          >
            <Image
              src={item.url}
              alt={item.alt_text || 'Media item'}
              fill
              className={commonClasses}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
              <Maximize2 className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
            </div>
          </div>
        );
        
      case 'video':
        return (
          <div 
            key={item.id}
            className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer"
            onClick={() => openLightbox(item, index)}
          >
            <video
              src={item.url}
              className={commonClasses}
              muted
              loop
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => e.currentTarget.pause()}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
              <Maximize2 className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const renderLightboxContent = (item: MediaItem) => {
    switch (item.type) {
      case 'before_after':
        return (
          <BeforeAfterSlider
            beforeImage={item.before_url!}
            afterImage={item.after_url!}
            beforeAlt={`${item.alt_text} - Before`}
            afterAlt={`${item.alt_text} - After`}
            className="max-w-4xl max-h-[80vh] mx-auto"
          />
        );
        
      case 'image':
        return (
          <div className="relative max-w-4xl max-h-[80vh] mx-auto">
            <Image
              src={item.url}
              alt={item.alt_text || 'Media item'}
              width={item.width || 1200}
              height={item.height || 800}
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        );
        
      case 'video':
        return (
          <div className="relative max-w-4xl max-h-[80vh] mx-auto">
            <video
              src={item.url}
              controls
              autoPlay
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <>
      {/* Media Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {media.map((item, index) => renderMediaItem(item, index))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/10"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation Buttons */}
            {media.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevMedia();
                  }}
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-16 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextMedia();
                  }}
                >
                  <RotateCcw className="h-6 w-6 rotate-180" />
                </Button>
              </>
            )}

            {/* Download Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-16 z-10 text-white hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                // Download functionality
                const link = document.createElement('a');
                link.href = selectedMedia.url;
                link.download = selectedMedia.alt_text || 'media';
                link.click();
              }}
            >
              <Download className="h-6 w-6" />
            </Button>

            {/* Media Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              {renderLightboxContent(selectedMedia)}
              
              {/* Caption */}
              {selectedMedia.caption && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-4 rounded-lg backdrop-blur-sm"
                >
                  <p className="text-sm">{selectedMedia.caption}</p>
                </motion.div>
              )}
            </motion.div>

            {/* Counter */}
            {media.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                {currentIndex + 1} / {media.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
