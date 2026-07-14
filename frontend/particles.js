/**
 * particles.js — generates animated floating dots in the background.
 * Pure JS, no libraries. Dots drift upward slowly and fade out.
 */
(function () {
  const container = document.getElementById('particles');
  if (!container) return;

  const COLORS = ['#e63946', '#00b4d8', '#00f5a0'];
  const COUNT  = 40;

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function createParticle() {
    const dot = document.createElement('div');
    const size = randomBetween(2, 5);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const left = randomBetween(0, 100);
    const duration = randomBetween(10, 25);
    const delay = randomBetween(0, 15);

    dot.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      left: ${left}%;
      bottom: -10px;
      opacity: 0;
      animation: riseUp ${duration}s ${delay}s linear infinite;
      box-shadow: 0 0 6px ${color};
    `;
    container.appendChild(dot);
  }

  // Inject keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes riseUp {
      0%   { transform: translateY(0)   scale(1);   opacity: 0; }
      10%  { opacity: 0.7; }
      90%  { opacity: 0.3; }
      100% { transform: translateY(-110vh) scale(0.5); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  for (let i = 0; i < COUNT; i++) createParticle();
})();
