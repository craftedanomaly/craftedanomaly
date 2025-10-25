// Bottom Tab Bar Component (Mobile)
import { router } from '../app.js';

export function renderTabbar(activeTab = 'chats') {
    const container = document.getElementById('tabbar-container');
    
    const tabs = [
        { id: 'chats', label: 'Chats', route: '/chats', icon: 'chat' },
        { id: 'status', label: 'Status', route: '/status', icon: 'status' },
        { id: 'calls', label: 'Calls', route: '/calls', icon: 'phone' },
        { id: 'settings', label: 'Settings', route: '/settings', icon: 'settings' }
    ];
    
    const icons = {
        chat: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>`,
        status: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>`,
        phone: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
        </svg>`,
        settings: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>`
    };
    
    container.innerHTML = `
        <nav class="bg-white dark:bg-wa-dark-panel border-t border-gray-200 dark:border-gray-800 flex items-center justify-around py-2 safe-area-inset-bottom">
            ${tabs.map(tab => `
                <button 
                    data-tab="${tab.id}" 
                    data-route="${tab.route}"
                    class="flex flex-col items-center gap-1 px-4 py-2 haptic-btn ${activeTab === tab.id ? 'text-wa-teal' : 'text-gray-500 dark:text-gray-400'}"
                >
                    ${icons[tab.icon]}
                    <span class="text-xs">${tab.label}</span>
                </button>
            `).join('')}
        </nav>
    `;
    
    // Add click handlers
    container.querySelectorAll('[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            const route = btn.dataset.route;
            router.navigate(route);
        });
    });
}

export default renderTabbar;
