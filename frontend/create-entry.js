/**
 * create-entry.js
 * POST /entries/      — create new entry
 * PUT  /entries/{id}  — update existing entry (edit mode via ?edit=ID)
 *
 * Backend fields: title, username, password, notes, category
 * Subcategory is stored as "[SubName]" prefix in the notes field.
 */

const API   = 'http://127.0.0.1:8000';
const token = localStorage.getItem('token');
if (token === null) window.location.href = 'login.html';

const editParams = new URLSearchParams(window.location.search);
const editId     = editParams.get('edit');
// Pre-selected cat/sub when coming from category page
const presetCat  = editParams.get('cat') || '';
const presetSub  = editParams.get('sub') || '';

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

function subIconHtml(name, size) {
  const src = SUB_IMAGES[name] || '';
  if (src) return `<img src="${encodeURI(src)}" alt="${name}" style="width:${size}px;height:${size}px;object-fit:cover;border-radius:6px;flex-shrink:0;"/>`;
  return `<div style="width:${size}px;height:${size}px;border-radius:6px;background:var(--card2);border:1px dashed var(--border2);flex-shrink:0;"></div>`;
}

let iconSelectValue = '';

// ── Custom icon dropdown ───────────────────────────────────────────────────
function buildIconSelect(options, preselected, labelText) {
  const wrap      = document.getElementById('iconSelectWrap');
  const hiddenSel = document.getElementById('subcategory');
  iconSelectValue = preselected || '';

  const container = document.createElement('div');
  container.className = 'icon-select-dropdown';

  const selected = document.createElement('div');
  selected.className = 'icon-select-selected';
  selected.innerHTML = `
    ${subIconHtml(preselected || '', 28)}
    <span class="sel-text">${preselected || '— Select ' + labelText + ' —'}</span>
    <span class="sel-arrow">&#9660;</span>
  `;

  const list = document.createElement('div');
  list.className = 'icon-select-list';

  options.forEach(opt => {
    const item = document.createElement('div');
    item.className = 'icon-select-opt' + (opt === preselected ? ' selected' : '');
    item.innerHTML = `${subIconHtml(opt, 28)} ${opt}`;
    item.addEventListener('click', () => {
      iconSelectValue = opt;
      hiddenSel.value = opt;
      selected.innerHTML = `${subIconHtml(opt, 28)}<span class="sel-text">${opt}</span><span class="sel-arrow">&#9660;</span>`;
      list.querySelectorAll('.icon-select-opt').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      list.classList.remove('open');
    });
    list.appendChild(item);
  });

  selected.addEventListener('click', () => list.classList.toggle('open'));
  document.addEventListener('click', (e) => { if (!container.contains(e.target)) list.classList.remove('open'); });

  container.appendChild(selected);
  container.appendChild(list);
  wrap.innerHTML = '';
  wrap.appendChild(container);

  hiddenSel.innerHTML = options.map(o => `<option value="${o}" ${o===preselected?'selected':''}>${o}</option>`).join('');
}

// ── Category dropdown change ───────────────────────────────────────────────
function handleCategory(preselectedSub) {
  const cat      = document.getElementById('category').value;
  const subField = document.getElementById('subField');
  const subLabel = document.getElementById('subLabel');
  if (SUB_OPTIONS[cat]) {
    subField.style.display = 'block';
    subLabel.textContent   = cat==='bank' ? 'Select Bank' : cat==='social' ? 'Select Platform' : 'Select Type';
    buildIconSelect(SUB_OPTIONS[cat], preselectedSub || '', subLabel.textContent);
  } else {
    subField.style.display = 'none';
    iconSelectValue = '';
  }
}

// ── Password show/hide ─────────────────────────────────────────────────────
document.getElementById('togglePw')?.addEventListener('click', () => {
  const input = document.getElementById('entryValue');
  input.type = input.type === 'password' ? 'text' : 'password';
});

// ── Pre-select category/sub if coming from category page ──────────────────
if (presetCat && !editId) {
  const catSel = document.getElementById('category');
  if (catSel) { catSel.value = presetCat; handleCategory(presetSub); }
}

// ── Edit mode: load existing entry ────────────────────────────────────────
async function loadForEdit() {
  if (!editId || !token) return;
  document.getElementById('formTitle').innerHTML = 'Update <span>Entry</span>';
  document.getElementById('saveBtn').textContent = 'Encrypt & Update';
  try {
    const res  = await fetch(`${API}/entries/${editId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;
    const entry = await res.json();

    document.getElementById('title').value         = entry.title    || '';
    document.getElementById('entryUsername').value = entry.username || '';
    document.getElementById('entryValue').value    = entry.password || '';

    // Extract subcategory from notes prefix "[SubName] rest of notes"
    const subMatch = (entry.notes || '').match(/^\[([^\]]+)\]\s*([\s\S]*)/);
    const entrySubcat  = subMatch ? subMatch[1] : '';
    const cleanNotes   = subMatch ? subMatch[2] : (entry.notes || '');
    document.getElementById('notes').value = cleanNotes;

    const catSel = document.getElementById('category');
    catSel.value = (entry.category || '').toLowerCase();
    handleCategory(entrySubcat);
  } catch {}
}

// ── Form submit ────────────────────────────────────────────────────────────
document.getElementById('entryForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title    = document.getElementById('title').value.trim();
  const username = document.getElementById('entryUsername').value.trim();
  const password = document.getElementById('entryValue').value;
  const category = document.getElementById('category').value;
  const sub      = document.getElementById('subcategory').value || iconSelectValue;
  const rawNotes = document.getElementById('notes').value.trim();

  // Pack subcategory into notes as "[SubName] notes text"
  const notes = sub ? `[${sub}]${rawNotes ? ' ' + rawNotes : ''}` : rawNotes;

  const btn = document.getElementById('saveBtn');
  const err = document.getElementById('errorBox');
  const ok  = document.getElementById('successBox');
  err.style.display = ok.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Encrypting...';

  const body = JSON.stringify({ title, username, password, notes, category });
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  try {
    let res;
    if (editId) {
      // Update existing — PUT /entries/{id}
      res = await fetch(`${API}/entries/${editId}`, { method: 'PUT', headers, body });
    } else {
      // Create new — POST /entries/
      res = await fetch(`${API}/entries/`, { method: 'POST', headers, body });
    }

    const data = await res.json();

    if (res.ok) {
      ok.textContent   = editId ? `"${title}" updated.` : `"${title}" encrypted and saved.`;
      ok.style.display = 'block';
      const dest = category ? `category.html?cat=${encodeURIComponent(category)}` : 'entries.html';
      setTimeout(() => { window.location.href = dest; }, 1200);
    } else {
      const msg = typeof data.detail === 'string' ? data.detail :
                  Array.isArray(data.detail) ? data.detail.map(d=>d.msg).join(', ') : 'Failed to save.';
      err.textContent   = msg;
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
