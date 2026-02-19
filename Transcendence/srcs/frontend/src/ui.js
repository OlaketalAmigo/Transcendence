// ─────────────────────────────────────────────
// UI
// ─────────────────────────────────────────────

const btnStart       = document.getElementById('btn-start');
const btnPause       = document.getElementById('btn-pause');
const btnStop        = document.getElementById('btn-stop');
const overlay        = document.getElementById('overlay');
const inputTTD       = document.getElementById('input-ttd');
const inputHardening = document.getElementById('input-hardening');
const inputDecrement = document.getElementById('input-decrement');

// Duel UI
const btnJoinDuel   = document.getElementById('btn-join-duel');
const btnLeaveDuel  = document.getElementById('btn-leave-duel');
const inputRoomCode = document.getElementById('input-room-code');
const duelStatusEl  = document.getElementById('duel-status');
const opponentSection = document.getElementById('opponent-section');

function updateButtons() {
    btnStart.disabled        = game.isRunning;
    btnPause.disabled        = !game.isRunning;
    btnStop.disabled         = !game.isRunning;
    btnPause.textContent     = game.isPaused ? 'Resume' : 'Pause';
    inputTTD.disabled        = game.isRunning;
    inputHardening.disabled  = game.isRunning;
    inputDecrement.disabled  = game.isRunning;
}

function showOverlay(title, score) {
    document.getElementById('overlay-title').textContent = title;
    document.getElementById('overlay-score').textContent = score !== undefined ? `Score : ${score}` : '';
    overlay.classList.add('visible');
}

function hideOverlay() {
    overlay.classList.remove('visible');
}

// ─────────────────────────────────────────────
// SOCKET + DUEL
// ─────────────────────────────────────────────

const socket = io({ auth: { token: localStorage.getItem('token') } });

let duel = null;

function updateDuelStatus(status, opponentName) {
    duelStatusEl.className = '';
    if (status === 'waiting') {
        duelStatusEl.textContent = 'En attente d\'un adversaire…';
        duelStatusEl.classList.add('waiting');
        opponentSection.classList.remove('visible');
    } else if (status === 'ready') {
        duelStatusEl.textContent = `Prêt — ${opponentName}`;
        duelStatusEl.classList.add('ready');
        opponentSection.classList.add('visible');
        if (duel) duel.hideOpponentOverlay();
        renderOpponent(duel ? duel.opponentGrid : Array.from({length:20}, () => Array(10).fill(0)));
    } else {
        duelStatusEl.textContent = '—';
        opponentSection.classList.remove('visible');
    }
}

btnJoinDuel.addEventListener('click', () => {
    const code = inputRoomCode.value.trim().toUpperCase();
    if (!code) return;
    if (duel) { duel.leave(); }
    duel = new Duel(socket, game, updateDuelStatus);
    duel.join(code);
    btnJoinDuel.disabled  = true;
    btnLeaveDuel.disabled = false;
    inputRoomCode.disabled = true;
    updateDuelStatus('waiting', null);
});

btnLeaveDuel.addEventListener('click', () => {
    if (duel) { duel.leave(); duel = null; }
    btnJoinDuel.disabled   = false;
    btnLeaveDuel.disabled  = true;
    inputRoomCode.disabled = false;
    updateDuelStatus(null, null);
});

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────

const game = new Tetris(
    // onRender
    () => {
        if (duel) duel.synchronize_game();
        render();
        updateButtons();
    },
    // onGameOver
    (score) => {
        if (duel) duel.onLocalGameOver(score);
        render();
        updateButtons();
        showOverlay('GAME OVER', score);
    },
    // onBlockPlaced — relay duel
    (grid) => {
        if (duel) duel.onLocalBlockPlaced(grid, game.score);
    },
    // onLinesCleared — relay duel
    (count, holeCol) => {
        if (duel) duel.onLocalLinesCleared(count, holeCol);
    }
);

btnStart.addEventListener('click', () => {
    hideOverlay();
    game.start();
    updateButtons();
    render();
});

btnPause.addEventListener('click', () => {
    game.pause();
    updateButtons();
    if (game.isPaused) showOverlay('PAUSE');
    else hideOverlay();
});

btnStop.addEventListener('click', () => {
    game.stop();
    updateButtons();
    render();
    showOverlay('STOPPED');
});

function applySettings() {
    game.configure({
        timeToDown:   parseInt(inputTTD.value,       10),
        hardening:    parseInt(inputHardening.value, 10),
        decrementTTD: parseInt(inputDecrement.value, 10),
    });
}

inputTTD.addEventListener('change',       applySettings);
inputHardening.addEventListener('change', applySettings);
inputDecrement.addEventListener('change', applySettings);

render();
updateButtons();
