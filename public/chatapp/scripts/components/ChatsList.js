// Chats List Component
import { appState, router } from '../app.js';
import store from '../store.js';
import ui from '../ui.js';
import { renderSearchBar } from './SearchBar.js';

export function renderChatsList(container) {
    container.innerHTML = '';
    
    // Search bar
    const searchInput = renderSearchBar(container, (query) => {
        appState.searchQuery = query;
        renderChatsList(container);
    });
    
    // List container
    const listDiv = document.createElement('div');
    listDiv.className = 'flex-1 overflow-y-auto';
    
    // Filter chats
    let chats = [...appState.chats];
    
    // Apply search filter
    if (appState.searchQuery) {
        const query = appState.searchQuery.toLowerCase();
        chats = chats.filter(chat => 
            chat.user.name.toLowerCase().includes(query) ||
            chat.lastMessage?.text?.toLowerCase().includes(query)
        );
    }
    
    // Separate archived
    const archivedChats = chats.filter(c => c.archived);
    const activeChats = chats.filter(c => !c.archived);
    
    // Sort: pinned first, then by last message time
    activeChats.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        
        const aTime = new Date(a.lastMessage?.ts || 0);
        const bTime = new Date(b.lastMessage?.ts || 0);
        return bTime - aTime;
    });
    
    // Archived chats section
    if (archivedChats.length > 0 && !appState.searchQuery) {
        const archivedBtn = document.createElement('button');
        archivedBtn.className = 'w-full p-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 haptic-btn border-b border-gray-200 dark:border-gray-800';
        archivedBtn.innerHTML = `
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
            </svg>
            <span class="text-gray-700 dark:text-gray-300">Archived</span>
            <span class="ml-auto text-sm text-gray-500">${archivedChats.length}</span>
        `;
        archivedBtn.onclick = () => showArchivedChats(archivedChats);
        listDiv.appendChild(archivedBtn);
    }
    
    // Render active chats
    if (activeChats.length === 0) {
        listDiv.innerHTML += `
            <div class="flex flex-col items-center justify-center p-8 text-center">
                <svg class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                <p class="text-gray-500 dark:text-gray-400">No chats found</p>
            </div>
        `;
    } else {
        activeChats.forEach(chat => {
            const item = createChatItem(chat);
            listDiv.appendChild(item);
        });
    }
    
    container.appendChild(listDiv);
}

function createChatItem(chat) {
    const item = document.createElement('div');
    item.className = 'relative';
    
    const button = document.createElement('button');
    button.className = 'w-full p-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 haptic-btn border-b border-gray-200 dark:border-gray-800 transition-smooth';
    
    // Get last message from localStorage
    const messages = store.getMessages(chat.id);
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : chat.lastMessage;
    
    // Update chat object with actual last message
    if (lastMessage) {
        chat.lastMessage = {
            type: lastMessage.type || 'text',
            text: lastMessage.text || '',
            ts: lastMessage.ts,
            from: lastMessage.from,
            status: lastMessage.status || 'sent'
        };
    }
    
    // Status ticks
    let statusIcon = '';
    if (lastMessage?.from === 'me') {
        if (lastMessage.status === 'read') {
            statusIcon = '<span class="text-blue-500">✓✓</span>';
        } else if (lastMessage.status === 'delivered') {
            statusIcon = '<span class="text-gray-500">✓✓</span>';
        } else {
            statusIcon = '<span class="text-gray-500">✓</span>';
        }
    }
    
    button.innerHTML = `
        <div class="relative flex-shrink-0">
            <img src="${chat.user.avatar}" alt="${chat.user.name}" class="w-12 h-12 rounded-full object-cover">
            ${chat.pinned ? '<div class="absolute -top-1 -right-1 w-4 h-4 bg-wa-teal rounded-full flex items-center justify-center"><svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78.409 1.574 1.215 1.574H9.667c.806 0 1.465-.793 1.215-1.574L10.064 10.274A1 1 0 0110 10V4a1 1 0 00-2 0v6c0 .057.005.113.014.168z"/></svg></div>' : ''}
        </div>
        
        <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
                <h3 class="font-semibold text-gray-900 dark:text-white truncate">${chat.user.name}</h3>
                <span class="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                    ${ui.formatTime(chat.lastMessage?.ts)}
                </span>
            </div>
            <div class="flex items-center justify-between">
                <p class="text-sm text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
                    ${statusIcon}
                    ${chat.muted ? '<svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>' : ''}
                    <span class="truncate">${chat.lastMessage?.text || 'No messages yet'}</span>
                </p>
                ${chat.unread > 0 ? `<span class="bg-wa-teal text-white text-xs rounded-full px-2 py-0.5 ml-2 flex-shrink-0">${chat.unread}</span>` : ''}
            </div>
        </div>
    `;
    
    // Click to open chat
    button.onclick = () => {
        router.navigate(`/chat/${chat.id}`);
    };
    
    // Long press / right click for menu
    let pressTimer;
    button.addEventListener('mousedown', (e) => {
        if (e.button === 2) return; // Right click handled separately
        pressTimer = setTimeout(() => {
            ui.haptic(20);
            showChatContextMenu(chat, item);
        }, 500);
    });
    
    button.addEventListener('mouseup', () => {
        clearTimeout(pressTimer);
    });
    
    button.addEventListener('mouseleave', () => {
        clearTimeout(pressTimer);
    });
    
    button.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showChatContextMenu(chat, item);
    });
    
    item.appendChild(button);
    return item;
}

function showChatContextMenu(chat, itemElement) {
    const content = document.createElement('div');
    content.className = 'py-2';
    
    const actions = [
        {
            label: chat.pinned ? 'Unpin' : 'Pin',
            icon: 'pin',
            action: () => {
                chat.pinned = !chat.pinned;
                store.setPinned(chat.id, chat.pinned);
                ui.toast(chat.pinned ? 'Chat pinned' : 'Chat unpinned', 'success');
                import('../app.js').then(({ router }) => router.handleRoute());
            }
        },
        {
            label: chat.muted ? 'Unmute' : 'Mute',
            icon: 'bell',
            action: () => {
                chat.muted = !chat.muted;
                store.setMuted(chat.id, chat.muted);
                ui.toast(chat.muted ? 'Chat muted' : 'Chat unmuted', 'success');
                import('../app.js').then(({ router }) => router.handleRoute());
            }
        },
        {
            label: chat.archived ? 'Unarchive' : 'Archive',
            icon: 'archive',
            action: () => {
                chat.archived = !chat.archived;
                store.setArchived(chat.id, chat.archived);
                ui.toast(chat.archived ? 'Chat archived' : 'Chat unarchived', 'success');
                import('../app.js').then(({ router }) => router.handleRoute());
            }
        },
        {
            label: 'Mark as Read',
            icon: 'check',
            action: () => {
                chat.unread = 0;
                store.setUnread(chat.id, 0);
                ui.toast('Marked as read', 'success');
                import('../app.js').then(({ router }) => router.handleRoute());
            }
        },
        {
            label: 'Delete Chat',
            icon: 'trash',
            className: 'text-red-600',
            action: () => {
                ui.confirm('Delete this chat?', () => {
                    store.deleteChat(chat.id);
                    const index = appState.chats.findIndex(c => c.id === chat.id);
                    if (index > -1) {
                        appState.chats.splice(index, 1);
                    }
                    ui.toast('Chat deleted', 'success');
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
    
    ui.showModal(content, { title: chat.user.name });
}

function showArchivedChats(archivedChats) {
    const content = document.createElement('div');
    content.className = 'divide-y divide-gray-200 dark:divide-gray-800';
    
    archivedChats.forEach(chat => {
        const item = createChatItem(chat);
        content.appendChild(item);
    });
    
    ui.showModal(content, { title: 'Archived Chats', className: 'max-w-2xl' });
}

export default renderChatsList;
