/**
 * profile.js
 * Loads user info from GET /auth/me
 * Loads entry stats from GET /entries/
 */

const API   = 'http://127.0.0.1:8000';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const username = localStorage.getItem('username') || '?';

// ── Set avatar initial ──────────────────────────────────────────────────
const avatarEl = document.getElementById('profileAvatar');
if (avatarEl) avatarEl.textContent = username.charAt(0).toUpperCase();

// ── Load user info from /auth/me ────────────────────────────────────────
async function loadProfile() {
  try {
    const res  = await fetch(`${API}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) { window.location.href = 'login.html'; return; }
    const user = await res.json();

    document.getElementById('profileUsername').textContent = user.username || username;
    document.getElementById('profileEmail').textContent    = user.email    || '';

    // Update avatar with real initial
    if (avatarEl) avatarEl.textContent = (user.username || username).charAt(0).toUpperCase();
  } catch {}
}

// ── Load entry stats ────────────────────────────────────────────────────
async function loadStats() {
  try {
    const res = await fetch(`${API}/entries/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;
    const entries = await res.json();

    const counts = { social:0, bank:0, work:0, personal:0 };
    entries.forEach(e => {
      const cat = (e.category || '').toLowerCase();
      if (counts[cat] !== undefined) counts[cat]++;
    });

    const total = entries.length;

    // Update stat cards
    document.getElementById('statTotal').textContent   = total;
    document.getElementById('statSocial').textContent  = counts.social;
    document.getElementById('statBank').textContent    = counts.bank;
    document.getElementById('statWork').textContent    = counts.work;
    document.getElementById('statPersonal').textContent = counts.personal;

    // Security score — always 100% because everything is encrypted
    document.getElementById('scoreNum').textContent = '100';

  } catch {}
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = 'login.html';
}

// Update home.js navUser reference on profile page
const navUsernameEl = document.getElementById('navUsername');
// (not on profile page navbar — skip)

loadProfile();
loadStats();
