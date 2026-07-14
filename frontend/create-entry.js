/**
 * create-entry.js
 * Handles new entry creation and edit mode (?edit=ID).
 * Features a custom icon-select dropdown with image placeholders.
 */

const API   = 'http://localhost:8000';
const token = localStorage.getItem('token');
// DEMO MODE: uncomment to enforce login:
// if (!token) window.location.href = 'login.html';

const editParams = new URLSearchParams(window.location.search);
const editId     = editParams.get('edit');

// ── Image map — same as category.js ──────────────────────────────────────
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

function subIconHtml(name, size) {
  const src = SUB_IMAGES[name] || '';
  if (src) return `<img src="${encodeURI(src)}" alt="${name}" style="width:${size}px;height:${size}px;object-fit:cover;border-radius:6px;flex-shrink:0;"/>`;
  return `<div style="width:${size}px;height:${size}px;border-radius:6px;background:var(--card2);border:1px dashed var(--border2);flex-shrink:0;"></div>`;
}
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

// ── Custom icon-select ────────────────────────────────────────────────────
// Renders a styled dropdown with an image placeholder next to each option.
// When you add real images: place them in images/ and update the src below.
let iconSelectValue = '';

function buildIconSelect(options, preselected, labelText) {
  const wrap = document.getElementById('iconSelectWrap');
  const hiddenSel = document.getElementById('subcategory');
  iconSelectValue = preselected || '';

  const container = document.createElement('div');
  container.className = 'icon-select-dropdown';

  // Selected display row
  const selected = document.createElement('div');
  selected.className = 'icon-select-selected';
  selected.innerHTML = `
    ${subIconHtml(preselected || '', 28)}
    <span class="sel-text">${preselected || '— Select ' + labelText + ' —'}</span>
    <span class="sel-arrow">&#9660;</span>
  `;

  // Options list
  const list = document.createElement('div');
  list.className = 'icon-select-list';

  options.forEach(opt => {
    const item = document.createElement('div');
    item.className = 'icon-select-opt' + (opt === preselected ? ' selected' : '');
    item.innerHTML = `
      ${subIconHtml(opt, 28)}
      ${opt}
    `;
    item.addEventListener('click', () => {
      iconSelectValue = opt;
      hiddenSel.value = opt;
      selected.innerHTML = `
        ${subIconHtml(opt, 28)}
        <span class="sel-text">${opt}</span>
        <span class="sel-arrow">&#9660;</span>
      `;
      list.querySelectorAll('.icon-select-opt').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      list.classList.remove('open');
    });
    list.appendChild(item);
  });

  // Toggle open/close
  selected.addEventListener('click', () => list.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) list.classList.remove('open');
  });

  container.appendChild(selected);
  container.appendChild(list);

  wrap.innerHTML = '';
  wrap.appendChild(container);

  // Keep hidden select in sync
  hiddenSel.innerHTML = options.map(o =>
    `<option value="${o}" ${o === preselected ? 'selected' : ''}>${o}</option>`
  ).join('');
}

// ── Category change ───────────────────────────────────────────────────────
function handleCategory(preselectedSub) {
  const cat      = document.getElementById('category').value;
  const subField = document.getElementById('subField');
  const subLabel = document.getElementById('subLabel');

  if (SUB_OPTIONS[cat]) {
    subField.style.display = 'block';
    subLabel.textContent   = cat === 'bank' ? 'Select Bank' :
                             cat === 'social' ? 'Select Platform' : 'Select Type';
    buildIconSelect(SUB_OPTIONS[cat], preselectedSub || '', subLabel.textContent);
  } else {
    subField.style.display = 'none';
    iconSelectValue = '';
  }
}

// ── Password show/hide ────────────────────────────────────────────────────
document.getElementById('togglePw')?.addEventListener('click', () => {
  const input = document.getElementById('entryValue');
  input.type = input.type === 'password' ? 'text' : 'password';
});

// ── Edit mode: pre-fill form ──────────────────────────────────────────────
async function loadForEdit() {
  if (!editId || !token) return;
  document.getElementById('formTitle').innerHTML = 'Update <span>Entry</span>';
  document.getElementById('saveBtn').textContent = 'Encrypt & Update';

  try {
    const res = await fetch(`${API}/secrets`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const all  = await res.json();
    const entry = all.find(e => String(e.id) === String(editId));
    if (!entry) return;

    let meta = {};
    try { meta = JSON.parse(entry.name); } catch { return; }

    document.getElementById('title').value         = meta.title    || '';
    document.getElementById('entryUsername').value = meta.username || '';
    document.getElementById('notes').value         = meta.notes    || '';

    const catSel = document.getElementById('category');
    catSel.value = meta.category || '';
    handleCategory(meta.subcategory || '');

    const hint = document.createElement('p');
    hint.style.cssText = 'font-size:12px;color:var(--muted);margin-top:6px;';
    hint.textContent = 'Re-enter the value to update it (required for security).';
    document.getElementById('entryValue').parentElement.after(hint);
  } catch {}
}

// ── Form submit ───────────────────────────────────────────────────────────
document.getElementById('entryForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title    = document.getElementById('title').value.trim();
  const username = document.getElementById('entryUsername').value.trim();
  const value    = document.getElementById('entryValue').value;
  const cat      = document.getElementById('category').value;
  const sub      = document.getElementById('subcategory').value || iconSelectValue;
  const notes    = document.getElementById('notes').value.trim();

  const fullName = JSON.stringify({ title, username, category: cat, subcategory: sub, notes });

  const btn = document.getElementById('saveBtn');
  const err = document.getElementById('errorBox');
  const ok  = document.getElementById('successBox');
  err.style.display = ok.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Encrypting...';

  try {
    if (editId && token) {
      await fetch(`${API}/secrets/${editId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res  = await fetch(`${API}/secrets`, {
      method: 'POST', headers,
      body: JSON.stringify({ name: fullName, value })
    });
    const data = await res.json();

    if (res.ok) {
      ok.textContent   = editId ? `"${title}" updated.` : `"${title}" encrypted and saved.`;
      ok.style.display = 'block';
      setTimeout(() => { window.location.href = 'entries.html'; }, 1200);
    } else {
      err.textContent   = data.detail || 'Failed to save.';
      err.style.display = 'block';
    }
  } catch {
    err.textContent   = 'Cannot reach the server.';
    err.style.display = 'block';
  } finally {
    btn.disabled    = false;
    btn.textContent = editId ? 'Encrypt & Update' : 'Encrypt & Save';
  }
});

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = 'login.html';
}

loadForEdit();
