// UI Utilities: Toasts, Modals, Haptics, etc.

export const ui = {
    // Toast notifications
    toast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        const colors = {
            info: 'bg-gray-800 dark:bg-gray-700',
            success: 'bg-green-600',
            error: 'bg-red-600',
            warning: 'bg-yellow-600'
        };
        
        toast.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg slide-down max-w-sm`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            toast.style.transition = 'all 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    // Modal system
    showModal(content, options = {}) {
        const {
            title = '',
            showClose = true,
            onClose = null,
            className = '',
            fullscreen = false
        } = options;

        const container = document.getElementById('modal-container');
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center fade-blur';
        modal.style.background = 'rgba(0, 0, 0, 0.5)';
        
        const dialog = document.createElement('div');
        dialog.className = fullscreen 
            ? 'w-full h-full bg-white dark:bg-wa-dark-panel'
            : `bg-white dark:bg-wa-dark-panel rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden ${className}`;
        
        if (title || showClose) {
            const header = document.createElement('div');
            header.className = 'flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700';
            
            if (title) {
                const titleEl = document.createElement('h3');
                titleEl.className = 'text-lg font-semibold text-gray-900 dark:text-white';
                titleEl.textContent = title;
                header.appendChild(titleEl);
            }
            
            if (showClose) {
                const closeBtn = document.createElement('button');
                closeBtn.className = 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 haptic-btn';
                closeBtn.innerHTML = `
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                `;
                closeBtn.onclick = () => this.closeModal(modal, onClose);
                header.appendChild(closeBtn);
            }
            
            dialog.appendChild(header);
        }
        
        const body = document.createElement('div');
        body.className = 'overflow-y-auto';
        body.style.maxHeight = fullscreen ? 'calc(100vh - 64px)' : 'calc(90vh - 64px)';
        
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else {
            body.appendChild(content);
        }
        
        dialog.appendChild(body);
        modal.appendChild(dialog);
        container.appendChild(modal);
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal, onClose);
            }
        });
        
        // Close on ESC
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal, onClose);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        return modal;
    },

    closeModal(modal, callback) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.remove();
            if (callback) callback();
        }, 200);
    },

    closeAllModals() {
        const container = document.getElementById('modal-container');
        container.innerHTML = '';
    },

    // Confirm dialog
    confirm(message, onConfirm, onCancel) {
        const content = document.createElement('div');
        content.className = 'p-6';
        
        const msg = document.createElement('p');
        msg.className = 'text-gray-700 dark:text-gray-300 mb-6';
        msg.textContent = message;
        content.appendChild(msg);
        
        const buttons = document.createElement('div');
        buttons.className = 'flex gap-3 justify-end';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg haptic-btn';
        cancelBtn.textContent = 'Cancel';
        
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'px-4 py-2 bg-wa-teal text-white rounded-lg hover:bg-wa-green-light haptic-btn';
        confirmBtn.textContent = 'Confirm';
        
        const modal = this.showModal(content, { title: 'Confirm', showClose: false });
        
        cancelBtn.onclick = () => {
            this.closeModal(modal);
            if (onCancel) onCancel();
        };
        
        confirmBtn.onclick = () => {
            this.closeModal(modal);
            if (onConfirm) onConfirm();
        };
        
        buttons.appendChild(cancelBtn);
        buttons.appendChild(confirmBtn);
        content.appendChild(buttons);
    },

    // Loading overlay
    showLoading() {
        document.getElementById('loading-overlay').classList.remove('hidden');
    },

    hideLoading() {
        document.getElementById('loading-overlay').classList.add('hidden');
    },

    // Haptic feedback (vibration)
    haptic(pattern = 10) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    },

    // Format time
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    },

    formatMessageTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    },

    // Generate unique ID
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Parse URLs in text
    linkify(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, (url) => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">${url}</a>`;
        });
    },

    // Extract URL metadata (dummy)
    extractUrlMetadata(url) {
        // In real app, this would fetch og:tags
        const domain = new URL(url).hostname;
        return {
            title: 'Link Preview',
            description: url,
            site: domain,
            image: null
        };
    },

    // Create skeleton loader
    createSkeleton(type = 'chat-item') {
        const skeletons = {
            'chat-item': `
                <div class="flex items-center gap-3 p-3 animate-pulse">
                    <div class="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full skeleton"></div>
                    <div class="flex-1">
                        <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-2 skeleton"></div>
                        <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3 skeleton"></div>
                    </div>
                </div>
            `,
            'message': `
                <div class="flex gap-2 mb-2 animate-pulse">
                    <div class="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full skeleton"></div>
                    <div class="flex-1 max-w-xs">
                        <div class="h-16 bg-gray-300 dark:bg-gray-700 rounded-lg skeleton"></div>
                    </div>
                </div>
            `
        };
        
        return skeletons[type] || skeletons['chat-item'];
    },

    // Render skeletons
    renderSkeletons(container, count = 5, type = 'chat-item') {
        container.innerHTML = Array(count).fill(this.createSkeleton(type)).join('');
    },

    // Image zoom modal
    showImageZoom(src, alt = '') {
        const content = document.createElement('div');
        content.className = 'relative w-full h-full flex items-center justify-center bg-black';
        
        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        img.className = 'max-w-full max-h-full object-contain';
        
        content.appendChild(img);
        
        const modal = this.showModal(content, {
            fullscreen: true,
            showClose: true,
            className: 'bg-black'
        });
        
        // Double tap to zoom
        let lastTap = 0;
        let scale = 1;
        img.addEventListener('click', (e) => {
            const now = Date.now();
            if (now - lastTap < 300) {
                scale = scale === 1 ? 2 : 1;
                img.style.transform = `scale(${scale})`;
                img.style.transition = 'transform 0.3s ease';
            }
            lastTap = now;
        });
    },

    // Video player modal
    showVideoPlayer(src) {
        const content = document.createElement('div');
        content.className = 'relative w-full h-full flex items-center justify-center bg-black';
        
        const video = document.createElement('video');
        video.src = src;
        video.controls = true;
        video.autoplay = true;
        video.className = 'max-w-full max-h-full';
        
        content.appendChild(video);
        
        this.showModal(content, {
            fullscreen: true,
            showClose: true,
            className: 'bg-black'
        });
    },

    // Emoji picker (simple)
    showEmojiPicker(onSelect) {
        const emojis = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉', '👏', '💯'];
        
        const content = document.createElement('div');
        content.className = 'p-4 grid grid-cols-5 gap-3';
        
        emojis.forEach(emoji => {
            const btn = document.createElement('button');
            btn.className = 'text-3xl hover:scale-125 transition-transform haptic-btn';
            btn.textContent = emoji;
            btn.onclick = () => {
                onSelect(emoji);
                this.closeAllModals();
            };
            content.appendChild(btn);
        });
        
        this.showModal(content, { title: 'Select Emoji' });
    }
};

export default ui;
