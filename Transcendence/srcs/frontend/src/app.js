/**
 * Application entry point
 * Initializes windows and handles menu interactions
 */
import { windowRegistry } from './core/windows.js';
import { API, STORAGE_KEYS } from './core/config.js';
import { eventBus, Events } from './core/events.js';
import { LoginWindow } from './windows/login.js';
import { LogoutWindow } from './windows/logout.js';
import { GlobalChat } from './windows/global_chat.js';
import { AvatarWindow } from './windows/avatar.js';
import { FriendsWindow } from './windows/friends.js';
import { GameRoomWindow } from './windows/game_room.js';
import { StatsWindow } from './windows/stats.js';

/**
 * Main application class
 * Handles initialization and menu interactions
 */
class App {
    constructor() {
        this.invalidateStaleToken();
        this.initWindows();
        this.initMenu();
        this.initPage();
        this.initEasterEgg();
        this.colorizeUI();
    }

    async invalidateStaleToken() {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) return;

        if (this.isJwtExpired(token)) {
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            eventBus.emit(Events.USER_LOGGED_OUT);
            return;
        }

        try {
            const response = await fetch(API.STATS.ME, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
                eventBus.emit(Events.USER_LOGGED_OUT);
				setTimeout(() => window.location.reload(), 500);
            }
        } catch (error) {
            console.warn('Token validation skipped:', error);
        }
    }

    isJwtExpired(token) {
        try {
            const payload = this.decodeJwtPayload(token);
            if (!payload || !payload.exp) return false;
            const now = Math.floor(Date.now() / 1000);
            return payload.exp <= now;
        } catch (error) {
            return false;
        }
    }

    decodeJwtPayload(token) {
        const parts = token.split('.');
        if (parts.length < 2) return null;

        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
        return JSON.parse(atob(padded));
    }

    /**
     * Initializes all windows
     */
    initWindows() {
        new LoginWindow();
        new GlobalChat();
        new AvatarWindow();
        new FriendsWindow();
        new GameRoomWindow();
        new StatsWindow();
        new LogoutWindow();
    }

    /**
     * Initializes the main menu
     * Uses event delegation instead of IDs
     */
    initMenu() {
        const menu = document.querySelector('.menu');
        if (!menu) {
            console.warn('Menu not found');
            return;
        }

        const actionMap = {
            'login': 'login',
            'chat': 'chat',
            'avatar': 'avatar',
            'friends': 'friends',
            'logout': 'logout'
        };

        // Event delegation on the menu
        menu.addEventListener('click', (e) => {
            const button = e.target.closest('.menu__item');
            if (!button) return;

            const action = button.dataset.action;

            // Actions with associated windows
            if (actionMap[action]) {
                windowRegistry.toggle(actionMap[action]);
                return;
            }

        });
    }

    initPage() {
        const page = document.querySelector('.page');
        if (!page) {
            return;
        }

        // Event delegation on the menu
        page.addEventListener('click', (e) => {
            const button = e.target.closest('.page__item');
            if (!button) return;

            const action = button.dataset.action;

            if (action === 'gameroom') {
                const gameRoomWindow = windowRegistry.get('gameroom');
                windowRegistry.toggle('gameroom');
				gameRoomWindow.loadRooms();

                if (gameRoomWindow?.currentTab === 'browse') {
                    gameRoomWindow.loadRooms();
                }
                return;
            }

        });
    }

    /**
     * Initializes the easter egg button
     */
    initEasterEgg() {
        const easterEgg = document.querySelector('.easter-egg');
        if (easterEgg) {
            easterEgg.addEventListener('click', () => {
                alert('DONT CLICK!');
            });
        }
    }

    colorizeUI() {
    
        const elements = document.querySelectorAll(".title, .menu__item, .game__item, .page__item");

        const colorizeText = (el) => {
            const text = el.textContent;
            el.innerHTML = "";

            const baseHue = Math.random() * 360;

            // 🎲 random step = makes rainbow "scrambled"
            const step = (Math.random() * 60) + 10; // 10 → 70

            // 🎲 random direction (left or right rainbow)
            const direction = Math.random() < 0.5 ? 1 : -1;

            [...text].forEach((char, i) => {
                const span = document.createElement("span");
                span.textContent = char;

                const hue = baseHue + (i * step * direction);

                span.style.color = `hsl(${hue}, 90%, 60%)`;

                span.style.textShadow = `1px 1px 0 rgba(0,0,0,0.3)`;

                el.appendChild(span);
            });
        };
        elements.forEach(colorizeText);
    }

}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new App());
} else {
    new App();
}
