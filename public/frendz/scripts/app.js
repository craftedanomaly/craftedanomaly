import { mountSplash } from './components/Splash.js';
import { createHeader } from './components/Header.js';
import { createBottomNav } from './components/BottomNav.js';
import { createStoryBar } from './components/StoryBar.js';
import { createFeed } from './components/Feed.js';
import { createMessagesPage } from './components/MessagesNew.js';
import { createSearchPage } from './components/SearchFriends.js';
import { createProfilePage } from './components/Profile.js';
import { mountStoryViewer } from './components/StoryViewer.js';
import { mountPostModal } from './components/PostModal.js';
import { mountCreateModal } from './components/UploadModal.js';
import { mountCommentsModal } from './components/CommentsModal.js';

const LOCAL_KEYS = {
  theme: 'theme',
  muted: 'muted',
  customPosts: 'customPosts',
};

const root = document.getElementById('app');
let appShell;
let headerSlot;
let mainSlot;
let navSlot;
let splash;
let currentStoryModal;
let currentPostModal;
let currentCreateModal;
let currentCommentsModal;

const appState = {
  ready: false,
  loading: true,
  route: '/home',
  modal: null,
  posts: [],
  stories: [],
  messages: [],
  likes: new Map(),
  saved: new Map(),
  storySeen: new Map(),
  threadMessages: new Map(),
  customPosts: [],
  muted: true,
  theme: 'light',
  searchTerm: '',
};

function storageKey(scope, id) {
  return `${scope}:${id}`;
}

const store = {
  getLike(id) {
    return localStorage.getItem(storageKey('likes', id)) === 'true';
  },
  setLike(id, value) {
    localStorage.setItem(storageKey('likes', id), value ? 'true' : 'false');
  },
  getSaved(id) {
    return localStorage.getItem(storageKey('saved', id)) === 'true';
  },
  setSaved(id, value) {
    localStorage.setItem(storageKey('saved', id), value ? 'true' : 'false');
  },
  getStorySeen(id) {
    return localStorage.getItem(storageKey('storySeen', id)) === 'true';
  },
  setStorySeen(id, value) {
    localStorage.setItem(storageKey('storySeen', id), value ? 'true' : 'false');
  },
  getThreadMessages(id) {
    const raw = localStorage.getItem(storageKey('messages', id));
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.warn('Failed to parse messages cache', err);
      return null;
    }
  },
  setThreadMessages(id, messages) {
    localStorage.setItem(storageKey('messages', id), JSON.stringify(messages));
  },
  getMuted() {
    const raw = localStorage.getItem(storageKey(LOCAL_KEYS.muted, 'global'));
    if (raw == null) return true;
    return raw === 'true';
  },
  setMuted(value) {
    localStorage.setItem(storageKey(LOCAL_KEYS.muted, 'global'), value ? 'true' : 'false');
  },
  getTheme() {
    return localStorage.getItem(storageKey(LOCAL_KEYS.theme, 'global')) || 'light';
  },
  setTheme(value) {
    localStorage.setItem(storageKey(LOCAL_KEYS.theme, 'global'), value);
  },
  getCustomPosts() {
    const raw = localStorage.getItem(storageKey(LOCAL_KEYS.customPosts, 'global'));
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (err) {
      console.warn('Failed to parse custom posts', err);
    }
    return [];
  },
  saveCustomPosts(posts) {
    localStorage.setItem(storageKey(LOCAL_KEYS.customPosts, 'global'), JSON.stringify(posts));
  },
  addCustomPost(post) {
    const existing = store.getCustomPosts();
    const next = [post, ...existing].slice(0, 20);
    store.saveCustomPosts(next);
    return next;
  },
};

function hydratePersistentState() {
  appState.muted = store.getMuted();
  appState.theme = store.getTheme();
  applyTheme(appState.theme);
}

function applyTheme(mode) {
  const rootEl = document.documentElement;
  const resolved = mode === 'system' ? getSystemTheme() : mode;
  if (resolved === 'dark') {
    rootEl.classList.add('dark');
  } else {
    rootEl.classList.remove('dark');
  }
  rootEl.dataset.theme = mode;
}

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function ensureShell() {
  if (appShell) return;
  appShell = document.createElement('div');
  appShell.className = 'h-full flex flex-col bg-slate-100 dark:bg-slate-950 mx-auto max-w-2xl';

  headerSlot = document.createElement('div');
  headerSlot.className = 'sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur shadow-sm border-b border-slate-200/60 dark:border-slate-800';

  mainSlot = document.createElement('main');
  mainSlot.className = 'flex-1 overflow-y-auto touch-pan-y';

  navSlot = document.createElement('div');
  navSlot.className = 'sticky bottom-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-t border-slate-200/60 dark:border-slate-800';

  appShell.append(headerSlot, mainSlot, navSlot);
  root.appendChild(appShell);
}

async function loadData() {
  const [posts, stories, messages] = await Promise.all([
    fetch('/frendz/data/posts.json').then((res) => res.json()),
    fetch('/frendz/data/stories.json').then((res) => res.json()),
    fetch('/frendz/data/messages.json').then((res) => res.json()),
  ]);

  const customPosts = store.getCustomPosts();

  appState.customPosts = customPosts;
  appState.posts = [...customPosts, ...posts];
  appState.stories = stories;
  appState.messages = messages.map((thread) => {
    const cached = store.getThreadMessages(thread.id);
    return {
      ...thread,
      messages: cached && Array.isArray(cached)
        ? cached
        : thread.messages,
    };
  });

  appState.likes = new Map(appState.posts.map((post) => [post.id, store.getLike(post.id)]));
  appState.saved = new Map(appState.posts.map((post) => [post.id, store.getSaved(post.id)]));
  appState.storySeen = new Map(stories.map((story) => [story.id, store.getStorySeen(story.id)]));
  appState.threadMessages = new Map(appState.messages.map((thread) => [thread.id, thread.messages]));

  appState.loading = false;
  renderApp();
}

function parseHash() {
  const raw = window.location.hash.replace(/^#/, '');
  const clean = raw || '/home';
  const parts = clean.split('?')[0].split('/').filter(Boolean);

  if (parts.length === 0) {
    return { route: '/home', modal: null };
  }

  if (parts[0] === 'story' && parts[1]) {
    return { route: '/home', modal: { type: 'story', id: parts[1] } };
  }

  if (parts[0] === 'post' && parts[1]) {
    return { route: '/home', modal: { type: 'post', id: parts[1] } };
  }

  const baseRoute = `/${parts.join('/')}`;
  if (['/home', '/messages', '/search', '/profile'].includes(baseRoute)) {
    return { route: baseRoute, modal: null };
  }

  return { route: '/404', modal: null };
}

function navigate(hash) {
  if (window.location.hash === hash) {
    handleRouteChange();
  } else {
    window.location.hash = hash;
  }
}

function handleRouteChange() {
  const parsed = parseHash();
  appState.route = parsed.route;
  appState.modal = parsed.modal;
  renderApp();
}

function renderHeader() {
  let title = '';
  let showDM = false;

  switch (appState.route) {
    case '/home':
      title = 'Frendz';
      showDM = true;
      break;
    case '/messages':
      title = 'Messages';
      break;
    case '/search':
      title = 'Search';
      break;
    case '/profile':
      title = 'Profile';
      break;
    default:
      title = 'Frendz';
  }

  const header = createHeader({
    title,
    showDM,
    onLogoClick: () => navigate('#/home'),
    onOpenMessages: () => navigate('#/messages'),
    themeMode: appState.theme,
    onThemeToggle: cycleTheme,
    muted: appState.muted,
    onToggleMuted: toggleMuted,
  });

  headerSlot.replaceChildren(header);
}

function cycleTheme() {
  const order = ['light', 'dark'];
  const currentIndex = order.indexOf(appState.theme);
  const next = order[(currentIndex + 1) % order.length];
  appState.theme = next;
  store.setTheme(next);
  applyTheme(next);
  renderHeader();
}

function toggleMuted(nextValue) {
  if (typeof nextValue === 'boolean') {
    appState.muted = nextValue;
  } else {
    appState.muted = !appState.muted;
  }
  store.setMuted(appState.muted);
  document.querySelectorAll('video[data-frendz-video]').forEach((video) => {
    video.muted = appState.muted;
    if (!appState.muted) {
      video.play().catch(() => {});
    }
  });
  renderHeader();
}

function renderNav() {
  const nav = createBottomNav({
    current: appState.route,
    onNavigate: (target) => navigate(target),
    onOpenCreate: handleOpenCreate,
  });
  navSlot.replaceChildren(nav);
}

function renderMain() {
  if (appState.route === '/404') {
    const view = document.createElement('div');
    view.className = 'p-6 text-center text-sm text-slate-500 dark:text-slate-400';
    view.innerHTML = '<p>Page not found.</p>';
    mainSlot.replaceChildren(view);
    return;
  }

  if (appState.loading) {
    const skeletonContainer = document.createElement('div');
    skeletonContainer.className = 'px-4 py-6 space-y-6';
    const storyRow = document.createElement('div');
    storyRow.className = 'flex gap-4 overflow-hidden';
    for (let i = 0; i < 8; i += 1) {
      storyRow.append(document.getElementById('skeleton-story-item').content.cloneNode(true));
    }
    skeletonContainer.append(storyRow);
    for (let i = 0; i < 4; i += 1) {
      skeletonContainer.append(document.getElementById('skeleton-post-card').content.cloneNode(true));
    }
    mainSlot.replaceChildren(skeletonContainer);
    return;
  }

  switch (appState.route) {
    case '/home':
      renderHome();
      break;
    case '/messages':
      renderMessages();
      break;
    case '/search':
      renderSearch();
      break;
    case '/profile':
      renderProfile();
      break;
    default:
      renderHome();
  }
}

function renderHome() {
  const container = document.createElement('div');
  container.className = 'pb-24';

  const storyBar = createStoryBar({
    stories: appState.stories,
    seenMap: appState.storySeen,
    onOpenStory: (storyId) => navigate(`#/story/${storyId}`),
  });

  const feed = createFeed({
    posts: appState.posts,
    likes: appState.likes,
    saved: appState.saved,
    muted: appState.muted,
    onToggleLike(postId) {
      const next = !appState.likes.get(postId);
      appState.likes.set(postId, next);
      store.setLike(postId, next);
      renderMain();
    },
    onToggleSave(postId) {
      const next = !appState.saved.get(postId);
      appState.saved.set(postId, next);
      store.setSaved(postId, next);
      renderMain();
    },
    onOpenComments(postId) {
      const post = appState.posts.find((p) => p.id === postId);
      if (!post) return;
      if (currentCommentsModal) {
        currentCommentsModal.destroy();
      }
      currentCommentsModal = mountCommentsModal({
        post,
        onClose: () => {
          currentCommentsModal?.destroy();
          currentCommentsModal = null;
        },
      });
    },
    onOpenProfile(userId) {
      navigate('#/profile');
    },
    onOpenPost(postId) {
      navigate(`#/post/${postId}`);
    },
    onToggleMuted: toggleMuted,
  });

  container.append(storyBar, feed);
  mainSlot.replaceChildren(container);
}

function markStorySeen(storyId) {
  if (appState.storySeen.get(storyId)) return;
  appState.storySeen.set(storyId, true);
  store.setStorySeen(storyId, true);
  renderMain();
}

function renderMessages() {
  const view = createMessagesPage({
    threads: appState.messages,
    onSelectThread: (threadId, messages) => {
      appState.threadMessages.set(threadId, messages);
      store.setThreadMessages(threadId, messages);
    },
  });
  mainSlot.replaceChildren(view);
}

function renderSearch() {
  const view = createSearchPage({
    value: appState.searchTerm,
    onNavigate: (hash) => navigate(hash),
  });
  mainSlot.replaceChildren(view);
}

function renderProfile() {
  const view = createProfilePage({
    posts: appState.posts,
    likes: appState.likes,
    saved: appState.saved,
    onOpenPost: (postId) => navigate(`#/post/${postId}`),
  });
  mainSlot.replaceChildren(view);
}

function attachModals() {
  if (currentStoryModal) {
    currentStoryModal.destroy();
    currentStoryModal = null;
  }
  if (currentPostModal) {
    currentPostModal.destroy();
    currentPostModal = null;
  }

  if (!appState.modal) {
    return;
  }

  if (appState.modal.type === 'story') {
    const story = appState.stories.find((item) => item.id === appState.modal.id);
    if (!story) return;
    currentStoryModal = mountStoryViewer({
      story,
      seen: !!appState.storySeen.get(story.id),
      onSeen: () => markStorySeen(story.id),
      onClose: () => navigate('#/home'),
      onNextStory: (nextId) => navigate(`#/story/${nextId}`),
      onPrevStory: (prevId) => navigate(`#/story/${prevId}`),
      stories: appState.stories,
      muted: appState.muted,
      onToggleMuted: toggleMuted,
    });
  }

  if (appState.modal.type === 'post') {
    const post = appState.posts.find((item) => item.id === appState.modal.id);
    if (!post) return;
    currentPostModal = mountPostModal({
      post,
      liked: !!appState.likes.get(post.id),
      saved: !!appState.saved.get(post.id),
      muted: appState.muted,
      onToggleLike: () => {
        const next = !appState.likes.get(post.id);
        appState.likes.set(post.id, next);
        store.setLike(post.id, next);
        renderMain();
        attachModals();
      },
      onToggleSave: () => {
        const next = !appState.saved.get(post.id);
        appState.saved.set(post.id, next);
        store.setSaved(post.id, next);
        renderMain();
        attachModals();
      },
      onClose: () => navigate('#/home'),
    });
  }
}

function handleOpenCreate() {
  if (currentCreateModal) {
    currentCreateModal.destroy();
    currentCreateModal = null;
  }
  currentCreateModal = mountCreateModal({
    posts: appState.posts,
    onAddPost: (newPost) => {
      appState.customPosts = store.addCustomPost(newPost);
      appState.posts = [newPost, ...appState.posts];
      appState.likes.set(newPost.id, false);
      appState.saved.set(newPost.id, false);
      renderMain();
      renderHeader();
    },
    onClose: () => {
      currentCreateModal?.destroy();
      currentCreateModal = null;
    },
  });
}

function renderApp() {
  ensureShell();
  renderHeader();
  renderMain();
  renderNav();
  attachModals();
}

function init() {
  hydratePersistentState();
  ensureShell();

  splash = mountSplash({
    container: document.body,
    duration: 3000,
    onContinue: () => navigate('#/home'),
  });

  window.addEventListener('hashchange', handleRouteChange);
  handleRouteChange();
  loadData().catch((err) => {
    console.error('Failed to load data', err);
    appState.loading = false;
    appState.route = '/404';
    renderApp();
  });
}

window.addEventListener('DOMContentLoaded', init);
