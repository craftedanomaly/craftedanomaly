// Settings Component
import store from '../store.js';
import ui from '../ui.js';
import { router } from '../app.js';

export function renderSettings(container) {
    container.innerHTML = '';
    
    const settingsDiv = document.createElement('div');
    settingsDiv.className = 'flex-1 overflow-y-auto';
    
    const profile = store.getUserProfile();
    const settings = store.getSettings();
    const theme = store.getTheme();
    const lang = store.getLang();
    
    // Profile Section
    const profileSection = document.createElement('div');
    profileSection.className = 'p-4 bg-white dark:bg-wa-dark-panel border-b border-gray-200 dark:border-gray-800';
    profileSection.innerHTML = `
        <div class="flex items-center gap-4">
            <div class="relative">
                <img src="${profile.avatar}" alt="Profile" class="w-20 h-20 rounded-full object-cover">
                <button class="absolute bottom-0 right-0 bg-wa-teal text-white rounded-full p-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                    </svg>
                </button>
            </div>
            <div class="flex-1">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">${profile.name}</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">${profile.about}</p>
            </div>
        </div>
    `;
    settingsDiv.appendChild(profileSection);
    
    // Settings Groups
    const groups = [
        {
            title: 'Account',
            items: [
                {
                    label: 'Privacy',
                    icon: 'lock',
                    action: () => showPrivacySettings()
                },
                {
                    label: 'Security',
                    icon: 'shield',
                    action: () => ui.toast('Security settings', 'info')
                },
                {
                    label: 'Change Number',
                    icon: 'phone',
                    action: () => ui.toast('Change number', 'info')
                }
            ]
        },
        {
            title: 'Appearance',
            items: [
                {
                    label: 'Theme',
                    icon: 'palette',
                    value: theme.charAt(0).toUpperCase() + theme.slice(1),
                    action: () => showThemeSelector()
                },
                {
                    label: 'Wallpaper',
                    icon: 'image',
                    action: () => showWallpaperSelector()
                },
                {
                    label: 'Language',
                    icon: 'globe',
                    value: lang === 'en' ? 'English' : 'Türkçe',
                    action: () => showLanguageSelector()
                }
            ]
        },
        {
            title: 'Notifications',
            items: [
                {
                    label: 'Notifications',
                    icon: 'bell',
                    toggle: true,
                    value: settings.notifications,
                    action: (value) => {
                        store.updateSettings({ notifications: value });
                        ui.toast('Notifications ' + (value ? 'enabled' : 'disabled'), 'success');
                    }
                }
            ]
        },
        {
            title: 'Data and Storage',
            items: [
                {
                    label: 'Auto-download Media',
                    icon: 'download',
                    toggle: true,
                    value: settings.autoDownloadMedia,
                    action: (value) => {
                        store.updateSettings({ autoDownloadMedia: value });
                        ui.toast('Auto-download ' + (value ? 'enabled' : 'disabled'), 'success');
                    }
                },
                {
                    label: 'Storage Usage',
                    icon: 'database',
                    action: () => showStorageInfo()
                }
            ]
        },
        {
            title: 'Help',
            items: [
                {
                    label: 'Help Center',
                    icon: 'help',
                    action: () => ui.toast('Help center', 'info')
                },
                {
                    label: 'Contact Us',
                    icon: 'mail',
                    action: () => ui.toast('Contact us', 'info')
                },
                {
                    label: 'Terms and Privacy Policy',
                    icon: 'document',
                    action: () => ui.toast('Terms and privacy', 'info')
                }
            ]
        },
        {
            title: 'Advanced',
            items: [
                {
                    label: 'Reset App',
                    icon: 'refresh',
                    className: 'text-red-600',
                    action: () => resetApp()
                }
            ]
        }
    ];
    
    groups.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'mb-4';
        
        const header = document.createElement('div');
        header.className = 'px-4 py-2 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-600 dark:text-gray-400';
        header.textContent = group.title;
        groupDiv.appendChild(header);
        
        const itemsDiv = document.createElement('div');
        itemsDiv.className = 'bg-white dark:bg-wa-dark-panel divide-y divide-gray-200 dark:divide-gray-800';
        
        group.items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800';
            
            if (item.toggle) {
                itemEl.innerHTML = `
                    <span class="text-gray-900 dark:text-white ${item.className || ''}">${item.label}</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer" ${item.value ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-wa-teal rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-wa-teal"></div>
                    </label>
                `;
                
                const toggle = itemEl.querySelector('input');
                toggle.addEventListener('change', () => {
                    item.action(toggle.checked);
                });
            } else {
                itemEl.className += ' cursor-pointer haptic-btn';
                itemEl.innerHTML = `
                    <span class="text-gray-900 dark:text-white ${item.className || ''}">${item.label}</span>
                    ${item.value ? `<span class="text-sm text-gray-500 dark:text-gray-400">${item.value}</span>` : ''}
                `;
                itemEl.onclick = item.action;
            }
            
            itemsDiv.appendChild(itemEl);
        });
        
        groupDiv.appendChild(itemsDiv);
        settingsDiv.appendChild(groupDiv);
    });
    
    // App version
    const versionDiv = document.createElement('div');
    versionDiv.className = 'p-4 text-center text-sm text-gray-500 dark:text-gray-400';
    versionDiv.textContent = 'ChatApp v1.0.0';
    settingsDiv.appendChild(versionDiv);
    
    container.appendChild(settingsDiv);
}

function showThemeSelector() {
    const content = document.createElement('div');
    content.className = 'py-2';
    
    const themes = [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'system', label: 'System Default' }
    ];
    
    const currentTheme = store.getTheme();
    
    themes.forEach(theme => {
        const btn = document.createElement('button');
        btn.className = `w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 haptic-btn flex items-center justify-between ${
            currentTheme === theme.value ? 'bg-gray-50 dark:bg-gray-800' : ''
        }`;
        btn.innerHTML = `
            <span class="text-gray-700 dark:text-gray-300">${theme.label}</span>
            ${currentTheme === theme.value ? '<svg class="w-5 h-5 text-wa-teal" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>' : ''}
        `;
        btn.onclick = () => {
            store.setTheme(theme.value);
            ui.closeAllModals();
            ui.toast('Theme updated', 'success');
            router.handleRoute();
        };
        content.appendChild(btn);
    });
    
    ui.showModal(content, { title: 'Choose Theme' });
}

function showWallpaperSelector() {
    const wallpapers = [
        { path: null, label: 'None' },
        { path: '/chatapp/media/wallpapers/default.jpg', label: 'Default' },
        { path: '/chatapp/media/wallpapers/pattern1.jpg', label: 'Pattern 1' },
        { path: '/chatapp/media/wallpapers/pattern2.jpg', label: 'Pattern 2' },
        { path: '/chatapp/media/wallpapers/gradient1.jpg', label: 'Gradient' }
    ];
    
    const content = document.createElement('div');
    content.className = 'p-4 grid grid-cols-2 gap-3';
    
    wallpapers.forEach(wp => {
        const btn = document.createElement('button');
        btn.className = 'aspect-video rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-700 hover:border-wa-teal haptic-btn';
        
        if (wp.path) {
            btn.innerHTML = `
                <img src="${wp.path}" alt="${wp.label}" class="w-full h-full object-cover">
                <div class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">${wp.label}</div>
            `;
        } else {
            btn.innerHTML = `
                <div class="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    ${wp.label}
                </div>
            `;
        }
        
        btn.onclick = () => {
            store.setGlobalWallpaper(wp.path);
            ui.closeAllModals();
            ui.toast('Wallpaper updated', 'success');
            router.handleRoute();
        };
        content.appendChild(btn);
    });
    
    ui.showModal(content, { title: 'Select Wallpaper', className: 'max-w-2xl' });
}

function showLanguageSelector() {
    const content = document.createElement('div');
    content.className = 'py-2';
    
    const languages = [
        { value: 'en', label: 'English' },
        { value: 'tr', label: 'Türkçe' }
    ];
    
    const currentLang = store.getLang();
    
    languages.forEach(lang => {
        const btn = document.createElement('button');
        btn.className = `w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 haptic-btn flex items-center justify-between ${
            currentLang === lang.value ? 'bg-gray-50 dark:bg-gray-800' : ''
        }`;
        btn.innerHTML = `
            <span class="text-gray-700 dark:text-gray-300">${lang.label}</span>
            ${currentLang === lang.value ? '<svg class="w-5 h-5 text-wa-teal" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>' : ''}
        `;
        btn.onclick = () => {
            store.setLang(lang.value);
            ui.closeAllModals();
            ui.toast('Language updated', 'success');
            router.handleRoute();
        };
        content.appendChild(btn);
    });
    
    ui.showModal(content, { title: 'Choose Language' });
}

function showPrivacySettings() {
    const content = document.createElement('div');
    content.className = 'py-2';
    
    const settings = store.getSettings();
    
    const privacyItems = [
        {
            label: 'Last Seen',
            value: settings.lastSeen,
            key: 'lastSeen'
        },
        {
            label: 'Read Receipts',
            value: settings.readReceipts,
            key: 'readReceipts'
        }
    ];
    
    privacyItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'px-4 py-3 flex items-center justify-between';
        div.innerHTML = `
            <span class="text-gray-700 dark:text-gray-300">${item.label}</span>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" ${item.value ? 'checked' : ''}>
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-wa-teal rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-wa-teal"></div>
            </label>
        `;
        
        const toggle = div.querySelector('input');
        toggle.addEventListener('change', () => {
            const updates = {};
            updates[item.key] = toggle.checked;
            store.updateSettings(updates);
            ui.toast(`${item.label} ${toggle.checked ? 'enabled' : 'disabled'}`, 'success');
        });
        
        content.appendChild(div);
    });
    
    ui.showModal(content, { title: 'Privacy Settings' });
}

function showStorageInfo() {
    const content = document.createElement('div');
    content.className = 'p-6';
    
    // Calculate storage usage (rough estimate)
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('chatapp:')) {
            totalSize += localStorage.getItem(key).length;
        }
    }
    
    const sizeKB = (totalSize / 1024).toFixed(2);
    
    content.innerHTML = `
        <div class="text-center mb-6">
            <div class="text-4xl font-bold text-wa-teal mb-2">${sizeKB} KB</div>
            <div class="text-gray-600 dark:text-gray-400">Total Storage Used</div>
        </div>
        
        <div class="space-y-3">
            <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Messages</span>
                <span class="font-semibold text-gray-900 dark:text-white">~${(sizeKB * 0.6).toFixed(2)} KB</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Settings</span>
                <span class="font-semibold text-gray-900 dark:text-white">~${(sizeKB * 0.2).toFixed(2)} KB</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Other</span>
                <span class="font-semibold text-gray-900 dark:text-white">~${(sizeKB * 0.2).toFixed(2)} KB</span>
            </div>
        </div>
    `;
    
    ui.showModal(content, { title: 'Storage Usage' });
}

function resetApp() {
    ui.confirm('This will delete all your chats, settings, and data. Are you sure?', () => {
        store.clear();
        ui.toast('App reset successfully', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    });
}

export default renderSettings;
