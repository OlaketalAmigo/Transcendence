/**
 * EventBus - Centralized event system
 * Enables communication between modules without circular dependencies
 */
class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Function to call
     * @returns {Function} Unsubscribe function
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        return () => this.off(event, callback);
    }

    /**
     * Subscribe to an event once
     * @param {string} event - Event name
     * @param {Function} callback - Function to call
     */
    once(event, callback) {
        const wrapper = (data) => {
            this.off(event, wrapper);
            callback(data);
        };
        this.on(event, wrapper);
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} callback - Function to remove
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {*} data - Data to transmit
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in listener for "${event}":`, error);
                }
            });
        }
    }
}

// Exported singleton instance
export const eventBus = new EventBus();

// Available events (for documentation and autocompletion)
export const Events = {
    // Authentication
    USER_LOGGED_IN: 'user:logged-in',
    USER_LOGGED_OUT: 'user:logged-out',
    USER_REGISTERED: 'user:registered',

    // Windows
    WINDOW_OPENED: 'window:opened',
    WINDOW_CLOSED: 'window:closed',

    // Avatar
    AVATAR_UPDATED: 'avatar:updated',

    // Chat
    CHAT_CONNECTED: 'chat:connected',
    CHAT_DISCONNECTED: 'chat:disconnected',
    CHAT_MESSAGE_RECEIVED: 'chat:message-received'
};
