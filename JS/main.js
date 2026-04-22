import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, addDoc, deleteDoc, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  getAuth, signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAVjuGZg8T8eMUHRVFS1K3Qk6cZXI2CSiM",
  authDomain: "homewebsite-f5702.firebaseapp.com",
  projectId: "homewebsite-f5702"
};

const firebaseApp = initializeApp(firebaseConfig);
const db          = getFirestore(firebaseApp);
const auth        = getAuth(firebaseApp);
const provider    = new GoogleAuthProvider();

window.APPS = [];
let currentUserId = null;

/* ── EINSTELLUNGEN ── */
const SETTINGS_KEY = 'startseite_settings';
function loadSettings() { try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch { return {}; } }
function saveSettings(patch) { const s = { ...loadSettings(), ...patch }; localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); return s; }

function applySettings(s) {
  document.documentElement.setAttribute('data-theme', s.theme || 'dark');
  if (s.accent) {
    const r = parseInt(s.accent.slice(1,3),16), g = parseInt(s.accent.slice(3,5),16), b = parseInt(s.accent.slice(5,7),16);
    document.documentElement.style.setProperty('--accent', s.accent);
    document.documentElement.style.setProperty('--accent-glow', `rgba(${r},${g},${b},0.18)`);
    document.documentElement.style.setProperty('--border-hover', `rgba(${r},${g},${b},0.35)`);
  }
  const gw = document.getElementById('gridWrapper');
  if (gw) gw.setAttribute('data-size', s.size || 'medium');
  const bg = document.getElementById('bgLayer');
  if (bg) {
    if (s.bgImage) {
      bg.style.backgroundImage = `url(${s.bgImage})`;
      bg.classList.add('active');
      const preview = document.getElementById('bgPreview');
      const wrap = document.getElementById('bgPreviewWrap');
      if (preview) { preview.src = s.bgImage; wrap.style.display = ''; }
    } else {
      bg.style.backgroundImage = '';
      bg.classList.remove('active');
    }
  }
}

/* ── UHR ── */
function updateClocks() {
  const t = `${String(new Date().getHours()).padStart(2,'0')}:${String(new Date().getMinutes()).padStart(2,'0')}`;
  ['clock','loginClock'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = t; });
}
updateClocks();
setInterval(updateClocks, 1000);

/* ── BEGRÜSSUNG ── */
function setGreeting() {
  const el = document.getElementById('greeting');
  if (!el) return;
  const h = new Date().getHours();
  if      (h >= 5  && h < 12) el.textContent = 'Guten Morgen ☀️';
  else if (h >= 12 && h < 18) el.textContent = 'Guten Nachmittag 🌤️';
  else if (h >= 18 && h < 22) el.textContent = 'Guten Abend 🌆';
  else                          el.textContent = 'Gute Nacht 🌙';
}

/* ── WETTER ── */
const WEATHER_ICONS = { Clear:'☀️', Clouds:'☁️', Rain:'🌧️', Drizzle:'🌦️', Thunderstorm:'⛈️', Snow:'❄️', Mist:'🌫️', Fog:'🌫️', Haze:'🌫️' };

async function loadWeather() {
  const s = loadSettings();
  if (!s.weatherApiKey) {
    document.getElementById('weatherLoading').style.display = 'none';
    document.getElementById('weatherError').style.display = 'flex';
    return;
  }
  try {
    const pos = await new Promise((res,rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
    const { latitude: lat, longitude: lon } = pos.coords;
    const data = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${s.weatherApiKey}&units=metric&lang=de`).then(r => r.json());
    if (data.cod !== 200) throw new Error();
    document.getElementById('weatherTemp').textContent = `${Math.round(data.main.temp)}°`;
    document.getElementById('weatherDesc').textContent = data.weather[0].description;
    document.getElementById('weatherCity').textContent = data.name;
    document.getElementById('weatherIcon').textContent = WEATHER_ICONS[data.weather[0].main] || '🌡️';
    document.getElementById('weatherLoading').style.display = 'none';
    document.getElementById('weatherContent').style.display = 'flex';
  } catch {
    document.getElementById('weatherLoading').style.display = 'none';
    document.getElementById('weatherError').style.display = 'flex';
  }
}

/* ── NOTIZ ── */
const NOTE_KEY = 'startseite_note';
const notepad = document.getElementById('notepad');
if (notepad) {
  notepad.value = localStorage.getItem(NOTE_KEY) || '';
  notepad.addEventListener('input', () => localStorage.setItem(NOTE_KEY, notepad.value));
}

/* ── ICON ── */
function createIconElement(app) {
  const wrap = document.createElement('div');
  wrap.className = 'app-icon';
  if (app.iconType === 'favicon') {
    const img = document.createElement('img');
    img.src = `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(app.url)}`;
    img.onerror = () => { wrap.textContent = app.name.charAt(0).toUpperCase(); };
    wrap.appendChild(img);
  } else if (app.iconType === 'image') {
    const img = document.createElement('img');
    img.src = app.icon;
    wrap.appendChild(img);
  } else {
    wrap.textContent = app.icon || '🔗';
  }
  const badge = document.createElement('div');
  badge.className = 'click-badge' + (app.clicks > 0 ? ' visible' : '');
  badge.textContent = app.clicks || 0;
  wrap.appendChild(badge);
  return wrap;
}

/* ── KLICK-ZÄHLER ── */
async function incrementClick(app) {
  if (!currentUserId || !app.docId) return;
  app.clicks = (app.clicks || 0) + 1;
  try { await updateDoc(doc(db, "users", currentUserId, "apps", app.docId), { clicks: app.clicks }); } catch {}
}

/* ── GRID ── */
function buildGrid() {
  const wrapper = document.getElementById('gridWrapper');
  if (!wrapper) return;
  wrapper.innerHTML = '';
  const s = loadSettings();
  wrapper.setAttribute('data-size', s.size || 'medium');

  if (!window.APPS || APPS.length === 0) {
    wrapper.innerHTML = '<p style="color:var(--text-secondary);font-size:13px;">Noch keine Apps. Klick auf + um zu starten.</p>';
    return;
  }

  const groups = {};
  APPS.forEach(app => { const cat = app.category || 'Meine Apps'; if (!groups[cat]) groups[cat] = []; groups[cat].push(app); });

  const dl = document.getElementById('categoryList');
  if (dl) { dl.innerHTML = ''; Object.keys(groups).forEach(cat => { const opt = document.createElement('option'); opt.value = cat; dl.appendChild(opt); }); }

  Object.entries(groups).forEach(([catName, apps]) => {
    const section = document.createElement('div');
    section.className = 'category-section';
    const label = document.createElement('div');
    label.className = 'category-label';
    label.textContent = catName;
    section.appendChild(label);
    const grid = document.createElement('div');
    grid.className = 'app-grid';
    grid.dataset.category = catName;
    apps.forEach((app, i) => grid.appendChild(buildCard(app, i)));
    section.appendChild(grid);
    wrapper.appendChild(section);
  });

  initDragDrop();
}

/* ── CARD ── */
function buildCard(app, index) {
  const wrapper = document.createElement('div');
  wrapper.className = 'card-wrapper';
  wrapper.draggable = true;
  wrapper.dataset.docId = app.docId;

  const card = document.createElement('a');
  card.href = app.url;
  card.target = '_blank';
  card.className = 'app-card';
  card.style.animationDelay = `${index * 40}ms`;
  card.appendChild(createIconElement(app));

  const name = document.createElement('div');
  name.className = 'app-name';
  name.textContent = app.name;
  card.appendChild(name);

  if (app.sub) {
    const sub = document.createElement('div');
    sub.className = 'app-sub';
    sub.textContent = app.sub;
    card.appendChild(sub);
  }

  card.addEventListener('click', () => incrementClick(app));

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'card-action-btn edit';
  editBtn.title = 'Bearbeiten';
  editBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  editBtn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); openEditModal(app); });

  const delBtn = document.createElement('button');
  delBtn.className = 'card-action-btn delete';
  delBtn.title = 'Löschen';
  delBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  delBtn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); deleteApp(app.docId); });

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);
  wrapper.appendChild(card);
  wrapper.appendChild(actions);
  return wrapper;
}

/* ── DRAG & DROP ── */
let dragSrc = null;
function initDragDrop() {
  document.querySelectorAll('.card-wrapper').forEach(w => {
    w.addEventListener('dragstart', e => { dragSrc = w; w.querySelector('.app-card').classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
    w.addEventListener('dragend', () => { w.querySelector('.app-card').classList.remove('dragging'); document.querySelectorAll('.card-wrapper').forEach(x => x.classList.remove('drag-over')); });
    w.addEventListener('dragover', e => { e.preventDefault(); if (w !== dragSrc) w.classList.add('drag-over'); });
    w.addEventListener('dragleave', () => w.classList.remove('drag-over'));
    w.addEventListener('drop', e => {
      e.preventDefault();
      if (!dragSrc || dragSrc === w) return;
      w.classList.remove('drag-over');
      const parent = w.parentNode;
      const siblings = [...parent.children];
      const srcIdx = siblings.indexOf(dragSrc);
      const tgtIdx = siblings.indexOf(w);
      if (srcIdx < tgtIdx) parent.insertBefore(dragSrc, w.nextSibling);
      else parent.insertBefore(dragSrc, w);
      const srcI = APPS.findIndex(a => a.docId === dragSrc.dataset.docId);
      const tgtI = APPS.findIndex(a => a.docId === w.dataset.docId);
      if (srcI !== -1 && tgtI !== -1) { const [moved] = APPS.splice(srcI, 1); APPS.splice(tgtI, 0, moved); }
    });
  });
}

/* ── LÖSCHEN ── */
async function deleteApp(docId) {
  if (!currentUserId || !docId) return;
  try { await deleteDoc(doc(db, "users", currentUserId, "apps", docId)); window.APPS = APPS.filter(a => a.docId !== docId); buildGrid(); }
  catch (err) { console.error("Löschen fehlgeschlagen:", err); }
}

/* ── BEARBEITEN ── */
function openEditModal(app) {
  document.getElementById('editDocId').value    = app.docId;
  document.getElementById('editName').value     = app.name;
  document.getElementById('editUrl').value      = app.url;
  document.getElementById('editSub').value      = app.sub || '';
  document.getElementById('editCategory').value = app.category || '';
  document.getElementById('editEmoji').value    = app.iconType === 'emoji' ? (app.icon || '') : '';
  openModal('editModal');
}

document.getElementById('editForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const docId    = document.getElementById('editDocId').value;
  const name     = document.getElementById('editName').value.trim();
  const url      = document.getElementById('editUrl').value.trim();
  const sub      = document.getElementById('editSub').value.trim();
  const category = document.getElementById('editCategory').value.trim();
  const emoji    = document.getElementById('editEmoji').value.trim();
  const updates  = { name, url: url.startsWith('http') ? url : `https://${url}`, sub: sub||'', category: category||'', icon: emoji||'', iconType: emoji ? 'emoji' : 'favicon' };
  try {
    await updateDoc(doc(db, "users", currentUserId, "apps", docId), updates);
    const idx = APPS.findIndex(a => a.docId === docId);
    if (idx !== -1) APPS[idx] = { ...APPS[idx], ...updates };
    buildGrid(); closeModal('editModal');
  } catch (err) { console.error("Bearbeiten fehlgeschlagen:", err); }
});
document.getElementById('editClose').addEventListener('click', () => closeModal('editModal'));

/* ── FIREBASE LADEN ── */
async function loadAppsFromFirebase() {
  if (!currentUserId) return;
  try {
    const snapshot = await getDocs(collection(db, "users", currentUserId, "apps"));
    window.APPS = [];
    snapshot.forEach(d => APPS.push({ ...d.data(), docId: d.id }));
    buildGrid();
  } catch (err) { console.error("Firebase Ladefehler:", err); }
}

/* ── AUTH ── */
onAuthStateChanged(auth, async user => {
  const loginScreen = document.getElementById('loginScreen');
  const appEl       = document.getElementById('app');
  const userChip    = document.getElementById('userChip');

  if (user) {
    currentUserId = user.uid;
    loginScreen.style.display = 'none';
    appEl.style.display = 'flex';
    if (user.photoURL) document.getElementById('userAvatar').src = user.photoURL;
    if (user.displayName) document.getElementById('userName').textContent = user.displayName.split(' ')[0];
    userChip.style.display = 'flex';
    setGreeting();
    applySettings(loadSettings());
    initSettingsUI();
    await loadAppsFromFirebase();
    loadWeather();
  } else {
    currentUserId = null;
    window.APPS = [];
    loginScreen.style.display = 'flex';
    appEl.style.display = 'none';
    if (userChip) userChip.style.display = 'none';
  }
});

document.getElementById('loginBtn').addEventListener('click', () => signInWithPopup(auth, provider).catch(console.error));
document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth).catch(console.error));

/* ── SUCHE ── */
document.getElementById('searchInput').addEventListener('keydown', function(e) {
  if (e.key !== 'Enter') return;
  const query = this.value.trim();
  if (!query) return;
  const isURL = query.includes('.') && !query.includes(' ');
  window.open(isURL ? (query.startsWith('http') ? query : `https://${query}`) : `https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  this.value = '';
});

/* ── TASTENKÜRZEL ── */
document.addEventListener('keydown', e => {
  const tag = document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  const shortcuts = loadSettings().shortcuts || {};
  const found = APPS.find(a => a.name.toLowerCase().includes((shortcuts[e.key.toLowerCase()]||'').toLowerCase()));
  if (found && shortcuts[e.key.toLowerCase()]) window.open(found.url, '_blank');
});

/* ── MODAL HELFER ── */
const overlay = document.getElementById('modalOverlay');

function openModal(id) { document.getElementById(id).classList.add('open'); overlay.style.display = 'block'; }
function closeModal(id) { document.getElementById(id).classList.remove('open'); if (!document.querySelector('.modal.open')) overlay.style.display = 'none'; }

overlay.addEventListener('click', () => { document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open')); overlay.style.display = 'none'; });

/* ── ADD MODAL ── */
let currentIconMode = 'emoji';
document.getElementById('addBtn').addEventListener('click', () => openModal('addModal'));
document.getElementById('modalClose').addEventListener('click', () => closeModal('addModal'));

document.getElementById('toggleEmoji').addEventListener('click', () => {
  currentIconMode = 'emoji';
  document.getElementById('toggleEmoji').classList.add('active');
  document.getElementById('toggleFavicon').classList.remove('active');
  document.getElementById('emojiArea').style.display = '';
  document.getElementById('faviconArea').style.display = 'none';
});

document.getElementById('toggleFavicon').addEventListener('click', () => {
  currentIconMode = 'favicon';
  document.getElementById('toggleFavicon').classList.add('active');
  document.getElementById('toggleEmoji').classList.remove('active');
  document.getElementById('emojiArea').style.display = 'none';
  document.getElementById('faviconArea').style.display = '';
});

document.getElementById('addForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  if (!currentUserId) return;
  const name     = document.getElementById('inputName').value.trim();
  const url      = document.getElementById('inputUrl').value.trim();
  const sub      = document.getElementById('inputSub').value.trim();
  const category = document.getElementById('inputCategory').value.trim();
  const emoji    = document.getElementById('inputEmoji').value.trim();
  const newApp   = { name, url: url.startsWith('http') ? url : `https://${url}`, iconType: currentIconMode, icon: currentIconMode === 'emoji' ? (emoji||'🔗') : '', sub: sub||'', category: category||'', clicks: 0 };
  try {
    const docRef = await addDoc(collection(db, "users", currentUserId, "apps"), newApp);
    APPS.push({ ...newApp, docId: docRef.id });
    buildGrid(); this.reset(); closeModal('addModal'); launchConfetti();
  } catch (err) { console.error("Speichern fehlgeschlagen:", err); }
});

/* ── KONFETTI ── */
function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const pieces = Array.from({ length: 120 }, () => ({ x: Math.random()*canvas.width, y: -10, r: Math.random()*6+4, c: `hsl(${Math.random()*360},70%,60%)`, vx: (Math.random()-.5)*4, vy: Math.random()*4+2, life: 1 }));
  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    let alive = false;
    pieces.forEach(p => { p.x+=p.vx; p.y+=p.vy; p.vy+=0.08; p.life-=0.012; if (p.life<=0) return; alive=true; ctx.globalAlpha=p.life; ctx.fillStyle=p.c; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); });
    ctx.globalAlpha=1;
    if (alive) requestAnimationFrame(draw); else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  draw();
}

/* ── EINSTELLUNGEN UI ── */
function initSettingsUI() {
  const s = loadSettings();

  const themeDark = document.getElementById('themeDark');
  const themeLight = document.getElementById('themeLight');
  function applyTheme(t) { saveSettings({ theme: t }); applySettings(loadSettings()); themeDark.classList.toggle('active', t==='dark'); themeLight.classList.toggle('active', t==='light'); }
  themeDark.classList.toggle('active', (s.theme||'dark')==='dark');
  themeLight.classList.toggle('active', s.theme==='light');
  themeDark.addEventListener('click', () => applyTheme('dark'));
  themeLight.addEventListener('click', () => applyTheme('light'));

  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.classList.toggle('active', (s.size||'medium') === btn.dataset.size);
    btn.addEventListener('click', () => { saveSettings({ size: btn.dataset.size }); applySettings(loadSettings()); document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); buildGrid(); });
  });

  document.querySelectorAll('.swatch').forEach(sw => {
    sw.classList.toggle('active', sw.dataset.color === (s.accent||'#5e6ad2'));
    sw.addEventListener('click', () => { saveSettings({ accent: sw.dataset.color }); applySettings(loadSettings()); document.querySelectorAll('.swatch').forEach(x => x.classList.remove('active')); sw.classList.add('active'); });
  });

  const customColor = document.getElementById('customColor');
  customColor.addEventListener('input', () => { saveSettings({ accent: customColor.value }); applySettings(loadSettings()); document.querySelectorAll('.swatch').forEach(x => x.classList.remove('active')); });

  document.getElementById('bgUpload').addEventListener('change', function() {
    const file = this.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { saveSettings({ bgImage: ev.target.result }); applySettings(loadSettings()); document.getElementById('bgPreview').src = ev.target.result; document.getElementById('bgPreviewWrap').style.display = ''; };
    reader.readAsDataURL(file);
  });

  document.getElementById('removeBg').addEventListener('click', () => { saveSettings({ bgImage: null }); const bg = document.getElementById('bgLayer'); bg.style.backgroundImage=''; bg.classList.remove('active'); document.getElementById('bgPreviewWrap').style.display='none'; });

  const weatherKeyInput = document.getElementById('weatherApiKey');
  weatherKeyInput.value = s.weatherApiKey || '';
  document.getElementById('saveWeatherKey').addEventListener('click', () => { saveSettings({ weatherApiKey: weatherKeyInput.value.trim() }); closeModal('settingsModal'); loadWeather(); });

  renderShortcuts();
  document.getElementById('addShortcut').addEventListener('click', () => {
    const key = document.getElementById('shortcutKey').value.trim().toLowerCase();
    const app = document.getElementById('shortcutApp').value.trim();
    if (!key || !app) return;
    const s2 = loadSettings(); const shortcuts = s2.shortcuts || {}; shortcuts[key] = app; saveSettings({ shortcuts });
    document.getElementById('shortcutKey').value = ''; document.getElementById('shortcutApp').value = '';
    renderShortcuts();
  });
}

function renderShortcuts() {
  const shortcuts = loadSettings().shortcuts || {};
  const list = document.getElementById('shortcutList');
  list.innerHTML = '';
  Object.entries(shortcuts).forEach(([key, appName]) => {
    const item = document.createElement('div');
    item.className = 'shortcut-list-item';
    item.innerHTML = `<span class="shortcut-key">${key}</span><span>→</span><span>${appName}</span><button class="shortcut-remove" data-key="${key}">×</button>`;
    item.querySelector('.shortcut-remove').addEventListener('click', () => { const s2 = loadSettings(); delete s2.shortcuts[key]; saveSettings(s2); renderShortcuts(); });
    list.appendChild(item);
  });
  if (!Object.keys(shortcuts).length) list.innerHTML = '<div style="font-size:12px;color:var(--text-label);">Noch keine Kürzel definiert.</div>';
}

document.getElementById('settingsBtn').addEventListener('click', () => { initSettingsUI(); openModal('settingsModal'); });
document.getElementById('settingsClose').addEventListener('click', () => closeModal('settingsModal'));