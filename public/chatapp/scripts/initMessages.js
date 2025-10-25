// Initialize sample messages for chats
import { appState } from './app.js';
import store from './store.js';
import ui from './ui.js';

export function initializeMessages() {
    appState.chats.forEach(chat => {
        const existingMessages = store.getMessages(chat.id);
        if (existingMessages.length === 0) {
            // Create sample messages based on chat
            const messages = [];
            
            // Add conversation history
            messages.push({
                id: ui.generateId('msg'),
                from: chat.user.id,
                type: 'text',
                text: 'Hey! How are you doing?',
                ts: new Date(Date.now() - 86400000 * 2).toISOString(),
                status: 'read'
            });
            
            messages.push({
                id: ui.generateId('msg'),
                from: 'me',
                type: 'text',
                text: 'Hi! I\'m doing great, thanks for asking!',
                ts: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
                status: 'read'
            });
            
            messages.push({
                id: ui.generateId('msg'),
                from: chat.user.id,
                type: 'text',
                text: 'That\'s awesome! Want to catch up later?',
                ts: new Date(Date.now() - 86400000 * 1.5).toISOString(),
                status: 'read'
            });
            
            messages.push({
                id: ui.generateId('msg'),
                from: 'me',
                type: 'text',
                text: 'Sure! What time works for you?',
                ts: new Date(Date.now() - 86400000 * 1.5 + 1800000).toISOString(),
                status: 'read'
            });
            
            // Add the last message from chats.json
            if (chat.lastMessage) {
                messages.push({
                    id: ui.generateId('msg'),
                    from: chat.lastMessage.from,
                    type: chat.lastMessage.type || 'text',
                    text: chat.lastMessage.text,
                    ts: chat.lastMessage.ts,
                    status: chat.lastMessage.status || 'sent'
                });
            }
            
            // Save to localStorage
            store.setMessages(chat.id, messages);
        }
    });
}

export default initializeMessages;
