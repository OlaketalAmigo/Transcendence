// ─────────────────────────────────────────────
// RENDU
// ─────────────────────────────────────────────

const CELL = 30;

const THEMES = {
    green: {
        bg: '#000500', panel: '#000d00', border: '#004400',
        accent: '#00ff41', accent2: '#39ff14', dim: '#1a5c1a', text: '#00cc26',
        grid: 'rgba(0,255,65,0.06)', ghost: 'rgba(0,255,65,0.25)', highlight: 'rgba(200,255,200,0.2)',
        colors: ['#000500','#00ff41','#39ff14','#00e676','#76ff03','#b2ff59','#00ffaa','#ccff00','#2d5a2d']
    },
    red: {
        bg: '#050000', panel: '#0d0000', border: '#440000',
        accent: '#ff1744', accent2: '#ff4569', dim: '#5c1a1a', text: '#cc2626',
        grid: 'rgba(255,23,68,0.06)', ghost: 'rgba(255,23,68,0.25)', highlight: 'rgba(255,200,200,0.2)',
        colors: ['#050000','#ff1744','#ff4569','#e53935','#ff6d00','#ff8a65','#ff5252','#ff6e40','#5a2d2d']
    },
    yellow: {
        bg: '#050500', panel: '#0d0d00', border: '#444400',
        accent: '#ffd600', accent2: '#ffea00', dim: '#5c5c1a', text: '#ccaa00',
        grid: 'rgba(255,214,0,0.06)', ghost: 'rgba(255,214,0,0.25)', highlight: 'rgba(255,255,200,0.2)',
        colors: ['#050500','#ffd600','#ffea00','#ffab00','#fff176','#ffe57f','#ffff00','#ffc400','#5a5a2d']
    },
    blue: {
        bg: '#000005', panel: '#00000d', border: '#000044',
        accent: '#00b0ff', accent2: '#40c4ff', dim: '#1a1a5c', text: '#2626cc',
        grid: 'rgba(0,176,255,0.06)', ghost: 'rgba(0,176,255,0.25)', highlight: 'rgba(200,200,255,0.2)',
        colors: ['#000005','#00b0ff','#40c4ff','#0091ea','#448aff','#82b1ff','#00e5ff','#2979ff','#2d2d5a']
    }
};

let currentTheme = THEMES.green;
let COLORS = [...currentTheme.colors];

function setColorTheme(themeName) {
    currentTheme = THEMES[themeName] || THEMES.green;
    COLORS = [...currentTheme.colors];
    const root = document.documentElement;
    root.style.setProperty('--bg',      currentTheme.bg);
    root.style.setProperty('--panel',   currentTheme.panel);
    root.style.setProperty('--border',  currentTheme.border);
    root.style.setProperty('--accent',  currentTheme.accent);
    root.style.setProperty('--accent2', currentTheme.accent2);
    root.style.setProperty('--dim',     currentTheme.dim);
    root.style.setProperty('--text',    currentTheme.text);
    localStorage.setItem('tetris-theme', themeName);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === themeName);
    });
}

const ctxMain     = document.getElementById('canvas-main').getContext('2d');
const ctxNext     = document.getElementById('canvas-next').getContext('2d');
const ctxHold     = document.getElementById('canvas-hold').getContext('2d');
const ctxOpponent = document.getElementById('canvas-opponent').getContext('2d');

function drawCell(ctx, x, y, colorIndex, size) {
    const p = 1;
    const color = COLORS[colorIndex];
    ctx.fillStyle = color;
    ctx.fillRect(x * size + p, y * size + p, size - p * 2, size - p * 2);
    // Glow inner
    ctx.shadowColor = color;
    ctx.shadowBlur  = 6;
    ctx.fillStyle = color;
    ctx.fillRect(x * size + p + 2, y * size + p + 2, size - p * 2 - 4, size - p * 2 - 4);
    ctx.shadowBlur = 0;
    // Highlight top/left
    ctx.fillStyle = currentTheme.highlight;
    ctx.fillRect(x * size + p, y * size + p, size - p * 2, 2);
    ctx.fillRect(x * size + p, y * size + p, 2, size - p * 2);
    // Shadow bottom/right
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x * size + p, (y + 1) * size - p - 2, size - p * 2, 2);
    ctx.fillRect((x + 1) * size - p - 2, y * size + p, 2, size - p * 2);
}

function clearCanvas(ctx, w, h) {
    ctx.fillStyle = currentTheme.bg;
    ctx.fillRect(0, 0, w, h);
}

function drawGridLines(ctx, cols, rows, size) {
    ctx.strokeStyle = currentTheme.grid;
    ctx.lineWidth   = 1;
    for (let x = 0; x <= cols; x++) {
        ctx.beginPath(); ctx.moveTo(x * size, 0); ctx.lineTo(x * size, rows * size); ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
        ctx.beginPath(); ctx.moveTo(0, y * size); ctx.lineTo(cols * size, y * size); ctx.stroke();
    }
}

function drawGhost(ctx, piece, grid) {
    if (!piece) return;
    const ghost = { x: piece.getPosition().x, y: piece.getPosition().y };
    const shape = piece.getShape();

    while (true) {
        ghost.y++;
        let valid = true;
        for (let row = 0; row < shape.length && valid; row++)
            for (let col = 0; col < shape[row].length && valid; col++)
                if (shape[row][col] !== 0) {
                    const ny = ghost.y + row;
                    const nx = ghost.x + col;
                    if (ny < 0 || ny >= grid.length || nx < 0 || nx >= grid[ny].length || grid[ny][nx] !== 0) valid = false;
                }
        if (!valid) { ghost.y--; break; }
    }

    if (ghost.y === piece.getPosition().y) return;

    ctx.strokeStyle = currentTheme.ghost;
    ctx.lineWidth   = 1;
    for (let row = 0; row < shape.length; row++)
        for (let col = 0; col < shape[row].length; col++)
            if (shape[row][col] !== 0)
                ctx.strokeRect(
                    (ghost.x + col) * CELL + 2,
                    (ghost.y + row) * CELL + 2,
                    CELL - 4, CELL - 4
                );
}

function drawMiniPiece(ctx, piece, canvasW, canvasH) {
    clearCanvas(ctx, canvasW, canvasH);
    if (!piece) return;
    const shape   = piece.getShape();
    const color   = piece.getColor();
    const s       = 20;
    const offsetX = Math.floor((canvasW / s - shape[0].length) / 2);
    const offsetY = Math.floor((canvasH / s - shape.length) / 2);
    for (let row = 0; row < shape.length; row++)
        for (let col = 0; col < shape[row].length; col++)
            if (shape[row][col] !== 0)
                drawCell(ctx, offsetX + col, offsetY + row, color, s);
}

function _drawShieldOverlay(ctx, w, h, alpha) {
    ctx.save();
    ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
    ctx.lineWidth   = 4;
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur  = 16;
    ctx.strokeRect(2, 2, w - 4, h - 4);
    ctx.shadowBlur  = 0;
    ctx.restore();
}

function render() {
    // Grille principale
    clearCanvas(ctxMain, 300, 600);
    drawGridLines(ctxMain, 10, 20, CELL);

    for (let y = 0; y < game.grid.length; y++)
        for (let x = 0; x < game.grid[y].length; x++)
            if (game.grid[y][x] !== 0)
                drawCell(ctxMain, x, y, game.grid[y][x], CELL);

    // Ghost + pièce courante
    if (game.currentPiece) {
        drawGhost(ctxMain, game.currentPiece, game.grid);
        const { x, y } = game.currentPiece.getPosition();
        const shape     = game.currentPiece.getShape();
        const color     = game.currentPiece.getColor();
        for (let row = 0; row < shape.length; row++)
            for (let col = 0; col < shape[row].length; col++)
                if (shape[row][col] !== 0)
                    drawCell(ctxMain, x + col, y + row, color, CELL);
    }

    // Shield overlay (bordure cyan pulsée)
    if (game.shieldActive) {
        const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 150);
        _drawShieldOverlay(ctxMain, 300, 600, pulse);
    }

    // Panneaux miniatures
    drawMiniPiece(ctxNext, game.nextPiece,   100, 80);
    drawMiniPiece(ctxHold, game.storedPiece, 100, 80);

    // Score
    document.getElementById('score-display').textContent = game.score;

    // Shield status UI
    const shieldEl  = document.getElementById('shield-status-display');
    const shieldBar = document.getElementById('shield-bar');
    if (shieldEl) {
        if (game.shieldActive) {
            const secs = Math.ceil(game.shieldActiveMs / 1000);
            shieldEl.textContent = `ACTIF ${secs}s`;
            shieldEl.className   = 'score-value shield-active';
            if (shieldBar) shieldBar.style.width = (game.shieldActiveMs / 3000 * 100) + '%';
        } else if (game.shieldReady) {
            shieldEl.textContent = 'PRÊT';
            shieldEl.className   = 'score-value shield-ready';
            if (shieldBar) shieldBar.style.width = '100%';
        } else {
            const secs = Math.ceil(game.shieldCooldownMs / 1000);
            shieldEl.textContent = `${secs}s`;
            shieldEl.className   = 'score-value shield-cooldown';
            if (shieldBar) shieldBar.style.width = ((1 - game.shieldCooldownMs / 60000) * 100) + '%';
        }
    }
}

function renderOpponent(opponentGrid) {
    clearCanvas(ctxOpponent, 300, 600);
    drawGridLines(ctxOpponent, 10, 20, CELL);
    for (let y = 0; y < opponentGrid.length; y++)
        for (let x = 0; x < opponentGrid[y].length; x++)
            if (opponentGrid[y][x] !== 0)
                drawCell(ctxOpponent, x, y, opponentGrid[y][x], CELL);

    // Shield overlay adversaire
    if (typeof duel !== 'undefined' && duel && duel.opponentShieldActive) {
        const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 150);
        _drawShieldOverlay(ctxOpponent, 300, 600, pulse);
    }

    // Indicateur HTML adversaire
    const oppShieldEl = document.getElementById('opponent-shield-indicator');
    if (oppShieldEl) {
        const active = typeof duel !== 'undefined' && duel && duel.opponentShieldActive;
        oppShieldEl.style.display = active ? 'block' : 'none';
    }
}

// Restore saved theme
(function() {
    const saved = localStorage.getItem('tetris-theme');
    if (saved && THEMES[saved]) setColorTheme(saved);
})();
