_Zuletzt aktualisiert: 2026-11-01_
# Adventskalender 2026
- Live: https://rokytnice.github.io/adventskalender/ (GitHub Pages, Branch main). Vorschau aller Türchen: `?preview=1`.
- Aufbau: `index.html`, `style.css`, `app.js` (Shell, Gemini-designt) + `games/dayNN.js` (je Spiel, Gemini-generiert; Vertrag: `Games[n]={title,hint,init(root,win),bot(root)}`).
- Neu generieren: `GEM_MODEL=gemini-3.5-flash python3 tools/gen.py N` (429 bei Pro-Modellen/Quota → Flash, Pausen).
- Test: `python3 tools/test.py [tage]` — Headless-Chromium (Playwright), `bot()` muss jedes Spiel gewinnen. Stand: 24/24 PASS.
- Gotcha: Port 8766 oft von anderem Projekt belegt; Testserver nutzt 8791.
