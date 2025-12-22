# Homepage Implementation Notes

## New Dependencies

The following packages have been installed for the new homepage architecture:

```bash
npm install embla-carousel-react react-masonry-css
```

### Package Details:
- **embla-carousel-react**: Lightweight, accessible carousel component for the full-screen hero
- **react-masonry-css**: Simple masonry layout for project grids

## Environment Variables

Ensure the following environment variable is set:

```env
NEXT_PUBLIC_R2_CDN_URL=https://cdn.craftedanomaly.com
```

This CDN URL is used for all media assets (images and videos) throughout the application.

## Logo Setup

Place your SVG logo file at:

```
public/logo.svg
```

This logo will be used in the RouteLoader component with turbulence displacement animation. The recommended size is 256x256px or larger for best quality.

## Architecture Overview

### Components Created

1. **RouteLoader.tsx** (`/src/components/RouteLoader.tsx`)
   - Global loading animation with SVG turbulence displacement effect
   - Displays "Crafted Anomaly" logo with fluid distortion
   - Shows on initial page load (1.5s) and route transitions (500ms)
   - Uses requestAnimationFrame for performant animation

2. **RouteLoaderWrapper.tsx** (`/src/components/RouteLoaderWrapper.tsx`)
   - Client component wrapper for RouteLoader
   - Detects route changes and triggers loading states
   - Manages initial load and navigation transitions

3. **HeroCarousel.tsx** (`/src/components/HeroCarousel.tsx`)
   - Full-screen carousel using Embla Carousel
   - Responsive caption text with single-line constraint
   - Keyboard navigation support (ArrowLeft/ArrowRight)
   - Accessible controls (ARIA labels, focus management)
   - Bottom-center positioned navigation controls

4. **CategorySideNav.tsx** (`/src/components/CategorySideNav.tsx`)
   - Sticky side navigation (left side, desktop only)
   - Appears after 300px scroll with fade-in + slide-in animation
   - Shows category thumbnails with hover video preview
   - Active category highlighting with scale/opacity
   - Smooth scroll to category section on click
   - Tooltip shows category title on hover

5. **CategorySection.tsx** (`/src/components/CategorySection.tsx`)
   - Individual category section with title and projects
   - Masonry grid layout (responsive: 1-2-3-4 columns)
   - Parallax effect (max 24px Y-axis movement)
   - Lazy-loaded images with hover overlay
   - Accessible headings with scroll-margin

### Updated Files

1. **app/layout.tsx**
   - Added RouteLoaderWrapper for global loading states
   - Positioned before MainLayout for full-screen overlay

2. **app/page.tsx** (Homepage)
   - Server component fetching data from Supabase
   - Organizes hero slides, categories, and projects
   - Uses category-based project organization
   - All media URLs come from R2 CDN (database fields)

## Performance & Accessibility

### Performance Optimizations
- Lazy loading for images (`loading="lazy"`)
- Video preload set to "metadata"
- Hover videos only play on interaction
- requestAnimationFrame for smooth animations
- Optimized Framer Motion transitions (180-350ms, easeOut)

### Accessibility Features
- ARIA labels and roles throughout
- Keyboard navigation support
- Focus management with visible focus rings
- Screen reader-friendly structure
- Semantic HTML (nav, section, headings)
- Color contrast compliance
- Reduced motion considerations

### Expected Metrics
- Lighthouse Performance: >85
- Lighthouse Accessibility: >95
- Low CLS (Cumulative Layout Shift)
- Good FID (First Input Delay)

## Masonry Breakpoints

```javascript
{
  default: 4,  // xl: 4 columns
  1280: 4,     // lg-xl: 4 columns
  1024: 3,     // lg: 3 columns
  768: 2,      // md: 2 columns
  640: 1,      // sm: 1 column
}
```

## Animation Timing

- **Entry animations**: 180-350ms with easeOut
- **Route transitions**: 400-600ms overlay
- **Initial load**: 1000-1500ms
- **Hover effects**: 200-300ms
- **Parallax**: Subtle, max 24-30px movement

## Media Loading Strategy

All media assets are served from R2 CDN:
- Database stores full CDN URLs (no runtime URL construction)
- Images use Next.js Image component with optimization
- Videos use native `<video>` tag with muted, loop, playsInline
- Hover videos: preload="metadata", autoplay on hover only

## Future Enhancements

- [ ] Add IntersectionObserver for active category detection in CategorySideNav
- [ ] Implement smooth scroll indicator in side nav
- [ ] Add loading skeletons for projects
- [ ] Consider virtual scrolling for large project lists
- [ ] Add analytics tracking for carousel interactions
