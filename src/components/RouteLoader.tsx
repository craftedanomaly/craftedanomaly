'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface RouteLoaderProps {
  isActive: boolean;
}

export function RouteLoader({ isActive }: RouteLoaderProps) {
  const lines = Array.from({ length: 10 });

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
          aria-live="polite"
          aria-label="Loading"
        >
          <div className="flex flex-col items-center gap-4">
            {/* String-like native loader */}
            <div className="flex flex-col gap-2">
              {lines.map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ scaleX: 0.3, opacity: 0.6 }}
                  animate={{
                    scaleX: [0.3, 1, 0.3],
                    y: [-4, 4, -4],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.06,
                  }}
                  className="block h-[2px] w-64 origin-center bg-foreground/80"
                />
              ))}
            </div>
            <span className="sr-only">Loading…</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
