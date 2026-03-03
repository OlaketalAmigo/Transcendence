// ─────────────────────────────────────────────
// DUEL
// ─────────────────────────────────────────────

class Duel {
    constructor(socket, tetrisGame, onStatusChange, onStart) {
        this.socket         = socket;
        this.tetrisGame     = tetrisGame;
        this.onStatusChange = onStatusChange;   // (status, opponentName) => void
        this.onStart        = onStart;          // () => void — déclenche le début du jeu local

        this.action_queue   = [];
        this.opponentGrid   = this._emptyGrid();
        this.opponentScore  = 0;
        this.roomCode       = null;
        this.isReady        = false;

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
        this.roomCode  = null;
        this.isReady   = false;
        this.opponentGrid = this._emptyGrid();
        this.opponentScore = 0;
    }

    // ─── Hooks appelés par tetris.js ──────────

    onLocalBlockPlaced(grid, score) {
        if (!this.isReady) return;
        this.socket.emit('tetris:grid-update', { grid, score });
    }

    onLocalLinesCleared(count, holeCol) {
        if (!this.isReady) return;
        const garbageLines = [];
        for (let i = 0; i < count; i++)
            garbageLines.push(this._buildGarbageLine(holeCol));
        this.socket.emit('tetris:lines-cleared', { count, holeCol, garbageLines });
    }

    onLocalGameOver(score) {
        if (!this.isReady) return;
        this.socket.emit('tetris:game-over', { score });
    }

    // ─── Traitement de la queue ───────────────

    synchronize_game() {
        while (this.action_queue.length > 0) {
            const action = this.action_queue.shift();
            this._processAction(action);
        }
    }

    _processAction(action) {
        switch (action.type) {
            case 'GRID_UPDATE':
                this.opponentGrid  = action.grid;
                this.opponentScore = action.score;
                document.getElementById('opponent-score').textContent = action.score;
                renderOpponent(this.opponentGrid);
                break;

            case 'LINES_CLEARED':
                this.tetrisGame.addGarbageLines(action.garbageLines);
                break;

            case 'OPPONENT_GAME_OVER':
                this._showOpponentOverlay('YOU WIN', action.score);
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
            this.action_queue.push({ type: 'OPPONENT_GAME_OVER', score: data.score });
        });

        this.socket.on('tetris:start-duel', () => {
            if (this.onStart) this.onStart();
        });
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
