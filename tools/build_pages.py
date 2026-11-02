#!/usr/bin/env python3
"""Erzeugt /milo/, /jonah/, /lio-levi/ aus index.html (Name steckt im Pfad, nicht im Parameter)."""
import os
src=open("index.html").read()
for who in ["milo","jonah","lio-levi","lizzy"]:
    os.makedirs(who,exist_ok=True)
    h=src.replace('<html lang="de">',f'<html lang="de" data-who="{who}">',1).replace("<head>",'<head>\n  <base href="../">',1)
    assert f'data-who="{who}"' in h and '<base' in h
    open(f"{who}/index.html","w").write(h)

# Rätsel-Variante: /raetsel/, /raetsel/<who>/ (eigene Spiele in raetsel/games/)
def variant(h, depth_base):
    h=h.replace('<html lang="de"','<html lang="de" data-variant="raetsel"',1)
    h=h.replace('href="style.css"','href="../style.css"').replace('src="app.js"','src="../app.js"').replace('assets/','../assets/')
    h=h.replace('<div class="progress-bar"','<p class="edition">🧩 Rätsel &amp; Knobel-Edition</p>\n    <div class="progress-bar"',1)
    return h
os.makedirs("raetsel",exist_ok=True)
open("raetsel/index.html","w").write(variant(src,""))
for who in ["milo","jonah","lio-levi","lizzy"]:
    os.makedirs(f"raetsel/{who}",exist_ok=True)
    h=variant(src.replace('<html lang="de">',f'<html lang="de" data-who="{who}">',1).replace("<head>",'<head>\n  <base href="../">',1),"")
    open(f"raetsel/{who}/index.html","w").write(h)
