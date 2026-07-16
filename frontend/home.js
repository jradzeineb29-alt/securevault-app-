/**
 * home.js — works for both logged-in and logged-out users.
 * Logged in:  shows username, secret count, full dashboard
 * Logged out: shows a guest welcome with login/register buttons
 */

const API   = 'http://127.0.0.1:8000';
const token = localStorage.getItem('token');
const username = localStorage.getItem('username') || '';

// ── Update greeting ─────────────────────────────────────────────────────
const nameEl = document.getElementById('welcomeName');
if (nameEl) {
  nameEl.textContent = token && username
    ? username.charAt(0).toUpperCase() + username.slice(1)
    : 'Guest';
}

const greetingEl = document.getElementById('wbGreeting');
if (greetingEl) {
  greetingEl.textContent = token ? 'Welcome back,' : 'Welcome,';
}

const subEl = document.getElementById('wbSub');
if (subEl) {
  subEl.textContent = token
    ? 'Your vault is active. All secrets encrypted with AES-256.'
    : 'Sign in to access your encrypted vault.';
}

// ── Navbar user display ──────────────────────────────────────────────────
const navUser = document.getElementById('navUser');
if (navUser) navUser.textContent = username;

// ── Show/hide sections based on login state ──────────────────────────────
const guestBanner = document.getElementById('guestBanner');
const dashboard   = document.getElementById('dashboardContent');

if (token) {
  if (guestBanner) guestBanner.style.display = 'none';
  if (dashboard)   dashboard.style.display   = 'block';
} else {
  if (guestBanner) guestBanner.style.display = 'block';
  if (dashboard)   dashboard.style.display   = 'none';
}

// ── Load secret count (only when logged in) ──────────────────────────────
async function loadCount() {
  if (!token) return;
  try {
    const res = await fetch(`${API}/entries/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      const count = data.length;
      const el  = document.getElementById('totalCount');
      const el2 = document.getElementById('totalCount2');
      if (el)  el.textContent  = count;
      if (el2) el2.textContent = count;
    }
  } catch { }
}
loadCount();

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = 'welcome.html';
}
