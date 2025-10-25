// Calls Component
import { appState } from '../app.js';
import ui from '../ui.js';

export function renderCalls(container) {
    container.innerHTML = '';
    
    const listDiv = document.createElement('div');
    listDiv.className = 'flex-1 overflow-y-auto';
    
    if (appState.calls.length === 0) {
        listDiv.innerHTML = `
            <div class="flex flex-col items-center justify-center p-8 text-center">
                <svg class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <p class="text-gray-500 dark:text-gray-400">No calls yet</p>
            </div>
        `;
    } else {
        appState.calls.forEach(call => {
            const user = appState.users.find(u => u.id === call.userId);
            if (!user) return;
            
            const item = document.createElement('button');
            item.className = 'w-full p-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 haptic-btn border-b border-gray-200 dark:border-gray-800';
            
            const directionIcon = call.direction === 'incoming' 
                ? '<svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path d="M14.414 7l3.293-3.293a1 1 0 00-1.414-1.414L13 5.586V4a1 1 0 10-2 0v4.003a.996.996 0 00.617.921A.997.997 0 0012 9h4a1 1 0 100-2h-1.586z"/></svg>'
                : call.direction === 'outgoing'
                ? '<svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M17.924 2.617a.997.997 0 00-.215-.322l-.004-.004A.997.997 0 0017 2h-4a1 1 0 100 2h1.586l-3.293 3.293a1 1 0 001.414 1.414L16 5.414V7a1 1 0 102 0V3a.997.997 0 00-.076-.383z"/></svg>'
                : '<svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M14.414 7l3.293-3.293a1 1 0 00-1.414-1.414L13 5.586V4a1 1 0 10-2 0v4.003a.996.996 0 00.617.921A.997.997 0 0012 9h4a1 1 0 100-2h-1.586z"/></svg>';
            
            const typeIcon = call.type === 'video'
                ? '<svg class="w-5 h-5 text-wa-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>'
                : '<svg class="w-5 h-5 text-wa-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>';
            
            item.innerHTML = `
                <img src="${user.avatar}" alt="${user.name}" class="w-12 h-12 rounded-full object-cover">
                <div class="flex-1 text-left">
                    <div class="flex items-center gap-2">
                        <h3 class="font-semibold text-gray-900 dark:text-white">${user.name}</h3>
                        ${directionIcon}
                    </div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        ${call.direction === 'missed' ? 'Missed call' : ui.formatTime(call.ts)}
                        ${call.duration ? ` • ${formatDuration(call.duration)}` : ''}
                    </p>
                </div>
                <div class="flex items-center gap-2">
                    ${typeIcon}
                </div>
            `;
            
            item.onclick = () => {
                startCall(user, call.type);
            };
            
            listDiv.appendChild(item);
        });
    }
    
    container.appendChild(listDiv);
    
    // Floating action button
    const fab = document.createElement('button');
    fab.className = 'fixed bottom-20 md:bottom-6 right-6 bg-wa-teal text-white rounded-full p-4 shadow-lg hover:bg-wa-green-light haptic-btn';
    fab.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
    `;
    fab.onclick = () => {
        ui.toast('New call feature coming soon!', 'info');
    };
    container.appendChild(fab);
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

function startCall(user, type) {
    const content = document.createElement('div');
    content.className = 'flex flex-col items-center justify-center p-8 bg-gradient-to-b from-wa-green to-wa-green-light text-white min-h-[400px]';
    
    let duration = 0;
    let timer;
    
    content.innerHTML = `
        <img src="${user.avatar}" alt="${user.name}" class="w-32 h-32 rounded-full object-cover mb-6 ring-4 ring-white/30">
        <h2 class="text-2xl font-semibold mb-2">${user.name}</h2>
        <p class="text-lg mb-8" id="call-status">Calling...</p>
        <p class="text-3xl font-mono mb-12" id="call-timer">00:00</p>
        
        <div class="flex gap-6">
            <button id="mute-btn" class="bg-white/20 hover:bg-white/30 rounded-full p-4 haptic-btn">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd"/>
                </svg>
            </button>
            
            ${type === 'video' ? `
                <button id="camera-btn" class="bg-white/20 hover:bg-white/30 rounded-full p-4 haptic-btn">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                </button>
            ` : ''}
            
            <button id="end-call-btn" class="bg-red-500 hover:bg-red-600 rounded-full p-4 haptic-btn">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
            </button>
        </div>
    `;
    
    const modal = ui.showModal(content, { fullscreen: true, showClose: false });
    
    // Simulate call connection
    setTimeout(() => {
        document.getElementById('call-status').textContent = 'Connected';
        
        // Start timer
        timer = setInterval(() => {
            duration++;
            const mins = Math.floor(duration / 60);
            const secs = duration % 60;
            document.getElementById('call-timer').textContent = 
                `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }, 1000);
    }, 2000);
    
    // End call button
    document.getElementById('end-call-btn').onclick = () => {
        clearInterval(timer);
        ui.closeModal(modal);
        ui.toast('Call ended', 'info');
    };
    
    // Mute button
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.onclick = () => {
            ui.toast('Microphone muted', 'info');
        };
    }
    
    // Camera button
    const cameraBtn = document.getElementById('camera-btn');
    if (cameraBtn) {
        cameraBtn.onclick = () => {
            ui.toast('Camera toggled', 'info');
        };
    }
}

export default renderCalls;
