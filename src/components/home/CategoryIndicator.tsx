'use client';

import { motion } from 'framer-motion';

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface CategoryIndicatorProps {
  categories: Category[];
  activeCategorySlug?: string;
  onCategoryClick?: (categorySlug: string) => void;
}

export function CategoryIndicator({ categories, activeCategorySlug, onCategoryClick }: CategoryIndicatorProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      {categories.map((category) => {
        const isActive = category.slug === activeCategorySlug;
        
        return (
          <motion.button
            key={category.id}
            onClick={() => onCategoryClick?.(category.slug)}
            className="relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer"
            animate={{
              backgroundColor: isActive ? 'rgba(237, 92, 44, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: isActive ? '#ed5c2c' : 'rgba(255, 255, 255, 0.6)',
              scale: isActive ? 1.1 : 1,
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            {category.name}
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: '#ed5c2c' }}
                layoutId="activeCategory"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
