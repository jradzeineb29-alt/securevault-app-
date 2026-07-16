/**
 * entry-detail.js
 * GET    /entries/{id}  — load and display entry
 * DELETE /entries/{id}  — delete entry
 * Edit redirects to create-entry.html?edit={id}
 */

const API   = 'http://127.0.0.1:8000';
const token = localStorage.getItem('token');
if (token === null) window.location.href = 'login.html';

const params   = new URLSearchParams(window.location.search);
const entryId  = params.get('id');
if (!entryId) window.location.href = 'entries.html';

function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

const BADGE = {
  social:   { cls:'badge-social',   label:'Social Media' },
  bank:     { cls:'badge-bank',     label:'Banking' },
  work:     { cls:'badge-work',     label:'Work' },
  personal: { cls:'badge-personal', label:'Personal' }
};

// ── Load entry from API ────────────────────────────────────────────────────
async function loadEntry() {
  if (!token) { renderError('Not logged in.'); return; }
  try {
    const res = await fetch(`${API}/entries/${entryId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.status === 404) { renderError('Entry not found.'); return; }
    if (res.status === 403) { renderError('Access denied.'); return; }
    if (!res.ok)             { renderError('Failed to load entry.'); return; }

    const entry = await res.json();
    renderDetail(entry);
  } catch { renderError('Cannot reach the server.'); }
}

// ── Extract subcategory from notes: "[SubName] rest" ──────────────────────
function parseNotes(notes) {
  const match = (notes || '').match(/^\[([^\]]+)\]\s*([\s\S]*)/);
  return {
    subcategory: match ? match[1] : '',
    cleanNotes:  match ? match[2] : (notes || '')
  };
}

// ── Render entry detail ────────────────────────────────────────────────────
function renderDetail(entry) {
  const cat  = (entry.category || 'personal').toLowerCase();
  const b    = BADGE[cat] || BADGE.personal;
  const { subcategory, cleanNotes } = parseNotes(entry.notes);

  // Set back link
  const backLink = document.getElementById('backLink');
  if (backLink) {
    backLink.href = subcategory
      ? `category.html?cat=${encodeURIComponent(cat)}&sub=${encodeURIComponent(subcategory)}`
      : `category.html?cat=${encodeURIComponent(cat)}`;
  }

  document.getElementById('detailCard').innerHTML = `

    <!-- Category badge -->
    <div class="cat-badge ${b.cls}">
      ${b.label}${subcategory ? ' &middot; ' + escapeHtml(subcategory) : ''}
    </div>

    <!-- Title -->
    <div class="detail-title-row">
      <h1 class="detail-title">${escapeHtml(entry.title)}</h1>
    </div>

    <!-- Username -->
    <div class="info-row">
      <div class="info-label">Username / Login</div>
      <div class="info-value">
        ${entry.username
          ? escapeHtml(entry.username)
          : '<span style="color:var(--muted)">—</span>'}
      </div>
    </div>

    <!-- Password (AES-256 decrypted by backend) -->
    <div class="info-row">
      <div class="info-label">Password / Secret Value</div>
      <div class="secret-row">
        <span class="secret-dots" id="secretDots">&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;</span>
        <span class="secret-actual" id="secretActual" data-value="${escapeHtml(entry.password)}"></span>
        <button class="btn-sm btn-sm-blue" id="showBtn" onclick="toggleShow()">Show</button>
        <button class="btn-sm btn-sm-green" onclick="copyValue()">Copy</button>
      </div>
      <div class="copy-feedback" id="copyFeedback"></div>
    </div>

    <!-- Notes -->
    <div class="info-row">
      <div class="info-label">Notes</div>
      <div class="info-value">
        ${cleanNotes
          ? escapeHtml(cleanNotes)
          : '<span style="color:var(--muted)">—</span>'}
      </div>
    </div>

    <!-- Actions -->
    <div class="action-buttons">
      <button class="btn btn-blue" style="flex:1;justify-content:center;" onclick="editEntry()">
        Update
      </button>
      <button class="btn btn-danger" style="flex:1;justify-content:center;" onclick="openModal()">
        Delete
      </button>
    </div>
  `;
}

function renderError(msg) {
  document.getElementById('detailCard').innerHTML =
    `<p style="color:var(--muted);text-align:center;padding:50px;">${msg}</p>`;
}

// ── Show / hide password ───────────────────────────────────────────────────
// The password is already decrypted by the backend and stored in data-value
function toggleShow() {
  const dots   = document.getElementById('secretDots');
  const actual = document.getElementById('secretActual');
  const btn    = document.getElementById('showBtn');
  if (!btn || !actual) return;

  if (actual.style.display === 'inline') {
    actual.style.display = 'none';
    dots.style.display   = 'inline';
    btn.textContent = 'Show';
  } else {
    actual.textContent   = actual.dataset.value;
    actual.style.display = 'inline';
    dots.style.display   = 'none';
    btn.textContent = 'Hide';
  }
}

// ── Copy password to clipboard ────────────────────────────────────────────
async function copyValue() {
  const actual = document.getElementById('secretActual');
  if (!actual) return;
  try {
    await navigator.clipboard.writeText(actual.dataset.value);
    const fb = document.getElementById('copyFeedback');
    if (fb) { fb.textContent = 'Copied to clipboard'; setTimeout(()=>fb.textContent='', 2000); }
  } catch {}
}

function editEntry() {
  window.location.href = `create-entry.html?edit=${entryId}`;
}

function openModal()  { document.getElementById('deleteModal').classList.add('open'); }
function closeModal() { document.getElementById('deleteModal').classList.remove('open'); }

document.getElementById('confirmDelete')?.addEventListener('click', async () => {
  try {
    const res = await fetch(`${API}/entries/${entryId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) window.location.href = 'entries.html';
  } catch { closeModal(); }
});

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = 'login.html';
}

loadEntry();
