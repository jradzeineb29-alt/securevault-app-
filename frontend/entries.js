const API   = 'http://127.0.0.1:8000';
const token = localStorage.getItem('token');
// Demo mode — uncomment to enforce login:
// if (!token) window.location.href = 'login.html';

async function loadCounts() {
  if (!token) return;
  try {
    const res = await fetch(`${API}/entries/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;
    const entries = await res.json();
    const counts = { social: 0, bank: 0, work: 0, personal: 0 };
    entries.forEach(e => {
      const cat = (e.category || '').toLowerCase();
      if (counts[cat] !== undefined) counts[cat]++;
    });
    Object.keys(counts).forEach(cat => {
      const el = document.getElementById(`count-${cat}`);
      if (el) el.textContent = `${counts[cat]} ${counts[cat] === 1 ? 'entry' : 'entries'}`;
    });
    const total = Object.values(counts).reduce((a,b)=>a+b,0);
    const totalEl = document.getElementById('totalCount');
    if (totalEl) totalEl.textContent = total;
  } catch { }
}

loadCounts();

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = 'login.html';
}
