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
const btnJoinDuel      = document.getElementById('btn-join-duel');
const btnLeaveDuel     = document.getElementById('btn-leave-duel');
const inputRoomCode    = document.getElementById('input-room-code');
const duelStatusEl     = document.getElementById('duel-status');
const opponentSection  = document.getElementById('opponent-section');

// Matchmaking UI
const btnMatchmaking       = document.getElementById('btn-matchmaking');
const btnMatchmakingCancel = document.getElementById('btn-matchmaking-cancel');
const matchmakingStatusEl  = document.getElementById('matchmaking-status');

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

const socket = io({
    auth: { token: localStorage.getItem('auth_token') },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling']
});

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

function startLocalGame() {
    hideOverlay();
    game.start();
    updateButtons();
    render();
}

// ─────────────────────────────────────────────
// SCORE SAVE (solo)
// ─────────────────────────────────────────────

function saveTetrisScore(score) {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    fetch('/api/stats/tetris/score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ score })
    })
    .then(r => r.json())
    .then(data => {
        if (data.bestScore !== undefined) {
            console.log('Meilleur score tetris:', data.bestScore);
        }
    })
    .catch(err => console.error('Erreur sauvegarde score tetris:', err));
}

// ─────────────────────────────────────────────
// DUEL BUTTONS
// ─────────────────────────────────────────────

btnJoinDuel.addEventListener('click', () => {
    const code = inputRoomCode.value.trim().toUpperCase();
    if (!code) return;
    if (duel) { duel.leave(); }
    if (game.isRunning) { game.stop(); hideOverlay(); render(); updateButtons(); }
    duel = new Duel(socket, game, updateDuelStatus, startLocalGame);
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
// MATCHMAKING
// ─────────────────────────────────────────────

btnMatchmaking.addEventListener('click', () => {
    socket.emit('tetris:matchmaking-join');
    btnMatchmaking.disabled       = true;
    btnMatchmakingCancel.disabled = false;
    btnJoinDuel.disabled          = true;
    matchmakingStatusEl.textContent = 'Recherche en cours…';
    matchmakingStatusEl.className   = 'waiting';
});

btnMatchmakingCancel.addEventListener('click', () => {
    socket.emit('tetris:matchmaking-leave');
    btnMatchmaking.disabled       = false;
    btnMatchmakingCancel.disabled = true;
    btnJoinDuel.disabled          = false;
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
    btnJoinDuel.disabled          = false;

    // Auto-rejoindre la salle générée
    if (duel) { duel.leave(); }
    if (game.isRunning) { game.stop(); hideOverlay(); render(); updateButtons(); }
    duel = new Duel(socket, game, updateDuelStatus, startLocalGame);
    duel.join(data.roomCode);
    inputRoomCode.value     = data.roomCode;
    btnJoinDuel.disabled    = true;
    btnLeaveDuel.disabled   = false;
    inputRoomCode.disabled  = true;
    updateDuelStatus('waiting', null);
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
    (score, validBlock) => {
        const isDuel = duel && duel.isReady;
        if (isDuel) {
            duel.onLocalGameOver(score, validBlock);
        } else {
            saveTetrisScore(score);
        }
        render();
        updateButtons();
        showOverlay('GAME OVER', score);
        loadLeaderboards();
        loadGameHistory();
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
    if (duel && duel.isReady) {
        duel.startDuel();   // déclenche les deux parties via le serveur
    } else {
        startLocalGame();   // solo
    }
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
        render();
        showOverlay('STOPPED');
    }
});

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

const btnRestart = document.getElementById('btn-restart');
if (btnRestart) {
    btnRestart.addEventListener('click', () => {
        if (duel && duel.isReady) return;
        game.restart();
        updateButtons();
        render();
    });
}

// ─────────────────────────────────────────────
// GAME HISTORY
// ─────────────────────────────────────────────

async function loadGameHistory() {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
        const res = await fetch('/api/stats/tetris/history', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;
        const history = await res.json();
        renderGameHistory(history);
    } catch (err) {
        console.error('Erreur chargement historique:', err);
    }
}

function renderGameHistory(history) {
    const tbody = document.getElementById('lb-history-body');
    if (!tbody) return;
    if (!history.length) {
        tbody.innerHTML = '<tr><td colspan="5">Aucune partie jouée</td></tr>';
        return;
    }

    tbody.innerHTML = history.map((entry, i) => {
        const date = new Date(entry.played_at).toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
        const type = entry.game_type === 'duel' ? 'Duel' : 'Solo';
        let resultHtml = '—';
        if (entry.result === 'win')  resultHtml = '<span class="hist-win">Victoire</span>';
        if (entry.result === 'loss') resultHtml = '<span class="hist-loss">Défaite</span>';
        return `<tr>
            <td>${i + 1}</td>
            <td>${date}</td>
            <td>${type}</td>
            <td>${entry.score}</td>
            <td>${resultHtml}</td>
        </tr>`;
    }).join('');
}

// ─────────────────────────────────────────────
// LEADERBOARDS
// ─────────────────────────────────────────────

async function loadLeaderboards() {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const headers = { 'Authorization': `Bearer ${token}` };

    try {
        const [scoresRes, winsRes, meRes, rankScoreRes, rankWinsRes] = await Promise.all([
            fetch('/api/stats/tetris/leaderboard/score', { headers }),
            fetch('/api/stats/tetris/leaderboard/wins',  { headers }),
            fetch('/api/stats/me',                       { headers }),
            fetch('/api/stats/tetris/rank/score',        { headers }),
            fetch('/api/stats/tetris/rank/wins',         { headers })
        ]);

        const me         = meRes.ok         ? await meRes.json()         : null;
        const rankScore  = rankScoreRes.ok  ? (await rankScoreRes.json()).rank  : null;
        const rankWins   = rankWinsRes.ok   ? (await rankWinsRes.json()).rank   : null;

        if (scoresRes.ok) {
            const scores = await scoresRes.json();
            renderLeaderboard('lb-scores-body', scores, ['tetris_best_score', 'tetris_games_played'], me, rankScore);
        }

        if (winsRes.ok) {
            const wins = await winsRes.json();
            renderLeaderboard('lb-wins-body', wins, ['tetris_wins', 'tetris_games_played'], me, rankWins);
        }
    } catch (err) {
        console.error('Erreur chargement leaderboards:', err);
    }
}

function renderLeaderboard(tbodyId, rows, [col1, col2], me, myRank) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    if (!rows.length && !me) {
        tbody.innerHTML = '<tr><td colspan="4">Aucun résultat</td></tr>';
        return;
    }

    const myUsername = me?.username;
    const inTop = rows.some(r => r.username === myUsername);

    let html = rows.map((r, i) => {
        const isMe = r.username === myUsername;
        return `<tr class="${isMe ? 'lb-me' : ''}">
            <td>${i + 1}</td>
            <td>${escapeHtml(r.username)}${isMe ? ' <span class="lb-you">(vous)</span>' : ''}</td>
            <td>${r[col1] ?? 0}</td>
            <td>${r[col2] ?? 0}</td>
        </tr>`;
    }).join('');

    if (!inTop && me && myRank !== null) {
        html += `<tr class="lb-separator"><td colspan="4">· · ·</td></tr>`;
        html += `<tr class="lb-me">
            <td>${myRank}</td>
            <td>${escapeHtml(myUsername)} <span class="lb-you">(vous)</span></td>
            <td>${me[col1] ?? 0}</td>
            <td>${me[col2] ?? 0}</td>
        </tr>`;
    }

    tbody.innerHTML = html || '<tr><td colspan="4">Aucun résultat</td></tr>';
}

function escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Tabs leaderboard
document.querySelectorAll('.lb-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('lb-tab--active'));
        document.querySelectorAll('.lb-content').forEach(c => c.classList.remove('lb-content--active'));
        tab.classList.add('lb-tab--active');
        document.getElementById(`lb-${tab.dataset.tab}`).classList.add('lb-content--active');
        if (tab.dataset.tab === 'history') loadGameHistory();
    });
});

// Chargement initial des leaderboards
loadLeaderboards();
loadGameHistory();
