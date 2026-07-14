const API   = 'http://localhost:8000';
const token = localStorage.getItem('token');
// DEMO MODE: auth guard disabled — uncomment to re-enable:
// if (!token) window.location.href = 'login.html';

async function loadCounts() {
  if (!token) return;
  try {
    const res = await fetch(`${API}/secrets`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;
    const secrets = await res.json();
    const counts = { social: 0, bank: 0, work: 0, personal: 0 };
    secrets.forEach(s => {
      try {
        const meta = JSON.parse(s.name);
        if (counts[meta.category] !== undefined) counts[meta.category]++;
      } catch { }
    });
    Object.keys(counts).forEach(cat => {
      const el = document.getElementById(`count-${cat}`);
      if (el) el.textContent = `${counts[cat]} ${counts[cat] === 1 ? 'entry' : 'entries'}`;
    });
  } catch { }
}

loadCounts();

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = 'login.html';
}
