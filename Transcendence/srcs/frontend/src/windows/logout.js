import { Window } from '../core/windows.js';
import { API, STORAGE_KEYS, CSS } from '../core/config.js';
import { eventBus, Events } from '../core/events.js';

export class LogoutWindow extends Window {
    constructor() {
        super({
            name: 'logout',
            title: 'Logout',
            cssClasses: ['logout-window']
        });

        this.buildUI();
        this.bindEvents();
    }

    buildUI() {
        this.text = this.createElement('div', 'logout__text', {
            text: 'Are you sure you want to log out?'
        });
        this.actions = this.createElement('div', 'logout__actions');

        this.yesBtn = this.createElement('button', [CSS.BTN, CSS.BTN_PRIMARY], {
            text: 'Yes'
        });
        this.noBtn = this.createElement('button', [CSS.BTN, CSS.BTN_SECONDARY], {
            text: 'No'
        });

        this.actions.append(this.yesBtn, this.noBtn);
        this.body.append(this.text, this.actions);
    }

    bindEvents() {
        this.yesBtn.addEventListener('click', () => this.confirmLogout());
        this.noBtn.addEventListener('click', () => this.hide());
    }

    show () {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
            this.text.textContent = 'You need to login first';
            this.yesBtn.style.display = 'none';
            this.noBtn.textContent = 'OK';
        } else {
            this.text.textContent = 'Are you sure you want to log out?';
            this.yesBtn.style.display = 'inline-flex';
            this.noBtn.textContent = 'No';
        }
        super.show();
    }

    async confirmLogout() {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token)
        {
            try
            {
                await fetch(API.AUTH.LOGOUT, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
            catch (err)
            {
                console.warn('Logout failed:', err);
                this.showNotification('Logout failed. Please try again.', 'red');
                return;
            }
        }
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        eventBus.emit(Events.USER_LOGGED_OUT);
        setTimeout(() => window.location.reload(), 500);
        this.showNotification('You have been logged out successfully.', 'green');
    }
}