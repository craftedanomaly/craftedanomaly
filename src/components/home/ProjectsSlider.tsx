'use client';

import { useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Mousewheel, Keyboard } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

import 'swiper/css';
import 'swiper/css/effect-coverflow';

interface Project {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string;
  blurb?: string;
  year?: number;
}

interface ProjectsSliderProps {
  projects: Project[];
}

export function ProjectsSlider({ projects }: ProjectsSliderProps) {
  const swiperRef = useRef<any>(null);

  if (!projects || projects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No projects available</p>
      </div>
    );
  }

  return (
    <div id="all-works" className="relative min-h-screen flex items-center justify-center py-20">
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Section Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-7xl font-bold text-accent mb-4 drop-shadow-lg">
            Our Works
          </h2>
          <p className="text-lg text-foreground/80">
            Explore our creative projects
          </p>
        </motion.div>

        {/* Swiper Slider */}
        <Swiper
          ref={swiperRef}
          modules={[EffectCoverflow, Mousewheel, Keyboard]}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
            slideShadows: false,
          }}
          mousewheel={{
            forceToAxis: true,
            sensitivity: 1,
            releaseOnEdges: true,
          }}
          keyboard={{
            enabled: true,
          }}
          breakpoints={{
            320: {
              slidesPerView: 1.2,
              spaceBetween: 20,
            },
            640: {
              slidesPerView: 1.5,
              spaceBetween: 30,
            },
            1024: {
              slidesPerView: 2.5,
              spaceBetween: 40,
            },
          }}
          className="!pb-12"
        >
          {projects.map((project, index) => (
            <SwiperSlide key={project.id} className="!w-auto">
              <Link href={`/projects/${project.slug}`}>
                <motion.div
                  className="group relative aspect-[3/4] w-[280px] md:w-[360px] lg:w-[420px] overflow-hidden rounded-2xl border border-border bg-card shadow-xl hover:shadow-2xl transition-all duration-500"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Project Image */}
                  <div className="absolute inset-0">
                    <Image
                      src={project.coverImageUrl}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </div>

                  {/* Project Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {project.title}
                    </h3>
                    {project.blurb && (
                      <p className="text-sm text-white/80 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {project.blurb}
                      </p>
                    )}
                    {project.year && (
                      <p className="text-xs text-accent mt-2 font-medium">
                        {project.year}
                      </p>
                    )}
                  </div>

                  {/* Hover Accent Border */}
                  <div className="absolute inset-0 border-2 border-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
                </motion.div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Hint */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-muted-foreground">
            Scroll or drag to explore more projects
          </p>
        </motion.div>
      </div>
    </div>
  );
}
