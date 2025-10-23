# Frendz

A fully static, Instagram-like wireframe that runs 100% in the browser with no backend. Built with Tailwind CSS via CDN and vanilla JavaScript.

## Features

- ✨ **Fully Static** - No build step, no backend, no database
- 🎨 **Modern UI** - Tailwind CSS with dark/light mode support
- 📱 **Mobile-First** - Responsive design optimized for all devices
- 🎬 **Rich Media** - Image and video posts with lazy loading
- 📖 **Stories** - Instagram-style stories with tap navigation and progress bars
- 💬 **Messages** - Real-time-like messaging with localStorage persistence
- 🔍 **Search** - Client-side filtering with grid view
- 👤 **Profile** - User profile with post grid
- 💾 **Persistent State** - Likes, saves, and messages stored in localStorage
- 🎭 **Micro-interactions** - Smooth animations and haptic-feel interactions

## Quick Start

### No Installation Required

Simply open `index.html` in a modern web browser. That's it!

For local development with live reload:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## Deployment

Deploy to any static hosting service:

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
Drag and drop the entire folder to [Netlify Drop](https://app.netlify.com/drop)

### GitHub Pages
1. Push to GitHub
2. Go to Settings → Pages
3. Select branch and `/` (root) folder
4. Save

### cPanel / Traditional Hosting
Upload all files via FTP to your `public_html` or `www` directory.

## Project Structure

```
frendz/
├── index.html                      # Main entry point
├── styles/
│   └── tailwind-extra.css         # Custom animations and utilities
├── scripts/
│   ├── app.js                     # Router and state management
│   ├── utils/
│   │   └── format.js              # Formatting utilities
│   └── components/
│       ├── Splash.js              # Splash screen
│       ├── Header.js              # Top navigation bar
│       ├── BottomNav.js           # Bottom navigation
│       ├── StoryBar.js            # Story carousel
│       ├── StoryViewer.js         # Story modal viewer
│       ├── Feed.js                # Post feed container
│       ├── PostCard.js            # Individual post card
│       ├── PostModal.js           # Post detail modal
│       ├── Messages.js            # Messages page
│       ├── Search.js              # Search page
│       ├── Profile.js             # Profile page
│       └── UploadModal.js         # Create post modal
├── data/
│   ├── posts.json                 # Post data (20 posts)
│   ├── stories.json               # Story data (10 stories)
│   └── messages.json              # Message threads (5 threads)
├── images/
│   ├── logo.png                   # App logo
│   ├── wordmark.svg               # Text logo
│   ├── avatars/                   # User avatars
│   ├── posts/                     # Post media
│   └── stories/                   # Story media
└── icons/                         # SVG icons

```

## Customization

### Change Branding

Replace these files with your own:
- `/images/logo.png` - Main logo (512×512px recommended)
- `/images/wordmark.svg` - Text logo
- Update `<title>` in `index.html`

### Modify Colors

Edit the Tailwind config in `index.html`:

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#fd1d1d',  // Your primary color
          dark: '#833ab4',     // Your secondary color
        },
      },
    }
  }
};
```

### Add/Edit Content

Edit JSON files in `/data/`:
- `posts.json` - Add or modify posts
- `stories.json` - Add or modify stories
- `messages.json` - Add or modify message threads

All media paths are relative to the project root (e.g., `/images/posts/myimage.jpg`)

### Add Custom Styles

Add custom CSS to `/styles/tailwind-extra.css`

## Routes

- `#/home` - Home feed with stories and posts
- `#/messages` - Messages/DM page
- `#/search` - Search and explore
- `#/profile` - User profile
- `#/story/:id` - Story viewer modal
- `#/post/:id` - Post detail modal

## State Persistence

The following data is stored in localStorage:
- `likes:{postId}` - Like state for each post
- `saved:{postId}` - Save state for each post
- `storySeen:{storyId}` - Viewed stories
- `messages:{threadId}` - Message history per thread
- `muted:global` - Global video mute preference
- `theme:global` - Theme preference (system/light/dark)
- `customPosts:global` - User-created posts (via upload modal)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

Requires support for:
- ES6 modules
- CSS Grid & Flexbox
- IntersectionObserver
- localStorage
- URL.createObjectURL (for upload feature)

## Features in Detail

### Story Viewer
- Tap left/right to navigate
- Hold to pause
- Auto-advance with progress bars
- Video support with audio toggle
- Keyboard navigation (←/→/ESC)

### Feed
- Lazy loading with IntersectionObserver
- Double-tap to like with animation
- Video posts with tap-to-unmute
- Expandable captions
- Like/save state persistence

### Messages
- Thread list with unread badges
- Real-time-like chat interface
- Message persistence in localStorage
- Dummy attachment button

### Search
- Client-side filtering by caption, username, or tags
- Grid layout with hover effects
- Video thumbnails with autoplay on hover

### Create Post
- Local file upload (image/video)
- Preview with URL.createObjectURL
- Posts persist in localStorage
- No backend required

### Theme Support
- System (auto-detect)
- Light mode
- Dark mode
- Persists across sessions

## Known Limitations

- No real backend - all data is static or localStorage
- Custom uploaded media uses blob URLs (lost on page refresh unless re-uploaded)
- No real authentication or user accounts
- Comments are dummy/placeholder
- Share functionality is placeholder
- Video encoding/compression not handled

## Performance Tips

1. **Optimize Images**: Use WebP format and compress images before adding
2. **Lazy Loading**: Already implemented for feed posts
3. **Video Formats**: Use MP4 with H.264 codec for best compatibility
4. **Reduce JSON Size**: Remove unused posts/stories if needed

## Troubleshooting

### Images not loading
- Check that paths in JSON files match actual file locations
- Paths should be relative to project root (start with `/`)
- Ensure web server is serving from project root

### Videos not playing
- Use MP4 format with H.264 codec
- Include `poster` attribute for thumbnails
- Check browser console for errors

### localStorage full
- Clear browser data for the site
- Reduce number of custom posts (limited to 20)
- Avoid uploading very large files

### Dark mode not working
- Check `prefers-color-scheme` in browser/OS settings
- Manually toggle theme using header button
- Clear localStorage if theme is stuck

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Credits

Built with:
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- Vanilla JavaScript - No frameworks needed
- Modern browser APIs - IntersectionObserver, localStorage, etc.

---

**Note**: This is a wireframe/prototype. For production use, consider adding:
- Real backend with authentication
- Database for persistent data
- CDN for media hosting
- Image optimization pipeline
- Analytics and monitoring
- Progressive Web App (PWA) features
