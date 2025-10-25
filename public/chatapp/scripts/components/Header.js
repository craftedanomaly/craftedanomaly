// Header Component
import { appState, router } from '../app.js';
import ui from '../ui.js';

export function renderHeader(title, chat = null) {
    const container = document.getElementById('header-container');
    
    if (chat) {
        // Check if header already exists for this chat
        const existingHeader = container.querySelector('header');
        const existingChatId = existingHeader?.dataset.chatId;
        
        if (existingChatId === chat.id) {
            // Just update the status text
            const statusEl = document.getElementById('chat-status');
            if (statusEl) {
                statusEl.textContent = appState.typingUsers.has(chat.user.id) ? 'typing...' : 'online';
            }
            return;
        }
        
        // Chat header with back button
        container.innerHTML = `
            <header class="bg-wa-green dark:bg-wa-dark-panel text-white p-3 flex items-center gap-3 shadow-md" data-chat-id="${chat.id}">
                <button id="back-btn" class="haptic-btn p-2 -ml-2">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                </button>
                
                <img src="${chat.user.avatar}" alt="${chat.user.name}" class="w-10 h-10 rounded-full object-cover">
                
                <div class="flex-1 min-w-0">
                    <h1 class="font-semibold truncate">${chat.user.name}</h1>
                    <p class="text-xs text-gray-200 dark:text-gray-400" id="chat-status">
                        ${appState.typingUsers.has(chat.user.id) ? 'typing...' : 'online'}
                    </p>
                </div>
                
                <div class="flex items-center gap-2">
                    <button class="haptic-btn p-2" title="Voice call">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                    </button>
                    <button class="haptic-btn p-2" title="Video call">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                    </button>
                    <button id="chat-menu-btn" class="haptic-btn p-2" title="More">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                        </svg>
                    </button>
                </div>
            </header>
        `;
        
        // Back button - always add listener
        const backBtn = document.getElementById('back-btn');
        if (backBtn && !backBtn.dataset.listenerAdded) {
            backBtn.dataset.listenerAdded = 'true';
            backBtn.addEventListener('click', () => {
                const sidebar = document.getElementById('sidebar');
                const mainView = document.getElementById('main-view');
                sidebar.classList.remove('hidden');
                mainView.classList.add('hidden');
                router.navigate('/chats');
            });
        }
        
        // Video call button
        const videoBtn = container.querySelector('[title="Video call"]');
        if (videoBtn && !videoBtn.dataset.listenerAdded) {
            videoBtn.dataset.listenerAdded = 'true';
            videoBtn.addEventListener('click', () => {
                startVideoCall(chat);
            });
        }
        
        // Chat menu
        const menuBtn = document.getElementById('chat-menu-btn');
        if (menuBtn && !menuBtn.dataset.listenerAdded) {
            menuBtn.dataset.listenerAdded = 'true';
            menuBtn.addEventListener('click', () => {
                showChatMenu(chat);
            });
        }
        
    } else {
        // Default header
        container.innerHTML = `
            <header class="bg-wa-green dark:bg-wa-dark-panel text-white p-3 flex items-center justify-between shadow-md">
                <h1 class="text-xl font-semibold">${title}</h1>
                
                <div class="flex items-center gap-2">
                    <button id="search-btn" class="haptic-btn p-2" title="Search">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                    </button>
                    <button id="menu-btn" class="haptic-btn p-2" title="Menu">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                        </svg>
                    </button>
                </div>
            </header>
        `;
        
        // Search button
        document.getElementById('search-btn')?.addEventListener('click', () => {
            ui.toast('Search feature coming soon!', 'info');
        });
        
        // Menu button
        document.getElementById('menu-btn')?.addEventListener('click', () => {
            showMainMenu();
        });
    }
}

function showChatMenu(chat) {
    const content = document.createElement('div');
    content.className = 'py-2';
    
    const menuItems = [
        { label: 'View Contact', icon: 'user', action: () => ui.toast('View contact', 'info') },
        { label: 'Media, Links, Docs', icon: 'folder', action: () => ui.toast('Media viewer', 'info') },
        { label: 'Search', icon: 'search', action: () => ui.toast('Search in chat', 'info') },
        { label: 'Mute Notifications', icon: 'bell', action: () => toggleMute(chat) },
        { label: 'Wallpaper', icon: 'image', action: () => selectWallpaper(chat) },
        { label: 'Clear Chat', icon: 'trash', action: () => clearChat(chat) }
    ];
    
    menuItems.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 haptic-btn';
        btn.innerHTML = `
            <span class="text-gray-700 dark:text-gray-300">${item.label}</span>
        `;
        btn.onclick = () => {
            ui.closeAllModals();
            item.action();
        };
        content.appendChild(btn);
    });
    
    ui.showModal(content, { title: 'Chat Options' });
}

function showMainMenu() {
    const content = document.createElement('div');
    content.className = 'py-2';
    
    const menuItems = [
        { label: 'New Group', action: () => ui.toast('New group', 'info') },
        { label: 'New Broadcast', action: () => ui.toast('New broadcast', 'info') },
        { label: 'Starred Messages', action: () => ui.toast('Starred messages', 'info') },
        { label: 'Settings', action: () => router.navigate('/settings') }
    ];
    
    menuItems.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 haptic-btn';
        btn.innerHTML = `<span class="text-gray-700 dark:text-gray-300">${item.label}</span>`;
        btn.onclick = () => {
            ui.closeAllModals();
            item.action();
        };
        content.appendChild(btn);
    });
    
    ui.showModal(content, { title: 'Menu' });
}

function toggleMute(chat) {
    const currentMuted = chat.muted || false;
    chat.muted = !currentMuted;
    
    import('../store.js').then(({ store }) => {
        store.setMuted(chat.id, chat.muted);
        ui.toast(chat.muted ? 'Chat muted' : 'Chat unmuted', 'success');
    });
}

function selectWallpaper(chat) {
    const wallpapers = [
        '/chatapp/media/wallpapers/default.jpg',
        '/chatapp/media/wallpapers/pattern1.jpg',
        '/chatapp/media/wallpapers/pattern2.jpg',
        '/chatapp/media/wallpapers/gradient1.jpg'
    ];
    
    const content = document.createElement('div');
    content.className = 'p-4 grid grid-cols-2 gap-3';
    
    wallpapers.forEach(wp => {
        const btn = document.createElement('button');
        btn.className = 'aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-wa-teal haptic-btn';
        btn.innerHTML = `<img src="${wp}" alt="Wallpaper" class="w-full h-full object-cover">`;
        btn.onclick = () => {
            import('../store.js').then(({ store }) => {
                store.setChatWallpaper(chat.id, wp);
                ui.closeAllModals();
                ui.toast('Wallpaper updated', 'success');
                router.handleRoute();
            });
        };
        content.appendChild(btn);
    });
    
    ui.showModal(content, { title: 'Select Wallpaper' });
}

function clearChat(chat) {
    ui.confirm('Are you sure you want to clear all messages?', () => {
        import('../store.js').then(({ store }) => {
            store.setMessages(chat.id, []);
            ui.toast('Chat cleared', 'success');
            router.handleRoute();
        });
    });
}

async function startVideoCall(chat) {
    // Request camera permission
    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (error) {
        ui.toast('Camera permission denied', 'error');
        return;
    }
    
    // Create video call overlay
    const overlay = document.createElement('div');
    overlay.id = 'video-call-overlay';
    overlay.className = 'fixed inset-0 bg-black z-50 flex flex-col';
    
    // Call status header
    overlay.innerHTML = `
        <div class="bg-gradient-to-b from-black/80 to-transparent p-6 text-white">
            <div class="flex flex-col items-center">
                <img src="${chat.user.avatar}" alt="${chat.user.name}" class="w-24 h-24 rounded-full mb-4 object-cover">
                <h2 class="text-2xl font-semibold">${chat.user.name}</h2>
                <p class="text-gray-300 mt-2" id="call-status">Calling...</p>
            </div>
        </div>
        
        <div class="flex-1 relative">
            <video id="remote-video" class="w-full h-full object-cover" autoplay playsinline></video>
            
            <!-- Local camera preview (PiP) -->
            <div class="absolute top-4 right-4 w-32 h-48 bg-gray-900 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20">
                <video id="local-video" class="w-full h-full object-cover" autoplay playsinline muted></video>
            </div>
        </div>
        
        <div class="bg-gradient-to-t from-black/80 to-transparent p-6">
            <div class="flex justify-center gap-6">
                <button id="mute-audio-btn" class="bg-gray-700/80 hover:bg-gray-600 text-white rounded-full p-4 haptic-btn">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd"/>
                    </svg>
                </button>
                
                <button id="end-call-btn" class="bg-red-600 hover:bg-red-700 text-white rounded-full p-5 haptic-btn">
                    <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                </button>
                
                <button id="toggle-camera-btn" class="bg-gray-700/80 hover:bg-gray-600 text-white rounded-full p-4 haptic-btn">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Setup local video
    const localVideo = document.getElementById('local-video');
    localVideo.srcObject = stream;
    
    // Setup remote video with delay
    const remoteVideo = document.getElementById('remote-video');
    const statusText = document.getElementById('call-status');
    
    setTimeout(() => {
        statusText.textContent = 'Connecting...';
        
        // After 10 seconds, start the video call
        setTimeout(() => {
            statusText.textContent = 'Connected';
            
            // Try to load video named after the contact (e.g., Sam.mp4)
            const contactVideoPath = `/chatapp/media/images/videocalls/${chat.user.name}.mp4`;
            
            // Fallback videos - use external CDN or smaller local videos
            const fallbackVideos = [
                // External video samples (always work)
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                // Local videos (if they exist and are small enough)
                '/chatapp/media/images/videocalls/call1.mp4',
                '/chatapp/media/images/videocalls/call2.mp4',
                '/chatapp/media/images/videocalls/charlie.mp4'
            ];
            
            // Try contact-specific video first
            remoteVideo.src = contactVideoPath;
            remoteVideo.muted = false;
            
            let fallbackAttempts = 0;
            
            // If it fails to load, try fallbacks
            remoteVideo.onerror = () => {
                console.log(`Failed to load video: ${remoteVideo.src}`);
                if (fallbackAttempts < fallbackVideos.length) {
                    const nextVideo = fallbackVideos[fallbackAttempts];
                    console.log(`Trying fallback video ${fallbackAttempts + 1}: ${nextVideo}`);
                    remoteVideo.src = nextVideo;
                    fallbackAttempts++;
                } else {
                    console.error('All video sources failed to load');
                    statusText.textContent = 'Video unavailable';
                    remoteVideo.onerror = null;
                }
            };
            
            remoteVideo.play().catch(err => {
                console.error('Video play failed:', err);
            });
        }, 10000);
    }, 1000);
    
    // End call button
    document.getElementById('end-call-btn').addEventListener('click', () => {
        stream.getTracks().forEach(track => track.stop());
        overlay.remove();
        ui.toast('Call ended', 'info');
    });
    
    // Mute audio button
    let audioMuted = false;
    document.getElementById('mute-audio-btn').addEventListener('click', (e) => {
        audioMuted = !audioMuted;
        stream.getAudioTracks().forEach(track => track.enabled = !audioMuted);
        e.currentTarget.classList.toggle('bg-red-600', audioMuted);
        e.currentTarget.classList.toggle('bg-gray-700/80', !audioMuted);
    });
    
    // Toggle camera button
    let videoEnabled = true;
    document.getElementById('toggle-camera-btn').addEventListener('click', (e) => {
        videoEnabled = !videoEnabled;
        stream.getVideoTracks().forEach(track => track.enabled = videoEnabled);
        e.currentTarget.classList.toggle('bg-red-600', !videoEnabled);
        e.currentTarget.classList.toggle('bg-gray-700/80', videoEnabled);
    });
}

export default renderHeader;
