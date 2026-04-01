const container = document.querySelector('.container-gamelinks');
const buttons = document.querySelectorAll('.game-button');

function initButtons() {
  const rect = container.getBoundingClientRect();

  buttons.forEach(btn => {
    // Ensure size is known
    const bw = btn.offsetWidth;
    const bh = btn.offsetHeight;

    // Random start position INSIDE container
    btn.x = Math.random() * (rect.width - bw);
    btn.y = Math.random() * (rect.height - bh);

    // Better velocity (avoid super slow)
    btn.vx = (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1);
    btn.vy = (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1);

    btn.style.left = btn.x + 'px';
    btn.style.top = btn.y + 'px';
  });
}

function animateButtons() {
  const rect = container.getBoundingClientRect();

  buttons.forEach(btn => {
    btn.x += btn.vx;
    btn.y += btn.vy;

    const bw = btn.offsetWidth;
    const bh = btn.offsetHeight;

    // Bounce inside container
    if (btn.x <= 0 || btn.x + bw >= rect.width) {
      btn.vx *= -1;
      btn.x = Math.max(0, Math.min(btn.x, rect.width - bw)); // clamp
    }

    if (btn.y <= 0 || btn.y + bh >= rect.height) {
      btn.vy *= -1;
      btn.y = Math.max(0, Math.min(btn.y, rect.height - bh)); // clamp
    }

    btn.style.left = btn.x + 'px';
    btn.style.top = btn.y + 'px';
  });

  requestAnimationFrame(animateButtons);
}

// 🔥 IMPORTANT: wait for layout to be ready
window.addEventListener('load', () => {
  initButtons();
  animateButtons();
});