/**
 * auth.js — login and registration logic.
 * Connects to POST /auth/login and POST /auth/register
 */

const API = 'http://127.0.0.1:8000';

// ── Helpers ────────────────────────────────────────────────────────────────
function showAlert(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent  = msg;
  el.style.display = 'block';
}

function hideAlerts() {
  ['errorBox', 'successBox'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function parseError(data) {
  if (!data) return 'Something went wrong.';
  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail)) return data.detail.map(d => d.msg || d).join(', ');
  if (data.message) return data.message;
  return 'Something went wrong.';
}

// ── Password strength meter (register page only) ──────────────────────────
const pwdInput = document.getElementById('password');
if (pwdInput && document.getElementById('strengthFill')) {
  pwdInput.addEventListener('input', () => {
    const val   = pwdInput.value;
    const fill  = document.getElementById('strengthFill');
    const label = document.getElementById('strengthLabel');
    let score = 0;
    if (val.length >= 8)         score++;
    if (/[A-Z]/.test(val))       score++;
    if (/[0-9]/.test(val))       score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    const levels = [
      { w: '0%',   color: 'transparent', text: '' },
      { w: '25%',  color: '#ff2d55',     text: 'Weak' },
      { w: '50%',  color: '#ff9500',     text: 'Fair' },
      { w: '75%',  color: '#00c8f0',     text: 'Good' },
      { w: '100%', color: '#00ffaa',     text: 'Strong' },
    ];
    fill.style.width      = levels[score].w;
    fill.style.background = levels[score].color;
    label.textContent     = levels[score].text;
    label.style.color     = levels[score].color;
  });
}

// ── LOGIN ──────────────────────────────────────────────────────────────────
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlerts();

    const btn      = document.getElementById('submitBtn');
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    btn.disabled    = true;
    btn.textContent = 'Signing in...';

    try {
      const res  = await fetch(`${API}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok && data.access_token) {
        localStorage.setItem('token', data.access_token);

        // Fetch real username from /auth/me
        try {
          const me = await fetch(`${API}/auth/me`, {
            headers: { 'Authorization': `Bearer ${data.access_token}` }
          });
          const meData = await me.json();
          localStorage.setItem('username', meData.username || email.split('@')[0]);
        } catch {
          localStorage.setItem('username', email.split('@')[0]);
        }

        showAlert('successBox', 'Access granted. Loading your vault...');
        setTimeout(() => { window.location.href = 'home.html'; }, 800);
      } else {
        showAlert('errorBox', parseError(data));
      }
    } catch {
      showAlert('errorBox', 'Cannot connect to the server. Is the backend running?');
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Sign In';
    }
  });
}

// ── REGISTER ───────────────────────────────────────────────────────────────
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlerts();

    const btn      = document.getElementById('submitBtn');
    const username = document.getElementById('username').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    btn.disabled    = true;
    btn.textContent = 'Creating vault...';

    try {
      // Step 1: Register
      const res  = await fetch(`${API}/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, email, password })
      });
      const data = await res.json();

      if (res.ok && data.id) {
        // Step 2: Auto-login
        const loginRes  = await fetch(`${API}/auth/login`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();

        if (loginRes.ok && loginData.access_token) {
          localStorage.setItem('token',    loginData.access_token);
          localStorage.setItem('username', username);
          showAlert('successBox', 'Vault created! Taking you home...');
          setTimeout(() => { window.location.href = 'home.html'; }, 1000);
        } else {
          // Registered but auto-login failed — send to login page
          showAlert('successBox', 'Account created! Please sign in.');
          setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        }
      } else {
        showAlert('errorBox', parseError(data));
      }
    } catch {
      showAlert('errorBox', 'Cannot connect to the server. Is the backend running?');
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Create Account';
    }
  });
}
