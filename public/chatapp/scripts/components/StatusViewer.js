// Status Viewer Component (Full-screen)
import { appState, router } from '../app.js';
import store from '../store.js';
import ui from '../ui.js';

export function renderStatusViewer(status) {
    const viewer = document.createElement('div');
    viewer.className = 'fixed inset-0 z-50 bg-black flex flex-col';
    viewer.id = 'status-viewer';
    
    let currentIndex = 0;
    let isPaused = false;
    let timer = null;
    
    // Header
    const header = document.createElement('div');
    header.className = 'absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent';
    
    // Progress bars
    const progressDiv = document.createElement('div');
    progressDiv.className = 'flex gap-1 mb-3';
    status.items.forEach((item, index) => {
        const bar = document.createElement('div');
        bar.className = 'flex-1 status-progress';
        bar.innerHTML = `<div class="status-progress-fill" style="width: 0%"></div>`;
        progressDiv.appendChild(bar);
    });
    header.appendChild(progressDiv);
    
    // User info
    const userInfo = document.createElement('div');
    userInfo.className = 'flex items-center justify-between text-white';
    userInfo.innerHTML = `
        <div class="flex items-center gap-3">
            <img src="${status.user.avatar}" alt="${status.user.name}" class="w-10 h-10 rounded-full object-cover">
            <div>
                <h3 class="font-semibold">${status.user.name}</h3>
                <p class="text-xs opacity-75">${ui.formatTime(status.ts)}</p>
            </div>
        </div>
        <button id="close-status" class="haptic-btn p-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>
    `;
    header.appendChild(userInfo);
    viewer.appendChild(header);
    
    // Content area
    const content = document.createElement('div');
    content.className = 'flex-1 flex items-center justify-center relative';
    content.id = 'status-content';
    viewer.appendChild(content);
    
    // Navigation areas
    const leftNav = document.createElement('div');
    leftNav.className = 'absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer';
    leftNav.onclick = () => previousItem();
    viewer.appendChild(leftNav);
    
    const rightNav = document.createElement('div');
    rightNav.className = 'absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer';
    rightNav.onclick = () => nextItem();
    viewer.appendChild(rightNav);
    
    // Pause on hold
    const centerArea = document.createElement('div');
    centerArea.className = 'absolute left-1/3 right-1/3 top-0 bottom-0';
    
    let holdTimer;
    centerArea.addEventListener('mousedown', () => {
        holdTimer = setTimeout(() => {
            isPaused = true;
            pauseProgress();
        }, 100);
    });
    
    centerArea.addEventListener('mouseup', () => {
        clearTimeout(holdTimer);
        if (isPaused) {
            isPaused = false;
            resumeProgress();
        }
    });
    
    centerArea.addEventListener('mouseleave', () => {
        clearTimeout(holdTimer);
        if (isPaused) {
            isPaused = false;
            resumeProgress();
        }
    });
    
    viewer.appendChild(centerArea);
    
    // Append to body
    document.body.appendChild(viewer);
    
    // Close button
    document.getElementById('close-status').onclick = () => {
        closeViewer();
    };
    
    // ESC to close
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeViewer();
        }
    };
    document.addEventListener('keydown', escHandler);
    
    // Functions
    function showItem(index) {
        const item = status.items[index];
        content.innerHTML = '';
        
        if (item.type === 'image') {
            const img = document.createElement('img');
            img.src = item.src;
            img.className = 'max-w-full max-h-full object-contain';
            content.appendChild(img);
        } else if (item.type === 'video') {
            const video = document.createElement('video');
            video.src = item.src;
            video.className = 'max-w-full max-h-full object-contain';
            video.muted = true;
            video.playsInline = true;
            video.loop = false;
            video.controls = false;
            content.appendChild(video);

            // Try to play immediately
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    console.log('Autoplay failed, showing play button:', error);
                    // Show play button overlay if autoplay fails
                    const overlayBtn = document.createElement('button');
                    overlayBtn.className = 'absolute inset-0 flex items-center justify-center bg-black/60 text-white z-10';
                    overlayBtn.innerHTML = `
                        <svg class="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                    `;
                    overlayBtn.onclick = () => {
                        video.play();
                        overlayBtn.remove();
                    };
                    content.appendChild(overlayBtn);
                });
            }

            const muteBtn = document.createElement('button');
            muteBtn.className = 'absolute bottom-4 right-4 bg-black/50 text-white rounded-full p-3 haptic-btn';
            muteBtn.innerHTML = `
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
            `;
            muteBtn.onclick = () => {
                video.muted = !video.muted;
                muteBtn.innerHTML = video.muted ? `
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                ` : `
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clip-rule="evenodd"/>
                    </svg>
                `;
            };
            content.appendChild(muteBtn);
        }
        
        startProgress(index, item.duration);
    }
    
    function startProgress(index, duration) {
        const bars = progressDiv.querySelectorAll('.status-progress');
        const currentBar = bars[index].querySelector('.status-progress-fill');
        
        let progress = 0;
        const interval = 50;
        const increment = (interval / duration) * 100;
        
        timer = setInterval(() => {
            if (!isPaused) {
                progress += increment;
                currentBar.style.width = Math.min(progress, 100) + '%';
                
                if (progress >= 100) {
                    clearInterval(timer);
                    nextItem();
                }
            }
        }, interval);
    }
    
    function pauseProgress() {
        // Progress paused, timer continues but doesn't increment
    }
    
    function resumeProgress() {
        // Progress resumes
    }
    
    function nextItem() {
        clearInterval(timer);
        
        if (currentIndex < status.items.length - 1) {
            // Mark previous as complete
            const bars = progressDiv.querySelectorAll('.status-progress');
            bars[currentIndex].querySelector('.status-progress-fill').style.width = '100%';
            
            currentIndex++;
            showItem(currentIndex);
        } else {
            // End of status, mark as seen and close
            store.markStatusSeen(status.id);
            closeViewer();
        }
    }
    
    function previousItem() {
        clearInterval(timer);
        
        if (currentIndex > 0) {
            // Reset current
            const bars = progressDiv.querySelectorAll('.status-progress');
            bars[currentIndex].querySelector('.status-progress-fill').style.width = '0%';
            
            currentIndex--;
            // Reset previous
            bars[currentIndex].querySelector('.status-progress-fill').style.width = '0%';
            
            showItem(currentIndex);
        }
    }
    
    function closeViewer() {
        clearInterval(timer);
        document.removeEventListener('keydown', escHandler);
        viewer.remove();
        
        // Mark as seen if viewed at least one item
        if (currentIndex > 0 || status.items.length === 1) {
            store.markStatusSeen(status.id);
        }
        
        router.navigate('/status');
    }
    
    // Start with first item
    showItem(0);
}

export default renderStatusViewer;
