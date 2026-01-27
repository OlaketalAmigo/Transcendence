/**
 * Centralized application configuration
 */

// API Endpoints
export const API = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        GITHUB: '/api/auth/github'
    },
    AVATAR: {
        GET: '/api/avatar/me',
        UPLOAD: '/api/avatar/upload'
    },
    FRIENDS: {
        LIST: '/api/friends',
        REQUESTS: '/api/friends/requests',
        SEARCH: '/api/friends/search',
        REQUEST: '/api/friends/request',
        ACCEPT: '/api/friends/accept',
        DECLINE: '/api/friends/decline'
    }
};

// localStorage keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token'
};

// Window configuration
export const WINDOW_CONFIG = {
    DEFAULT_WIDTH: 320,
    DEFAULT_HEIGHT: 220,
    Z_INDEX_BASE: 100
};

// CSS classes (BEM convention)
export const CSS = {
    // Menu
    MENU: 'menu',
    MENU_ITEM: 'menu__item',
    MENU_ITEM_ACTIVE: 'menu__item--active',

    // Windows
    WINDOW: 'window',
    WINDOW_VISIBLE: 'window--visible',
    WINDOW_HEADER: 'window__header',
    WINDOW_TITLE: 'window__title',
    WINDOW_CLOSE: 'window__close',
    WINDOW_BODY: 'window__body',

    // Buttons
    BTN: 'btn',
    BTN_PRIMARY: 'btn--primary',
    BTN_SECONDARY: 'btn--secondary',
    BTN_SUCCESS: 'btn--success',
    BTN_DANGER: 'btn--danger',
    BTN_GITHUB: 'btn--github',

    // Forms
    INPUT: 'input',
    INPUT_GROUP: 'input-group',

    // Messages
    MESSAGE: 'message',
    MESSAGE_SUCCESS: 'message--success',
    MESSAGE_ERROR: 'message--error',
    MESSAGE_INFO: 'message--info',

    // Chat
    CHAT: 'chat',
    CHAT_OUTPUT: 'chat__output',
    CHAT_INPUT: 'chat__input',
    CHAT_CONTROLS: 'chat__controls',
    CHAT_MESSAGE: 'chat__message',
    CHAT_SYSTEM: 'chat__system',

    // Avatar
    AVATAR: 'avatar',
    AVATAR_PREVIEW: 'avatar__preview',
    AVATAR_CONTROLS: 'avatar__controls',
    AVATAR_USERNAME: 'avatar__username',

    // Friends
    FRIENDS: 'friends',
    FRIENDS_TABS: 'friends__tabs',
    FRIENDS_TAB: 'friends__tab',
    FRIENDS_TAB_ACTIVE: 'friends__tab--active',
    FRIENDS_CONTENT: 'friends__content',
    FRIENDS_LIST: 'friends__list',
    FRIENDS_ITEM: 'friends__item',
    FRIENDS_AVATAR: 'friends__avatar',
    FRIENDS_NAME: 'friends__name',
    FRIENDS_ACTIONS: 'friends__actions',
    FRIENDS_SEARCH: 'friends__search',
    FRIENDS_EMPTY: 'friends__empty'
};

// Colors (for reference, mainly used in CSS)
export const COLORS = {
    PRIMARY: '#0066cc',
    SUCCESS: '#3cff01',
    ERROR: '#ff4d4d',
    GITHUB: '#24292e',
    BACKGROUND: '#000',
    SURFACE: '#222',
    TEXT: '#fff'
};
