/**
 * category.js
 * Handles sub-category list and entry list views.
 * All social media and bank icons are now mapped to real image files.
 */

const API   = 'http://localhost:8000';
const token = localStorage.getItem('token');
// Demo mode — uncomment to enforce login:
// if (!token) window.location.href = 'login.html';

const params = new URLSearchParams(window.location.search);
const cat    = params.get('cat');
const sub    = params.get('sub');

// ── Image map — filename for each sub-category ────────────────────────────
const SUB_IMAGES = {
  // Social Media
  'Facebook':              'facebook.webp',
  'Instagram':             'instagram.jpg',
  'TikTok':                'tiktok.png',
  'Snapchat':              'snapchat.jpg',
  'X (formerly Twitter)':  'X.jpg',
  'LinkedIn':              'linkedin.jpg',
  'YouTube':               'youtube.svg',
  'Reddit':                'reddit.webp',
  'Pinterest':             'pinterest.webp',
  'Discord':               'discord.png',
  'Threads':               'threads.avif',
  'Telegram':              'telegram.webp',
  'WhatsApp':              'whatsapp.jpg',
  'WeChat':                'wechat.png',
  'Tumblr':                'tumblr.webp',
  'BeReal':                'Bereal.png',
  'Twitch':                'twitch.jpg',

  // Banks
  'Banque Internationale Arabe de Tunisie (BIAT)': 'Banque Internationale Arabe de Tunisie (BIAT).jpg',
  'Banque Nationale Agricole (BNA)':               'banque nationale agricole.png',
  'Société Tunisienne de Banque (STB)':            'societe-tunisienne-de-banque--600.png',
  'Amen Bank':                                     'amen bank.png',
  'Attijari Bank Tunisie':                         'Attijari Bank Tunisie.png',
  'Banque de Tunisie (BT)':                        'Banque de Tunisie (BT).jpg',
  'BH Bank':                                       'BH_BANK.png',
  'Union Internationale de Banques (UIB)':         'Union Internationale de Banques (UIB).webp',
  "Union Bancaire pour le Commerce et l'Industrie (UBCI)": "union bancaire pour le commerce et l'industrie (ubci).jpg",
  'Arab Tunisian Bank (ATB)':                      'Arab Tunisian Bank (ATB).jpg',
  'Banque Zitouna':                                'Banque Zitouna.png',
  'Al Baraka Bank Tunisia':                        'al baraka bank tunisia.png',
  'Wifak Bank':                                    'wifak bank.jpg',
  'Qatar National Bank Tunisie':                   'Qatar National Bank Tunisie.png',
  'Banque Tuniso-Koweitienne':                     'Banque Tuniso-Koweitienne.png',
  'Banque de Tunisie et des Emirates':             'Banque de Tunisie et des Emirates.jpg',
  'Banque Tuniso-Libyenne':                        'Banque Tuniso-Libyenne.jpg',
  'Banque Tunisienne de Solidarité':               'Banque Tunisienne de Solidarité.png',

  // Work — no logos, keep placeholder
  'API Keys':                'work.webp',
  'Authentication & Tokens': 'work.webp',
  'Cloud Services':          'work.webp',
  'Databases':               'work.webp',
  'Servers & Infrastructure':'work.webp',
  'DevOps & CI/CD':          'work.webp',
  'Source Control (Git)':    'work.webp',
  'Domain & DNS Management': 'work.webp',
  'Hosting Providers':       'work.webp',
};

// ── Sub-category lists ────────────────────────────────────────────────────
const SUB_OPTIONS = {
  social: [
    'Facebook','Instagram','TikTok','Snapchat','X (formerly Twitter)',
    'LinkedIn','YouTube','Reddit','Pinterest','Discord','Threads',
    'Telegram','WhatsApp','WeChat','Tumblr','BeReal','Twitch'
  ],
  bank: [
    'Banque Internationale Arabe de Tunisie (BIAT)',
    'Banque Nationale Agricole (BNA)',
    'Société Tunisienne de Banque (STB)',
    'Amen Bank','Attijari Bank Tunisie','Banque de Tunisie (BT)',
    'BH Bank','Union Internationale de Banques (UIB)',
    "Union Bancaire pour le Commerce et l'Industrie (UBCI)",
    'Arab Tunisian Bank (ATB)','Banque Zitouna','Al Baraka Bank Tunisia',
    'Wifak Bank','Qatar National Bank Tunisie','Banque Tuniso-Koweitienne',
    'Banque de Tunisie et des Emirates','Banque Tuniso-Libyenne',
    'Banque Tunisienne de Solidarité'
  ],
  work: [
    'API Keys','Authentication & Tokens','Cloud Services','Databases',
    'Servers & Infrastructure','DevOps & CI/CD','Source Control (Git)',
    'Domain & DNS Management','Hosting Providers'
  ]
};

const CAT_NAMES = { social:'Social Media', bank:'Banking', work:'Work', personal:'Personal' };

function escapeHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Returns an <img> tag if we have an image, otherwise a styled placeholder div
function iconImg(name, size) {
  const src = SUB_IMAGES[name] || '';
  if (src) {
    return `<img src="${encodeURI(src)}" alt="${escapeHtml(name)}"
              style="width:${size}px;height:${size}px;object-fit:cover;
                     border-radius:${size > 40 ? 10 : 6}px;flex-shrink:0;"/>`;
  }
  return `<div style="width:${size}px;height:${size}px;border-radius:${size > 40 ? 10 : 6}px;
                      flex-shrink:0;background:var(--card2);border:1px dashed var(--border2);"></div>`;
}

// Set page title
const titleEl = document.getElementById('pageTitle');
if (titleEl) {
  titleEl.innerHTML = `<span style="color:var(--green)">${escapeHtml(sub || CAT_NAMES[cat] || cat)}</span>`;
}

// Load entries from backend
async function loadEntries() {
  if (!token) return [];
  try {
    const res = await fetch(`${API}/secrets`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return [];
    const all = await res.json();
    return all.filter(s => {
      try {
        const m = JSON.parse(s.name);
        if (m.category !== cat) return false;
        if (sub && m.subcategory !== sub) return false;
        return true;
      } catch { return false; }
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

// ── Sub-category list with real icons ─────────────────────────────────────
function renderSubcats(entries) {
  const list = document.getElementById('subcatList');
  const subs = SUB_OPTIONS[cat] || [];

  const counts = {};
  entries.forEach(s => {
    try { const m = JSON.parse(s.name); counts[m.subcategory] = (counts[m.subcategory]||0)+1; }
    catch {}
  });

  if (!subs.length) {
    list.innerHTML = '<p style="color:var(--muted)">No sub-categories.</p>';
    return;
  }

  list.innerHTML = subs.map(name => `
    <a href="category.html?cat=${encodeURIComponent(cat)}&sub=${encodeURIComponent(name)}"
       class="subcat-item animate-in">
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
        <div class="img-placeholder empty-img" style="margin:0 auto 20px;">
          <img src="secret.jpg" alt="empty vault" style="width:80px;height:80px;object-fit:cover;border-radius:16px;"/>
        </div>
        <p style="margin-bottom:20px;">No entries here yet.</p>
        <a href="create-entry.html" class="btn btn-green">+ Add Entry</a>
      </div>`;
    return;
  }

  wrap.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <span style="color:var(--muted);font-size:13px;">${entries.length} ${entries.length===1?'entry':'entries'}</span>
      <a href="create-entry.html" class="btn btn-green" style="padding:8px 18px;font-size:13px;">+ Add</a>
    </div>
    <div class="entry-list">
      ${entries.map(e => {
        let meta = {};
        try { meta = JSON.parse(e.name); } catch {}
        const img = iconImg(meta.subcategory || '', 40);
        return `
          <a href="entry-detail.html?id=${e.id}" class="entry-item animate-in">
            ${img}
            <div class="entry-info">
              <div class="entry-title">${escapeHtml(meta.title || 'Entry')}</div>
              <div class="entry-sub">${escapeHtml(meta.username || '')}</div>
            </div>
            <span class="entry-arrow">&#8594;</span>
          </a>`;
      }).join('')}
    </div>`;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = 'login.html';
}

init();
