// Search Bar Component
export function renderSearchBar(container, onSearch) {
    const searchDiv = document.createElement('div');
    searchDiv.className = 'p-3 bg-white dark:bg-wa-dark-panel border-b border-gray-200 dark:border-gray-800';
    searchDiv.innerHTML = `
        <div class="relative">
            <input 
                type="text" 
                id="search-input"
                placeholder="Search or start new chat"
                class="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-wa-dark-input text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-wa-teal"
            >
            <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
        </div>
    `;
    
    container.insertBefore(searchDiv, container.firstChild);
    
    const input = document.getElementById('search-input');
    input.addEventListener('input', (e) => {
        if (onSearch) {
            onSearch(e.target.value);
        }
    });
    
    return input;
}

export default renderSearchBar;
