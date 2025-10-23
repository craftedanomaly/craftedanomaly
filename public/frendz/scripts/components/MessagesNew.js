const ME_USER_ID = 'me';

// Otomatik cevap mesajları - bu listeyi değiştirebilirsiniz
const AUTO_REPLIES = [
  'Thanks for your message! 😊',
  'Got it, will check that out!',
  'Sounds good to me! 👍',
  'Absolutely! Let\'s do it',
  'That\'s awesome! 🔥',
  'I agree completely',
  'Perfect timing!',
  'Can\'t wait! ✨',
  'You\'re the best!',
  'Haha, love it! 😄',
];

function formatTimestamp(iso) {
  try {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    return '';
  }
}

function getRandomReply() {
  return AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
}

export function createMessagesPage({ threads = [], onSelectThread }) {
  const state = {
    threads: threads.map((thread) => ({
      ...thread,
      messages: thread.messages ? [...thread.messages] : [],
    })),
    activeId: null,
    chatOpen: false,
  };

  const container = document.createElement('div');
  container.className = 'h-full flex bg-slate-50 dark:bg-slate-950/60';

  // Left panel - Contact list
  const listPanel = document.createElement('aside');
  listPanel.className = 'w-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col';

  const listHeader = document.createElement('header');
  listHeader.className = 'px-4 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur';
  listHeader.innerHTML = `
    <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Messages</h2>
    <button type="button" class="h-9 px-3 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium">New</button>
  `;
  const newButton = listHeader.querySelector('button');
  newButton.addEventListener('click', () => alert('New chat coming soon'));

  const threadContainer = document.createElement('div');
  threadContainer.className = 'flex-1 overflow-y-auto';

  // Right panel - Chat (slide in from right)
  const chatPanel = document.createElement('section');
  chatPanel.className = [
    'fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-slate-900',
    'transform transition-transform duration-300 ease-out z-40',
    'translate-x-full flex flex-col shadow-2xl'
  ].join(' ');

  function getThreadById(id) {
    return state.threads.find((thread) => thread.id === id);
  }

  function renderThreadList() {
    threadContainer.replaceChildren();
    if (state.threads.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'px-6 py-12 text-sm text-slate-500 dark:text-slate-400';
      empty.textContent = 'No conversations yet';
      threadContainer.appendChild(empty);
      return;
    }

    state.threads.forEach((thread) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = [
        'w-full px-4 py-3 flex items-center gap-3 transition text-left',
        'hover:bg-slate-100 dark:hover:bg-slate-800/60 active:scale-[0.99]',
        thread.id === state.activeId && state.chatOpen ? 'bg-slate-100 dark:bg-slate-800/60' : 'bg-transparent'
      ].join(' ');

      button.innerHTML = `
        <img src="${thread.user?.avatar ?? './images/avatars/placeholder.jpg'}" alt="${thread.user?.name ?? 'User'}" class="h-14 w-14 rounded-full object-cover" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">${thread.user?.name ?? 'Unknown'}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">${thread.messages?.[thread.messages.length - 1]?.text ?? 'Say hi!'}</p>
        </div>
        ${thread.unread ? `<span class="inline-flex h-5 px-2 items-center justify-center rounded-full text-[11px] font-semibold bg-brand/20 text-brand">${thread.unread}</span>` : ''}
      `;

      button.addEventListener('click', () => {
        state.activeId = thread.id;
        state.chatOpen = true;
        thread.unread = 0;
        renderThreadList();
        renderChat();
        openChat();
      });

      threadContainer.appendChild(button);
    });
  }

  function openChat() {
    chatPanel.classList.remove('translate-x-full');
    chatPanel.classList.add('translate-x-0');
  }

  function closeChat() {
    chatPanel.classList.remove('translate-x-0');
    chatPanel.classList.add('translate-x-full');
    setTimeout(() => {
      state.chatOpen = false;
      state.activeId = null;
      renderThreadList();
    }, 300);
  }

  function renderChat() {
    const thread = getThreadById(state.activeId);
    chatPanel.replaceChildren();

    if (!thread) {
      closeChat();
      return;
    }

    const header = document.createElement('header');
    header.className = 'px-5 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur';
    header.innerHTML = `
      <div class="flex items-center gap-3">
        <button type="button" class="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center sm:hidden" data-action="back">
          <img src="./icons/close.svg" alt="Back" class="h-5 w-5" />
        </button>
        <img src="${thread.user?.avatar ?? './images/avatars/placeholder.jpg'}" alt="${thread.user?.name ?? 'User'}" class="h-12 w-12 rounded-full object-cover" />
        <div>
          <p class="text-sm font-semibold text-slate-900 dark:text-white">${thread.user?.name ?? 'Unknown'}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">Active now</p>
        </div>
      </div>
      <button type="button" class="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hidden sm:flex" data-action="close">
        <img src="./icons/close.svg" alt="Close" class="h-5 w-5" />
      </button>
    `;

    const backButton = header.querySelector('[data-action="back"]');
    const closeButton = header.querySelector('[data-action="close"]');
    
    if (backButton) {
      backButton.addEventListener('click', closeChat);
    }
    if (closeButton) {
      closeButton.addEventListener('click', closeChat);
    }

    const messagesWrapper = document.createElement('div');
    messagesWrapper.className = 'flex-1 overflow-y-auto px-5 py-6 space-y-3';

    function appendMessageBubble(message) {
      const mine = message.from === ME_USER_ID;
      const bubble = document.createElement('div');
      bubble.className = [
        'max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm',
        mine
          ? 'ml-auto bg-brand text-white rounded-br-sm'
          : 'mr-auto bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white rounded-bl-sm border border-slate-200/60 dark:border-slate-700'
      ].join(' ');

      bubble.innerHTML = `
        <p>${message.text}</p>
        <span class="block mt-1 text-[11px] opacity-70">${formatTimestamp(message.ts)}</span>
      `;

      messagesWrapper.appendChild(bubble);
      messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
    }

    thread.messages.forEach((message) => appendMessageBubble(message));

    const form = document.createElement('form');
    form.className = 'px-4 py-3 flex items-center gap-3 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur';
    form.innerHTML = `
      <button type="button" class="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <img src="./icons/plus.svg" alt="Add" class="h-5 w-5" />
      </button>
      <input type="text" placeholder="Message..." class="flex-1 h-10 rounded-full bg-slate-100 dark:bg-slate-800 px-4 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand" />
      <button type="submit" class="h-10 w-10 rounded-full bg-brand text-white flex items-center justify-center">
        <img src="./icons/send.svg" alt="Send" class="h-4 w-4" />
      </button>
    `;

    const input = form.querySelector('input');
    const dummyAttach = form.querySelector('button[type="button"]');
    dummyAttach.addEventListener('click', () => alert('Attachments coming soon'));

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = input.value.trim();
      if (!value) return;

      const newMessage = {
        id: `${Date.now()}`,
        from: ME_USER_ID,
        text: value,
        ts: new Date().toISOString(),
      };

      thread.messages = [...thread.messages, newMessage];
      onSelectThread?.(thread.id, thread.messages);
      input.value = '';
      appendMessageBubble(newMessage);

      // Auto-reply after 5 seconds
      setTimeout(() => {
        const replyMessage = {
          id: `${Date.now()}-reply`,
          from: thread.user.id,
          text: getRandomReply(),
          ts: new Date().toISOString(),
        };
        thread.messages = [...thread.messages, replyMessage];
        onSelectThread?.(thread.id, thread.messages);
        appendMessageBubble(replyMessage);
      }, 5000);
    });

    chatPanel.append(header, messagesWrapper, form);
    requestAnimationFrame(() => {
      messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
    });
  }

  renderThreadList();

  listPanel.append(listHeader, threadContainer);
  container.append(listPanel, chatPanel);

  return container;
}
