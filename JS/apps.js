/* ================================================
   apps.js – Deine App-Liste
   ================================================
   Jede App hat folgende Felder:
   ┌──────────────────────────────────────────────────────┐
   │ name      → Anzeigename der App                      │
   │ url       → Webadresse, wohin die Kachel führt       │
   │ iconType  → "favicon" | "emoji" | "image"            │
   │ icon      → Emoji-Zeichen ODER Pfad zu einem Bild    │
   │             Bei "favicon" wird das automatisch geladen│
   │ sub       → Kurze Beschreibung (optional)            │
   └──────────────────────────────────────────────────────┘

   iconType "favicon" → lädt das offizielle Website-Icon automatisch
   iconType "emoji"   → zeigt ein Emoji-Zeichen
   iconType "image"   → zeigt ein lokales Bild aus dem icons/-Ordner
   ================================================ */

window.APPS = [

  /* ---- Kommunikation ---- */
  {
    name:     "Gmail",
    url:      "https://mail.google.com",
    iconType: "favicon",
    sub:      "Mail"
  },
  {
    name:     "WhatsApp",
    url:      "https://web.whatsapp.com",
    iconType: "favicon",
    sub:      "Chat"
  },

  /* ---- Arbeit & Produktivität ---- */
  {
    name:     "Notion",
    url:      "https://notion.so",
    iconType: "favicon",
    sub:      "Notizen"
  },
  {
    name:     "Google Drive",
    url:      "https://drive.google.com",
    iconType: "favicon",
    sub:      "Cloud"
  },
  {
    name:     "Calendar",
    url:      "https://calendar.google.com",
    iconType: "favicon",
    sub:      "Kalender"
  },

  /* ---- Entwicklung ---- */
  {
    name:     "GitHub",
    url:      "https://github.com",
    iconType: "favicon",
    sub:      "Code"
  },
  {
    name:     "ChatGPT",
    url:      "https://chat.openai.com",
    iconType: "favicon",
    sub:      "KI"
  },
  {
    name:     "Claude",
    url:      "https://claude.ai",
    iconType: "favicon",
    sub:      "KI"
  },

  /* ---- Medien & News ---- */
  {
    name:     "YouTube",
    url:      "https://youtube.com",
    iconType: "favicon",
    sub:      "Video"
  },
  {
    name:     "Spotify",
    url:      "https://open.spotify.com",
    iconType: "favicon",
    sub:      "Musik"
  },
  {
    name:     "Reddit",
    url:      "https://reddit.com",
    iconType: "favicon",
    sub:      "News"
  },
  {
    name:     "Twitter / X",
    url:      "https://x.com",
    iconType: "favicon",
    sub:      "Social"
  },

];