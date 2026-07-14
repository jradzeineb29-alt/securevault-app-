/**
 * onboarding.js — controls the multi-step animated onboarding flow.
 *
 * How it works:
 * - There are 4 "slides" (divs with class .slide)
 * - Only one has class "active" at a time — CSS shows it, hides the rest
 * - goToStep(n) removes "active" from the current slide,
 *   adds it to the target slide, and updates the progress bar + dots
 * - The CSS animates the slide in with a slideIn keyframe
 */

let currentStep = 1;
const TOTAL = 4;

function goToStep(n) {
  if (n < 1 || n > TOTAL) return;

  // Hide current
  const current = document.querySelector('.slide.active');
  if (current) current.classList.remove('active');

  // Show target
  const target = document.querySelector(`.slide[data-step="${n}"]`);
  if (target) target.classList.add('active');

  // Update progress bar width
  const bar = document.getElementById('progressBar');
  bar.style.width = (n / TOTAL * 100) + '%';

  // Update label
  document.getElementById('progressLabel').textContent = `Step ${n} of ${TOTAL}`;

  // Update dots
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === n - 1);
  });

  currentStep = n;
}

// Category card selection (visual only — just highlights the chosen one)
document.querySelectorAll('.cat-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
  });
});
