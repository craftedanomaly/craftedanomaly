'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface FilterBarProps {
  tags: string[];
  years: number[];
  selectedTags: string[];
  selectedYears: number[];
  onTagToggle: (tag: string) => void;
  onYearToggle: (year: number) => void;
  onClearFilters: () => void;
}

export function FilterBar({
  tags,
  years,
  selectedTags,
  selectedYears,
  onTagToggle,
  onYearToggle,
  onClearFilters,
}: FilterBarProps) {
  const [showAllTags, setShowAllTags] = useState(false);
  const hasActiveFilters = selectedTags.length > 0 || selectedYears.length > 0;
  const displayTags = showAllTags ? tags : tags.slice(0, 8);

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border py-4">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Filters
            </h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground hover:text-accent"
              >
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>

          {/* Year Filters */}
          {years.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground mr-2 self-center">Year:</span>
              <Button
                variant={selectedYears.length === 0 ? 'default' : 'outline'}
                size="sm"
                onClick={onClearFilters}
                className="rounded-full"
              >
                All
              </Button>
              {years.map((year) => (
                <Button
                  key={year}
                  variant={selectedYears.includes(year) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onYearToggle(year)}
                  className="rounded-full"
                >
                  {year}
                </Button>
              ))}
            </div>
          )}

          {/* Tag Filters */}
          {tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground mr-2 self-center">Tags:</span>
                {displayTags.map((tag) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Button
                      variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onTagToggle(tag)}
                      className="rounded-full"
                    >
                      {tag}
                      {selectedTags.includes(tag) && (
                        <X className="ml-1 h-3 w-3" />
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>
              
              {tags.length > 8 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="text-xs text-muted-foreground hover:text-accent"
                >
                  {showAllTags ? 'Show less' : `Show ${tags.length - 8} more tags`}
                </Button>
              )}
            </div>
          )}

          {/* Active Filters Count */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-muted-foreground"
              >
                Showing results for {selectedTags.length + selectedYears.length} active filter
                {selectedTags.length + selectedYears.length !== 1 ? 's' : ''}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
