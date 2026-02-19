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
// INIT
// ─────────────────────────────────────────────

const game = new Tetris(
    () => { render(); updateButtons(); },
    (score) => { render(); updateButtons(); showOverlay('GAME OVER', score); }
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
