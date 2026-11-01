#!/usr/bin/env python3
"""Generate advent games via Gemini. usage: gen.py [day ...]"""
import os, sys, json, re, urllib.request, concurrent.futures as cf
KEY=os.environ["GEMINI_API_KEY"]; MODEL=os.environ.get("GEM_MODEL","gemini-3.1-pro-preview")
IDEAS={1:"Memory: 8 Paare Weihnachtsemojis, Karten umdrehen",2:"Schneeflocken fangen: Korb per Maus/Touch bewegen, 15 Flocken fangen, Bomben-Kohle vermeiden",3:"Plätzchen-Klicker: in 20 s mindestens 40 Plätzchen anklicken die an zufälligen Stellen erscheinen",4:"Kerzen-Simon: 4 Kerzen leuchten in Folge, Reihenfolge nachklicken, 6 Runden",5:"Schneemann bauen: Teile (Kugeln, Hut, Nase, Arme, Schal) per Tippen/Ziehen in richtiger Reihenfolge platzieren",6:"Wörter-Anagramm: 5 Weihnachtswörter aus durcheinandergewürfelten Buchstaben per Tippen zusammensetzen",7:"Rentier-Sprung: Endless-Runner, Tap/Leertaste zum Springen über Hindernisse, Ziel: Strecke 1500 m",8:"Tannenbaum schmücken: Kugeln aus Leiste in markierte Slots am Baum ziehen/tippen, alle Slots füllen",9:"Schiebepuzzle 3x3 mit Weihnachtsbild (Emoji/CSS-Art), lösbar mischen",10:"Lichterkette: Lights-Out 5x5, alle Lichter ausschalten",11:"Weihnachts-Quiz: 8 Fragen zu Weihnachten/Advent, mindestens 6 richtig",12:"Wichtel hauen: Whack-a-Mole mit Wichteln, 12 Treffer in 30 s",13:"Labyrinth: Weihnachtsmann zum Geschenk, Pfeiltasten/Swipe/D-Pad, zufälliges Labyrinth 11x11",14:"Plätzchen-Snake: Snake sammelt Plätzchen, 12 sammeln, Steuerung Pfeile/Swipe/Buttons",15:"Geschenke stapeln: Bewegende Box per Tap fallen lassen, 8 Geschenke hoch stapeln, Überstand wird abgeschnitten",16:"Schlitten-Ausweichen: Schlitten in 3 Spuren, Hindernisse ausweichen, 25 s überleben",17:"Tic-Tac-Toe gegen Computer (Tannenbaum vs Stern), Gewinn oder Unentschieden-Chance; Computer nicht unschlagbar",18:"Zahlenraten: Wichtel denkt Zahl 1-100, 7 Versuche, höher/tiefer Hinweise",19:"Glocken-Reaktionstest: bei Glockensignal schnell tippen, 5 Runden, Durchschnitt unter 700 ms (zu früh = Strafe)",20:"Paare-Dreh: Geschenkpapier-Farbmuster Sequenz-Merken-Spiel mit Lichtmuster 5x5 das nachgebaut werden muss, 4 Muster",21:"Galgenmännchen mit Weihnachtswörtern (Schneemann der schmilzt), 3 Wörter erraten",22:"2048-Variante mit Weihnachtssymbolen, Ziel Kachel 256, Pfeile/Swipe",23:"Lebkuchen-Minensuche: Minesweeper 8x8 mit 8 Zuckerstangen-Minen, Touch: Modus-Umschalter Aufdecken/Flagge",24:"Finale Geschenke-Regen: Weihnachtsmann-Schlitten unten, Geschenke fangen (20), Steine ausweichen, 3 Leben"}
CONTRACT='''Erzeuge EIN eigenständiges JavaScript (kein HTML, kein Markdown-Fence, nur Code), das so registriert wird:
(function(){
 Games[%d] = {
  title: "…kurzer deutscher Titel…",
  hint: "…eine Zeile Anleitung auf Deutsch…",
  init(root, win){ /* baut das komplette Spiel in das DOM-Element root; ruft win() genau einmal bei Gewinn */ },
  bot(root){ /* async: spielt das Spiel automatisch zum Gewinn durch (nutzt echte DOM-Klicks/Events oder interne Zustandsfunktionen), gibt Promise zurück */ }
 };
})();
Regeln: Vanilla JS, keine Libraries, keine externen Ressourcen/Bilder (Emojis, CSS, Canvas, inline SVG ok). Alles Mobile-first und responsiv (Touch + Maus + Tastatur), root hat width 100%% und ca. 320-560px nutzbare Breite; Canvas per Container-Größe skalieren. Alle Klassen/IDs mit Präfix "g%d-" versehen; CSS per injiziertem <style>-Element (Präfix-Selektoren). Dunkles festliches Design: Farbpalette Hintergrund #0b1d33, Rot #d62839, Gold #f4c430, Tannengrün #1f7a4d, Schnee #f5f9ff; große Touch-Ziele (>=44px). Spiel zeigt bei Niederlage/Zeitablauf einen "Nochmal"-Button und startet neu (init-Zustand zurücksetzen); win() erst bei echtem Sieg. Timer/Intervalle/Listener müssen aufgeräumt werden, wenn root aus dem DOM entfernt wird (prüfe root.isConnected im Loop). bot() muss das Spiel zuverlässig in unter 20 Sekunden gewinnen (Spiel darf dafür beschleunigende Hooks wie root.__fast=true auslesen: wenn gesetzt, Timer/Animationen 5x schneller und Zufall nicht verändern). Spiel muss ohne Fehler laufen.
Spiel Nr. %d: %s
'''
def call(day):
    body={"contents":[{"parts":[{"text":CONTRACT%(day,day,day,IDEAS[day])}]}],"generationConfig":{"temperature":0.7}}
    for a in range(3):
        try:
            r=urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={KEY}",json.dumps(body).encode(),{"Content-Type":"application/json"})
            d=json.load(urllib.request.urlopen(r,timeout=300))
            t=d["candidates"][0]["content"]["parts"][0]["text"]
            t=re.sub(r"^```(?:javascript|js)?\s*|```\s*$","",t.strip())
            open(f"games/day{day:02d}.js","w").write(t); return day,len(t)
        except Exception as e: err=e
    return day,f"FAIL {err}"
days=[int(x) for x in sys.argv[1:]] or list(IDEAS)
with cf.ThreadPoolExecutor(1) as ex:
    for r in ex.map(call,days): print(r,flush=True)
