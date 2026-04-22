import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, addDoc, deleteDoc, doc
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

/* ── UHR ── */
function updateClocks() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const t = `${h}:${m}`;
  const c1 = document.getElementById('clock');
  const c2 = document.getElementById('loginClock');
  if (c1) c1.textContent = t;
  if (c2) c2.textContent = t;
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
  return wrap;
}

/* ── APP LÖSCHEN ── */
async function deleteApp(docId, index) {
  if (!currentUserId) return;
  try {
    await deleteDoc(doc(db, "users", currentUserId, "apps", docId));
    APPS.splice(index, 1);
    buildGrid();
  } catch (err) {
    console.error("Löschen fehlgeschlagen:", err);
  }
}

/* ── GRID ── */
function buildGrid() {
  const grid = document.getElementById('appGrid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!window.APPS || APPS.length === 0) {
    grid.innerHTML = '<p style="color:#555;font-size:13px;">Noch keine Apps hinzugefügt.</p>';
    return;
  }
  APPS.forEach((app, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'card-wrapper';

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

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.title = 'App entfernen';
    deleteBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    `;
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      deleteApp(app.docId, index);
    });

    wrapper.appendChild(card);
    wrapper.appendChild(deleteBtn);
    grid.appendChild(wrapper);
  });
}

/* ── FIREBASE LADEN ── */
async function loadAppsFromFirebase() {
  if (!currentUserId) return;
  try {
    const snapshot = await getDocs(collection(db, "users", currentUserId, "apps"));
    window.APPS = [];
    snapshot.forEach(d => APPS.push({ ...d.data(), docId: d.id }));
    buildGrid();
  } catch (err) {
    console.error("Firebase Ladefehler:", err);
  }
}

/* ── AUTH STATE ── */
onAuthStateChanged(auth, async (user) => {
  const loginScreen = document.getElementById('loginScreen');
  const app         = document.getElementById('app');
  const userChip    = document.getElementById('userChip');
  const userAvatar  = document.getElementById('userAvatar');

  if (user) {
    currentUserId = user.uid;
    loginScreen.style.display = 'none';
    app.style.display = 'flex';
    if (user.photoURL) {
      userAvatar.src = user.photoURL;
      userChip.style.display = 'flex';
    }
    setGreeting();
    await loadAppsFromFirebase();
  } else {
    currentUserId = null;
    window.APPS = [];
    loginScreen.style.display = 'flex';
    app.style.display = 'none';
    if (userChip) userChip.style.display = 'none';
  }
});

/* ── LOGIN / LOGOUT ── */
document.getElementById('loginBtn').addEventListener('click', () => {
  signInWithPopup(auth, provider).catch(err => console.error("Login Fehler:", err));
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  signOut(auth).catch(err => console.error("Logout Fehler:", err));
});

/* ── SUCHE ── */
document.getElementById('searchInput').addEventListener('keydown', function (e) {
  if (e.key !== 'Enter') return;
  const query = this.value.trim();
  if (!query) return;
  const isURL = query.includes('.') && !query.includes(' ');
  if (isURL) {
    window.open(query.startsWith('http') ? query : `https://${query}`, '_blank');
  } else {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  }
  this.value = '';
});

/* ── MODAL ── */
const modal   = document.getElementById('addModal');
const overlay = document.getElementById('modalOverlay');

function openModal()  { modal.classList.add('open');    overlay.style.display = 'block'; }
function closeModal() { modal.classList.remove('open'); overlay.style.display = 'none';  }

document.getElementById('addBtn').addEventListener('click', openModal);
document.getElementById('modalClose').addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

/* ── ICON TOGGLE ── */
const toggleEmoji = document.getElementById('toggleEmoji');
const toggleImage = document.getElementById('toggleImage');
const emojiArea   = document.getElementById('emojiArea');
const imageArea   = document.getElementById('imageArea');
let currentIconMode = 'emoji';

toggleEmoji.addEventListener('click', () => {
  currentIconMode = 'emoji';
  toggleEmoji.classList.add('active');
  toggleImage.classList.remove('active');
  emojiArea.style.display = '';
  imageArea.style.display = 'none';
});

toggleImage.addEventListener('click', () => {
  currentIconMode = 'favicon';
  toggleImage.classList.add('active');
  toggleEmoji.classList.remove('active');
  emojiArea.style.display = 'none';
  imageArea.style.display = '';
});

/* ── FORMULAR ── */
document.getElementById('addForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  if (!currentUserId) return;

  const name  = document.getElementById('inputName').value.trim();
  const url   = document.getElementById('inputUrl').value.trim();
  const sub   = document.getElementById('inputSub').value.trim();
  const emoji = document.getElementById('inputEmoji').value.trim();

  const newApp = {
    name,
    url:      url.startsWith('http') ? url : `https://${url}`,
    iconType: currentIconMode,
    icon:     currentIconMode === 'emoji' ? (emoji || '🔗') : '',
    sub:      sub || ''
  };

  try {
    const docRef = await addDoc(collection(db, "users", currentUserId, "apps"), newApp);
    APPS.push({ ...newApp, docId: docRef.id });
    buildGrid();
    this.reset();
    currentIconMode = 'emoji';
    toggleEmoji.classList.add('active');
    toggleImage.classList.remove('active');
    emojiArea.style.display = '';
    imageArea.style.display = 'none';
    closeModal();
  } catch (err) {
    console.error("Speichern fehlgeschlagen:", err);
  }
});