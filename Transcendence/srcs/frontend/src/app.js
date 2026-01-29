/**
 * Application entry point
 * Initializes windows and handles menu interactions
 */
import { windowRegistry } from './windows.js';
import { LoginWindow } from './login.js';
import { GlobalChat } from './global_chat.js';
import { AvatarWindow } from './avatar.js';
import { FriendsWindow } from './friends.js';

/**
 * Main application class
 * Handles initialization and menu interactions
 */
class App {
    constructor() {
        this.initWindows();
        this.initMenu();
        this.initGame();
        this.initEasterEgg();
    }

    /**
     * Initializes all windows
     */
    initWindows() {
        // Windows automatically register themselves in the registry
        new LoginWindow();
        new GlobalChat();
        new AvatarWindow();
        new FriendsWindow();
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

        // Action to window name mapping
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

    initGame() {
        const game = document.querySelector('.game');
        if (!game) {
            console.warn('Game not found');
            return;
        }

        // Action to window name mapping
        const actionMap = {
            'new_game': 'new_game'
        };

        // Event delegation on the menu
        game.addEventListener('click', (e) => {
            const button = e.target.closest('.game__item');
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
            console.warn('Page not found');
            return;
        }

        // Action to window name mapping
        const actionMap = {
            'new_page': 'new_page'
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
    // initEasterEgg() {
    //     const easterEgg = document.querySelector('.easter-egg');
    //     if (easterEgg) {
    //         easterEgg.addEventListener('click', () => {
    //             alert('You clicked when we told you not to!');
    //         });
    //     }
    // }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new App());
} else {
    new App();
}
