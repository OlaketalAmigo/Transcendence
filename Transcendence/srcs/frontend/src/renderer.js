// ─────────────────────────────────────────────
// RENDU
// ─────────────────────────────────────────────

const CELL   = 30;
const COLORS = ['#070712','#a855f7','#f97316','#3b82f6','#06b6d4','#ef4444','#22c55e','#eab308'];

const ctxMain = document.getElementById('canvas-main').getContext('2d');
const ctxNext = document.getElementById('canvas-next').getContext('2d');
const ctxHold = document.getElementById('canvas-hold').getContext('2d');

function drawCell(ctx, x, y, colorIndex, size) {
    const p = 1;
    ctx.fillStyle = COLORS[colorIndex];
    ctx.fillRect(x * size + p, y * size + p, size - p * 2, size - p * 2);
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(x * size + p, y * size + p, size - p * 2, 3);
    ctx.fillRect(x * size + p, y * size + p, 3, size - p * 2);
    // Ombre
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(x * size + p, (y + 1) * size - p - 3, size - p * 2, 3);
    ctx.fillRect((x + 1) * size - p - 3, y * size + p, 3, size - p * 2);
}

function clearCanvas(ctx, w, h) {
    ctx.fillStyle = '#070712';
    ctx.fillRect(0, 0, w, h);
}

function drawGridLines(ctx, cols, rows, size) {
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
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
                    if (ny >= grid.length || grid[ny][nx] !== 0) valid = false;
                }
        if (!valid) { ghost.y--; break; }
    }

    if (ghost.y === piece.getPosition().y) return;

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
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

    // Panneaux miniatures
    drawMiniPiece(ctxNext, game.nextPiece,   100, 80);
    drawMiniPiece(ctxHold, game.storedPiece, 100, 80);

    // Score
    document.getElementById('score-display').textContent = game.score;
}
