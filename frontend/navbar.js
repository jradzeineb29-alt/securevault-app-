/**
 * navbar.js — runs on every page.
 * Shows/hides Login, Register, Dashboard, Profile, Sign Out
 * based on whether a JWT token exists in localStorage.
 *
 * Include this script in every HTML page BEFORE page-specific scripts.
 */

(function () {
  const token    = localStorage.getItem('token');
  const username = localStorage.getItem('username') || '';

  // Highlight active page link
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.href && path.endsWith(link.getAttribute('href'))) {
      link.classList.add('active');
    }
  });

  if (token && username) {
    // ── Logged IN ──────────────────────────────────────────────────────
    const chip = document.getElementById('navUserChip');
    if (chip) {
      chip.textContent  = username.toUpperCase();
      chip.style.display = 'inline-flex';
    }
    // Hide login/register, show logout
    const login    = document.getElementById('nlLogin');
    const register = document.getElementById('nlRegister');
    const logout   = document.getElementById('nlLogout');
    if (login)    login.style.display    = 'none';
    if (register) register.style.display = 'none';
    if (logout)   logout.style.display   = 'block';

  } else {
    // ── Logged OUT ─────────────────────────────────────────────────────
    // Hide dashboard and profile links — not useful without login
    const dashboard = document.getElementById('nlDashboard');
    const profile   = document.getElementById('nlProfile');
    if (dashboard) dashboard.style.display = 'none';
    if (profile)   profile.style.display   = 'none';
  }
})();

// Global logout function available on every page
function globalLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = 'welcome.html';
}
