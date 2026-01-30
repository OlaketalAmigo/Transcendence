import { Window } from './windows.js';
import { API, STORAGE_KEYS, CSS } from './config.js';
import { eventBus, Events } from './events.js';

/**
 * Avatar management window
 * Allows viewing and modifying the user's avatar
 */
export class AvatarWindow extends Window {
    constructor() {
        super({
            name: 'avatar',
            title: 'Avatar',
            cssClasses: ['avatar-window']
        });

        this.buildUI();
        this.bindEvents();
        this.loadAvatar();

        // Listen for login events
        eventBus.on(Events.USER_LOGGED_IN, () => this.loadAvatar());
    }

    /**
     * Builds the user interface
     */
    buildUI() {
        // Avatar preview
        this.preview = this.createElement('img', CSS.AVATAR_PREVIEW, {
            alt: 'Avatar'
        });

        // Username display
        this.username = this.createElement('div', CSS.AVATAR_USERNAME);

        // Stats display
        this.statsContainer = this.createElement('div', 'avatar__stats');
        this.pointsDisplay = this.createElement('div', 'avatar__stat');
        this.gamesPlayedDisplay = this.createElement('div', 'avatar__stat');
        this.gamesWonDisplay = this.createElement('div', 'avatar__stat');
        this.statsContainer.append(this.pointsDisplay, this.gamesPlayedDisplay, this.gamesWonDisplay);

        // Hidden file input
        this.fileInput = this.createElement('input', 'avatar__file-input', {
            type: 'file',
            accept: 'image/*'
        });

        // Controls
        this.controls = this.createElement('div', CSS.AVATAR_CONTROLS);

        this.chooseBtn = this.createElement('button', [CSS.BTN, CSS.BTN_SECONDARY], {
            text: 'Choose image'
        });

        this.saveBtn = this.createElement('button', [CSS.BTN, CSS.BTN_PRIMARY], {
            text: 'Save avatar'
        });

        this.refreshBtn = this.createElement('button', [CSS.BTN, CSS.BTN_SECONDARY], {
            text: 'Refresh'
        });

        this.controls.append(this.chooseBtn, this.saveBtn, this.refreshBtn);

        // Feedback message
        this.message = this.createElement('div', CSS.MESSAGE);

        // Assembly
        this.body.append(
            this.preview,
            this.username,
            this.statsContainer,
            this.fileInput,
            this.controls,
            this.message
        );
    }

    /**
     * Attaches event handlers
     */
    bindEvents() {
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.chooseBtn.addEventListener('click', () => this.fileInput.click());
        this.saveBtn.addEventListener('click', () => this.uploadAvatar());
        this.refreshBtn.addEventListener('click', () => this.loadAvatar());
    }

    /**
     * Handles file selection
     * @param {Event} e
     */
    handleFileSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            this.preview.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Decodes a JWT token and returns the payload
     * @param {string} token
     * @returns {object|null}
     */
    decodeToken(token) {
        try {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload));
        } catch {
            return null;
        }
    }

    /**
     * Loads avatar from the server
     */
    async loadAvatar() {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
            console.log('No token, skipping avatar load');
            return;
        }

        // Extract username from JWT token
        const tokenData = this.decodeToken(token);
        if (tokenData?.username) {
            this.username.textContent = tokenData.username;
        }

        try {
            const response = await fetch(API.AVATAR.GET, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.warn('Failed to load avatar, status:', response.status);
                return;
            }

            const data = await response.json();

            if (data?.avatar_url) {
                this.preview.src = data.avatar_url;
            } else {
                console.warn('Avatar URL not found in response');
            }
        } catch (error) {
            console.error('Error loading avatar:', error);
        }

        // Load stats
        await this.loadStats();
    }

    /**
     * Loads player stats from the server
     */
    async loadStats() {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) return;

        try {
            const response = await fetch(API.STATS.ME, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.warn('Failed to load stats, status:', response.status);
                return;
            }

            const data = await response.json();
            this.updateStatsDisplay(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    /**
     * Updates the stats display
     * @param {object} stats
     */
    updateStatsDisplay(stats) {
        this.pointsDisplay.innerHTML = `<span class="avatar__stat-label">Points:</span> <span class="avatar__stat-value">${stats.total_points || 0}</span>`;
        this.gamesPlayedDisplay.innerHTML = `<span class="avatar__stat-label">Parties:</span> <span class="avatar__stat-value">${stats.games_played || 0}</span>`;
        this.gamesWonDisplay.innerHTML = `<span class="avatar__stat-label">Victoires:</span> <span class="avatar__stat-value">${stats.games_won || 0}</span>`;
    }

    /**
     * Uploads avatar to the server
     */
    async uploadAvatar() {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
            this.showMessage('You must be logged in', 'error');
            return;
        }

        const file = this.fileInput.files?.[0];
        if (!file) {
            this.showMessage('Select an image first', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            this.showMessage('Uploading...', 'info');

            const response = await fetch(API.AVATAR.UPLOAD, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data?.error || data?.message || 'Upload failed';
                this.showMessage(errorMsg, 'error');
                return;
            }

            if (data?.avatar_url) {
                this.preview.src = data.avatar_url;
            }

            this.showMessage('Avatar saved!', 'success');
            eventBus.emit(Events.AVATAR_UPDATED, { url: data?.avatar_url });

        } catch (error) {
            console.error('Avatar upload error:', error);
            this.showMessage('Upload error', 'error');
        }
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
