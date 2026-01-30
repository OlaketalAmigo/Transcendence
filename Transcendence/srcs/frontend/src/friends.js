import { Window } from './windows.js';
import { API, STORAGE_KEYS, CSS } from './config.js';
import { eventBus, Events } from './events.js';

/**
 * Friends management window
 * Allows viewing friends, requests, and searching users
 */
export class FriendsWindow extends Window {
    constructor() {
        super({
            name: 'friends',
            title: 'Amis',
            cssClasses: ['friends-window']
        });

        this.currentTab = 'friends';
        this.buildUI();
        this.bindEvents();

        eventBus.on(Events.USER_LOGGED_IN, () => this.loadCurrentTab());
    }

    /**
     * Builds the user interface
     */
    buildUI() {
        // Tabs
        this.tabs = this.createElement('div', CSS.FRIENDS_TABS);

        this.friendsTab = this.createElement('button', [CSS.FRIENDS_TAB, CSS.FRIENDS_TAB_ACTIVE], {
            text: 'Amis'
        });
        this.friendsTab.dataset.tab = 'friends';

        this.requestsTab = this.createElement('button', CSS.FRIENDS_TAB, {
            text: 'Demandes'
        });
        this.requestsTab.dataset.tab = 'requests';

        this.searchTab = this.createElement('button', CSS.FRIENDS_TAB, {
            text: 'Rechercher'
        });
        this.searchTab.dataset.tab = 'search';

        this.tabs.append(this.friendsTab, this.requestsTab, this.searchTab);

        // Content area
        this.content = this.createElement('div', CSS.FRIENDS_CONTENT);

        // Search input (hidden by default)
        this.searchContainer = this.createElement('div', CSS.FRIENDS_SEARCH);
        this.searchInput = this.createElement('input', CSS.INPUT, {
            type: 'text',
            placeholder: 'Rechercher un utilisateur...'
        });
        this.searchBtn = this.createElement('button', [CSS.BTN, CSS.BTN_PRIMARY], {
            text: 'Chercher'
        });
        this.searchContainer.append(this.searchInput, this.searchBtn);
        this.searchContainer.style.display = 'none';

        // List container
        this.list = this.createElement('div', CSS.FRIENDS_LIST);

        // Message
        this.message = this.createElement('div', CSS.MESSAGE);

        this.content.append(this.searchContainer, this.list, this.message);

        // Assembly
        this.body.append(this.tabs, this.content);
    }

    /**
     * Attaches event handlers
     */
    bindEvents() {
        this.tabs.addEventListener('click', (e) => {
            const tab = e.target.closest(`.${CSS.FRIENDS_TAB}`);
            if (tab) {
                this.switchTab(tab.dataset.tab);
            }
        });

        this.searchBtn.addEventListener('click', () => this.searchUsers());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchUsers();
        });
    }

    /**
     * Switches between tabs
     */
    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab styles
        [this.friendsTab, this.requestsTab, this.searchTab].forEach(tab => {
            tab.classList.toggle(CSS.FRIENDS_TAB_ACTIVE, tab.dataset.tab === tabName);
        });

        // Show/hide search
        this.searchContainer.style.display = tabName === 'search' ? 'flex' : 'none';

        this.loadCurrentTab();
    }

    /**
     * Loads data for current tab
     */
    loadCurrentTab() {
        switch (this.currentTab) {
            case 'friends':
                this.loadFriends();
                break;
            case 'requests':
                this.loadRequests();
                break;
            case 'search':
                this.list.innerHTML = '';
                this.showMessage('Entrez un nom pour rechercher', 'info');
                break;
        }
    }

    /**
     * Gets auth headers
     */
    getHeaders() {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Loads friends list
     */
    async loadFriends() {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
            this.showMessage('Connectez-vous pour voir vos amis', 'info');
            return;
        }

        try {
            const response = await fetch(API.FRIENDS.LIST, {
                headers: this.getHeaders()
            });
            const data = await response.json();

            if (!response.ok) {
                this.showMessage(data.error || 'Erreur', 'error');
                return;
            }

            this.renderFriendsList(data.friends || []);
        } catch (error) {
            console.error('Load friends error:', error);
            this.showMessage('Erreur de connexion', 'error');
        }
    }

    /**
     * Loads pending requests
     */
    async loadRequests() {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
            this.showMessage('Connectez-vous pour voir les demandes', 'info');
            return;
        }

        try {
            const response = await fetch(API.FRIENDS.REQUESTS, {
                headers: this.getHeaders()
            });
            const data = await response.json();

            if (!response.ok) {
                this.showMessage(data.error || 'Erreur', 'error');
                return;
            }

            this.renderRequestsList(data.requests || []);
        } catch (error) {
            console.error('Load requests error:', error);
            this.showMessage('Erreur de connexion', 'error');
        }
    }

    /**
     * Searches users
     */
    async searchUsers() {
        const query = this.searchInput.value.trim();
        if (!query) {
            this.showMessage('Entrez un nom pour rechercher', 'info');
            return;
        }

        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
            this.showMessage('Connectez-vous pour rechercher', 'info');
            return;
        }

        try {
            const response = await fetch(`${API.FRIENDS.SEARCH}?q=${encodeURIComponent(query)}`, {
                headers: this.getHeaders()
            });
            const data = await response.json();

            if (!response.ok) {
                this.showMessage(data.error || 'Erreur', 'error');
                return;
            }

            this.renderSearchResults(data.users || []);
        } catch (error) {
            console.error('Search error:', error);
            this.showMessage('Erreur de connexion', 'error');
        }
    }

    /**
     * Renders friends list
     */
    renderFriendsList(friends) {
        this.list.innerHTML = '';
        this.message.textContent = '';

        if (friends.length === 0) {
            this.showMessage('Aucun ami pour le moment', 'info');
            return;
        }

        friends.forEach(friend => {
            const item = this.createFriendItem(friend, 'friend');
            this.list.appendChild(item);
        });
    }

    /**
     * Renders requests list
     */
    renderRequestsList(requests) {
        this.list.innerHTML = '';
        this.message.textContent = '';

        if (requests.length === 0) {
            this.showMessage('Aucune demande en attente', 'info');
            return;
        }

        requests.forEach(request => {
            const item = this.createFriendItem(request, 'request');
            this.list.appendChild(item);
        });
    }

    /**
     * Renders search results
     */
    renderSearchResults(users) {
        this.list.innerHTML = '';
        this.message.textContent = '';

        if (users.length === 0) {
            this.showMessage('Aucun utilisateur trouve', 'info');
            return;
        }

        users.forEach(user => {
            const item = this.createFriendItem(user, 'search');
            this.list.appendChild(item);
        });
    }

    /**
     * Creates a friend/user item
     */
    createFriendItem(user, type) {
        const item = this.createElement('div', CSS.FRIENDS_ITEM);

        const avatar = this.createElement('img', CSS.FRIENDS_AVATAR, {
            alt: user.username
        });
        avatar.src = user.avatar_url || '/avatar/default.png';

        const infoContainer = this.createElement('div', 'friends__info');

        const name = this.createElement('span', CSS.FRIENDS_NAME, {
            text: user.username
        });

        infoContainer.appendChild(name);

        // Show stats for friends
        if (type === 'friend' && user.total_points !== undefined) {
            const stats = this.createElement('span', 'friends__stats', {
                text: `${user.total_points || 0} pts`
            });
            infoContainer.appendChild(stats);
        }

        const actions = this.createElement('div', CSS.FRIENDS_ACTIONS);

        if (type === 'friend') {
            const removeBtn = this.createElement('button', [CSS.BTN, CSS.BTN_DANGER], {
                text: 'Retirer'
            });
            removeBtn.addEventListener('click', () => this.removeFriend(user.id));
            actions.appendChild(removeBtn);
        } else if (type === 'request') {
            const acceptBtn = this.createElement('button', [CSS.BTN, CSS.BTN_SUCCESS], {
                text: 'Accepter'
            });
            acceptBtn.addEventListener('click', () => this.acceptRequest(user.id));

            const declineBtn = this.createElement('button', [CSS.BTN, CSS.BTN_DANGER], {
                text: 'Refuser'
            });
            declineBtn.addEventListener('click', () => this.declineRequest(user.id));

            actions.append(acceptBtn, declineBtn);
        } else if (type === 'search') {
            const addBtn = this.createElement('button', [CSS.BTN, CSS.BTN_PRIMARY], {
                text: 'Ajouter'
            });
            addBtn.addEventListener('click', () => this.sendRequest(user.id, addBtn));
            actions.appendChild(addBtn);
        }

        item.append(avatar, infoContainer, actions);
        return item;
    }

    /**
     * Sends a friend request
     */
    async sendRequest(userId, button) {
        try {
            const response = await fetch(`${API.FRIENDS.REQUEST}/${userId}`, {
                method: 'POST',
                headers: this.getHeaders()
            });
            const data = await response.json();

            if (!response.ok) {
                this.showMessage(data.error || 'Erreur', 'error');
                return;
            }

            button.textContent = 'Envoye';
            button.disabled = true;
            this.showMessage('Demande envoyee', 'success');
        } catch (error) {
            console.error('Send request error:', error);
            this.showMessage('Erreur', 'error');
        }
    }

    /**
     * Accepts a friend request
     */
    async acceptRequest(userId) {
        try {
            const response = await fetch(`${API.FRIENDS.ACCEPT}/${userId}`, {
                method: 'POST',
                headers: this.getHeaders()
            });
            const data = await response.json();

            if (!response.ok) {
                this.showMessage(data.error || 'Erreur', 'error');
                return;
            }

            this.showMessage('Ami ajoute', 'success');
            this.loadRequests();
        } catch (error) {
            console.error('Accept request error:', error);
            this.showMessage('Erreur', 'error');
        }
    }

    /**
     * Declines a friend request
     */
    async declineRequest(userId) {
        try {
            const response = await fetch(`${API.FRIENDS.DECLINE}/${userId}`, {
                method: 'POST',
                headers: this.getHeaders()
            });
            const data = await response.json();

            if (!response.ok) {
                this.showMessage(data.error || 'Erreur', 'error');
                return;
            }

            this.showMessage('Demande refusee', 'success');
            this.loadRequests();
        } catch (error) {
            console.error('Decline request error:', error);
            this.showMessage('Erreur', 'error');
        }
    }

    /**
     * Removes a friend
     */
    async removeFriend(userId) {
        try {
            const response = await fetch(`${API.FRIENDS.LIST}/${userId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            const data = await response.json();

            if (!response.ok) {
                this.showMessage(data.error || 'Erreur', 'error');
                return;
            }

            this.showMessage('Ami retire', 'success');
            this.loadFriends();
        } catch (error) {
            console.error('Remove friend error:', error);
            this.showMessage('Erreur', 'error');
        }
    }

    /**
     * Shows a message
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
