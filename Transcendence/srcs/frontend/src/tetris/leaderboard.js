// ─────────────────────────────────────────────
// LEADERBOARDS & HISTORIQUE
// ─────────────────────────────────────────────

function escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Historique ───────────────────────────────

async function loadGameHistory() {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    try {
        const res = await fetch('/api/stats/tetris/history', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;
        renderGameHistory(await res.json());
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

// ── Classements ──────────────────────────────

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

        const me        = meRes.ok        ? await meRes.json()               : null;
        const rankScore = rankScoreRes.ok ? (await rankScoreRes.json()).rank  : null;
        const rankWins  = rankWinsRes.ok  ? (await rankWinsRes.json()).rank   : null;

        if (scoresRes.ok) renderLeaderboard('lb-scores-body', await scoresRes.json(), ['tetris_best_score', 'tetris_games_played'], me, rankScore);
        if (winsRes.ok)   renderLeaderboard('lb-wins-body',   await winsRes.json(),   ['tetris_wins',       'tetris_games_played'], me, rankWins);
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

// ── Tabs ─────────────────────────────────────

document.querySelectorAll('.lb-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('lb-tab--active'));
        document.querySelectorAll('.lb-content').forEach(c => c.classList.remove('lb-content--active'));
        tab.classList.add('lb-tab--active');
        document.getElementById(`lb-${tab.dataset.tab}`).classList.add('lb-content--active');
        if (tab.dataset.tab === 'history') loadGameHistory();
    });
});

loadLeaderboards();
loadGameHistory();
