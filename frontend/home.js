/**
 * home.js — welcome name + secret count.
 * AUTH GUARD DISABLED for demo — remove the comment below to re-enable.
 */

const API = 'http://localhost:8000';
const token = localStorage.getItem('token');

// DEMO MODE: auth guard disabled so you can browse all pages freely
// To re-enable, uncomment the next two lines:
// if (!token) { window.location.href = 'login.html'; }

const username = localStorage.getItem('username') || 'Vault Owner';
const el = document.getElementById('welcomeName');
if (el) el.textContent = username.charAt(0).toUpperCase() + username.slice(1);

const navUser = document.getElementById('navUser');
if (navUser) navUser.textContent = username;

async function loadCount() {
  if (!token) return;
  try {
    const res = await fetch(`${API}/secrets`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      const el = document.getElementById('totalCount');
      if (el) el.textContent = data.length;
    }
  } catch { }
}
loadCount();

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = 'login.html';
}
