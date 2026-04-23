import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, addDoc, deleteDoc, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  getAuth, signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";


import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app-check.js";

const firebaseConfig = {
  apiKey: "AIzaSyAVjuGZg8T8eMUHRVFS1K3Qk6cZXI2CSiM",
  authDomain: "homewebsite-f5702.firebaseapp.com",
  projectId: "homewebsite-f5702"
};

const firebaseApp = initializeApp(firebaseConfig);

/* ── APP CHECK ── */
initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaV3Provider('6LenH8YsAAAAAM0GaumGKYLgxS6ySyBoENSImg3A'),
  isTokenAutoRefreshEnabled: true
});

const db       = getFirestore(firebaseApp);
const auth     = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

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

/* ════════════════════════════════════
   AUTO-EMOJI
════════════════════════════════════ */
const AUTO_EMOJI_MAP = [
  { keys: ['gmail','mail','email','post'],         emoji: '📧' },
  { keys: ['whatsapp','telegram','signal'],         emoji: '💬' },
  { keys: ['discord'],                              emoji: '🎮' },
  { keys: ['slack'],                                emoji: '💼' },
  { keys: ['zoom','meet','teams','conference'],     emoji: '📹' },
  { keys: ['twitter','x.com','tweet'],              emoji: '🐦' },
  { keys: ['instagram'],                            emoji: '📸' },
  { keys: ['facebook'],                             emoji: '👥' },
  { keys: ['linkedin'],                             emoji: '🤝' },
  { keys: ['tiktok'],                               emoji: '🎵' },
  { keys: ['reddit'],                               emoji: '🦊' },
  { keys: ['pinterest'],                            emoji: '📌' },
  { keys: ['github','gitlab','bitbucket'],          emoji: '🐙' },
  { keys: ['stackoverflow','stack'],                emoji: '📚' },
  { keys: ['vercel','netlify','hosting'],           emoji: '🚀' },
  { keys: ['docker'],                               emoji: '🐳' },
  { keys: ['figma','design','sketch'],              emoji: '🎨' },
  { keys: ['vscode','code','editor'],               emoji: '💻' },
  { keys: ['terminal','console','shell'],           emoji: '⌨️' },
  { keys: ['chatgpt','openai'],                     emoji: '🤖' },
  { keys: ['claude','anthropic'],                   emoji: '🧠' },
  { keys: ['midjourney','dalle','stable'],          emoji: '🖼️' },
  { keys: ['copilot'],                              emoji: '✈️' },
  { keys: ['notion'],                               emoji: '📓' },
  { keys: ['obsidian','notes','notizen'],           emoji: '📝' },
  { keys: ['trello','jira','asana','linear'],       emoji: '📋' },
  { keys: ['calendar','kalender','cal'],            emoji: '📅' },
  { keys: ['todoist','todo','tasks','aufgaben'],    emoji: '✅' },
  { keys: ['airtable'],                             emoji: '🗂️' },
  { keys: ['confluence','wiki','docs'],             emoji: '📖' },
  { keys: ['google.com'],                           emoji: '🔍' },
  { keys: ['drive','cloud','speicher'],             emoji: '☁️' },
  { keys: ['sheets','excel','tabelle'],             emoji: '📊' },
  { keys: ['slides','powerpoint','präsentation'],   emoji: '🖥️' },
  { keys: ['maps','karte','navigation'],            emoji: '🗺️' },
  { keys: ['translate','übersetzer'],               emoji: '🌍' },
  { keys: ['youtube'],                              emoji: '▶️' },
  { keys: ['spotify','musik','music'],              emoji: '🎵' },
  { keys: ['netflix'],                              emoji: '🎬' },
  { keys: ['twitch'],                               emoji: '🎮' },
  { keys: ['soundcloud'],                           emoji: '🎶' },
  { keys: ['podcast'],                              emoji: '🎙️' },
  { keys: ['amazon'],                               emoji: '📦' },
  { keys: ['paypal','payment','zahlung'],           emoji: '💳' },
  { keys: ['bank','banking','konto'],               emoji: '🏦' },
  { keys: ['crypto','bitcoin','ethereum'],          emoji: '₿' },
  { keys: ['protonmail','proton'],                  emoji: '🔒' },
  { keys: ['bitwarden','lastpass','1password'],     emoji: '🔑' },
  { keys: ['news','zeitung','heise','spiegel'],     emoji: '📰' },
  { keys: ['wikipedia'],                            emoji: '📚' },
  { keys: ['fitness','gym','sport'],                emoji: '💪' },
  { keys: ['steam','game','spiel'],                 emoji: '🎮' },
];

function getAutoEmoji(name, url) {
  const haystack = `${name} ${url}`.toLowerCase();
  for (const entry of AUTO_EMOJI_MAP) {
    if (entry.keys.some(k => haystack.includes(k))) return entry.emoji;
  }
  return '🔗';
}

/* ════════════════════════════════════
   EMOJI PICKER DATEN
════════════════════════════════════ */
const EMOJI_DATA = {
  smileys: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😋','😛','😜','🤪','😝','🤑','🤗','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','😌','😔','😪','😴','😷','🤒','🤕','🤢','🤧','🥵','🥶','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','😤','😡','😠','🤬','😈','👿'],
  tech: ['💻','🖥️','🖨️','⌨️','🖱️','💾','💿','📀','📱','☎️','📞','📟','📠','📺','📷','📸','📹','🎥','📡','🔋','🔌','💡','🔦','⚙️','🔧','🔨','🔩','🗜️','🔗','⛓️','🧲','🔭','🔬','🩺','💊','🧬','🧪','🌡️','🖼️','🛍️','🎁'],
  objects: ['📦','📫','📬','📭','📮','🗳️','✏️','✒️','🖋️','📝','📁','📂','🗂️','📅','📆','🗒️','🗓️','📇','📈','📉','📊','📋','📌','📍','✂️','🗃️','🗄️','🗑️','🔒','🔓','🔑','🗝️','🪄','🧿','🎭','🎨','🎰','🎲','🧩','♟️','🎯','🎳','🏹','🎣','🥊','🥋','🎽','🛷','🛹'],
  symbols: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','☯️','🆔','⚛️','☢️','☣️','📴','📳','✴️','🆚','💯','💢','♨️','🚫','🔞','⚠️','🚸','♻️','✅','❎','➕','➖','➗','✖️','❓','❗','💱','💲','▶️','⏩','⏭️','◀️','⏪','🔀','🔁','🔂','⏸️','⏹️','⏺️','🎦','🔅','🔆','📶']
};

EMOJI_DATA.all = Object.values(EMOJI_DATA).flat();

/* ════════════════════════════════════
   EMOJI PICKER
════════════════════════════════════ */
let selectedEmoji = '🔗';
let pickerOpen = false;
let currentCat = 'all';

function renderEmojiGrid(filter = '') {
  const grid = document.getElementById('emojiGrid');
  if (!grid) return;
  const emojis = EMOJI_DATA[currentCat] || EMOJI_DATA.all;
  const filtered = filter ? emojis.filter(e => e.includes(filter)) : emojis;
  grid.innerHTML = '';
  filtered.forEach(em => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'emoji-btn' + (em === selectedEmoji ? ' selected' : '');
    btn.textContent = em;
    btn.addEventListener('click', () => {
      selectedEmoji = em;
      document.getElementById('emojiPreviewBtn').textContent = em;
      document.getElementById('emojiAutoLabel').textContent = 'Manuell gewählt';
      document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
    grid.appendChild(btn);
  });
}

function initEmojiPicker() {
  const previewBtn  = document.getElementById('emojiPreviewBtn');
  const pickerWrap  = document.getElementById('emojiPickerWrap');
  const emojiSearch = document.getElementById('emojiSearch');
  if (!previewBtn) return;

  previewBtn.addEventListener('click', () => {
    pickerOpen = !pickerOpen;
    pickerWrap.style.display = pickerOpen ? '' : 'none';
    if (pickerOpen) { renderEmojiGrid(); emojiSearch.focus(); }
  });

  emojiSearch.addEventListener('input', () => renderEmojiGrid(emojiSearch.value));

  document.querySelectorAll('.emoji-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCat = btn.dataset.cat;
      document.querySelectorAll('.emoji-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderEmojiGrid(emojiSearch.value);
    });
  });
}

function initAutoEmoji() {
  const nameInput = document.getElementById('inputName');
  const urlInput  = document.getElementById('inputUrl');
  let userHasPicked = false;

  function resetEmojiPicker() {
    selectedEmoji = '🔗';
    userHasPicked = false;
    const btn   = document.getElementById('emojiPreviewBtn');
    const label = document.getElementById('emojiAutoLabel');
    if (btn)   btn.textContent   = '🔗';
    if (label) label.textContent = 'Automatisch gewählt';
    pickerOpen = false;
    const wrap = document.getElementById('emojiPickerWrap');
    if (wrap) wrap.style.display = 'none';
  }

  function updateAutoEmoji() {
    if (userHasPicked) return;
    const emoji = getAutoEmoji(nameInput.value, urlInput.value);
    selectedEmoji = emoji;
    const btn   = document.getElementById('emojiPreviewBtn');
    const label = document.getElementById('emojiAutoLabel');
    if (btn)   btn.textContent   = emoji;
    if (label) label.textContent = emoji !== '🔗' ? 'Automatisch gewählt' : 'Standard';
  }

  nameInput.addEventListener('input', updateAutoEmoji);
  urlInput.addEventListener('input', updateAutoEmoji);

  document.getElementById('emojiGrid')?.addEventListener('click', () => { userHasPicked = true; });
  document.getElementById('modalClose').addEventListener('click', resetEmojiPicker);
  document.getElementById('modalOverlay').addEventListener('click', resetEmojiPicker);
}

/* ════════════════════════════════════
   ZITAT
════════════════════════════════════ */
const QUOTES = [
  { text: "Der einzige Weg, großartige Arbeit zu leisten, ist zu lieben, was man tut.", author: "Steve Jobs" },
  { text: "Nicht weil es schwer ist, wagen wir es nicht, sondern weil wir es nicht wagen, ist es schwer.", author: "Seneca" },
  { text: "In der Mitte jeder Schwierigkeit liegt eine Möglichkeit.", author: "Albert Einstein" },
  { text: "Das Geheimnis des Vorwärtskommens ist, anzufangen.", author: "Mark Twain" },
  { text: "Disziplin ist die Brücke zwischen Zielen und Erfolgen.", author: "Jim Rohn" },
  { text: "Du musst die Veränderung sein, die du in der Welt sehen möchtest.", author: "Mahatma Gandhi" },
  { text: "Erfolg ist die Summe kleiner Anstrengungen, die Tag für Tag wiederholt werden.", author: "Robert Collier" },
  { text: "Wer aufhört, besser zu werden, hat aufgehört, gut zu sein.", author: "Philip Rosenthal" },
  { text: "Das Leben ist das, was passiert, während du andere Pläne machst.", author: "John Lennon" },
  { text: "Träume nicht dein Leben, lebe deinen Traum.", author: "Mark Twain" },
  { text: "Der beste Zeitpunkt, einen Baum zu pflanzen, war vor 20 Jahren. Der zweitbeste ist jetzt.", author: "Chinesisches Sprichwort" },
  { text: "Wenn du weißt, warum du aufstehst, ist es egal, wie.", author: "Friedrich Nietzsche" },
  { text: "Perfektion ist nicht dann erreicht, wenn es nichts mehr hinzuzufügen gibt, sondern wenn man nichts mehr weglassen kann.", author: "Antoine de Saint-Exupéry" },
  { text: "Wer kämpft, kann verlieren. Wer nicht kämpft, hat schon verloren.", author: "Bertolt Brecht" },
  { text: "Die Zukunft gehört denen, die an die Schönheit ihrer Träume glauben.", author: "Eleanor Roosevelt" },
  { text: "Tue jeden Tag etwas, wovor du Angst hast.", author: "Eleanor Roosevelt" },
  { text: "Erfolg ist kein Schlüssel zum Glück. Glück ist der Schlüssel zum Erfolg.", author: "Albert Schweitzer" },
  { text: "Dein einziger Konkurrent sollte dein gestrigeres Ich sein.", author: "Unbekannt" },
  { text: "Fang an, wo du bist. Nutze, was du hast. Tue, was du kannst.", author: "Arthur Ashe" },
  { text: "Kleine tägliche Verbesserungen führen zu atemberaubenden Ergebnissen über die Zeit.", author: "Robin Sharma" },
  { text: "Der Unterschied zwischen ordinary und extraordinary ist das kleine Extra.", author: "Jimmy Johnson" },
  { text: "Stärke wächst nicht aus körperlicher Kraft. Sie kommt aus unbezwingbarem Willen.", author: "Mahatma Gandhi" },
  { text: "Jeder Experte war einmal ein Anfänger.", author: "Helen Hayes" },
  { text: "Konzentriere dich auf das Wesentliche, lass den Rest los.", author: "Mark Twain" },
  { text: "Es ist nicht genug zu wissen, man muss auch anwenden.", author: "Johann Wolfgang von Goethe" },
];

let currentQuoteIndex = -1;

function getQuoteForToday() {
  const day = new Date().toDateString();
  const stored    = localStorage.getItem('quote_day');
  const storedIdx = parseInt(localStorage.getItem('quote_idx'));
  if (stored === day && !isNaN(storedIdx)) return storedIdx;
  let idx;
  do { idx = Math.floor(Math.random() * QUOTES.length); } while (idx === storedIdx);
  localStorage.setItem('quote_day', day);
  localStorage.setItem('quote_idx', idx);
  return idx;
}

function showQuote(index, animate = false) {
  const textEl   = document.getElementById('quoteText');
  const authorEl = document.getElementById('quoteAuthor');
  if (!textEl || !authorEl) return;
  const quote = QUOTES[index];
  if (animate) {
    textEl.classList.add('fade');
    authorEl.classList.add('fade');
    setTimeout(() => {
      textEl.textContent   = quote.text;
      authorEl.textContent = '— ' + quote.author;
      textEl.classList.remove('fade');
      authorEl.classList.remove('fade');
    }, 400);
  } else {
    textEl.textContent   = quote.text;
    authorEl.textContent = '— ' + quote.author;
  }
  currentQuoteIndex = index;
}

function initQuote() {
  const textEl   = document.getElementById('quoteText');
  const authorEl = document.getElementById('quoteAuthor');
  const refreshBtn = document.getElementById('quoteRefresh');
  if (!textEl || !authorEl) return;

  const idx = getQuoteForToday();
  showQuote(idx);

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      let newIdx;
      do { newIdx = Math.floor(Math.random() * QUOTES.length); }
      while (newIdx === currentQuoteIndex);
      refreshBtn.classList.add('spinning');
      setTimeout(() => refreshBtn.classList.remove('spinning'), 400);
      showQuote(newIdx, true);
      localStorage.setItem('quote_idx', newIdx);
    });
  }
}

/* ════════════════════════════════════
   EINSTELLUNGEN
════════════════════════════════════ */
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
      const wrap    = document.getElementById('bgPreviewWrap');
      if (preview) { preview.src = s.bgImage; wrap.style.display = ''; }
    } else {
      bg.style.backgroundImage = '';
      bg.classList.remove('active');
    }
  }
}

/* ════════════════════════════════════
   UHR
════════════════════════════════════ */
function updateClocks() {
  const t = `${String(new Date().getHours()).padStart(2,'0')}:${String(new Date().getMinutes()).padStart(2,'0')}`;
  ['clock','loginClock'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = t; });
}
updateClocks();
setInterval(updateClocks, 1000);

/* ════════════════════════════════════
   BEGRÜSSUNG
════════════════════════════════════ */
function setGreeting() {
  const el = document.getElementById('greeting');
  if (!el) return;
  const h = new Date().getHours();
  if      (h >= 5  && h < 12) el.textContent = 'Guten Morgen ☀️';
  else if (h >= 12 && h < 18) el.textContent = 'Guten Nachmittag 🌤️';
  else if (h >= 18 && h < 22) el.textContent = 'Guten Abend 🌆';
  else                          el.textContent = 'Gute Nacht 🌙';
}

/* ════════════════════════════════════
   ICON
════════════════════════════════════ */
function createIconElement(app) {
  const wrap = document.createElement('div');
  wrap.className = 'app-icon';
  if (app.iconType === 'favicon') {
    const img = document.createElement('img');
    img.src = `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(app.url)}`;
    img.onerror = () => { wrap.textContent = app.name.charAt(0).toUpperCase(); };
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

/* ════════════════════════════════════
   KLICK-ZÄHLER
════════════════════════════════════ */
async function incrementClick(app) {
  if (!currentUserId || !app.docId) return;
  app.clicks = (app.clicks || 0) + 1;
  try { await updateDoc(doc(db, "users", currentUserId, "apps", app.docId), { clicks: app.clicks }); } catch {}
}

/* ════════════════════════════════════
   GRID
════════════════════════════════════ */
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
    apps.forEach((app, i) => grid.appendChild(buildCard(app, i)));
    section.appendChild(grid);
    wrapper.appendChild(section);
  });

  initDragDrop();
}

/* ════════════════════════════════════
   CARD
════════════════════════════════════ */
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

/* ════════════════════════════════════
   DRAG & DROP
════════════════════════════════════ */
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

/* ════════════════════════════════════
   LÖSCHEN
════════════════════════════════════ */
async function deleteApp(docId) {
  if (!currentUserId || !docId) return;
  try { await deleteDoc(doc(db, "users", currentUserId, "apps", docId)); window.APPS = APPS.filter(a => a.docId !== docId); buildGrid(); }
  catch (err) { console.error("Löschen fehlgeschlagen:", err); }
}

/* ════════════════════════════════════
   BEARBEITEN
════════════════════════════════════ */
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

/* ════════════════════════════════════
   FIREBASE LADEN
════════════════════════════════════ */
async function loadAppsFromFirebase() {
  if (!currentUserId) return;
  try {
    const snapshot = await getDocs(collection(db, "users", currentUserId, "apps"));
    window.APPS = [];
    snapshot.forEach(d => APPS.push({ ...d.data(), docId: d.id }));
    buildGrid();
  } catch (err) { console.error("Firebase Ladefehler:", err); }
}

/* ════════════════════════════════════
   AUTH
════════════════════════════════════ */
onAuthStateChanged(auth, async user => {
  const loginScreen = document.getElementById('loginScreen');
  const appEl       = document.getElementById('app');
  const userChip    = document.getElementById('userChip');

  if (user) {
    // ── EMAIL WHITELIST ──
  /*  const ALLOWED_EMAILS = [
      'deine@email.com', // ← deine Email hier eintragen
    ];
    if (!ALLOWED_EMAILS.includes(user.email)) {
      await signOut(auth);
      loginScreen.style.display = 'flex';
      appEl.style.display = 'none';
      alert('Kein Zugriff. Diese Seite ist privat.');
      return;
    }

    */
    currentUserId = user.uid;
    loginScreen.style.display = 'none';
    appEl.style.display = 'flex';
    if (user.photoURL) document.getElementById('userAvatar').src = user.photoURL;
    if (user.displayName) document.getElementById('userName').textContent = user.displayName.split(' ')[0];
    userChip.style.display = 'flex';
    setGreeting();
    applySettings(loadSettings());
    initSettingsUI();
    initEmojiPicker();
    initAutoEmoji();
    await loadAppsFromFirebase();
    initQuote();
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

/* ════════════════════════════════════
   SUCHE
════════════════════════════════════ */
document.getElementById('searchInput').addEventListener('keydown', function(e) {
  if (e.key !== 'Enter') return;
  const query = this.value.trim();
  if (!query) return;
  const isURL = query.includes('.') && !query.includes(' ');
  window.open(isURL ? (query.startsWith('http') ? query : `https://${query}`) : `https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  this.value = '';
});

/* ════════════════════════════════════
   TASTENKÜRZEL
════════════════════════════════════ */
document.addEventListener('keydown', e => {
  const tag = document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  const shortcuts = loadSettings().shortcuts || {};
  const appName = shortcuts[e.key.toLowerCase()];
  if (!appName) return;
  const found = APPS.find(a => a.name.toLowerCase().includes(appName.toLowerCase()));
  if (found) window.open(found.url, '_blank');
});

/* ════════════════════════════════════
   MODAL HELFER
════════════════════════════════════ */
const overlay = document.getElementById('modalOverlay');
function openModal(id) { document.getElementById(id).classList.add('open'); overlay.style.display = 'block'; }
function closeModal(id) { document.getElementById(id).classList.remove('open'); if (!document.querySelector('.modal.open')) overlay.style.display = 'none'; }
overlay.addEventListener('click', () => { document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open')); overlay.style.display = 'none'; });

/* ════════════════════════════════════
   ADD MODAL
════════════════════════════════════ */
document.getElementById('addBtn').addEventListener('click', () => openModal('addModal'));
document.getElementById('modalClose').addEventListener('click', () => closeModal('addModal'));

document.getElementById('addForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  if (!currentUserId) return;
  const name     = document.getElementById('inputName').value.trim();
  const url      = document.getElementById('inputUrl').value.trim();
  const sub      = document.getElementById('inputSub').value.trim();
  const category = document.getElementById('inputCategory').value.trim();
  const newApp   = { name, url: url.startsWith('http') ? url : `https://${url}`, iconType: 'emoji', icon: selectedEmoji, sub: sub||'', category: category||'', clicks: 0 };
  try {
    const docRef = await addDoc(collection(db, "users", currentUserId, "apps"), newApp);
    APPS.push({ ...newApp, docId: docRef.id });
    buildGrid(); this.reset(); closeModal('addModal'); launchConfetti();
  } catch (err) { console.error("Speichern fehlgeschlagen:", err); }
});

/* ════════════════════════════════════
   KONFETTI
════════════════════════════════════ */
function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const pieces = Array.from({ length: 120 }, () => ({ x: Math.random()*canvas.width, y: -10, r: Math.random()*6+4, c: `hsl(${Math.random()*360},70%,60%)`, vx: (Math.random()-.5)*4, vy: Math.random()*4+2, life: 1 }));
  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height); let alive = false;
    pieces.forEach(p => { p.x+=p.vx; p.y+=p.vy; p.vy+=0.08; p.life-=0.012; if(p.life<=0)return; alive=true; ctx.globalAlpha=p.life; ctx.fillStyle=p.c; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); });
    ctx.globalAlpha=1;
    if(alive) requestAnimationFrame(draw); else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  draw();
}

/* ════════════════════════════════════
   EINSTELLUNGEN UI
════════════════════════════════════ */
function initSettingsUI() {
  const s = loadSettings();

  const themeDark  = document.getElementById('themeDark');
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