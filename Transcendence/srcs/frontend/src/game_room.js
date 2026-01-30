import { Window } from './windows.js';
import { API, STORAGE_KEYS, CSS } from './config.js';
import { eventBus, Events } from './events.js';

export class GameRoomWindow extends Window {
    constructor() {
        super({
            name: 'gameroom',
            title: 'Game Rooms',
            cssClasses: ['gameroom-window']
        });

        this.currentTab = 'browse';
        this.currentRoom = null;
        this.roomsList = [];
        this.socket = null;
        this.buildUI();
        this.bindEvents();

        eventBus.on(Events.USER_LOGGED_IN, () => {
            this.updateTabsAccess();
            this.checkCurrentRoom();
        });
        eventBus.on(Events.USER_LOGGED_OUT, () => {
            this.handleLogout();
        });

        this.updateTabsAccess();

        // Verifier si l'utilisateur est deja dans un salon au chargement
        if (this.isLoggedIn()) {
            this.checkCurrentRoom();
        }
    }

    buildUI() {
        this.tabs = this.createElement('div', CSS.GAMEROOM_TABS);

        this.browseTab = this.createElement('button', [CSS.GAMEROOM_TAB, CSS.GAMEROOM_TAB_ACTIVE], {
            text: 'Salons'
        });
        this.browseTab.dataset.tab = 'browse';

        this.createTab = this.createElement('button', CSS.GAMEROOM_TAB, {
            text: 'Creer'
        });
        this.createTab.dataset.tab = 'create';

        this.lobbyTab = this.createElement('button', CSS.GAMEROOM_TAB, {
            text: 'Lobby'
        });
        this.lobbyTab.dataset.tab = 'lobby';
        this.lobbyTab.style.display = 'none';

        this.tabs.append(this.browseTab, this.createTab, this.lobbyTab);

        this.content = this.createElement('div', CSS.GAMEROOM_CONTENT);

        this.createContainer = this.createElement('div', CSS.GAMEROOM_CREATE);
        this.roomNameInput = this.createElement('input', CSS.INPUT, {
            type: 'text',
            placeholder: 'Nom du salon...'
        });
        this.createBtn = this.createElement('button', [CSS.BTN, CSS.BTN_PRIMARY], {
            text: 'Creer le salon'
        });
        this.createContainer.append(this.roomNameInput, this.createBtn);
        this.createContainer.style.display = 'none';

        this.lobbyContainer = this.createElement('div', CSS.GAMEROOM_LOBBY);
        this.lobbyTitle = this.createElement('h3', 'gameroom__lobby-title', { text: '' });
        this.playerList = this.createElement('div', CSS.GAMEROOM_PLAYER_LIST);

        // Boutons du lobby
        this.lobbyButtons = this.createElement('div', 'gameroom__lobby-buttons');
        this.startGameBtn = this.createElement('button', [CSS.BTN, CSS.BTN_SUCCESS], {
            text: 'Lancer le jeu'
        });
        this.leaveBtn = this.createElement('button', [CSS.BTN, CSS.BTN_DANGER], {
            text: 'Quitter'
        });
        this.lobbyButtons.append(this.startGameBtn, this.leaveBtn);

        // Container du jeu (caché par défaut)
        this.gameContainer = this.createElement('div', 'gameroom__game');
        this.gameContainer.style.display = 'none';
        this.buildGameUI();

        this.lobbyContainer.append(this.lobbyTitle, this.playerList, this.lobbyButtons, this.gameContainer);
        this.lobbyContainer.style.display = 'none';

        this.list = this.createElement('div', CSS.GAMEROOM_LIST);

        this.message = this.createElement('div', CSS.MESSAGE);

        this.content.append(this.createContainer, this.lobbyContainer, this.list, this.message);

        this.body.append(this.tabs, this.content);
    }

    buildGameUI() {
        // Zone d'info du jeu
        this.gameInfo = this.createElement('div', 'gameroom__game-info');
        this.currentDrawerInfo = this.createElement('div', 'gameroom__drawer-info', { text: '' });
        this.scoresDisplay = this.createElement('div', 'gameroom__scores-display');
        this.gameInfo.append(this.currentDrawerInfo, this.scoresDisplay);

        // Affichage du mot caché
        this.wordDisplay = this.createElement('div', 'gameroom__word-display');

        // Canvas de dessin
        this.canvasContainer = this.createElement('div', 'gameroom__canvas-container');
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'gameroom__canvas';
        this.canvas.width = 380;
        this.canvas.height = 200;
        this.ctx = this.canvas.getContext('2d');
        this.canvasContainer.appendChild(this.canvas);

        // Outils de dessin
        this.drawTools = this.createElement('div', 'gameroom__draw-tools');
        this.colorPicker = this.createElement('input', 'gameroom__color-picker');
        this.colorPicker.type = 'color';
        this.colorPicker.value = '#ffffff';
        this.clearCanvasBtn = this.createElement('button', [CSS.BTN, CSS.BTN_SECONDARY], { text: 'Effacer' });
        this.drawTools.append(this.colorPicker, this.clearCanvasBtn);
        this.drawTools.style.display = 'none';

        // Zone pour choisir le mot (pour le dessinateur)
        this.wordInputContainer = this.createElement('div', 'gameroom__word-input-container');
        this.wordInput = this.createElement('input', CSS.INPUT, {
            type: 'text',
            placeholder: 'Entrez le mot a faire deviner...'
        });
        this.confirmWordBtn = this.createElement('button', [CSS.BTN, CSS.BTN_PRIMARY], { text: 'OK' });
        this.wordInputContainer.append(this.wordInput, this.confirmWordBtn);
        this.wordInputContainer.style.display = 'none';

        // Zone pour deviner (pour les autres joueurs)
        this.guessContainer = this.createElement('div', 'gameroom__guess-container');
        this.letterInput = this.createElement('input', CSS.INPUT, {
            type: 'text',
            placeholder: 'Proposez une lettre ou le mot...',
            maxLength: '50'
        });
        this.guessBtn = this.createElement('button', [CSS.BTN, CSS.BTN_PRIMARY], { text: 'Deviner' });
        this.guessContainer.append(this.letterInput, this.guessBtn);
        this.guessContainer.style.display = 'none';

        // Historique des tentatives
        this.guessHistory = this.createElement('div', 'gameroom__guess-history');

        // Boutons du jeu
        this.gameButtons = this.createElement('div', 'gameroom__game-buttons');
        this.backToLobbyBtn = this.createElement('button', [CSS.BTN, CSS.BTN_SECONDARY], { text: 'Retour au lobby' });
        this.endRoundBtn = this.createElement('button', [CSS.BTN, CSS.BTN_DANGER], { text: 'Terminer le jeu' });
        this.gameButtons.append(this.backToLobbyBtn, this.endRoundBtn);

        this.gameContainer.append(
            this.gameInfo,
            this.wordDisplay,
            this.canvasContainer,
            this.drawTools,
            this.wordInputContainer,
            this.guessContainer,
            this.guessHistory,
            this.gameButtons
        );

        // Initialiser les variables du jeu
        this.gameState = {
            isPlaying: false,
            currentWord: '',
            wordLength: 0,
            revealedLetters: [],
            revealedWord: [],
            drawer: null,
            players: [],
            currentPlayerIndex: 0,
            guessedLetters: [],
            scores: {}
        };

        this.initDrawing();
    }

    initDrawing() {
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;

        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.gameState.isPlaying || !this.isCurrentUserDrawer()) return;
            this.isDrawing = true;
            [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isDrawing) return;

            const x1 = this.lastX;
            const y1 = this.lastY;
            const x2 = e.offsetX;
            const y2 = e.offsetY;
            const color = this.colorPicker.value;
            const lineWidth = 3;

            // Dessiner localement
            this.drawLine(x1, y1, x2, y2, color, lineWidth);

            // Envoyer aux autres joueurs via WebSocket
            if (this.socket?.connected) {
                this.socket.emit('game-draw', { x1, y1, x2, y2, color, lineWidth });
            }

            [this.lastX, this.lastY] = [x2, y2];
        });

        this.canvas.addEventListener('mouseup', () => this.isDrawing = false);
        this.canvas.addEventListener('mouseout', () => this.isDrawing = false);

        this.clearCanvasBtn.addEventListener('click', () => {
            this.clearCanvas();
            // Notifier les autres
            if (this.socket?.connected) {
                this.socket.emit('game-clear-canvas');
            }
        });
    }

    drawLine(x1, y1, x2, y2, color, lineWidth) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    clearCanvas() {
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    bindEvents() {
        this.tabs.addEventListener('click', (e) => {
            const tab = e.target.closest(`.${CSS.GAMEROOM_TAB}`);
            if (tab) {
                this.switchTab(tab.dataset.tab);
            }
        });

        this.createBtn.addEventListener('click', () => this.createRoom());
        this.roomNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.createRoom();
        });

        this.leaveBtn.addEventListener('click', () => this.leaveRoom());
        this.startGameBtn.addEventListener('click', () => this.startGame());

        // Events du jeu
        this.confirmWordBtn.addEventListener('click', () => this.confirmWord());
        this.wordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.confirmWord();
        });

        this.guessBtn.addEventListener('click', () => this.makeGuess());
        this.letterInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.makeGuess();
        });

        this.backToLobbyBtn.addEventListener('click', () => this.backToLobby());
        this.endRoundBtn.addEventListener('click', () => this.endGame());
    }

    // ============================================
    // SOCKET.IO CONNECTION
    // ============================================

    async connectToGameSocket() {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token || !this.currentRoom) return;

        // Ensure socket is connected
        await this.ensureSocketConnected();

        // Join the room
        if (this.socket?.connected) {
            console.log('Socket connected, joining room:', this.currentRoom.id);
            this.socket.emit('game-join-room', { roomId: this.currentRoom.id });
        }
    }

    async loadSocketIO() {
        if (window.io) return;

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/socket.io/socket.io.js';

            script.onload = () => {
                console.log('Socket.IO loaded for game');
                resolve();
            };

            script.onerror = () => {
                console.error('Failed to load Socket.IO');
                reject(new Error('Socket.IO load failed'));
            };

            document.head.appendChild(script);
        });
    }

    setupGameSocketListeners() {
        this.socketReady = false;

        this.socket.on('connect', () => {
            console.log('Game socket connected, id:', this.socket.id);
            if (this.currentRoom) {
                console.log('Joining room:', this.currentRoom.id);
                this.socket.emit('game-join-room', { roomId: this.currentRoom.id });
            }
        });

        this.socket.on('connect_error', (err) => {
            console.error('Game socket connection error:', err.message);
        });

        // Confirmation that we joined the room
        this.socket.on('game-room-joined', (data) => {
            console.log('Successfully joined game room:', data.roomId);
            this.socketReady = true;
        });

        // Real-time rooms list update
        this.socket.on('game-rooms-updated', (data) => {
            console.log('Rooms list updated:', data.rooms?.length, 'rooms');
            if (this.currentTab === 'browse') {
                this.roomsList = data.rooms || [];
                this.renderRoomsList(this.roomsList);
            }
        });

        // Real-time player list update in lobby
        this.socket.on('game-players-updated', (data) => {
            console.log('Players list updated:', data.players?.length, 'players');
            if (this.currentRoom) {
                this.renderPlayersList(data.players || []);
            }
        });

        // Player joined/left
        this.socket.on('game-player-joined', (data) => {
            console.log(`${data.username} joined the room`);
        });

        this.socket.on('game-player-left', (data) => {
            console.log(`${data.username} left the room`);
        });

        // Game started
        this.socket.on('game-started', (data) => {
            console.log('Received game-started event:', data);
            this.gameState.isPlaying = true;
            this.gameState.drawer = data.drawer;
            this.gameState.players = data.players;
            this.gameState.currentPlayerIndex = data.players.indexOf(data.drawer);

            // Initialize scores
            this.gameState.scores = {};
            data.players.forEach(p => this.gameState.scores[p] = 0);

            this.showGameUI();
            this.setupRound();
        });

        // Word was set by drawer
        this.socket.on('game-word-set', (data) => {
            console.log(`Word set by ${data.drawer}, length: ${data.wordLength}`);
            this.gameState.wordLength = data.wordLength;
            this.gameState.revealedLetters = new Array(data.wordLength).fill(false);
            this.gameState.revealedWord = data.revealedWord || new Array(data.wordLength).fill('_');

            if (data.scores) {
                this.updateScoresDisplay(data.scores);
            }

            this.updateWordDisplay();
            this.currentDrawerInfo.textContent = `${data.drawer} dessine (${data.wordLength} lettres)`;

            // Enable guess input for non-drawers
            if (!this.isCurrentUserDrawer()) {
                this.guessContainer.style.display = 'flex';
                this.letterInput.disabled = false;
                this.guessBtn.disabled = false;
                this.letterInput.placeholder = 'Proposez une lettre ou le mot...';
                this.letterInput.focus();
            }
        });

        // Drawing received
        this.socket.on('game-draw', (data) => {
            this.drawLine(data.x1, data.y1, data.x2, data.y2, data.color, data.lineWidth);
        });

        // Clear canvas
        this.socket.on('game-clear-canvas', () => {
            this.clearCanvas();
        });

        // Guess result
        this.socket.on('game-guess-result', (data) => {
            this.addGuessToHistory(data.guess, data.success, data.type, data.username, data.points || 0);

            if (data.revealedLetters) {
                this.gameState.revealedLetters = data.revealedLetters;
            }
            if (data.revealedWord) {
                this.gameState.revealedWord = data.revealedWord;
            }
            if (data.scores) {
                this.updateScoresDisplay(data.scores);
            }
            this.updateWordDisplay();
        });

        // Word found
        this.socket.on('game-word-found', (data) => {
            if (data.scores) {
                this.updateScoresDisplay(data.scores);
            }
            this.wordFound(data.word, data.winner, data.drawerBonus || 0);
        });

        // New round
        this.socket.on('game-new-round', (data) => {
            this.gameState.drawer = data.drawer;
            this.gameState.currentPlayerIndex = this.gameState.players.indexOf(data.drawer);
            this.setupRound();
        });

        // Game ended
        this.socket.on('game-ended', () => {
            this.resetGameUI();
        });

        // Sync state for late joiners
        this.socket.on('game-state-sync', (data) => {
            if (data.isPlaying) {
                this.gameState.isPlaying = true;
                this.gameState.drawer = data.drawer;
                this.gameState.wordLength = data.wordLength;
                this.gameState.revealedLetters = data.revealedLetters || [];
                this.gameState.revealedWord = data.revealedWord || new Array(data.wordLength).fill('_');
                this.gameState.players = data.players;

                this.showGameUI();
                this.updateWordDisplay();
                this.currentDrawerInfo.textContent = `${data.drawer} dessine (${data.wordLength} lettres)`;

                if (!this.isCurrentUserDrawer()) {
                    this.guessContainer.style.display = 'flex';
                    if (data.wordLength > 0) {
                        this.letterInput.disabled = false;
                        this.guessBtn.disabled = false;
                        this.letterInput.placeholder = 'Proposez une lettre ou le mot...';
                    } else {
                        this.letterInput.disabled = true;
                        this.guessBtn.disabled = true;
                        this.letterInput.placeholder = 'En attente du mot...';
                    }
                }
            }
        });
    }

    disconnectGameSocket() {
        if (this.socket) {
            this.socket.emit('game-leave-room');
        }
    }

    // ============================================
    // UI HELPERS
    // ============================================

    isLoggedIn() {
        return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    }

    updateTabsAccess() {
        const loggedIn = this.isLoggedIn();

        this.createTab.disabled = !loggedIn;
        this.createTab.style.opacity = loggedIn ? '1' : '0.5';
        this.createTab.title = loggedIn ? '' : 'Connectez-vous pour creer un salon';

        if (!loggedIn && this.currentTab === 'create') {
            this.switchTab('browse');
        }
    }

    handleLogout() {
        this.disconnectGameSocket();
        if (this.currentRoom) {
            this.exitLobby();
        }
        this.updateTabsAccess();
        if (this.currentTab !== 'browse') {
            this.switchTab('browse');
        }
    }

    switchTab(tabName) {
        if (tabName === 'lobby' && !this.currentRoom) {
            return;
        }

        if (tabName === 'create' && !this.isLoggedIn()) {
            this.showMessage('Connectez-vous pour creer un salon', 'info');
            return;
        }

        this.currentTab = tabName;

        [this.browseTab, this.createTab, this.lobbyTab].forEach(tab => {
            tab.classList.toggle(CSS.GAMEROOM_TAB_ACTIVE, tab.dataset.tab === tabName);
        });

        this.createContainer.style.display = tabName === 'create' ? 'flex' : 'none';
        this.lobbyContainer.style.display = tabName === 'lobby' ? 'flex' : 'none';
        this.list.style.display = tabName === 'browse' ? 'flex' : 'none';

        this.loadCurrentTab();
    }

    loadCurrentTab() {
        switch (this.currentTab) {
            case 'browse':
                this.loadRooms();
                // Connect to socket to receive real-time room updates
                this.ensureSocketConnected();
                break;
            case 'create':
                this.message.textContent = '';
                this.ensureSocketConnected();
                break;
            case 'lobby':
                if (this.currentRoom) {
                    this.loadLobby();
                }
                break;
        }
    }

    async ensureSocketConnected() {
        if (!this.isLoggedIn()) return;
        if (this.socket?.connected) return;

        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) return;

        await this.loadSocketIO();

        const ioConfig = {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['websocket', 'polling']
        };

        const altPort = window.GLOBAL_CHAT_ALT_PORT;
        if (altPort) {
            const host = location.hostname || 'localhost';
            this.socket = io(`http://${host}:${altPort}`, ioConfig);
        } else {
            this.socket = io(ioConfig);
        }

        this.setupGameSocketListeners();
    }

    getHeaders() {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    async loadRooms() {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
            this.showMessage('Connectez-vous pour voir les salons', 'info');
            return;
        }

        try {
            const response = await fetch(API.ROOMS.LIST, {
                headers: this.getHeaders()
            });
            const data = await response.json();

            if (!response.ok) {
                this.showMessage(data.error || 'Erreur', 'error');
                return;
            }

            this.roomsList = data || [];
            this.renderRoomsList(this.roomsList);
        } catch (error) {
            console.error('Load rooms error:', error);
            this.showMessage('Erreur de connexion', 'error');
        }
    }

    async checkCurrentRoom() {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
            return null;
        }

        try {
            const response = await fetch(API.ROOMS.CURRENT, {
                headers: this.getHeaders()
            });

            // 204 No Content means user is not in any room
            if (response.status === 204) {
                return null;
            }

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            if (data && data.id) {
                this.currentRoom = data;
                this.enterLobby(data);
                return data;
            }
            return null;
        } catch (error) {
            console.error('Check current room error:', error);
            return null;
        }
    }

    roomNameExists(name) {
        const normalizedName = name.toLowerCase().trim();
        return this.roomsList.some(room => room.name.toLowerCase().trim() === normalizedName);
    }

    renderRoomsList(rooms) {
        this.list.innerHTML = '';
        this.message.textContent = '';

        if (rooms.length === 0) {
            this.showMessage('Aucun salon disponible', 'info');
            return;
        }

        rooms.forEach(room => {
            const item = this.createRoomItem(room);
            this.list.appendChild(item);
        });
    }

    createRoomItem(room) {
        const item = this.createElement('div', CSS.GAMEROOM_ITEM);

        const name = this.createElement('span', CSS.GAMEROOM_NAME, {
            text: room.name
        });

        const players = this.createElement('span', CSS.GAMEROOM_PLAYERS, {
            text: `${room.player_count || 0}/${room.max_players || 8}`
        });

        const actions = this.createElement('div', CSS.GAMEROOM_ACTIONS);

        const joinBtn = this.createElement('button', [CSS.BTN, CSS.BTN_SUCCESS], {
            text: 'Rejoindre'
        });
        joinBtn.addEventListener('click', () => this.joinRoom(room.id));
        actions.appendChild(joinBtn);

        item.append(name, players, actions);
        return item;
    }

    async createRoom() {
        const name = this.roomNameInput.value.trim();
        if (!name) {
            this.showMessage('Entrez un nom pour le salon', 'error');
            return;
        }

        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
            this.showMessage('Connectez-vous pour creer un salon', 'info');
            return;
        }

        if (this.currentRoom) {
            this.showMessage('Vous etes deja dans un salon. Quittez-le d\'abord.', 'error');
            return;
        }

        try {
            const currentResponse = await fetch(API.ROOMS.CURRENT, {
                headers: this.getHeaders()
            });
            if (currentResponse.ok && currentResponse.status !== 204) {
                const currentData = await currentResponse.json();
                if (currentData && currentData.id) {
                    this.currentRoom = currentData;
                    this.enterLobby(currentData);
                    this.showMessage('Vous etes deja dans un salon', 'error');
                    return;
                }
            }
        } catch (e) {
            // Continue
        }

        try {
            const listResponse = await fetch(API.ROOMS.LIST, {
                headers: this.getHeaders()
            });
            if (listResponse.ok) {
                this.roomsList = await listResponse.json() || [];
            }
        } catch (e) {
            // Continue
        }

        if (this.roomNameExists(name)) {
            this.showMessage('Un salon avec ce nom existe deja', 'error');
            return;
        }

        try {
            const response = await fetch(API.ROOMS.CREATE, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ name })
            });
            const data = await response.json();

            if (!response.ok) {
                this.showMessage(data.error || 'Erreur', 'error');
                return;
            }

            this.roomNameInput.value = '';
            this.currentRoom = data;
            this.showMessage('Salon cree', 'success');
            eventBus.emit(Events.ROOM_CREATED, data);
            this.enterLobby(data);
        } catch (error) {
            console.error('Create room error:', error);
            this.showMessage('Erreur de connexion', 'error');
        }
    }

    async joinRoom(roomId) {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
            this.showMessage('Connectez-vous pour rejoindre', 'info');
            return;
        }

        if (this.currentRoom) {
            this.showMessage('Vous etes deja dans un salon. Quittez-le d\'abord.', 'error');
            return;
        }

        try {
            const currentResponse = await fetch(API.ROOMS.CURRENT, {
                headers: this.getHeaders()
            });
            if (currentResponse.ok && currentResponse.status !== 204) {
                const currentData = await currentResponse.json();
                if (currentData && currentData.id) {
                    this.currentRoom = currentData;
                    this.enterLobby(currentData);
                    this.showMessage('Vous etes deja dans un salon', 'error');
                    return;
                }
            }
        } catch (e) {
            // Continue
        }

        try {
            const response = await fetch(API.ROOMS.JOIN(roomId), {
                method: 'POST',
                headers: this.getHeaders()
            });
            const data = await response.json();

            if (!response.ok) {
                this.showMessage(data.error || 'Erreur', 'error');
                return;
            }

            const roomResponse = await fetch(API.ROOMS.GET(roomId), {
                headers: this.getHeaders()
            });
            const roomData = await roomResponse.json();

            this.currentRoom = roomData;
            eventBus.emit(Events.ROOM_JOINED, roomData);
            this.enterLobby(roomData);
        } catch (error) {
            console.error('Join room error:', error);
            this.showMessage('Erreur de connexion', 'error');
        }
    }

    enterLobby(room) {
        this.currentRoom = room;
        this.lobbyTab.style.display = 'block';
        this.lobbyTitle.textContent = room.name;
        this.switchTab('lobby');

        // Connect to WebSocket for real-time sync
        this.connectToGameSocket();
    }

    async loadLobby() {
        if (!this.currentRoom) return;

        try {
            const response = await fetch(API.ROOMS.PLAYERS(this.currentRoom.id), {
                headers: this.getHeaders()
            });
            const data = await response.json();

            if (!response.ok) {
                this.showMessage(data.error || 'Erreur', 'error');
                return;
            }

            this.renderPlayersList(data || []);
        } catch (error) {
            console.error('Load lobby error:', error);
            this.showMessage('Erreur de connexion', 'error');
        }
    }

    renderPlayersList(players) {
        this.playerList.innerHTML = '';

        if (players.length === 0) {
            const empty = this.createElement('div', 'gameroom__empty', {
                text: 'Aucun joueur'
            });
            this.playerList.appendChild(empty);
            return;
        }

        players.forEach(player => {
            const item = this.createElement('div', CSS.GAMEROOM_PLAYER);

            const avatar = this.createElement('img', CSS.GAMEROOM_PLAYER_AVATAR, {
                alt: player.username
            });
            avatar.src = player.avatar_url || '/avatar/default.png';

            const name = this.createElement('span', CSS.GAMEROOM_PLAYER_NAME, {
                text: player.username
            });

            const statsContainer = this.createElement('div', 'gameroom__player-stats');

            const score = this.createElement('span', CSS.GAMEROOM_PLAYER_SCORE, {
                text: `${player.score || 0} pts`
            });

            const totalPoints = this.createElement('span', 'gameroom__player-total', {
                text: `Total: ${player.total_points || 0}`
            });

            statsContainer.append(score, totalPoints);
            item.append(avatar, name, statsContainer);
            this.playerList.appendChild(item);
        });
    }

    async leaveRoom() {
        if (!this.currentRoom) return;

        // End game if playing
        if (this.gameState.isPlaying) {
            this.endGame();
        }

        this.disconnectGameSocket();

        try {
            const response = await fetch(API.ROOMS.LEAVE(this.currentRoom.id), {
                method: 'POST',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                const data = await response.json();
                this.showMessage(data.error || 'Erreur', 'error');
                return;
            }

            eventBus.emit(Events.ROOM_LEFT, this.currentRoom);
            this.exitLobby();
        } catch (error) {
            console.error('Leave room error:', error);
            this.showMessage('Erreur de connexion', 'error');
        }
    }

    exitLobby() {
        this.currentRoom = null;
        this.lobbyTab.style.display = 'none';
        this.playerList.innerHTML = '';
        this.lobbyTitle.textContent = '';
        this.resetGameUI();
        this.switchTab('browse');
    }

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

    // ============================================
    // LOGIQUE DU JEU
    // ============================================

    getCurrentUsername() {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.username || payload.sub || 'Joueur';
        } catch {
            return 'Joueur';
        }
    }

    isCurrentUserDrawer() {
        return this.gameState.drawer === this.getCurrentUsername();
    }

    showGameUI() {
        this.gameContainer.style.display = 'flex';
        this.playerList.style.display = 'none';
        this.lobbyButtons.style.display = 'none';
        this.clearCanvas();
        this.guessHistory.innerHTML = '';
    }

    resetGameUI() {
        this.gameState.isPlaying = false;
        this.gameState.currentWord = '';
        this.gameState.wordLength = 0;
        this.gameState.revealedLetters = [];
        this.gameState.revealedWord = [];
        this.gameState.drawer = null;

        this.gameContainer.style.display = 'none';
        this.playerList.style.display = 'flex';
        this.lobbyButtons.style.display = 'flex';

        this.wordInputContainer.style.display = 'none';
        this.guessContainer.style.display = 'none';
        this.drawTools.style.display = 'none';

        this.currentDrawerInfo.classList.remove('gameroom__drawer-info--winner');
    }

    async startGame() {
        console.log('startGame called');

        // Load player list
        await this.loadLobby();

        const playerElements = this.playerList.querySelectorAll('.gameroom__player-name');
        const players = Array.from(playerElements).map(el => el.textContent);

        console.log('Players found:', players);

        if (players.length < 1) {
            this.showMessage('Il faut au moins 1 joueur pour jouer', 'error');
            return;
        }

        const drawer = players[0];

        console.log('Socket connected:', this.socket?.connected, 'Socket ready:', this.socketReady);

        // Send start game event via WebSocket
        if (this.socket?.connected) {
            console.log('Emitting game-start event');
            this.socket.emit('game-start', { drawer, players });
        } else {
            console.log('No socket, using local fallback');
            // Fallback local - start immediately
            this.gameState.isPlaying = true;
            this.gameState.players = players;
            this.gameState.drawer = drawer;
            this.gameState.currentPlayerIndex = 0;
            this.showGameUI();
            this.setupRound();
        }
    }

    setupRound() {
        this.gameState.currentWord = '';
        this.gameState.wordLength = 0;
        this.gameState.revealedLetters = [];
        this.gameState.revealedWord = [];
        this.gameState.guessedLetters = [];

        this.currentDrawerInfo.textContent = `C'est au tour de ${this.gameState.drawer} de dessiner`;
        this.currentDrawerInfo.classList.remove('gameroom__drawer-info--winner');
        this.wordDisplay.textContent = '';
        this.guessHistory.innerHTML = '';
        this.clearCanvas();

        if (this.isCurrentUserDrawer()) {
            // Drawer chooses a word
            this.wordInputContainer.style.display = 'flex';
            this.guessContainer.style.display = 'none';
            this.drawTools.style.display = 'none';
            this.currentDrawerInfo.textContent = 'Choisissez un mot a faire deviner';
        } else {
            // Others see the guess input (disabled while waiting for word)
            this.wordInputContainer.style.display = 'none';
            this.guessContainer.style.display = 'flex';
            this.drawTools.style.display = 'none';
            this.letterInput.disabled = true;
            this.guessBtn.disabled = true;
            this.letterInput.placeholder = 'En attente du mot...';
            this.currentDrawerInfo.textContent = `${this.gameState.drawer} choisit un mot...`;
        }
    }

    confirmWord() {
        const word = this.wordInput.value.trim().toLowerCase();
        if (!word || word.length < 2) {
            this.showMessage('Le mot doit faire au moins 2 lettres', 'error');
            return;
        }

        if (!/^[a-z]+$/.test(word)) {
            this.showMessage('Le mot ne doit contenir que des lettres', 'error');
            return;
        }

        this.gameState.currentWord = word;
        this.gameState.wordLength = word.length;
        this.gameState.revealedLetters = new Array(word.length).fill(false);
        this.gameState.revealedWord = new Array(word.length).fill('_');

        this.wordInput.value = '';
        this.wordInputContainer.style.display = 'none';
        this.drawTools.style.display = 'flex';

        // Send word to server via WebSocket
        if (this.socket?.connected) {
            this.socket.emit('game-set-word', { word });
        }

        this.updateWordDisplay();
        this.currentDrawerInfo.textContent = `Dessinez pour faire deviner le mot (${word.length} lettres)`;
    }

    updateWordDisplay() {
        // If drawer, show from currentWord
        if (this.isCurrentUserDrawer() && this.gameState.currentWord) {
            let display = '';
            for (let i = 0; i < this.gameState.currentWord.length; i++) {
                if (this.gameState.revealedLetters && this.gameState.revealedLetters[i]) {
                    display += this.gameState.currentWord[i] + ' ';
                } else {
                    display += '_ ';
                }
            }
            this.wordDisplay.textContent = display.trim();
            return;
        }

        // For guessers, use revealedWord from server
        if (this.gameState.revealedWord && this.gameState.revealedWord.length > 0) {
            this.wordDisplay.textContent = this.gameState.revealedWord.join(' ');
            return;
        }

        // Fallback: show underscores based on wordLength
        if (this.gameState.wordLength > 0) {
            this.wordDisplay.textContent = '_ '.repeat(this.gameState.wordLength).trim();
        }
    }

    makeGuess() {
        const guess = this.letterInput.value.trim().toLowerCase();
        if (!guess) return;

        this.letterInput.value = '';

        // Send guess via WebSocket
        if (this.socket?.connected) {
            this.socket.emit('game-guess', { guess });
        } else {
            // Fallback local (for testing)
            this.processGuessLocally(guess);
        }
    }

    processGuessLocally(guess) {
        const username = this.getCurrentUsername();

        if (guess.length > 1) {
            const success = guess === this.gameState.currentWord;
            this.addGuessToHistory(guess, success, 'word', username);
            if (success) {
                this.gameState.revealedWord = this.gameState.currentWord.split('');
                this.wordFound(this.gameState.currentWord, username);
            }
            return;
        }

        if (this.gameState.guessedLetters.includes(guess)) {
            this.showMessage('Lettre deja proposee', 'info');
            return;
        }

        this.gameState.guessedLetters.push(guess);

        let found = false;
        for (let i = 0; i < this.gameState.currentWord.length; i++) {
            if (this.gameState.currentWord[i] === guess) {
                this.gameState.revealedLetters[i] = true;
                this.gameState.revealedWord[i] = guess;
                found = true;
            }
        }

        this.addGuessToHistory(guess, found, 'letter', username);
        this.updateWordDisplay();

        if (this.gameState.revealedLetters.every(r => r)) {
            this.wordFound(this.gameState.currentWord, username);
        }
    }

    addGuessToHistory(guess, success, type, username, points = 0) {
        const item = this.createElement('div', 'gameroom__guess-item');
        item.classList.add(success ? 'gameroom__guess-item--success' : 'gameroom__guess-item--fail');

        const typeText = type === 'letter' ? 'lettre' : 'mot';
        const pointsText = points !== 0 ? ` (${points > 0 ? '+' : ''}${points} pts)` : '';

        if (success) {
            item.textContent = `${username}: "${guess}" - Bonne ${typeText}!${pointsText}`;
        } else {
            item.textContent = `${username}: "${guess}" - Mauvais ${typeText}${pointsText}`;
        }

        this.guessHistory.appendChild(item);
        this.guessHistory.scrollTop = this.guessHistory.scrollHeight;
    }

    updateScoresDisplay(scores) {
        if (!scores) return;
        this.gameState.scores = scores;

        // Update scores display in game UI
        if (this.scoresDisplay) {
            const sortedScores = Object.entries(scores)
                .sort((a, b) => b[1] - a[1])
                .map(([name, score]) => `${name}: ${score}`)
                .join(' | ');
            this.scoresDisplay.textContent = sortedScores;
        }

        // Update player list with scores if visible
        const playerItems = this.playerList.querySelectorAll('.gameroom__player');
        playerItems.forEach(item => {
            const nameEl = item.querySelector('.gameroom__player-name');
            const scoreEl = item.querySelector('.gameroom__player-score');
            if (nameEl && scoreEl) {
                const playerName = nameEl.textContent;
                const score = scores[playerName] || 0;
                scoreEl.textContent = `${score} pts`;
            }
        });
    }

    wordFound(word, winner, drawerBonus = 0) {
        let message = `${winner} a trouve le mot: ${word}!`;
        if (drawerBonus > 0 && this.gameState.drawer) {
            message += ` (${this.gameState.drawer} +${drawerBonus} pts)`;
        }
        this.currentDrawerInfo.textContent = message;
        this.currentDrawerInfo.classList.add('gameroom__drawer-info--winner');

        this.guessContainer.style.display = 'none';
        this.drawTools.style.display = 'none';

        // Reveal full word
        this.wordDisplay.textContent = word.split('').join(' ');

        // Auto next round after delay
        setTimeout(() => {
            if (this.gameState.isPlaying) {
                this.nextRound();
            }
        }, 3000);
    }

    nextRound() {
        // Move to next player
        this.gameState.currentPlayerIndex = (this.gameState.currentPlayerIndex + 1) % this.gameState.players.length;
        const nextDrawer = this.gameState.players[this.gameState.currentPlayerIndex];

        if (this.socket?.connected) {
            this.socket.emit('game-next-round', { drawer: nextDrawer });
        } else {
            this.gameState.drawer = nextDrawer;
            this.setupRound();
        }
    }

    backToLobby() {
        // Return to lobby without ending game for others
        this.resetGameUI();
        this.loadLobby();
    }

    endGame() {
        if (this.socket?.connected) {
            this.socket.emit('game-end');
        }
        this.resetGameUI();
        this.showMessage('Jeu termine', 'info');
    }
}
