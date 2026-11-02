#!/usr/bin/env python3
"""Headless test: each game's bot must win. usage: test.py [day ...]"""
import sys, subprocess, time, os
from playwright.sync_api import sync_playwright
BASE=os.environ.get("BASE","index.html"); KEY=os.environ.get("KEY","adv2026-won")
days=[int(x) for x in sys.argv[1:]] or range(1,25)
srv=subprocess.Popen(["python3","-m","http.server","8791"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1)
os.makedirs("_tmp/shots",exist_ok=True); res={}
try:
  with sync_playwright() as p:
    b=p.chromium.launch()
    for d in days:
        ctx=b.new_context(viewport={"width":390,"height":780},has_touch=True); pg=ctx.new_page(); errs=[]
        pg.on("pageerror",lambda e:errs.append(str(e)+" @"+str(getattr(e,"stack",""))[:300])); pg.on("console",lambda m:errs.append(m.text) if m.type=="error" and "Failed to load resource" not in m.text else None)
        pg.goto("http://127.0.0.1:8791/"+BASE+"?preview=1"); pg.wait_for_timeout(400)
        try:
            pg.click(f'.door[data-day="{d}"]'); pg.wait_for_timeout(500)
            pg.screenshot(path=f"_tmp/shots/day{d:02d}.png")
            r=pg.evaluate("""async d=>{const root=document.querySelector('#game-root'); if(!window.Games[d]) return 'nogame'; root.__fast=true;
              let t=setTimeout(()=>{},0);
              try{await Promise.race([window.Games[d].bot(root),new Promise((_,j)=>setTimeout(()=>j('bot timeout 40s'),40000))]);}catch(e){return 'boterr '+e}
              return 'ok'}""",d)
            pg.wait_for_timeout(600)
            won=pg.evaluate("JSON.parse(localStorage.getItem('"+KEY+"')||'[]')")
            ok = r=='ok' and (d in won or str(d) in [str(x) for x in won])
            res[d]="PASS" if ok and not errs else f"FAIL r={r} won={ok} errs={errs[:2]}"
        except Exception as e: res[d]=f"FAIL exc {str(e)[:150]}"
        ctx.close(); print(d,res[d],flush=True)
    b.close()
finally: srv.terminate()
sys.exit(0 if all(v=="PASS" for v in res.values()) else 1)
