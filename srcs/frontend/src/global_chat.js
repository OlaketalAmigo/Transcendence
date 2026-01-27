import { Window } from './windows.js';
import { STORAGE_KEYS, CSS } from './config.js';
import { eventBus, Events } from './events.js';

/**
 * Global chat window
 * Uses Socket.IO for real-time communication
 */
export class GlobalChat extends Window {
    constructor() {
        super({
            name: 'chat',
            title: 'Global Chat',
            cssClasses: ['chat']
        });

        this.socket = null;
        this.connected = false;

        this.buildUI();
        this.bindEvents();
    }

    /**
     * Builds the user interface
     */
    buildUI() {
        // Message display area
        this.output = this.createElement('div', CSS.CHAT_OUTPUT);

        // Input container
        this.inputContainer = this.createElement('div', 'chat__input-container');

        this.input = this.createElement('input', [CSS.INPUT, CSS.CHAT_INPUT], {
            type: 'text',
            placeholder: 'Type your message...'
        });

        this.sendBtn = this.createElement('button', [CSS.BTN, CSS.BTN_PRIMARY], {
            text: 'Send'
        });

        this.inputContainer.append(this.input, this.sendBtn);

        // Connection controls
        this.controls = this.createElement('div', CSS.CHAT_CONTROLS);

        this.connectBtn = this.createElement('button', [CSS.BTN, CSS.BTN_SUCCESS], {
            text: 'Connect'
        });

        this.reconnectBtn = this.createElement('button', [CSS.BTN, CSS.BTN_PRIMARY], {
            text: 'Reconnect'
        });

        this.controls.append(this.connectBtn, this.reconnectBtn);

        // Assembly
        this.body.append(this.output, this.inputContainer, this.controls);
    }

    /**
     * Attaches event handlers
     */
    bindEvents() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.connectBtn.addEventListener('click', () => this.connect());
        this.reconnectBtn.addEventListener('click', () => this.reconnect());

        // Send with Enter
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    /**
     * Displays a system message
     * @param {string} text - Message text
     * @param {'info'|'error'|'success'} type - Message type
     */
    addSystemMessage(text, type = 'info') {
        const msg = this.createElement('div', CSS.CHAT_SYSTEM);

        if (type === 'error') {
            msg.classList.add('chat__system--error');
        } else if (type === 'success') {
            msg.classList.add('chat__system--success');
        }

        msg.textContent = text;
        this.output.appendChild(msg);
        this.scrollToBottom();
    }

    /**
     * Displays a chat message
     * @param {string} username - User name
     * @param {string} content - Message content
     * @param {boolean} isOwn - Is this the current user's message
     */
    addChatMessage(username, content, isOwn = false) {
        const msg = this.createElement('div', CSS.CHAT_MESSAGE);

        if (isOwn) {
            msg.classList.add('chat__message--own');
        }

        msg.innerHTML = `<strong>${this.escapeHtml(username)}:</strong> ${this.escapeHtml(content)}`;
        this.output.appendChild(msg);
        this.scrollToBottom();
    }

    /**
     * Escapes HTML to prevent XSS
     * @param {string} text
     * @returns {string}
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Scrolls the message area to the bottom
     */
    scrollToBottom() {
        this.output.scrollTop = this.output.scrollHeight;
    }

    /**
     * Sends a message
     */
    sendMessage() {
        const content = this.input.value.trim();
        if (!content) return;

        if (!this.socket?.connected) {
            this.addSystemMessage('Error: you are not connected to the global chat', 'error');
            return;
        }

        this.socket.emit('chat-message', { content });
        this.addChatMessage('Me', content, true);
        this.input.value = '';
    }

    /**
     * Reconnects to the server
     */
    async reconnect() {
        if (this.socket) {
            try {
                this.socket.close();
            } catch (e) {
                // Ignore
            }
            this.socket = null;
        }

        this.connected = false;
        this.addSystemMessage('Reconnecting...');
        await this.connect();
    }

    /**
     * Connects to the Socket.IO server
     */
    async connect() {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

        if (!token) {
            this.addSystemMessage('Error: you must be logged in to use the global chat', 'error');
            return;
        }

        if (this.socket?.connected) {
            this.addSystemMessage('Already connected to global chat');
            return;
        }

        // Load Socket.IO if needed
        await this.loadSocketIO();

        const ioConfig = {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['websocket', 'polling']
        };

        // Optional alternative port
        const altPort = window.GLOBAL_CHAT_ALT_PORT;
        if (altPort) {
            const host = location.hostname || 'localhost';
            this.socket = io(`http://${host}:${altPort}`, ioConfig);
        } else {
            this.socket = io(ioConfig);
        }

        this.setupSocketListeners();
    }

    /**
     * Loads the Socket.IO script if needed
     */
    async loadSocketIO() {
        if (window.io) return;

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/socket.io/socket.io.js';

            script.onload = () => {
                console.log('Socket.IO loaded');
                resolve();
            };

            script.onerror = () => {
                console.error('Failed to load Socket.IO');
                reject(new Error('Socket.IO load failed'));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Sets up Socket.IO listeners
     */
    setupSocketListeners() {
        this.socket.on('connect', () => {
            console.log('Socket connected, ID:', this.socket.id);
            this.connected = true;
            this.addSystemMessage('Connected to global chat', 'success');
            eventBus.emit(Events.CHAT_CONNECTED, { socketId: this.socket.id });
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
            this.addSystemMessage(`Connection error: ${err.message}`, 'error');
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            this.connected = false;
            this.addSystemMessage(`Disconnected (${reason})`);
            eventBus.emit(Events.CHAT_DISCONNECTED, { reason });
        });

        this.socket.on('chat-message', (msg) => {
            this.addChatMessage(msg.username, msg.content);
            eventBus.emit(Events.CHAT_MESSAGE_RECEIVED, msg);
        });
    }
}
