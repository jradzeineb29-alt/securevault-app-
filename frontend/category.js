/**
 * category.js
 * Loads entries from GET /entries/ and filters by category.
 * The backend stores category as a plain string field.
 * Subcategory is stored as a prefix in the notes field: "[subcategory] actual notes"
 */

const API   = 'http://127.0.0.1:8000';
const token = localStorage.getItem('token');
// Enforce login — comment out to browse without logging in:
if (token === null) window.location.href = 'login.html';

const params = new URLSearchParams(window.location.search);
const cat    = params.get('cat');   // e.g. "social", "bank", "work", "personal"
const sub    = params.get('sub');   // e.g. "Instagram", "BIAT" — null if not selected yet

// ── Image map ──────────────────────────────────────────────────────────────
const SUB_IMAGES = {
  'Facebook':'facebook.webp','Instagram':'instagram.jpg','TikTok':'tiktok.png',
  'Snapchat':'snapchat.jpg','X (formerly Twitter)':'X.jpg','LinkedIn':'linkedin.jpg',
  'YouTube':'youtube.svg','Reddit':'reddit.webp','Pinterest':'pinterest.webp',
  'Discord':'discord.png','Threads':'threads.avif','Telegram':'telegram.webp',
  'WhatsApp':'whatsapp.jpg','WeChat':'wechat.png','Tumblr':'tumblr.webp',
  'BeReal':'Bereal.png','Twitch':'twitch.jpg',
  'Banque Internationale Arabe de Tunisie (BIAT)':'Banque Internationale Arabe de Tunisie (BIAT).jpg',
  'Banque Nationale Agricole (BNA)':'banque nationale agricole.png',
  'Société Tunisienne de Banque (STB)':'societe-tunisienne-de-banque--600.png',
  'Amen Bank':'amen bank.png','Attijari Bank Tunisie':'Attijari Bank Tunisie.png',
  'Banque de Tunisie (BT)':'Banque de Tunisie (BT).jpg','BH Bank':'BH_BANK.png',
  'Union Internationale de Banques (UIB)':'Union Internationale de Banques (UIB).webp',
  "Union Bancaire pour le Commerce et l'Industrie (UBCI)":"union bancaire pour le commerce et l'industrie (ubci).jpg",
  'Arab Tunisian Bank (ATB)':'Arab Tunisian Bank (ATB).jpg',
  'Banque Zitouna':'Banque Zitouna.png','Al Baraka Bank Tunisia':'al baraka bank tunisia.png',
  'Wifak Bank':'wifak bank.jpg','Qatar National Bank Tunisie':'Qatar National Bank Tunisie.png',
  'Banque Tuniso-Koweitienne':'Banque Tuniso-Koweitienne.png',
  'Banque de Tunisie et des Emirates':'Banque de Tunisie et des Emirates.jpg',
  'Banque Tuniso-Libyenne':'Banque Tuniso-Libyenne.jpg',
  'Banque Tunisienne de Solidarité':'Banque Tunisienne de Solidarité.png',
};

const SUB_OPTIONS = {
  social:['Facebook','Instagram','TikTok','Snapchat','X (formerly Twitter)',
    'LinkedIn','YouTube','Reddit','Pinterest','Discord','Threads',
    'Telegram','WhatsApp','WeChat','Tumblr','BeReal','Twitch'],
  bank:['Banque Internationale Arabe de Tunisie (BIAT)','Banque Nationale Agricole (BNA)',
    'Société Tunisienne de Banque (STB)','Amen Bank','Attijari Bank Tunisie',
    'Banque de Tunisie (BT)','BH Bank','Union Internationale de Banques (UIB)',
    "Union Bancaire pour le Commerce et l'Industrie (UBCI)",'Arab Tunisian Bank (ATB)',
    'Banque Zitouna','Al Baraka Bank Tunisia','Wifak Bank','Qatar National Bank Tunisie',
    'Banque Tuniso-Koweitienne','Banque de Tunisie et des Emirates',
    'Banque Tuniso-Libyenne','Banque Tunisienne de Solidarité'],
  work:['API Keys','Authentication & Tokens','Cloud Services','Databases',
    'Servers & Infrastructure','DevOps & CI/CD','Source Control (Git)',
    'Domain & DNS Management','Hosting Providers']
};

const CAT_NAMES = { social:'Social Media', bank:'Banking', work:'Work', personal:'Personal' };

function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function iconImg(name, size) {
  const src = SUB_IMAGES[name] || '';
  if (src) return `<img src="${encodeURI(src)}" alt="${escapeHtml(name)}" style="width:${size}px;height:${size}px;object-fit:cover;border-radius:${size>40?10:6}px;flex-shrink:0;"/>`;
  return `<div style="width:${size}px;height:${size}px;border-radius:${size>40?10:6}px;flex-shrink:0;background:var(--card2);border:1px dashed var(--border2);"></div>`;
}

// Set page title
const titleEl = document.getElementById('pageTitle');
if (titleEl) titleEl.innerHTML = `<span style="color:var(--green)">${escapeHtml(sub || CAT_NAMES[cat] || cat)}</span>`;

// ── Extract subcategory from notes field ───────────────────────────────────
// We store subcategory as "[SubName]" at the start of notes
// e.g. notes = "[Instagram] This is my main account"
function getSubcategory(entry) {
  const match = (entry.notes || '').match(/^\[([^\]]+)\]/);
  return match ? match[1] : '';
}
function getCleanNotes(entry) {
  return (entry.notes || '').replace(/^\[[^\]]+\]\s*/, '');
}

// ── Load from real API ─────────────────────────────────────────────────────
async function loadEntries() {
  if (!token) return [];
  try {
    const res = await fetch(`${API}/entries/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return [];
    const all = await res.json();
    return all.filter(e => {
      if ((e.category || '').toLowerCase() !== cat) return false;
      if (sub && getSubcategory(e) !== sub) return false;
      return true;
    });
  } catch { return []; }
}

async function init() {
  const entries = await loadEntries();
  if (cat === 'personal' || sub) {
    document.getElementById('subcatView').style.display = 'none';
    document.getElementById('entryView').style.display  = 'block';
    renderEntries(entries);
  } else {
    renderSubcats(entries);
  }
}

// ── Sub-category list ──────────────────────────────────────────────────────
function renderSubcats(entries) {
  const list = document.getElementById('subcatList');
  const subs = SUB_OPTIONS[cat] || [];

  // Count entries per sub
  const counts = {};
  entries.forEach(e => {
    const s = getSubcategory(e);
    if (s) counts[s] = (counts[s] || 0) + 1;
  });

  if (!subs.length) { list.innerHTML = '<p style="color:var(--muted)">No sub-categories.</p>'; return; }

  list.innerHTML = subs.map(name => `
    <a href="category.html?cat=${encodeURIComponent(cat)}&sub=${encodeURIComponent(name)}" class="subcat-item animate-in">
      ${iconImg(name, 40)}
      <span class="subcat-name">${escapeHtml(name)}</span>
      ${counts[name] ? `<span class="subcat-count">${counts[name]} entr${counts[name]===1?'y':'ies'}</span>` : ''}
      <span class="subcat-arrow">&#8594;</span>
    </a>
  `).join('');
}

// ── Entry list ─────────────────────────────────────────────────────────────
function renderEntries(entries) {
  const wrap = document.getElementById('entryListWrap');

  if (!entries.length) {
    wrap.innerHTML = `
      <div class="empty-state">
        <img src="secret.jpg" alt="empty" class="empty-img"/>
        <p style="margin-bottom:20px;">No entries here yet.</p>
        <a href="create-entry.html" class="btn btn-green">+ Add Entry</a>
      </div>`;
    return;
  }

  const subOfEntry = sub || '';
  wrap.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
      <span style="color:var(--muted);font-family:var(--mono);font-size:12px;letter-spacing:2px;">
        ${entries.length} ${entries.length===1?'ENTRY':'ENTRIES'}
      </span>
      <a href="create-entry.html?cat=${encodeURIComponent(cat)}&sub=${encodeURIComponent(subOfEntry)}"
         class="btn btn-green" style="padding:9px 20px;font-size:13px;">+ Add</a>
    </div>
    <div class="entry-list">
      ${entries.map(e => `
        <a href="entry-detail.html?id=${e.id}" class="entry-item animate-in">
          ${iconImg(getSubcategory(e), 44)}
          <div class="entry-info">
            <div class="entry-title">${escapeHtml(e.title)}</div>
            <div class="entry-sub">${escapeHtml(e.username || '')}</div>
          </div>
          <span class="entry-arrow">&#8594;</span>
        </a>`).join('')}
    </div>`;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = 'login.html';
}

init();
