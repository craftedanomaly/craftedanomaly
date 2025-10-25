// Chat View Component
import { appState } from '../app.js';
import store from '../store.js';
import ui from '../ui.js';
import { renderComposer } from './Composer.js';

export function renderChatView(container, chat) {
    // Check if view already exists for this chat
    const existingContainer = container.querySelector('[data-chat-id]');
    const existingChatId = existingContainer?.dataset.chatId;
    
    if (existingChatId === chat.id) {
        // Just update messages and typing indicator
        updateChatMessages(chat);
        return;
    }
    
    container.innerHTML = '';
    container.className = 'flex-1 flex flex-col bg-wa-bg dark:bg-wa-dark-bg';
    
    // Create wrapper with chat ID
    const wrapper = document.createElement('div');
    wrapper.dataset.chatId = chat.id;
    wrapper.className = 'flex-1 flex flex-col';
    
    // Get wallpaper
    const wallpaper = store.getChatWallpaper(chat.id) || store.getGlobalWallpaper();
    
    // Messages container
    const messagesDiv = document.createElement('div');
    messagesDiv.id = 'messages-container';
    messagesDiv.className = 'flex-1 overflow-y-auto p-4 space-y-2 relative';
    
    if (wallpaper) {
        messagesDiv.classList.add('chat-wallpaper');
        messagesDiv.style.backgroundImage = `url(${wallpaper})`;
    }
    
    // Load messages
    const messages = store.getMessages(chat.id);
    
    if (messages.length === 0) {
        // Empty state
        messagesDiv.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center">
                <svg class="w-20 h-20 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                <p class="text-gray-500 dark:text-gray-400">No messages yet</p>
                <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Send a message to start the conversation</p>
            </div>
        `;
    } else {
        messages.forEach(message => {
            const msgEl = createMessageElement(message, chat);
            messagesDiv.appendChild(msgEl);
        });
        
        // Scroll to bottom
        setTimeout(() => {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }, 100);
    }
    
    // Typing indicator
    if (appState.typingUsers.has(chat.user.id)) {
        const typingEl = createTypingIndicator(chat);
        messagesDiv.appendChild(typingEl);
    }
    
    wrapper.appendChild(messagesDiv);
    container.appendChild(wrapper);
    
    // Composer
    renderComposer(container, chat);
    
    // Scroll to bottom button
    const scrollBtn = document.createElement('button');
    scrollBtn.id = 'scroll-to-bottom';
    scrollBtn.className = 'fixed bottom-24 right-6 bg-white dark:bg-wa-dark-panel rounded-full p-3 shadow-lg hidden haptic-btn';
    scrollBtn.innerHTML = `
        <svg class="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>
    `;
    scrollBtn.onclick = () => {
        messagesDiv.scrollTo({ top: messagesDiv.scrollHeight, behavior: 'smooth' });
    };
    container.appendChild(scrollBtn);
    
    // Show/hide scroll button
    messagesDiv.addEventListener('scroll', () => {
        const isAtBottom = messagesDiv.scrollHeight - messagesDiv.scrollTop - messagesDiv.clientHeight < 100;
        scrollBtn.classList.toggle('hidden', isAtBottom);
    });
}

function createMessageElement(message, chat) {
    const isMe = message.from === 'me';
    const div = document.createElement('div');
    div.className = `flex ${isMe ? 'justify-end' : 'justify-start'} bounce-in`;
    div.dataset.messageId = message.id;
    
    if (appState.selectedMessages.includes(message.id)) {
        div.classList.add('message-selected');
    }
    
    const bubble = document.createElement('div');
    bubble.className = `max-w-xs md:max-w-md lg:max-w-lg relative ${
        isMe 
            ? 'bg-green-100 dark:bg-[#005C4B] message-bubble-out' 
            : 'bg-white dark:bg-[#202C33] message-bubble-in'
    } rounded-lg shadow-sm p-3`;
    
    // Long press for context menu
    let pressTimer;
    bubble.addEventListener('mousedown', (e) => {
        if (e.button === 2) return;
        pressTimer = setTimeout(() => {
            ui.haptic(20);
            showMessageContextMenu(message, chat);
        }, 500);
    });
    
    bubble.addEventListener('mouseup', () => clearTimeout(pressTimer));
    bubble.addEventListener('mouseleave', () => clearTimeout(pressTimer));
    bubble.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showMessageContextMenu(message, chat);
    });
    
    // Reply to message
    if (message.replyTo) {
        const originalMsg = store.getMessages(chat.id).find(m => m.id === message.replyTo);
        if (originalMsg) {
            const replyDiv = document.createElement('div');
            replyDiv.className = 'quoted-message text-xs mb-2 cursor-pointer';
            replyDiv.innerHTML = `
                <div class="font-semibold text-gray-700 dark:text-gray-300">${originalMsg.from === 'me' ? 'You' : chat.user.name}</div>
                <div class="text-gray-600 dark:text-gray-400 truncate">${originalMsg.text || 'Media'}</div>
            `;
            replyDiv.onclick = () => {
                const originalEl = document.querySelector(`[data-message-id="${message.replyTo}"]`);
                if (originalEl) {
                    originalEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    originalEl.classList.add('ring-2', 'ring-wa-teal');
                    setTimeout(() => originalEl.classList.remove('ring-2', 'ring-wa-teal'), 1000);
                }
            };
            bubble.appendChild(replyDiv);
        }
    }
    
    // Message content
    const contentDiv = document.createElement('div');
    
    if (message.type === 'text') {
        contentDiv.className = 'text-gray-900 dark:text-gray-100 break-words';
        contentDiv.innerHTML = ui.linkify(ui.escapeHtml(message.text));
        
        // Check for URLs and add preview
        const urlMatch = message.text.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
            const preview = ui.extractUrlMetadata(urlMatch[0]);
            const previewDiv = document.createElement('div');
            previewDiv.className = 'link-preview mt-2 p-2 rounded text-xs';
            previewDiv.innerHTML = `
                <div class="font-semibold">${preview.title}</div>
                <div class="text-gray-600 dark:text-gray-400">${preview.site}</div>
            `;
            contentDiv.appendChild(previewDiv);
        }
    } else if (message.type === 'image') {
        const img = document.createElement('img');
        img.src = message.media.src;
        img.alt = 'Image';
        img.className = 'rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity';
        img.onclick = () => ui.showImageZoom(message.media.src);
        contentDiv.appendChild(img);
        
        if (message.text) {
            const caption = document.createElement('p');
            caption.className = 'text-gray-900 dark:text-gray-100 mt-2';
            caption.textContent = message.text;
            contentDiv.appendChild(caption);
        }
    } else if (message.type === 'video') {
        const video = document.createElement('video');
        video.src = message.media.src;
        video.className = 'rounded-lg max-w-full cursor-pointer';
        video.controls = true;
        video.playsInline = true;
        if (message.media.poster) {
            video.poster = message.media.poster;
        }
        contentDiv.appendChild(video);
        
        if (message.text) {
            const caption = document.createElement('p');
            caption.className = 'text-gray-900 dark:text-gray-100 mt-2';
            caption.textContent = message.text;
            contentDiv.appendChild(caption);
        }
    } else if (message.type === 'audio') {
        const audioDiv = document.createElement('div');
        audioDiv.className = 'flex items-center gap-3';
        audioDiv.innerHTML = `
            <button class="play-btn haptic-btn">
                <svg class="w-8 h-8 text-wa-teal" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                </svg>
            </button>
            <div class="flex-1 voice-waveform">
                ${Array(20).fill(0).map(() => `<span style="height: ${Math.random() * 100}%"></span>`).join('')}
            </div>
            <span class="text-xs text-gray-600 dark:text-gray-400">${Math.floor(message.media.duration / 60)}:${String(message.media.duration % 60).padStart(2, '0')}</span>
        `;
        
        const playBtn = audioDiv.querySelector('.play-btn');
        const audio = new Audio(message.media.src);
        let playing = false;
        
        playBtn.onclick = () => {
            if (playing) {
                audio.pause();
                playBtn.innerHTML = `<svg class="w-8 h-8 text-wa-teal" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>`;
            } else {
                audio.play();
                playBtn.innerHTML = `<svg class="w-8 h-8 text-wa-teal" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V4z"/></svg>`;
            }
            playing = !playing;
        };
        
        audio.onended = () => {
            playing = false;
            playBtn.innerHTML = `<svg class="w-8 h-8 text-wa-teal" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>`;
        };
        
        contentDiv.appendChild(audioDiv);
    } else if (message.type === 'file') {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-800 rounded';
        fileDiv.innerHTML = `
            <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
            <div class="flex-1 min-w-0">
                <div class="font-semibold text-sm truncate">${message.media.name || 'File'}</div>
                <div class="text-xs text-gray-500">${formatFileSize(message.media.size || 0)}</div>
            </div>
        `;
        contentDiv.appendChild(fileDiv);
    }
    
    bubble.appendChild(contentDiv);
    
    // Reactions
    if (message.reactions && message.reactions.length > 0) {
        const reactionsDiv = document.createElement('div');
        reactionsDiv.className = 'flex gap-1 mt-1';
        message.reactions.forEach(emoji => {
            const span = document.createElement('span');
            span.className = 'text-sm';
            span.textContent = emoji;
            reactionsDiv.appendChild(span);
        });
        bubble.appendChild(reactionsDiv);
    }
    
    // Time and status
    const metaDiv = document.createElement('div');
    metaDiv.className = 'flex items-center justify-end gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400';
    
    if (message.starred) {
        metaDiv.innerHTML += `<svg class="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
    }
    
    metaDiv.innerHTML += `<span>${ui.formatMessageTime(message.ts)}</span>`;
    
    if (isMe && message.status) {
        if (message.status === 'read') {
            metaDiv.innerHTML += `<span class="text-blue-500">✓✓</span>`;
        } else if (message.status === 'delivered') {
            metaDiv.innerHTML += `<span>✓✓</span>`;
        } else {
            metaDiv.innerHTML += `<span>✓</span>`;
        }
    }
    
    bubble.appendChild(metaDiv);
    
    if (!isMe) {
        const avatar = document.createElement('img');
        avatar.src = chat.user.avatar;
        avatar.alt = chat.user.name;
        avatar.className = 'w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0';
        div.appendChild(avatar);
    }
    
    div.appendChild(bubble);
    
    return div;
}

function showMessageContextMenu(message, chat) {
    const content = document.createElement('div');
    content.className = 'py-2';
    
    const actions = [
        {
            label: 'Reply',
            action: () => {
                appState.replyingTo = message;
                import('../app.js').then(({ router }) => router.handleRoute());
            }
        },
        {
            label: 'React',
            action: () => {
                ui.showEmojiPicker((emoji) => {
                    store.toggleReaction(chat.id, message.id, emoji);
                    import('../app.js').then(({ router }) => router.handleRoute());
                });
            }
        },
        {
            label: message.starred ? 'Unstar' : 'Star',
            action: () => {
                store.toggleStar(chat.id, message.id);
                import('../app.js').then(({ router }) => router.handleRoute());
            }
        },
        {
            label: 'Forward',
            action: () => ui.toast('Forward feature coming soon', 'info')
        },
        {
            label: 'Copy',
            action: () => {
                if (message.text) {
                    navigator.clipboard.writeText(message.text);
                    ui.toast('Copied to clipboard', 'success');
                }
            }
        },
        {
            label: 'Delete',
            className: 'text-red-600',
            action: () => {
                ui.confirm('Delete this message?', () => {
                    store.deleteMessage(chat.id, message.id);
                    import('../app.js').then(({ router }) => router.handleRoute());
                });
            }
        }
    ];
    
    actions.forEach(action => {
        const btn = document.createElement('button');
        btn.className = `w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 haptic-btn ${action.className || ''}`;
        btn.innerHTML = `<span class="${action.className || 'text-gray-700 dark:text-gray-300'}">${action.label}</span>`;
        btn.onclick = () => {
            ui.closeAllModals();
            action.action();
        };
        content.appendChild(btn);
    });
    
    ui.showModal(content, { title: 'Message Options' });
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function createTypingIndicator(chat) {
    const typingEl = document.createElement('div');
    typingEl.id = 'typing-indicator';
    typingEl.className = 'flex items-start gap-2 mb-2';
    typingEl.innerHTML = `
        <img src="${chat.user.avatar}" alt="${chat.user.name}" class="w-8 h-8 rounded-full object-cover">
        <div class="bg-white dark:bg-wa-dark-panel px-4 py-2 rounded-lg shadow-sm">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    return typingEl;
}

function updateChatMessages(chat) {
    const messagesContainer = document.getElementById('messages-container');
    if (!messagesContainer) return;
    
    // Get current messages
    const messages = store.getMessages(chat.id);
    const existingMessageIds = Array.from(messagesContainer.querySelectorAll('[data-message-id]'))
        .map(el => el.dataset.messageId);
    
    // Add new messages
    messages.forEach(message => {
        if (!existingMessageIds.includes(message.id)) {
            const msgEl = createMessageElement(message, chat);
            // Insert before typing indicator if it exists
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                messagesContainer.insertBefore(msgEl, typingIndicator);
            } else {
                messagesContainer.appendChild(msgEl);
            }
        }
    });
    
    // Update typing indicator
    const existingTyping = document.getElementById('typing-indicator');
    const shouldShowTyping = appState.typingUsers.has(chat.user.id);
    
    if (shouldShowTyping && !existingTyping) {
        const typingEl = createTypingIndicator(chat);
        messagesContainer.appendChild(typingEl);
    } else if (!shouldShowTyping && existingTyping) {
        existingTyping.remove();
    }
    
    // Scroll to bottom if near bottom
    const isNearBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 150;
    if (isNearBottom) {
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 50);
    }
}

export default renderChatView;
