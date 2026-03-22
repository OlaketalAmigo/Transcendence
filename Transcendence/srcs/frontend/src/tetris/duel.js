// ─────────────────────────────────────────────
// DUEL
// ─────────────────────────────────────────────

class Duel {
    // ui : { showOverlay, hideOverlay, render, renderOpponent, updateButtons }
    constructor(socket, tetrisGame, onStatusChange, onStart, ui) {
        this.socket         = socket;
        this.tetrisGame     = tetrisGame;
        this.onStatusChange = onStatusChange;
        this.onStart        = onStart;
        this.ui             = ui;

        this.action_queue         = [];
        this.opponentGrid         = this._emptyGrid();
        this.opponentScore        = 0;
        this.opponentShieldActive = false;
        this.roomCode             = null;
        this.isReady              = false;

        this._bindSocketEvents();
    }

    // ─── Connexion ────────────────────────────

    join(roomCode) {
        this.roomCode = roomCode;
        this.socket.emit('tetris:join', { roomCode });
    }

    startDuel() {
        if (!this.isReady) return;
        this.socket.emit('tetris:start-duel');
    }

    leave() {
        if (!this.roomCode) return;
        this.socket.emit('tetris:leave');
        this.roomCode             = null;
        this.isReady              = false;
        this.opponentGrid         = this._emptyGrid();
        this.opponentScore        = 0;
        this.opponentShieldActive = false;
    }

    // ─── Hooks appelés par tetris.js ──────────

    onLocalBlockPlaced(grid, score) {
        if (!this.isReady) return;
        this.socket.emit('tetris:grid-update', { grid, score });
    }

    onLocalLinesCleared(count, holeCol) {
        if (!this.isReady) return;
        const garbageLines = Array.from({ length: count }, () => this._buildGarbageLine(holeCol));
        this.socket.emit('tetris:lines-cleared', { count, holeCol, garbageLines });
    }

    onLocalGameOver(score, validBlock) {
        if (!this.isReady) return;
        this.socket.emit('tetris:game-over', { score, validBlock });
        this.endDuel();
    }

    onLocalShieldChanged(event) {
        if (!this.isReady) return;
        if (event === 'activated')   this.socket.emit('tetris:shield-activated');
        else if (event === 'deactivated') this.socket.emit('tetris:shield-deactivated');
    }

    endDuel() {
        this.isReady      = false;
        this.action_queue = [];
        if (this.tetrisGame.isRunning) this.tetrisGame.stop();
    }

    // ─── Traitement de la queue ───────────────

    synchronize_game() {
        while (this.action_queue.length > 0) {
            this._processAction(this.action_queue.shift());
        }
    }

    _processAction(action) {
        switch (action.type) {
            case 'GRID_UPDATE':
                this.opponentGrid  = action.grid;
                this.opponentScore = action.score;
                document.getElementById('opponent-score').textContent = action.score;
                this.ui.renderOpponent(this.opponentGrid, this.opponentShieldActive);
                break;

            case 'LINES_CLEARED':
                this.tetrisGame.addGarbageLines(action.garbageLines);
                break;

            case 'OPPONENT_GAME_OVER':
                this.ui.showOverlay('YOU WIN', action.score);
                this.endDuel();
                break;

            case 'OPPONENT_SHIELD_ACTIVATED':
                this.opponentShieldActive = true;
                break;

            case 'OPPONENT_SHIELD_DEACTIVATED':
                this.opponentShieldActive = false;
                break;
        }
    }

    // ─── Liaison socket ───────────────────────

    _bindSocketEvents() {
        this.socket.on('tetris:room-status', (data) => {
            this.isReady = data.status === 'ready';
            const opponentName = data.players.find(p => p !== this.socket.username) || 'Adversaire';
            document.getElementById('opponent-name').textContent = opponentName;
            this.onStatusChange(data.status, opponentName);
        });

        this.socket.on('tetris:opponent-joined', (data) => {
            document.getElementById('opponent-name').textContent = data.username;
        });

        this.socket.on('tetris:opponent-left', () => {
            this.isReady = false;
            this.onStatusChange('waiting', null);
            this._showOpponentOverlay('DÉCONNECTÉ');
        });

        this.socket.on('tetris:grid-update', (data) => {
            this.action_queue.push({ type: 'GRID_UPDATE', grid: data.grid, score: data.score });
        });

        this.socket.on('tetris:lines-cleared', (data) => {
            this.action_queue.push({ type: 'LINES_CLEARED', garbageLines: data.garbageLines });
        });

        this.socket.on('tetris:opponent-game-over', (data) => {
            this.action_queue.push({ type: 'OPPONENT_GAME_OVER', score: data.score, validBlock: data.validBlock });
        });

        this.socket.on('tetris:shield-activated', () => {
            this.action_queue.push({ type: 'OPPONENT_SHIELD_ACTIVATED' });
        });

        this.socket.on('tetris:shield-deactivated', () => {
            this.action_queue.push({ type: 'OPPONENT_SHIELD_DEACTIVATED' });
        });

        this.socket.on('tetris:start-duel', () => {
            if (this.onStart) this.onStart();
        });

        this.socket.on('tetris:pause', () => {
            this.tetrisGame.pause();
            this.ui.updateButtons();
            if (this.tetrisGame.isPaused) this.ui.showOverlay('PAUSE');
            else this.ui.hideOverlay();
        });

        this.socket.on('tetris:stop', () => {
            this.tetrisGame.stop();
            this.ui.updateButtons();
            this.ui.render();
            this.ui.showOverlay('STOPPED');
        });

        this.socket.on('tetris:settings', (data) => {
            document.getElementById('input-ttd').value       = data.timeToDown;
            document.getElementById('input-hardening').value = data.hardening;
            document.getElementById('input-decrement').value = data.decrementTTD;
            this.tetrisGame.configure(data);
        });
    }

    togglePause() {
        if (!this.isReady) return;
        this.socket.emit('tetris:pause');
    }

    stop() {
        if (!this.isReady) return;
        this.socket.emit('tetris:stop');
    }

    syncSettings(settings) {
        if (!this.isReady) return;
        this.socket.emit('tetris:settings', settings);
    }

    // ─── Utilitaires ─────────────────────────

    _buildGarbageLine(holeCol) {
        return Array.from({ length: 10 }, (_, i) => i === holeCol ? 0 : 8);
    }

    _emptyGrid() {
        return Array.from({ length: 20 }, () => Array(10).fill(0));
    }

    _showOpponentOverlay(title, score) {
        const overlayEl = document.getElementById('overlay-opponent');
        document.getElementById('overlay-opponent-title').textContent = title;
        const scoreEl = document.getElementById('overlay-opponent-score');
        if (scoreEl) scoreEl.textContent = score !== undefined ? `Score : ${score}` : '';
        overlayEl.classList.add('visible');
    }

    hideOpponentOverlay() {
        document.getElementById('overlay-opponent').classList.remove('visible');
    }
}
