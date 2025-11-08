'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface FilmGrainToggleProps {
  inline?: boolean;
}

export function FilmGrainToggle({ inline = false }: FilmGrainToggleProps) {
  const [grainEnabled, setGrainEnabled] = useState(true);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setGrainEnabled(!grainEnabled)}
        className={[
          inline
            ? 'relative z-[100] p-2 bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-black/80 transition-colors flex items-center justify-center'
            : 'absolute top-6 right-24 z-[100] p-2 bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-black/80 transition-colors flex items-center justify-center'
        ].join(' ')}
        aria-label="Toggle Film Grain"
      >
        <Image
          src="/tv.svg"
          alt="Film Grain Toggle"
          width={20}
          height={20}
          style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(346deg) brightness(98%) contrast(97%)' }}
        />
      </button>

      {/* Film Grain Overlay */}
      <AnimatePresence>
        {grainEnabled && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-[9998] film-grain-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
