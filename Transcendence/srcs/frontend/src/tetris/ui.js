// ─────────────────────────────────────────────
// UI — Contrôles, socket, duel, matchmaking
// ─────────────────────────────────────────────

// ── Références DOM ───────────────────────────

const btnStart       = document.getElementById('btn-start');
const btnPause       = document.getElementById('btn-pause');
const btnStop        = document.getElementById('btn-stop');
const btnRestart     = document.getElementById('btn-restart');
const overlay        = document.getElementById('overlay');
const inputTTD       = document.getElementById('input-ttd');
const inputHardening = document.getElementById('input-hardening');
const inputDecrement = document.getElementById('input-decrement');

const btnJoinDuel     = document.getElementById('btn-join-duel');
const btnLeaveDuel    = document.getElementById('btn-leave-duel');
const inputRoomCode   = document.getElementById('input-room-code');
const duelStatusEl    = document.getElementById('duel-status');
const opponentSection = document.getElementById('opponent-section');

const btnMatchmaking       = document.getElementById('btn-matchmaking');
const btnMatchmakingCancel = document.getElementById('btn-matchmaking-cancel');
const matchmakingStatusEl  = document.getElementById('matchmaking-status');

// ── Overlay ──────────────────────────────────

function showOverlay(title, score) {
    document.getElementById('overlay-title').textContent = title;
    document.getElementById('overlay-score').textContent = score !== undefined ? `Score : ${score}` : '';
    overlay.classList.add('visible');
}

function hideOverlay() {
    overlay.classList.remove('visible');
}

// ── Boutons ──────────────────────────────────

function updateButtons() {
    btnStart.disabled       = game.isRunning;
    btnPause.disabled       = !game.isRunning;
    btnStop.disabled        = !game.isRunning;
    btnPause.textContent    = game.isPaused ? 'Resume' : 'Pause';
    inputTTD.disabled       = game.isRunning;
    inputHardening.disabled = game.isRunning;
    inputDecrement.disabled = game.isRunning;
}

// ── Socket ───────────────────────────────────

const socket = io({
    auth: { token: localStorage.getItem('auth_token') },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling']
});

// ── Duel ─────────────────────────────────────

let duel = null;

// Callbacks passés au Duel pour qu'il pilote l'UI sans accéder à des globaux.
function _makeDuelUI() {
    return {
        showOverlay,
        hideOverlay,
        updateButtons,
        render:         () => render(game),
        renderOpponent: (grid, shieldActive) => renderOpponent(grid, shieldActive),
    };
}

function updateDuelStatus(status, opponentName) {
    duelStatusEl.className = '';
    if (status === 'waiting') {
        duelStatusEl.textContent = "En attente d'un adversaire…";
        duelStatusEl.classList.add('waiting');
        opponentSection.classList.remove('visible');
    } else if (status === 'ready') {
        duelStatusEl.textContent = `Prêt — ${opponentName}`;
        duelStatusEl.classList.add('ready');
        opponentSection.classList.add('visible');
        if (duel) duel.hideOpponentOverlay();
        const grid        = duel ? duel.opponentGrid         : Array.from({ length: 20 }, () => Array(10).fill(0));
        const shieldActive = duel ? duel.opponentShieldActive : false;
        renderOpponent(grid, shieldActive);
    } else {
        duelStatusEl.textContent = '—';
        opponentSection.classList.remove('visible');
    }
}

function startLocalGame() {
    hideOverlay();
    game.start();
    updateButtons();
    render(game);
}

// Crée un Duel et rejoint la salle — mutualisé entre le bouton et le matchmaking.
function _joinDuelRoom(code) {
    if (duel) duel.leave();
    if (game.isRunning) { game.stop(); hideOverlay(); render(game); updateButtons(); }
    duel = new Duel(socket, game, updateDuelStatus, startLocalGame, _makeDuelUI());
    duel.join(code);
    btnJoinDuel.disabled   = true;
    btnLeaveDuel.disabled  = false;
    inputRoomCode.disabled = true;
    updateDuelStatus('waiting', null);
}

btnJoinDuel.addEventListener('click', () => {
    const code = inputRoomCode.value.trim().toUpperCase();
    if (!code) return;
    _joinDuelRoom(code);
});

btnLeaveDuel.addEventListener('click', () => {
    if (duel) { duel.leave(); duel = null; }
    btnJoinDuel.disabled   = false;
    btnLeaveDuel.disabled  = true;
    inputRoomCode.disabled = false;
    updateDuelStatus(null, null);
});

// ── Matchmaking ──────────────────────────────

btnMatchmaking.addEventListener('click', () => {
    socket.emit('tetris:matchmaking-join');
    btnMatchmaking.disabled         = true;
    btnMatchmakingCancel.disabled   = false;
    btnJoinDuel.disabled            = true;
    matchmakingStatusEl.textContent = 'Recherche en cours…';
    matchmakingStatusEl.className   = 'waiting';
});

btnMatchmakingCancel.addEventListener('click', () => {
    socket.emit('tetris:matchmaking-leave');
    btnMatchmaking.disabled         = false;
    btnMatchmakingCancel.disabled   = true;
    btnJoinDuel.disabled            = false;
    matchmakingStatusEl.textContent = '';
});

socket.on('tetris:matchmaking-status', (data) => {
    if (data.status === 'searching') {
        matchmakingStatusEl.textContent = `Recherche… (${data.position} joueur(s) en attente)`;
    } else if (data.status === 'idle') {
        matchmakingStatusEl.textContent = '';
        btnMatchmaking.disabled       = false;
        btnMatchmakingCancel.disabled = true;
        btnJoinDuel.disabled          = false;
    }
});

socket.on('tetris:matched', (data) => {
    matchmakingStatusEl.textContent = `Adversaire trouvé : ${data.opponent} !`;
    matchmakingStatusEl.className   = 'ready';
    btnMatchmaking.disabled       = false;
    btnMatchmakingCancel.disabled = true;
    inputRoomCode.value           = data.roomCode;
    _joinDuelRoom(data.roomCode);
});

// ── Jeu ──────────────────────────────────────

function saveTetrisScore(score) {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    fetch('/api/stats/tetris/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ score })
    })
    .then(r => r.json())
    .then(data => { if (data.bestScore !== undefined) console.log('Meilleur score tetris:', data.bestScore); })
    .catch(err => console.error('Erreur sauvegarde score tetris:', err));
}

const game = new Tetris(
    // onRender
    () => {
        if (duel) duel.synchronize_game();
        render(game);
        updateButtons();
    },
    // onGameOver
    (score, validBlock) => {
        if (duel && duel.isReady) duel.onLocalGameOver(score, validBlock);
        else saveTetrisScore(score);
        render(game);
        updateButtons();
        showOverlay('GAME OVER', score);
        loadLeaderboards();
        loadGameHistory();
    },
    // onBlockPlaced
    (grid) => { if (duel) duel.onLocalBlockPlaced(grid, game.score); },
    // onLinesCleared
    (count, holeCol) => { if (duel) duel.onLocalLinesCleared(count, holeCol); },
    // onShieldChanged
    (event) => { if (duel) duel.onLocalShieldChanged(event); }
);

// ── Boutons de contrôle ──────────────────────

btnStart.addEventListener('click', () => {
    if (duel && duel.isReady) duel.startDuel();
    else startLocalGame();
});

btnPause.addEventListener('click', () => {
    if (duel && duel.isReady) {
        duel.togglePause();
    } else {
        game.pause();
        updateButtons();
        if (game.isPaused) showOverlay('PAUSE');
        else hideOverlay();
    }
});

btnStop.addEventListener('click', () => {
    if (duel && duel.isReady) {
        duel.stop();
    } else {
        game.stop();
        updateButtons();
        render(game);
        showOverlay('STOPPED');
    }
});

if (btnRestart) {
    btnRestart.addEventListener('click', () => {
        if (duel && duel.isReady) return;
        game.restart();
        updateButtons();
        render(game);
    });
}

// ── Paramètres ───────────────────────────────

function applySettings() {
    const settings = {
        timeToDown:   parseInt(inputTTD.value,       10),
        hardening:    parseInt(inputHardening.value, 10),
        decrementTTD: parseInt(inputDecrement.value, 10),
    };
    game.configure(settings);
    if (duel && duel.isReady) duel.syncSettings(settings);
}

inputTTD.addEventListener('change',       applySettings);
inputHardening.addEventListener('change', applySettings);
inputDecrement.addEventListener('change', applySettings);

// ── Thème ────────────────────────────────────

document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => setColorTheme(btn.dataset.theme));
});
