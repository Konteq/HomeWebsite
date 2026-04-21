/* ================================================
   main.js – Logik der Startseite
   ================================================ */

/* 🔥 FIREBASE IMPORTS */
import { collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


/* ─────────────────────────────────────────────────
   1. UHR & BEGRÜSSUNG
   ───────────────────────────────────────────────── */

function updateClock() {
  const clockEl = document.getElementById('clock');
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  clockEl.textContent = `${h}:${m}`;
}
updateClock();
setInterval(updateClock, 1000);

function setGreeting() {
  const greetEl = document.getElementById('greeting');
  const hour = new Date().getHours();
  let text = '';
  if      (hour >= 5  && hour < 12) text = 'Guten Morgen ☀️';
  else if (hour >= 12 && hour < 18) text = 'Guten Nachmittag 🌤️';
  else if (hour >= 18 && hour < 22) text = 'Guten Abend 🌆';
  else                               text = 'Gute Nacht 🌙';
  greetEl.textContent = text;
}
setGreeting();


/* ─────────────────────────────────────────────────
   2. ICON-HILFSFUNKTION
   ───────────────────────────────────────────────── */

function createIconElement(app) {
  const wrap = document.createElement('div');
  wrap.className = 'app-icon';

  if (app.iconType === 'favicon') {
    const img = document.createElement('img');
    img.src = `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(app.url)}`;
    img.onerror = () => {
      wrap.textContent = app.name.charAt(0).toUpperCase();
    };
    wrap.appendChild(img);

  } else if (app.iconType === 'image') {
    const img = document.createElement('img');
    img.src = app.icon;
    wrap.appendChild(img);

  } else {
    wrap.textContent = app.icon || '🔗';
  }

  return wrap;
}


/* ─────────────────────────────────────────────────
   3. FIREBASE → APPS LADEN
   ───────────────────────────────────────────────── */

async function loadAppsFromFirebase() {
  const snapshot = await getDocs(collection(window.db, "apps"));

  window.APPS = [];

  snapshot.forEach(doc => {
    APPS.push(doc.data());
  });

  // 🔥 WICHTIG: ERST JETZT GRID BAUEN
  buildGrid();
}


/* ─────────────────────────────────────────────────
   4. APP-GRID AUFBAUEN
   ───────────────────────────────────────────────── */

function buildGrid() {
  const grid = document.getElementById('appGrid');
  grid.innerHTML = '';

  if (!window.APPS || APPS.length === 0) {
    grid.innerHTML = '<p style="color:#555">Keine Apps definiert.</p>';
    return;
  }

  APPS.forEach((app, index) => {
    const card = document.createElement('a');
    card.href = app.url;
    card.target = '_blank';
    card.className = 'app-card';

    card.appendChild(createIconElement(app));

    const name = document.createElement('div');
    name.textContent = app.name;
    card.appendChild(name);

    if (app.sub) {
      const sub = document.createElement('div');
      sub.textContent = app.sub;
      card.appendChild(sub);
    }

    grid.appendChild(card);
  });
}


/* ─────────────────────────────────────────────────
   5. SUCHLEISTE
   ───────────────────────────────────────────────── */

const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter') return;
  const query = searchInput.value.trim();
  if (!query) return;

  const isURL = query.includes('.') && !query.includes(' ');

  if (isURL) {
    const url = query.startsWith('http') ? query : `https://${query}`;
    window.open(url, '_blank');
  } else {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  }

  searchInput.value = '';
});


/* ─────────────────────────────────────────────────
   6. MODAL + BUTTON
   ───────────────────────────────────────────────── */

const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('addModal');

addBtn.addEventListener('click', () => {
  modal.classList.add('open');
});

function closeModal() {
  modal.classList.remove('open');
}

document.getElementById('modalClose').addEventListener('click', closeModal);


/* ─────────────────────────────────────────────────
   7. FORMULAR → APP SPEICHERN
   ───────────────────────────────────────────────── */

const addForm = document.getElementById('addForm');

addForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('inputName').value.trim();
  const url  = document.getElementById('inputUrl').value.trim();

  const newApp = {
    name,
    url: url.startsWith('http') ? url : `https://${url}`,
    iconType: 'emoji',
    icon: '🔗'
  };

  // 🔥 IN FIREBASE SPEICHERN
  await addDoc(collection(window.db, "apps"), newApp);

  // 🔥 DIREKT UI UPDATEN
  APPS.push(newApp);
  buildGrid();

  closeModal();
});


/* ─────────────────────────────────────────────────
   START
   ───────────────────────────────────────────────── */

// 🔥 GANZ AM ENDE LADEN
loadAppsFromFirebase();