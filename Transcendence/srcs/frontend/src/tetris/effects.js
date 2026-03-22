// ─────────────────────────────────────────────
// EFFETS VISUELS : SCALING RESPONSIVE + MATRIX RAIN
// ─────────────────────────────────────────────

// ── Responsive scaling ──
(function() {
    const container = document.getElementById('scale-container');
    const NAT_W = 640;
    const NAT_H = 1020;

    function resize() {
        const s = Math.min(window.innerWidth / NAT_W, window.innerHeight / NAT_H);
        container.style.transform       = 'scale(' + s + ')';
        container.style.transformOrigin = 'top center';
        container.style.marginBottom    = ((s - 1) * NAT_H) + 'px';
    }

    resize();
    window.addEventListener('resize', resize);
})();

// ── Matrix rain ──
(function() {
    const canvas = document.getElementById('matrix-bg');
    const ctx    = canvas.getContext('2d');
    const chars  = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF>_{}[]|\\/#@$%^&*01';
    const fs     = 14;
    let drops    = [];

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    function initDrops() { drops = Array(Math.floor(canvas.width / fs)).fill(1); }

    resize();
    initDrops();
    window.addEventListener('resize', () => { resize(); initDrops(); });

    setInterval(function() {
        ctx.fillStyle = 'rgba(0,5,0,0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = fs + 'px monospace';
        for (let i = 0; i < drops.length; i++) {
            const ch = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillStyle = drops[i] * fs < 50 ? '#aaffaa' : '#00ff41';
            ctx.fillText(ch, i * fs, drops[i] * fs);
            if (drops[i] * fs > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }, 40);
})();
