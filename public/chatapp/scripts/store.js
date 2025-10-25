// localStorage Helper Module
const PREFIX = 'chatapp:';

export const store = {
    // Generic get/set
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(PREFIX + key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            console.error('Store get error:', e);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(PREFIX + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Store set error:', e);
            return false;
        }
    },

    remove(key) {
        localStorage.removeItem(PREFIX + key);
    },

    clear() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    },

    // Theme
    getTheme() {
        return this.get('theme', 'system');
    },

    setTheme(theme) {
        this.set('theme', theme);
        this.applyTheme(theme);
    },

    applyTheme(theme) {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else if (theme === 'light') {
            root.classList.remove('dark');
        } else {
            // System
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.toggle('dark', prefersDark);
        }
    },

    // Language
    getLang() {
        return this.get('lang', 'en');
    },

    setLang(lang) {
        this.set('lang', lang);
    },

    // Wallpaper
    getGlobalWallpaper() {
        return this.get('wallpaper:global', null);
    },

    setGlobalWallpaper(path) {
        this.set('wallpaper:global', path);
    },

    getChatWallpaper(chatId) {
        return this.get(`wallpaper:chat:${chatId}`, null);
    },

    setChatWallpaper(chatId, path) {
        this.set(`wallpaper:chat:${chatId}`, path);
    },

    // Chats metadata (pinned, muted, archived, unread)
    getChatsMetadata() {
        return this.get('chats', {});
    },

    getChatMetadata(chatId) {
        const all = this.getChatsMetadata();
        return all[chatId] || {};
    },

    updateChatMetadata(chatId, updates) {
        const all = this.getChatsMetadata();
        all[chatId] = { ...all[chatId], ...updates };
        this.set('chats', all);
    },

    setPinned(chatId, pinned) {
        this.updateChatMetadata(chatId, { pinned });
    },

    setMuted(chatId, muted) {
        this.updateChatMetadata(chatId, { muted });
    },

    setArchived(chatId, archived) {
        this.updateChatMetadata(chatId, { archived });
    },

    setUnread(chatId, count) {
        this.updateChatMetadata(chatId, { unread: count });
    },

    deleteChat(chatId) {
        const all = this.getChatsMetadata();
        delete all[chatId];
        this.set('chats', all);
        this.remove(`messages:${chatId}`);
    },

    // Messages
    getMessages(chatId) {
        return this.get(`messages:${chatId}`, []);
    },

    setMessages(chatId, messages) {
        this.set(`messages:${chatId}`, messages);
    },

    pushMessage(chatId, message) {
        const messages = this.getMessages(chatId);
        messages.push(message);
        this.setMessages(chatId, messages);
        return message;
    },

    updateMessage(chatId, messageId, updates) {
        const messages = this.getMessages(chatId);
        const index = messages.findIndex(m => m.id === messageId);
        if (index !== -1) {
            messages[index] = { ...messages[index], ...updates };
            this.setMessages(chatId, messages);
        }
    },

    deleteMessage(chatId, messageId) {
        const messages = this.getMessages(chatId);
        const filtered = messages.filter(m => m.id !== messageId);
        this.setMessages(chatId, filtered);
    },

    deleteSelectedMessages(chatId, messageIds) {
        const messages = this.getMessages(chatId);
        const filtered = messages.filter(m => !messageIds.includes(m.id));
        this.setMessages(chatId, filtered);
    },

    toggleReaction(chatId, messageId, emoji) {
        const messages = this.getMessages(chatId);
        const message = messages.find(m => m.id === messageId);
        if (message) {
            message.reactions = message.reactions || [];
            const index = message.reactions.indexOf(emoji);
            if (index > -1) {
                message.reactions.splice(index, 1);
            } else {
                message.reactions.push(emoji);
            }
            this.setMessages(chatId, messages);
        }
    },

    toggleStar(chatId, messageId) {
        const messages = this.getMessages(chatId);
        const message = messages.find(m => m.id === messageId);
        if (message) {
            message.starred = !message.starred;
            this.setMessages(chatId, messages);
        }
    },

    // Status seen tracking
    isStatusSeen(statusId) {
        return this.get(`statuses:seen:${statusId}`, false);
    },

    markStatusSeen(statusId) {
        this.set(`statuses:seen:${statusId}`, true);
    },

    // Settings
    getSettings() {
        return this.get('settings', {
            notifications: true,
            readReceipts: true,
            lastSeen: true,
            autoDownloadMedia: true,
            muteUntil: null
        });
    },

    updateSettings(updates) {
        const settings = this.getSettings();
        this.set('settings', { ...settings, ...updates });
    },

    // User profile
    getUserProfile() {
        return this.get('profile', {
            name: 'You',
            about: 'Hey there! I am using ChatApp.',
            avatar: '/chatapp/media/avatars/me.jpg'
        });
    },

    updateUserProfile(updates) {
        const profile = this.getUserProfile();
        this.set('profile', { ...profile, ...updates });
    }
};

// Initialize theme on load
store.applyTheme(store.getTheme());

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (store.getTheme() === 'system') {
        store.applyTheme('system');
    }
});

export default store;
