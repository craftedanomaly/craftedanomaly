// Status List Component
import { appState, router } from '../app.js';
import store from '../store.js';
import ui from '../ui.js';

export function renderStatusList(container) {
    container.innerHTML = '';
    
    const listDiv = document.createElement('div');
    listDiv.className = 'flex-1 overflow-y-auto';
    
    // My Status
    const myStatusDiv = document.createElement('div');
    myStatusDiv.className = 'p-4 border-b border-gray-200 dark:border-gray-800';
    
    const profile = store.getUserProfile();
    myStatusDiv.innerHTML = `
        <div class="flex items-center gap-3">
            <div class="relative">
                <img src="${profile.avatar}" alt="My Status" class="w-14 h-14 rounded-full object-cover">
                <button class="absolute bottom-0 right-0 bg-wa-teal text-white rounded-full p-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                </button>
            </div>
            <div class="flex-1">
                <h3 class="font-semibold text-gray-900 dark:text-white">My Status</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Tap to add status update</p>
            </div>
        </div>
    `;
    
    myStatusDiv.onclick = () => {
        ui.toast('Add status feature coming soon!', 'info');
    };
    
    listDiv.appendChild(myStatusDiv);
    
    // Recent updates
    const unseenStatuses = appState.statuses.filter(s => !store.isStatusSeen(s.id));
    const seenStatuses = appState.statuses.filter(s => store.isStatusSeen(s.id));
    
    if (unseenStatuses.length > 0) {
        const recentHeader = document.createElement('div');
        recentHeader.className = 'px-4 py-2 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-600 dark:text-gray-400';
        recentHeader.textContent = 'Recent updates';
        listDiv.appendChild(recentHeader);
        
        unseenStatuses.forEach(status => {
            listDiv.appendChild(createStatusItem(status, false));
        });
    }
    
    // Viewed updates
    if (seenStatuses.length > 0) {
        const viewedHeader = document.createElement('div');
        viewedHeader.className = 'px-4 py-2 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-600 dark:text-gray-400';
        viewedHeader.textContent = 'Viewed updates';
        listDiv.appendChild(viewedHeader);
        
        seenStatuses.forEach(status => {
            listDiv.appendChild(createStatusItem(status, true));
        });
    }
    
    if (appState.statuses.length === 0) {
        listDiv.innerHTML += `
            <div class="flex flex-col items-center justify-center p-8 text-center">
                <svg class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                <p class="text-gray-500 dark:text-gray-400">No status updates</p>
            </div>
        `;
    }
    
    container.appendChild(listDiv);
}

function createStatusItem(status, viewed) {
    const item = document.createElement('button');
    item.className = 'w-full p-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 haptic-btn border-b border-gray-200 dark:border-gray-800';
    
    item.innerHTML = `
        <div class="relative ${viewed ? 'status-ring-viewed' : 'status-ring'}">
            <img src="${status.user.avatar}" alt="${status.user.name}" class="w-14 h-14 rounded-full object-cover">
        </div>
        <div class="flex-1 text-left">
            <h3 class="font-semibold text-gray-900 dark:text-white">${status.user.name}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">${ui.formatTime(status.ts)}</p>
        </div>
    `;
    
    item.onclick = () => {
        router.navigate(`/status/${status.id}`);
    };
    
    return item;
}

export default renderStatusList;
