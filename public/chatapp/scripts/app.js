// Main App - Router & State Management
import store from './store.js';
import ui from './ui.js';
import { renderHeader } from './components/Header.js';
import { renderTabbar } from './components/Tabbar.js';
import { renderChatsList } from './components/ChatsList.js';
import { renderChatView } from './components/ChatView.js';
import { renderStatusList } from './components/StatusList.js';
import { renderStatusViewer } from './components/StatusViewer.js';
import { renderCalls } from './components/Calls.js';
import { renderSettings } from './components/Settings.js';
import { initializeMessages } from './initMessages.js';

// App State
export const appState = {
    users: [],
    chats: [],
    statuses: [],
    calls: [],
    currentRoute: '',
    currentChatId: null,
    currentStatusId: null,
    searchQuery: '',
    selectionMode: false,
    selectedMessages: [],
    typingUsers: new Set()
};

// Load mock data
async function loadData() {
    try {
        ui.showLoading();
        
        const [users, chats, statuses, calls] = await Promise.all([
            fetch('/chatapp/data/users.json').then(r => r.json()),
            fetch('/chatapp/data/chats.json').then(r => r.json()),
            fetch('/chatapp/data/statuses.json').then(r => r.json()),
            fetch('/chatapp/data/calls.json').then(r => r.json())
        ]);
        
        appState.users = users;
        appState.chats = chats;
        appState.statuses = statuses;
        appState.calls = calls;
        
        // Merge with localStorage metadata
        appState.chats = appState.chats.map(chat => {
            const meta = store.getChatMetadata(chat.id);
            return { ...chat, ...meta };
        });
        
        // Initialize messages if not present
        initializeMessages();
        
        ui.hideLoading();
        return true;
    } catch (error) {
        console.error('Failed to load data:', error);
        ui.hideLoading();
        ui.toast('Failed to load data. Using cached data.', 'error');
        return false;
    }
}

// Router
class Router {
    constructor() {
        this.routes = {
            '/chats': this.renderChats.bind(this),
            '/chat/:id': this.renderChat.bind(this),
            '/status': this.renderStatus.bind(this),
            '/status/:id': this.renderStatusView.bind(this),
            '/calls': this.renderCallsList.bind(this),
            '/settings': this.renderSettingsPage.bind(this),
            '/search': this.renderSearch.bind(this)
        };
        
        this.currentRoute = null;
        this.params = {};
    }
    
    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.navigate('/search');
            }
            
            // ESC to close modals or exit selection mode
            if (e.key === 'Escape') {
                if (appState.selectionMode) {
                    appState.selectionMode = false;
                    appState.selectedMessages = [];
                    this.handleRoute();
                }
            }
        });
    }
    
    handleRoute() {
        const hash = window.location.hash.slice(1) || '/chats';
        appState.currentRoute = hash;
        
        // Match route
        for (const [pattern, handler] of Object.entries(this.routes)) {
            const match = this.matchRoute(pattern, hash);
            if (match) {
                this.params = match.params;
                handler(match.params);
                return;
            }
        }
        
        // Default to chats
        this.navigate('/chats');
    }
    
    matchRoute(pattern, path) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        
        if (patternParts.length !== pathParts.length) {
            return null;
        }
        
        const params = {};
        
        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                const paramName = patternParts[i].slice(1);
                params[paramName] = pathParts[i];
            } else if (patternParts[i] !== pathParts[i]) {
                return null;
            }
        }
        
        return { params };
    }
    
    navigate(path) {
        window.location.hash = path;
    }
    
    // Route Handlers
    renderChats() {
        appState.currentChatId = null;
        renderHeader('Chats');
        renderTabbar('chats');
        
        const sidebar = document.getElementById('sidebar-content');
        renderChatsList(sidebar);

        const sidebarContainer = document.getElementById('sidebar');
        const mainContainer = document.getElementById('main-view');
        if (window.innerWidth < 768) {
            sidebarContainer?.classList.remove('hidden');
            mainContainer?.classList.add('hidden');
            mainContainer?.classList.remove('flex', 'mobile-full');
        }
        
        // Desktop: show welcome screen
        const mainView = document.getElementById('main-content');
        if (window.innerWidth >= 768) {
            mainView.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-center p-8">
                    <svg class="w-32 h-32 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                    <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">ChatApp Web</h2>
                    <p class="text-gray-500 dark:text-gray-400">Select a chat to start messaging</p>
                </div>
            `;
        }
    }
    
    renderChat(params) {
        const chatId = params.id;
        appState.currentChatId = chatId;
        
        const chat = appState.chats.find(c => c.id === chatId);
        if (!chat) {
            this.navigate('/chats');
            return;
        }
        
        renderHeader(chat.user.name, chat);
        
        const mainView = document.getElementById('main-content');
        const sidebar = document.getElementById('sidebar');
        const mainContainer = document.getElementById('main-view');

        // Mobile: hide sidebar, show main view
        if (window.innerWidth < 768) {
            sidebar.classList.add('hidden');
            mainContainer?.classList.remove('hidden');
            mainContainer?.classList.add('flex', 'mobile-full');
        } else {
            sidebar.classList.remove('hidden');
            mainContainer?.classList.remove('mobile-full');
        }

        renderChatView(mainView, chat);
    }
    
    renderStatus() {
        renderHeader('Status');
        renderTabbar('status');
        
        const sidebar = document.getElementById('sidebar-content');
        renderStatusList(sidebar);
        
        const mainView = document.getElementById('main-content');
        if (window.innerWidth >= 768) {
            mainView.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-center p-8">
                    <svg class="w-32 h-32 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                    <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</h2>
                    <p class="text-gray-500 dark:text-gray-400">Click on a status to view</p>
                </div>
            `;
        }
    }
    
    renderStatusView(params) {
        const statusId = params.id;
        appState.currentStatusId = statusId;
        
        const status = appState.statuses.find(s => s.id === statusId);
        if (!status) {
            this.navigate('/status');
            return;
        }
        
        renderStatusViewer(status);
    }
    
    renderCallsList() {
        renderHeader('Calls');
        renderTabbar('calls');
        
        const sidebar = document.getElementById('sidebar-content');
        renderCalls(sidebar);
        
        const mainView = document.getElementById('main-content');
        if (window.innerWidth >= 768) {
            mainView.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-center p-8">
                    <svg class="w-32 h-32 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Calls</h2>
                    <p class="text-gray-500 dark:text-gray-400">Your call history</p>
                </div>
            `;
        }
    }
    
    renderSettingsPage() {
        renderHeader('Settings');
        renderTabbar('settings');
        
        const sidebar = document.getElementById('sidebar-content');
        renderSettings(sidebar);
        
        const mainView = document.getElementById('main-content');
        mainView.innerHTML = '';
    }
    
    renderSearch() {
        // TODO: Implement search
        this.navigate('/chats');
    }
}

// Initialize app
const router = new Router();

async function init() {
    console.log('🚀 ChatApp initializing...');
    
    // Load data
    await loadData();
    
    // Initialize router
    router.init();
    
    // Register service worker (PWA)
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/chatapp/sw.js', {
                scope: '/chatapp/'
            });
            console.log('✅ Service Worker registered');
        } catch (error) {
            console.log('ℹ️ Service Worker registration failed:', error);
        }
    }
    
    // Install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log('💡 Install prompt available');
    });
    
    console.log('✅ ChatApp ready!');
}

// Start the app
init();

// Export for use in components
export { router, loadData };
