import { Window } from './windows.js';
import { API, STORAGE_KEYS, CSS } from './config.js';
import { eventBus, Events } from './events.js';

/**
 * Login and registration window
 * Emits events instead of directly importing other windows
 */
export class LoginWindow extends Window {
    constructor() {
        super({
            name: 'login',
            title: 'Login',
            cssClasses: ['login']
        });

        this.buildUI();
        this.bindEvents();
        this.checkIfAlreadyLoggedIn();
    }

    /**
     * Builds the user interface
     */
    buildUI() {
        // Main form
        this.form = this.createElement('div', 'login__form');

        // Username field
        this.usernameInput = this.createElement('input', CSS.INPUT, {
            type: 'text',
            placeholder: 'Username'
        });

        // Password field
        this.passwordInput = this.createElement('input', CSS.INPUT, {
            type: 'password',
            placeholder: 'Password'
        });

        // Action buttons
        this.actions = this.createElement('div', 'login__actions');

        this.loginBtn = this.createElement('button', [CSS.BTN, CSS.BTN_PRIMARY], {
            text: 'Sign in'
        });

        this.registerBtn = this.createElement('button', [CSS.BTN, CSS.BTN_SECONDARY], {
            text: 'Register'
        });

        this.actions.append(this.loginBtn, this.registerBtn);

        // Feedback message
        this.message = this.createElement('div', CSS.MESSAGE);

        // Divider
        this.divider = this.createElement('div', 'login__divider', {
            text: 'or'
        });

        // GitHub button
        this.githubBtn = this.createElement('button', [CSS.BTN, CSS.BTN_GITHUB], {
            text: 'Sign in with GitHub'
        });

        // Assembly
        this.form.append(
            this.usernameInput,
            this.passwordInput,
            this.actions,
            this.message,
            this.divider,
            this.githubBtn
        );

        this.body.appendChild(this.form);
    }

    /**
     * Attaches event handlers
     */
    bindEvents() {
        this.loginBtn.addEventListener('click', () => this.handleLogin());
        this.registerBtn.addEventListener('click', () => this.handleRegister());
        this.githubBtn.addEventListener('click', () => this.handleGitHubLogin());

        // Login with Enter
        this.passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin();
            }
        });
    }

    /**
     * Checks if user is already logged in
     */
    checkIfAlreadyLoggedIn() {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
            this.showMessage('You are already logged in!', 'success');
        }
    }

    /**
     * Handles login
     */
    async handleLogin() {
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value;

        if (!username || !password) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        this.showMessage('Signing in...', 'info');

        try {
            const response = await fetch(API.AUTH.LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.token) {
                localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
                this.showMessage('Login successful! Welcome.', 'success');

                // Emit login event
                eventBus.emit(Events.USER_LOGGED_IN, { username, token: data.token });

                // Close window after delay
                setTimeout(() => this.hide(), 1500);
            } else {
                const errorMsg = data?.message || 'Login failed';
                this.showMessage(errorMsg, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('Server connection error', 'error');
        }
    }

    /**
     * Handles registration
     */
    async handleRegister() {
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value;

        if (!username || !password) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        this.showMessage('Registering...', 'info');

        try {
            const response = await fetch(API.AUTH.REGISTER, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage('Registration successful! You can now sign in.', 'success');
                eventBus.emit(Events.USER_REGISTERED, { username });
            } else {
                const errorMsg = data?.message || 'Registration failed';
                this.showMessage(errorMsg, 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage('Server connection error', 'error');
        }
    }

    /**
     * Handles GitHub OAuth login
     */
    handleGitHubLogin() {
        const width = 600;
        const height = 700;
        const left = (screen.width - width) / 2;
        const top = (screen.height - height) / 2;

        const popup = window.open(
            API.AUTH.GITHUB,
            'githubOAuth',
            `width=${width},height=${height},left=${left},top=${top}`
        );

        const handleMessage = (event) => {
            if (event.data?.token) {
                localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, event.data.token);
                this.showMessage('GitHub login successful! Welcome.', 'success');

                // Emit login event
                eventBus.emit(Events.USER_LOGGED_IN, {
                    provider: 'github',
                    token: event.data.token
                });

                window.removeEventListener('message', handleMessage);
                if (popup) popup.close();
            }
        };

        window.addEventListener('message', handleMessage, { once: true });
    }

    /**
     * Displays a feedback message
     * @param {string} text - Message text
     * @param {'success'|'error'|'info'} type - Message type
     */
    showMessage(text, type = 'info') {
        this.message.textContent = text;
        this.message.className = CSS.MESSAGE;

        if (type === 'success') {
            this.message.classList.add(CSS.MESSAGE_SUCCESS);
        } else if (type === 'error') {
            this.message.classList.add(CSS.MESSAGE_ERROR);
        } else {
            this.message.classList.add(CSS.MESSAGE_INFO);
        }
    }
}
