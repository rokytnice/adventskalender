#!/usr/bin/env python3
"""Erzeugt /milo/, /jonah/, /lio-levi/ aus index.html (Name steckt im Pfad, nicht im Parameter)."""
import os
src=open("index.html").read()
for who in ["milo","jonah","lio-levi"]:
    os.makedirs(who,exist_ok=True)
    h=src.replace('<html lang="de">',f'<html lang="de" data-who="{who}">',1).replace("<head>",'<head>\n  <base href="../">',1)
    assert f'data-who="{who}"' in h and '<base' in h
    open(f"{who}/index.html","w").write(h)
