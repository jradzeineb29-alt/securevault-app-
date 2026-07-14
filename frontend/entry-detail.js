/**
 * entry-detail.js — shows full entry info with image placeholders.
 * No auth guard in demo mode.
 */

const API   = 'http://localhost:8000';
const token = localStorage.getItem('token');
// DEMO MODE: uncomment to enforce login:
// if (!token) window.location.href = 'login.html';

const params   = new URLSearchParams(window.location.search);
const secretId = params.get('id');

let secretMeta  = {};
let secretValue = null;

function escapeHtml(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

const BADGE = {
  social:  {cls:'badge-social',  label:'Social Media'},
  bank:    {cls:'badge-bank',    label:'Banking'},
  work:    {cls:'badge-work',    label:'Work'},
  personal:{cls:'badge-personal',label:'Personal'}
};

async function loadEntry() {
  if (!token || !secretId) { renderError('No entry selected.'); return; }
  try {
    const res = await fetch(`${API}/secrets`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) { renderError('Failed to load entries.'); return; }
    const all   = await res.json();
    const entry = all.find(e => String(e.id) === String(secretId));
    if (!entry) { renderError('Entry not found.'); return; }
    try { secretMeta = JSON.parse(entry.name); } catch { secretMeta = { title: entry.name }; }
    renderDetail();
  } catch { renderError('Cannot reach the server.'); }
}

function renderDetail() {
  const cat = secretMeta.category || 'personal';
  const b   = BADGE[cat] || BADGE.personal;

  const backLink = document.getElementById('backLink');
  backLink.href = secretMeta.subcategory
    ? `category.html?cat=${cat}&sub=${encodeURIComponent(secretMeta.subcategory)}`
    : `category.html?cat=${cat}`;

  document.getElementById('detailCard').innerHTML = `

    <!-- Category badge with image placeholder -->
    <div class="cat-badge ${b.cls}">
      <!--
        BADGE IMAGE for ${b.label}
        Replace src="" with e.g. src="images/${cat}-icon.png"
      -->
      <div class="img-placeholder badge-img"><img src="" alt="${b.label}"/></div>
      ${b.label}${secretMeta.subcategory ? ' &middot; ' + escapeHtml(secretMeta.subcategory) : ''}
    </div>

    <!-- Title with icon -->
    <div class="detail-title-row">
      <!--
        ENTRY ICON IMAGE
        Replace src="" with e.g. src="images/entry-icon.png"
      -->
      <div class="img-placeholder detail-entry-icon"><img src="" alt="entry"/></div>
      <h1 class="detail-title">${escapeHtml(secretMeta.title || 'Entry')}</h1>
    </div>

    <!-- Username -->
    <div class="info-row">
      <div class="info-label">Username / Login</div>
      <div class="info-value">
        ${secretMeta.username
          ? escapeHtml(secretMeta.username)
          : '<span style="color:var(--muted)">—</span>'}
      </div>
    </div>

    <!-- Secret value -->
    <div class="info-row">
      <div class="info-label">Entry Value (AES-256 encrypted)</div>
      <div class="secret-row">
        <span class="secret-dots" id="secretDots">&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;</span>
        <span class="secret-actual" id="secretActual"></span>
        <button class="btn-sm btn-sm-blue" id="showBtn" onclick="toggleShow()">
          <!--
            SHOW ICON — replace src="" with e.g. src="images/eye.png"
          -->
          <div class="img-placeholder btn-sm-icon"><img src="" alt="show"/></div>
          Show
        </button>
        <button class="btn-sm btn-sm-green" onclick="copyValue()">
          <!--
            COPY ICON — replace src="" with e.g. src="images/copy.png"
          -->
          <div class="img-placeholder btn-sm-icon"><img src="" alt="copy"/></div>
          Copy
        </button>
      </div>
      <div class="copy-feedback" id="copyFeedback"></div>
    </div>

    <!-- Notes -->
    <div class="info-row">
      <div class="info-label">Notes</div>
      <div class="info-value">
        ${secretMeta.notes
          ? escapeHtml(secretMeta.notes)
          : '<span style="color:var(--muted)">—</span>'}
      </div>
    </div>

    <!-- Action buttons -->
    <div class="action-buttons">
      <button class="btn btn-blue" style="flex:1;justify-content:center;" onclick="editEntry()">
        <!--
          UPDATE ICON — replace src="" with e.g. src="images/edit.png"
        -->
        <div class="img-placeholder btn-action-icon"><img src="" alt="edit"/></div>
        Update
      </button>
      <button class="btn btn-danger" style="flex:1;justify-content:center;" onclick="openModal()">
        <!--
          DELETE ICON — replace src="" with e.g. src="images/delete.png"
        -->
        <div class="img-placeholder btn-action-icon"><img src="" alt="delete"/></div>
        Delete
      </button>
    </div>
  `;
}

function renderError(msg) {
  document.getElementById('detailCard').innerHTML =
    `<p style="color:var(--muted);text-align:center;padding:50px;">${msg}</p>`;
}

async function toggleShow() {
  const dots   = document.getElementById('secretDots');
  const actual = document.getElementById('secretActual');
  const btn    = document.getElementById('showBtn');
  if (!btn) return;

  if (actual.style.display === 'block') {
    actual.style.display = 'none';
    dots.style.display   = 'inline';
    btn.innerHTML = btn.innerHTML.replace(/Hide/,'Show');
    return;
  }

  if (!secretValue && token) {
    btn.innerHTML = btn.innerHTML.replace(/Show/,'Loading...');
    try {
      const res  = await fetch(`${API}/secrets/${secretId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      secretValue = (await res.json()).value;
    } catch {
      btn.innerHTML = btn.innerHTML.replace(/Loading\.\.\./,'Show');
      return;
    }
  }

  if (!secretValue) return;
  actual.textContent   = escapeHtml(secretValue);
  actual.style.display = 'block';
  dots.style.display   = 'none';
  btn.innerHTML = btn.innerHTML.replace(/Show/,'Hide');
}

async function copyValue() {
  if (!secretValue && token) {
    try {
      const res  = await fetch(`${API}/secrets/${secretId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      secretValue = (await res.json()).value;
    } catch { return; }
  }
  if (!secretValue) return;
  await navigator.clipboard.writeText(secretValue);
  const fb = document.getElementById('copyFeedback');
  if (fb) { fb.textContent = 'Copied to clipboard'; setTimeout(()=>fb.textContent='',2000); }
}

function editEntry() {
  window.location.href = `create-entry.html?edit=${secretId}`;
}

function openModal()  { document.getElementById('deleteModal').classList.add('open'); }
function closeModal() { document.getElementById('deleteModal').classList.remove('open'); }

document.getElementById('confirmDelete')?.addEventListener('click', async () => {
  if (!token) { closeModal(); return; }
  try {
    const res = await fetch(`${API}/secrets/${secretId}`, {
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
