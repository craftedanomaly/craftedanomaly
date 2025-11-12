"use client";

import { useWindowSize } from "@/hooks/useWindowSize";
import { motion } from "framer-motion";
import { useState } from "react";

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface OurWorksCategoryIndicatorProps {
  categories: Category[];
  onCategoryClick?: (categorySlug: Category) => void;
}

export function OurWorksCategoryIndicator({
  categories,
  onCategoryClick,
}: OurWorksCategoryIndicatorProps) {
  if (!categories || categories.length === 0) return null;

  const [activeCategorySlug, setActiveCategorySlug] = useState<string>("");
  const { width } = useWindowSize();

  return (
    <div className="flex max-md:flex-wrap items-center justify-center gap-3 mt-6">
      {categories.map((category) => {
        const isActive = category.slug === activeCategorySlug;

        return (
          <motion.button
            key={category.id}
            onClick={() => {
              setActiveCategorySlug(category.slug);
              onCategoryClick?.(category);
            }}
            className="relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer"
            animate={{
              backgroundColor: isActive
                ? "rgba(237, 92, 44, 0.2)"
                : "rgba(255, 255, 255, 0.05)",
              color: isActive ? "#ed5c2c" : "rgba(255, 255, 255, 0.6)",
              scale: isActive ? 1.1 : 1,
            }}
            whileHover={width > 768 ? { scale: 1.05 } : undefined}
            transition={width > 768 ? { duration: 0.3 } : undefined}
          >
            {category.name}
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: "#ed5c2c" }}
                layoutId="activeCategory"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
