/**
 * auth.js — handles login and register form submissions.
 * Stores the JWT token and username in localStorage after login/register.
 */

const API = 'http://localhost:8000';

// ── Password strength meter (register page only) ──────────────────────────
const pwdInput = document.getElementById('password');
if (pwdInput && document.getElementById('strengthFill')) {
  pwdInput.addEventListener('input', () => {
    const val = pwdInput.value;
    const fill  = document.getElementById('strengthFill');
    const label = document.getElementById('strengthLabel');
    let score = 0;
    if (val.length >= 8)  score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const levels = [
      { w: '0%',   color: 'transparent', text: '' },
      { w: '25%',  color: '#e63946',     text: 'Weak' },
      { w: '50%',  color: '#f4a261',     text: 'Fair' },
      { w: '75%',  color: '#00b4d8',     text: 'Good' },
      { w: '100%', color: '#00f5a0',     text: 'Strong' },
    ];
    fill.style.width      = levels[score].w;
    fill.style.background = levels[score].color;
    label.textContent     = levels[score].text;
    label.style.color     = levels[score].color;
  });
}

// ── Helpers ────────────────────────────────────────────────────────────────
function showAlert(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}
function hideAlerts() {
  ['errorBox','successBox'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}
function parseError(data) {
  if (!data) return 'Something went wrong.';
  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail)) return data.detail[0]?.msg || 'Validation error.';
  return 'Something went wrong.';
}

// ── LOGIN ──────────────────────────────────────────────────────────────────
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlerts();
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = 'Signing in...';

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res  = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        // Save token — all future requests need it
        localStorage.setItem('token', data.access_token);
        // Save email as display name (username shown on home page)
        // If the backend returns a username we'd use that — for now use email prefix
        const displayName = email.split('@')[0];
        localStorage.setItem('username', displayName);

        showAlert('successBox', 'Access granted. Loading your vault...');
        setTimeout(() => { window.location.href = 'home.html'; }, 800);
      } else {
        showAlert('errorBox', parseError(data));
      }
    } catch {
      showAlert('errorBox', 'Cannot connect to the server. Is the backend running?');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign In →';
    }
  });
}

// ── REGISTER ───────────────────────────────────────────────────────────────
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlerts();
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = 'Creating vault...';

    const username = document.getElementById('username')?.value.trim() || '';
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res  = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        // Auto-login after registration
        const loginRes  = await fetch(`${API}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          localStorage.setItem('token', loginData.access_token);
          localStorage.setItem('username', username || email.split('@')[0]);
          showAlert('successBox', 'Vault created! Taking you home...');
          setTimeout(() => { window.location.href = 'home.html'; }, 1000);
        }
      } else {
        showAlert('errorBox', parseError(data));
      }
    } catch {
      showAlert('errorBox', 'Cannot connect to the server. Is the backend running?');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Create Account';
    }
  });
}
