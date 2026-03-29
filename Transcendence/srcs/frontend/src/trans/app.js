/**
 * Application entry point
 * Initializes windows and handles menu interactions
 */
import { windowRegistry } from '../core/windows.js';
import { LoginWindow } from '../windows/login.js';
import { LogoutWindow } from '../windows/logout.js';
import { GlobalChat } from '../windows/global_chat.js';
import { AvatarWindow } from '../windows/avatar.js';
import { FriendsWindow } from '../windows/friends.js';
import { GameRoomWindow } from '../windows/game_room.js';
import { StatsWindow } from '../windows/stats.js';

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
        this.colorizeUI();
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
