# ChatApp - WhatsApp Clone Wireframe

A fully static, WhatsApp-like chat wireframe that runs 100% in the browser with no backend.

## 🚀 Features

### Core Features
- ✅ **Hash-based Routing** - Navigate between chats, status, calls, and settings
- ✅ **localStorage Persistence** - All data persists across sessions
- ✅ **Responsive Design** - Mobile-first with desktop support
- ✅ **Dark/Light Theme** - System-aware theme switching
- ✅ **PWA Support** - Install as standalone app

### Chat Features
- 📱 Chat list with search, pin, mute, archive
- 💬 Message bubbles with read receipts (✓, ✓✓, ✓✓ blue)
- 📎 Media support (images, videos, audio, files)
- ↩️ Reply to messages
- 😊 Reactions (👍❤️😂😮😢🙏)
- ⭐ Star messages
- 🎨 Per-chat wallpapers
- ⌨️ Typing indicators
- 🔍 Search in chats

### Status (Stories)
- 📸 Image/video status updates
- 🔄 Progress bars with tap navigation
- 👁️ Seen/unseen tracking
- ⏸️ Press-hold to pause

### Calls
- 📞 Voice and video call simulation
- 📋 Call history with direction indicators
- ⏱️ Call duration tracking
- 🎥 Dummy call screen with controls

### Settings
- 🎨 Theme selector (Light/Dark/System)
- 🖼️ Wallpaper customization
- 🌍 Language support (EN/TR)
- 🔔 Notification toggles
- 🔒 Privacy settings
- 💾 Storage usage info
- 🔄 Reset app functionality

## 📁 Project Structure

```
/public/chatapp/
├── index.html              # Main HTML file
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # Service worker
├── README.md               # This file
├── /scripts/
│   ├── app.js             # Router & main app logic
│   ├── store.js           # localStorage helpers
│   ├── ui.js              # UI utilities (toasts, modals)
│   └── /components/
│       ├── Header.js
│       ├── Tabbar.js
│       ├── SearchBar.js
│       ├── ChatsList.js
│       ├── ChatView.js
│       ├── Composer.js
│       ├── StatusList.js
│       ├── StatusViewer.js
│       ├── Calls.js
│       └── Settings.js
├── /styles/
│   └── app.css            # Custom styles & animations
├── /data/
│   ├── users.json
│   ├── chats.json
│   ├── statuses.json
│   └── calls.json
└── /media/
    ├── /avatars/          # User avatars
    ├── /images/           # Status images
    ├── /videos/           # Video files
    ├── /audio/            # Audio files
    └── /wallpapers/       # Chat wallpapers
```

## 🧭 Routes

- `#/chats` - Chat list (default)
- `#/chat/:id` - Individual chat view
- `#/status` - Status list
- `#/status/:id` - Status viewer
- `#/calls` - Call history
- `#/settings` - Settings page

## 💾 localStorage Keys

- `chatapp:theme` - Theme preference
- `chatapp:lang` - Language preference
- `chatapp:wallpaper:global` - Global wallpaper
- `chatapp:wallpaper:chat:{id}` - Per-chat wallpaper
- `chatapp:chats` - Chat metadata (pinned, muted, archived)
- `chatapp:messages:{id}` - Messages for each chat
- `chatapp:statuses:seen:{id}` - Status view tracking
- `chatapp:settings` - App settings
- `chatapp:profile` - User profile

## 🎨 Tech Stack

- **HTML5** - Semantic markup
- **Tailwind CSS** (CDN) - Utility-first styling
- **Vanilla JavaScript** (ES6 modules) - No frameworks
- **localStorage** - Client-side persistence
- **Service Worker** - PWA offline support

## 🚦 Getting Started

1. Navigate to `craftedanomaly.com/chatapp`
2. The app loads with mock data
3. All interactions are saved to localStorage
4. Install as PWA for standalone experience

## ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd + K` - Open search
- `ESC` - Close modals/exit selection mode

## 📱 Mobile Features

- Swipe gestures (simulated with long-press)
- Haptic feedback (vibration)
- Bottom tab navigation
- Pull-to-refresh ready

## 🔧 Customization

### Adding New Chats
Edit `/data/chats.json` and add a new chat object.

### Adding Wallpapers
Place images in `/media/wallpapers/` and reference in settings.

### Changing Theme Colors
Modify Tailwind config in `index.html` or add custom CSS in `app.css`.

## 🐛 Known Limitations

- No real backend - all data is local
- Media files use object URLs (not persisted)
- No real encryption
- Voice recording requires microphone permission
- File uploads are simulated

## 📄 License

This is a wireframe/demo project for educational purposes.

## 🙏 Credits

Inspired by WhatsApp Web design and functionality.
