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

window.APPS = [];