# Setup Guide

## Required Assets

Before running the app, you need to provide media assets. The app references the following files:

### Icons (SVG format)

Create or download icons and place them in `/icons/`:

```
/icons/home.svg
/icons/search.svg
/icons/plus.svg
/icons/reels.svg
/icons/profile.svg
/icons/heart.svg
/icons/heart-filled.svg
/icons/comment.svg
/icons/share.svg
/icons/save.svg
/icons/save-filled.svg
/icons/dm.svg
/icons/more.svg
/icons/close.svg
/icons/send.svg
/icons/muted.svg
/icons/volume.svg
/icons/sun.svg
/icons/moon.svg
/icons/auto.svg
/icons/grid.svg
/icons/tag.svg
```

**Recommended icon libraries:**
- [Lucide Icons](https://lucide.dev/) - Modern, clean SVG icons
- [Heroicons](https://heroicons.com/) - Beautiful hand-crafted SVG icons
- [Feather Icons](https://feathericons.com/) - Simply beautiful open source icons

### Images

Place the following images in `/images/`:

**Branding:**
- `logo.png` - App logo (512×512px recommended)
- `wordmark.svg` - Text logo/wordmark

**Avatars** (`/images/avatars/`):
- `a1.jpg` through `a10.jpg` - User avatars (10 files)
- `me.jpg` - Your profile avatar
- `placeholder.jpg` - Fallback avatar

**Posts** (`/images/posts/`):
- `p1.jpg`, `p3.jpg`, `p4.jpg`, `p6.jpg`, `p7.jpg`, `p8.jpg`, `p10.jpg`, `p11.jpg`, `p12.jpg`, `p13.jpg`, `p15.jpg`, `p16.jpg`, `p17.jpg`, `p18.jpg`, `p20.jpg` - Post images (15 files)
- `p2.mp4`, `p2.jpg` - Video post with poster
- `p5.mp4`, `p5.jpg` - Video post with poster
- `p9.mp4`, `p9.jpg` - Video post with poster
- `p14.mp4`, `p14.jpg` - Video post with poster
- `p19.mp4`, `p19.jpg` - Video post with poster

**Stories** (`/images/stories/`):
- `s1_1.jpg`, `s1_2.mp4`, `s1_2.jpg`
- `s2_1.jpg`
- `s3_1.mp4`, `s3_1.jpg`, `s3_2.jpg`
- `s4_1.jpg`, `s4_2.jpg`, `s4_3.jpg`
- `s5_1.mp4`, `s5_1.jpg`
- `s6_1.jpg`, `s6_2.jpg`
- `s7_1.jpg`
- `s8_1.mp4`, `s8_1.jpg`, `s8_2.jpg`
- `s9_1.jpg`
- `s10_1.jpg`, `s10_2.mp4`, `s10_2.jpg`

## Quick Asset Generation

### Using Placeholder Services

For quick testing, you can use placeholder image services:

**Images:**
```bash
# Using curl to download placeholder images
curl "https://picsum.photos/800/1000" -o images/posts/p1.jpg
curl "https://i.pravatar.cc/300?img=1" -o images/avatars/a1.jpg
```

**Or use inline data URLs in JSON** (for testing only):
```json
{
  "src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='1000'%3E%3Crect fill='%23ddd' width='800' height='1000'/%3E%3C/svg%3E"
}
```

### Using AI Image Generation

Generate custom images with:
- [DALL-E](https://openai.com/dall-e-2)
- [Midjourney](https://www.midjourney.com/)
- [Stable Diffusion](https://stablediffusionweb.com/)

### Using Stock Photos

Download free stock photos from:
- [Unsplash](https://unsplash.com/)
- [Pexels](https://www.pexels.com/)
- [Pixabay](https://pixabay.com/)

## Minimal Setup (For Testing)

If you want to test the app without all assets:

1. Create a simple 1×1 pixel PNG as a fallback:
```bash
# Create a minimal placeholder
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > images/placeholder.png
```

2. Update all JSON files to reference the same placeholder
3. Copy the placeholder to all required locations

## Video Format Recommendations

For best compatibility:
- **Format:** MP4 (H.264 codec)
- **Resolution:** 1080×1350 (4:5 aspect ratio for posts), 1080×1920 (9:16 for stories)
- **Duration:** 5-15 seconds for stories, 15-60 seconds for posts
- **File size:** Keep under 10MB for smooth loading

Convert videos using FFmpeg:
```bash
ffmpeg -i input.mov -c:v libx264 -preset slow -crf 22 -c:a aac -b:a 128k output.mp4
```

## Icon Setup with Lucide

Quick setup using Lucide icons:

1. Visit [lucide.dev](https://lucide.dev/)
2. Search for each icon name
3. Download as SVG
4. Rename and place in `/icons/` folder

**Icon mapping:**
- home → `home.svg`
- search → `search.svg`
- plus → `plus.svg`
- film → `reels.svg`
- user → `profile.svg`
- heart → `heart.svg`
- message-circle → `comment.svg`
- send → `share.svg`
- bookmark → `save.svg`
- mail → `dm.svg`
- more-horizontal → `more.svg`
- x → `close.svg`
- volume-2 → `volume.svg`
- volume-x → `muted.svg`
- sun → `sun.svg`
- moon → `moon.svg`
- monitor → `auto.svg`
- grid → `grid.svg`
- tag → `tag.svg`

## Verification

After adding assets, verify the setup:

1. Open `index.html` in a browser
2. Check browser console for 404 errors
3. All images/icons should load without errors
4. Stories and posts should display correctly

## Troubleshooting

**Icons not showing:**
- Ensure SVG files are valid XML
- Check that fill/stroke attributes allow CSS color override
- Use `currentColor` in SVG for dynamic coloring

**Images not loading:**
- Verify file paths match JSON references exactly
- Check file extensions (case-sensitive on some servers)
- Ensure web server is serving from project root

**Videos not playing:**
- Confirm MP4 format with H.264 codec
- Add poster images for thumbnails
- Check browser console for codec errors
