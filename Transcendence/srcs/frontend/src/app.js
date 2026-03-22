/**
 * Application entry point
 * Initializes windows and handles menu interactions
 */
import { windowRegistry } from './core/windows.js';
import { LoginWindow } from './windows/login.js';
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
        this.initWindows();
        this.initMenu();
        this.initPage();
        this.initEasterEgg();
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
            'friends': 'friends'
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

        const actionMap = {
            'gameroom': 'gameroom'
        };

        // Event delegation on the menu
        page.addEventListener('click', (e) => {
            const button = e.target.closest('.page__item');
            if (!button) return;

            const action = button.dataset.action;

            // Actions with associated windows
            if (actionMap[action]) {
                windowRegistry.toggle(actionMap[action]);
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
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new App());
} else {
    new App();
}
