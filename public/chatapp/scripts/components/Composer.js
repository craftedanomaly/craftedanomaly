// Composer Component (Message Input)
import { appState, router } from '../app.js';
import store from '../store.js';
import ui from '../ui.js';

export function renderComposer(container, chat) {
    const composerDiv = document.createElement('div');
    composerDiv.className = 'bg-white dark:bg-wa-dark-panel border-t border-gray-200 dark:border-gray-800 p-3';
    
    // Reply preview
    if (appState.replyingTo) {
        const replyPreview = document.createElement('div');
        replyPreview.className = 'mb-2 p-2 bg-gray-100 dark:bg-wa-dark-input rounded-lg flex items-center justify-between';
        replyPreview.innerHTML = `
            <div class="flex-1 min-w-0">
                <div class="text-xs font-semibold text-wa-teal">Replying to ${appState.replyingTo.from === 'me' ? 'yourself' : chat.user.name}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400 truncate">${appState.replyingTo.text || 'Media'}</div>
            </div>
            <button id="cancel-reply" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 haptic-btn">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        `;
        composerDiv.appendChild(replyPreview);
        
        document.getElementById('cancel-reply')?.addEventListener('click', () => {
            appState.replyingTo = null;
            router.handleRoute();
        });
    }
    
    // Input area
    const inputDiv = document.createElement('div');
    inputDiv.className = 'flex items-end gap-2';
    inputDiv.innerHTML = `
        <button id="emoji-btn" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 haptic-btn p-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
        </button>
        
        <button id="attach-btn" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 haptic-btn p-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
            </svg>
        </button>
        
        <div class="flex-1 relative">
            <textarea 
                id="message-input" 
                placeholder="Type a message"
                rows="1"
                class="w-full px-4 py-2 bg-gray-100 dark:bg-wa-dark-input text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-wa-teal resize-none max-h-32"
            ></textarea>
        </div>
        
        <button id="send-btn" class="bg-wa-teal text-white rounded-full p-2 haptic-btn disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
        </button>
        
        <button id="mic-btn" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 haptic-btn p-2 hidden">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
            </svg>
        </button>
    `;
    
    composerDiv.appendChild(inputDiv);
    container.appendChild(composerDiv);
    
    // Elements
    const input = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const micBtn = document.getElementById('mic-btn');
    const emojiBtn = document.getElementById('emoji-btn');
    const attachBtn = document.getElementById('attach-btn');
    
    // Auto-resize textarea
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 128) + 'px';
        
        // Toggle send/mic button
        if (input.value.trim()) {
            sendBtn.disabled = false;
            sendBtn.classList.remove('hidden');
            micBtn.classList.add('hidden');
        } else {
            sendBtn.disabled = true;
            sendBtn.classList.add('hidden');
            micBtn.classList.remove('hidden');
        }
    });
    
    // Send message
    const sendMessage = () => {
        const text = input.value.trim();
        if (!text) return;
        
        const message = {
            id: ui.generateId('msg'),
            from: 'me',
            type: 'text',
            text: text,
            ts: new Date().toISOString(),
            status: 'sent',
            replyTo: appState.replyingTo?.id || null
        };
        
        store.pushMessage(chat.id, message);
        
        // Update chat last message
        chat.lastMessage = {
            type: 'text',
            text: text,
            ts: message.ts,
            from: 'me',
            status: 'sent'
        };
        
        // Clear input
        input.value = '';
        input.style.height = 'auto';
        appState.replyingTo = null;
        
        // Re-render once immediately
        router.handleRoute();
        
        // Simulate delivery (no re-render)
        setTimeout(() => {
            message.status = 'delivered';
            store.updateMessage(chat.id, message.id, { status: 'delivered' });
            
            // Simulate read (no re-render)
            setTimeout(() => {
                message.status = 'read';
                store.updateMessage(chat.id, message.id, { status: 'read' });
            }, 1000 + Math.random() * 2000);
        }, 500 + Math.random() * 1000);
        
        // Show typing indicator and send reply after 5 seconds
        setTimeout(() => {
            appState.typingUsers.add(chat.user.id);
            router.handleRoute();
            
            setTimeout(() => {
                appState.typingUsers.delete(chat.user.id);
                
                // Generate reply message
                const replies = [
                    'Thanks for your message!',
                    'Got it, will get back to you soon.',
                    'Sounds good!',
                    'Sure thing!',
                    'Okay, let me check that.',
                    'Alright, thanks!',
                    'Perfect, talk to you later.',
                    'Understood!'
                ];
                
                const replyMessage = {
                    id: ui.generateId('msg'),
                    from: chat.user.id,
                    type: 'text',
                    text: replies[Math.floor(Math.random() * replies.length)],
                    ts: new Date().toISOString(),
                    status: 'delivered'
                };
                
                store.pushMessage(chat.id, replyMessage);
                
                // Update chat last message
                chat.lastMessage = {
                    type: 'text',
                    text: replyMessage.text,
                    ts: replyMessage.ts,
                    from: chat.user.id,
                    status: 'delivered'
                };
                
                router.handleRoute();
            }, 5000);
        }, 2000);
        
        ui.haptic(10);
    };
    
    // Enter to send, Shift+Enter for new line
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    sendBtn.addEventListener('click', sendMessage);
    
    // Emoji picker
    emojiBtn.addEventListener('click', () => {
        ui.showEmojiPicker((emoji) => {
            input.value += emoji;
            input.focus();
            input.dispatchEvent(new Event('input'));
        });
    });
    
    // Attach file
    attachBtn.addEventListener('click', () => {
        showAttachMenu(chat);
    });
    
    // Voice recording
    micBtn.addEventListener('click', () => {
        startVoiceRecording(chat);
    });
    
    // Focus input
    input.focus();
}

function showAttachMenu(chat) {
    const content = document.createElement('div');
    content.className = 'py-2';
    
    const options = [
        {
            label: 'Photo or Video',
            icon: 'image',
            accept: 'image/*,video/*',
            type: 'media'
        },
        {
            label: 'Document',
            icon: 'document',
            accept: '*/*',
            type: 'file'
        },
        {
            label: 'Audio',
            icon: 'audio',
            accept: 'audio/*',
            type: 'audio'
        }
    ];
    
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 haptic-btn';
        btn.innerHTML = `<span class="text-gray-700 dark:text-gray-300">${option.label}</span>`;
        btn.onclick = () => {
            ui.closeAllModals();
            selectFile(chat, option.accept, option.type);
        };
        content.appendChild(btn);
    });
    
    ui.showModal(content, { title: 'Attach' });
}

function selectFile(chat, accept, type) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const url = URL.createObjectURL(file);
        
        let messageType = 'file';
        if (file.type.startsWith('image/')) {
            messageType = 'image';
        } else if (file.type.startsWith('video/')) {
            messageType = 'video';
        } else if (file.type.startsWith('audio/')) {
            messageType = 'audio';
        }
        
        const message = {
            id: ui.generateId('msg'),
            from: 'me',
            type: messageType,
            text: '',
            media: {
                src: url,
                name: file.name,
                size: file.size,
                duration: messageType === 'audio' ? 30 : undefined
            },
            ts: new Date().toISOString(),
            status: 'sent'
        };
        
        store.pushMessage(chat.id, message);
        
        // Update chat
        chat.lastMessage = {
            type: messageType,
            text: messageType === 'image' ? '📷 Photo' : messageType === 'video' ? '🎥 Video' : '📎 ' + file.name,
            ts: message.ts,
            from: 'me',
            status: 'sent'
        };
        
        router.handleRoute();
        ui.toast('Media sent', 'success');
    };
    
    input.click();
}

function startVoiceRecording(chat) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        ui.toast('Voice recording not supported', 'error');
        return;
    }
    
    ui.toast('Recording...', 'info', 1000);
    
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const mediaRecorder = new MediaRecorder(stream);
            const chunks = [];
            
            mediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };
            
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                
                const message = {
                    id: ui.generateId('msg'),
                    from: 'me',
                    type: 'audio',
                    text: '',
                    media: {
                        src: url,
                        duration: 5
                    },
                    ts: new Date().toISOString(),
                    status: 'sent'
                };
                
                store.pushMessage(chat.id, message);
                
                chat.lastMessage = {
                    type: 'audio',
                    text: '🎤 Voice message',
                    ts: message.ts,
                    from: 'me',
                    status: 'sent'
                };
                
                stream.getTracks().forEach(track => track.stop());
                router.handleRoute();
                ui.toast('Voice message sent', 'success');
            };
            
            mediaRecorder.start();
            
            // Stop after 5 seconds (demo)
            setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            }, 5000);
        })
        .catch(err => {
            console.error('Microphone error:', err);
            ui.toast('Microphone access denied', 'error');
        });
}

export default renderComposer;
