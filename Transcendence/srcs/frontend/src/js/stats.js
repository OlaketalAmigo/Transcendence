import { Window } from './windows.js';
import { API, STORAGE_KEYS } from './config.js';

/**
 * Stats window — displays Scribble + Tetris stats for any user
 * Usage: windowRegistry.get('stats').showUser(username)
 */
export class StatsWindow extends Window {
    constructor() {
        super({
            name: 'stats',
            title: 'Statistiques',
            cssClasses: ['stats-window']
        });

        this.buildUI();
    }

    buildUI() {
        this.avatarEl = this.createElement('img', 'stats__avatar', { alt: 'Avatar' });
        this.avatarEl.src = '/avatar/default.png';

        this.usernameEl = this.createElement('div', 'stats__username');

        // Scribble section
        const scribbleSection = this.createElement('div', 'stats__section');
        const scribbleTitle = this.createElement('div', 'stats__section-title', { text: 'Scribble' });
        this.scribbleBody = this.createElement('div', 'stats__section-body');
        scribbleSection.append(scribbleTitle, this.scribbleBody);

        // Tetris section
        const tetrisSection = this.createElement('div', 'stats__section');
        const tetrisTitle = this.createElement('div', 'stats__section-title', { text: 'Tetris' });
        this.tetrisBody = this.createElement('div', 'stats__section-body');
        tetrisSection.append(tetrisTitle, this.tetrisBody);

        this.body.append(this.avatarEl, this.usernameEl, scribbleSection, tetrisSection);
    }

    async showUser(username) {
        this.show();
        this.setTitle('Statistiques');
        this.usernameEl.textContent = username;
        this.avatarEl.src = '/avatar/default.png';
        this.scribbleBody.innerHTML = '<div class="stats__loading">Chargement…</div>';
        this.tetrisBody.innerHTML = '';

        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) return;

        try {
            const res = await fetch(API.STATS.USER(username), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                this.scribbleBody.innerHTML = '<div class="stats__loading">Erreur</div>';
                return;
            }
            const data = await res.json();
            this.renderStats(data);
        } catch (err) {
            console.error('Stats load error:', err);
        }
    }

    async showMe() {
        this.show();
        this.setTitle('Mes statistiques');
        this.scribbleBody.innerHTML = '<div class="stats__loading">Chargement…</div>';
        this.tetrisBody.innerHTML = '';

        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) return;

        try {
            const res = await fetch(API.STATS.ME, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) return;
            const data = await res.json();
            this.renderStats(data);
        } catch (err) {
            console.error('Stats load error:', err);
        }
    }

    renderStats(data) {
        this.setTitle(`Stats — ${data.username}`);
        this.usernameEl.textContent = data.username;
        this.avatarEl.src = data.avatar_url || '/avatar/default.png';

        this.scribbleBody.innerHTML = `
            <div class="stats__row">
                <span class="stats__label">Points</span>
                <span class="stats__value">${data.total_points || 0}</span>
            </div>
            <div class="stats__row">
                <span class="stats__label">Parties</span>
                <span class="stats__value">${data.games_played || 0}</span>
            </div>
            <div class="stats__row">
                <span class="stats__label">Victoires</span>
                <span class="stats__value">${data.games_won || 0}</span>
            </div>
        `;

        this.tetrisBody.innerHTML = `
            <div class="stats__row">
                <span class="stats__label">Meilleur score</span>
                <span class="stats__value">${data.tetris_best_score || 0}</span>
            </div>
            <div class="stats__row">
                <span class="stats__label">Duels gagnés</span>
                <span class="stats__value">${data.tetris_wins || 0}</span>
            </div>
            <div class="stats__row">
                <span class="stats__label">Parties</span>
                <span class="stats__value">${data.tetris_games_played || 0}</span>
            </div>
        `;
    }
}
