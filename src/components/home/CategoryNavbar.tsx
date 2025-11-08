'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface CategoryNavbarProps {
  categories: Category[];
  activeCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
}

export function CategoryNavbar({ categories, activeCategory, onCategoryChange }: CategoryNavbarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show navbar after scrolling past hero (100vh)
      const scrollPosition = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      if (scrollPosition > viewportHeight * 0.8) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          className="fixed top-24 left-8 z-50 flex flex-col gap-2"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* All Works */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <button
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeCategory === null
                  ? 'bg-accent text-accent-foreground shadow-lg'
                  : 'bg-card/80 backdrop-blur-sm text-foreground hover:bg-accent/20 border border-border/50'
              }`}
              onClick={() => onCategoryChange(null)}
            >
              All Works
            </button>
          </motion.div>

          {/* Categories */}
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <button
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeCategory === category.slug
                    ? 'bg-accent text-accent-foreground shadow-lg'
                    : 'bg-card/80 backdrop-blur-sm text-foreground hover:bg-accent/20 border border-border/50'
                }`}
                onClick={() => onCategoryChange(category.slug)}
              >
                {category.name}
              </button>
            </motion.div>
          ))}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
