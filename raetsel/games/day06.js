(function(){
 Games[6] = {
  title: "Fluss-Überquerung",
  hint: "Bringe alle ans andere Ufer! Rentier frisst Plätzchen, Plätzchen frisst Möhre.",
  init(root, win){
   root.innerHTML = "";

   if(!document.getElementById("g6-styles")){
    const st = document.createElement("style");
    st.id = "g6-styles";
    st.textContent = `
     .g6-wrap {
      box-sizing: border-box;
      width: 100%;
      max-width: 540px;
      margin: 0 auto;
      padding: 12px;
      font-family: system-ui, -apple-system, sans-serif;
      color: #f5f9ff;
      background: #0b1d33;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
     }
     .g6-header {
      text-align: center;
      margin-bottom: 8px;
     }
     .g6-title {
      font-size: 1.25rem;
      font-weight: bold;
      color: #f4c430;
      margin: 0 0 4px 0;
     }
     .g6-rules {
      font-size: 0.82rem;
      color: #cbd5e1;
      margin: 0;
      line-height: 1.3;
     }
     .g6-scene {
      position: relative;
      width: 100%;
      height: 250px;
      background: linear-gradient(180deg, #16365c 0%, #0d223a 100%);
      border: 2px solid #1f7a4d;
      border-radius: 12px;
      overflow: hidden;
      margin: 10px 0;
      display: flex;
      justify-content: space-between;
     }
     .g6-bank {
      width: 32%;
      height: 100%;
      background: #f5f9ff;
      border-bottom: 8px solid #cbd5e1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 6px 4px;
      box-sizing: border-box;
      position: relative;
      z-index: 2;
     }
     .g6-bank-title {
      font-size: 0.75rem;
      font-weight: bold;
      color: #0b1d33;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
     }
     .g6-river {
      position: absolute;
      left: 32%;
      width: 36%;
      height: 100%;
      background: linear-gradient(180deg, #1b4d7e 0%, #103357 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
     }
     .g6-ice-wave {
      position: absolute;
      width: 100%;
      height: 2px;
      background: rgba(245, 249, 255, 0.2);
     }
     .g6-boat {
      position: absolute;
      width: 110px;
      height: 72px;
      top: 90px;
      transition: left 0.45s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 5;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      pointer-events: none;
     }
     .g6-boat-hull {
      width: 90px;
      height: 26px;
      background: #8b3a12;
      border: 2px solid #f4c430;
      border-radius: 0 0 16px 16px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.5);
      position: relative;
     }
     .g6-boat-seats {
      display: flex;
      gap: 6px;
      margin-bottom: 2px;
      align-items: flex-end;
     }
     .g6-item-slot {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
      align-items: center;
      flex: 1;
     }
     .g6-item-btn {
      width: 90%;
      max-width: 90px;
      min-height: 46px;
      background: #1e3a5f;
      border: 2px solid #f4c430;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      cursor: pointer;
      box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      padding: 0;
      outline: none;
      transition: transform 0.1s, background-color 0.15s;
     }
     .g6-item-btn:hover:not(:disabled) {
      background: #2a5286;
      transform: scale(1.05);
     }
     .g6-item-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      border-color: #64748b;
     }
     .g6-item-label {
      font-size: 0.65rem;
      color: #0b1d33;
      font-weight: bold;
      text-align: center;
      line-height: 1;
      margin-top: 2px;
     }
     .g6-santa-seat {
      font-size: 1.8rem;
     }
     .g6-controls {
      display: flex;
      gap: 12px;
      width: 100%;
      margin-top: 4px;
     }
     .g6-action-btn {
      flex: 1;
      min-height: 48px;
      background: #d62839;
      color: #ffffff;
      font-weight: bold;
      font-size: 1rem;
      border: 2px solid #f4c430;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.4);
      transition: transform 0.1s, background-color 0.15s;
     }
     .g6-action-btn:hover:not(:disabled) {
      background: #e63946;
      transform: translateY(-2px);
     }
     .g6-action-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      transform: none;
     }
     .g6-status-banner {
      min-height: 24px;
      font-size: 0.88rem;
      font-weight: 600;
      text-align: center;
      color: #f4c430;
      margin-top: 8px;
     }
     .g6-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(11, 29, 51, 0.92);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10;
      padding: 16px;
      text-align: center;
     }
     .g6-overlay-title {
      font-size: 1.4rem;
      font-weight: bold;
      margin-bottom: 8px;
     }
     .g6-overlay-text {
      font-size: 0.95rem;
      margin-bottom: 16px;
      color: #e2e8f0;
     }
     .g6-restart-btn {
      padding: 12px 24px;
      background: #1f7a4d;
      color: #fff;
      font-size: 1rem;
      font-weight: bold;
      border: 2px solid #f4c430;
      border-radius: 8px;
      cursor: pointer;
      min-height: 46px;
     }
    `;
    document.head.appendChild(st);
   }

   const wrap = document.createElement("div");
   wrap.className = "g6-wrap";
   wrap.innerHTML = `
    <div class="g6-header">
     <div class="g6-title">❄️ Fluss-Überquerung ❄️</div>
     <p class="g6-rules">🎅 Santa rudert. Boot fasst 1 Passagier.<br>Alleine frisst: 🦌 Rentier → 🍪 Plätzchen, 🍪 Plätzchen → 🥕 Möhre!</p>
    </div>
    <div class="g6-scene">
     <div class="g6-bank" id="g6-left-bank">
      <div class="g6-bank-title">Start-Ufer</div>
      <div class="g6-item-slot" id="g6-left-slot"></div>
     </div>
     <div class="g6-river">
      <div class="g6-ice-wave" style="top:25%"></div>
      <div class="g6-ice-wave" style="top:55%"></div>
      <div class="g6-ice-wave" style="top:80%"></div>
     </div>
     <div class="g6-boat" id="g6-boat">
      <div class="g6-boat-seats">
       <span class="g6-santa-seat" title="Weihnachtsmann">🎅</span>
       <div id="g6-boat-passenger" style="width:42px;height:42px;display:flex;align-items:center;justify-content:center;"></div>
      </div>
      <div class="g6-boat-hull"></div>
     </div>
     <div class="g6-bank" id="g6-right-bank">
      <div class="g6-bank-title">Ziel-Ufer</div>
      <div class="g6-item-slot" id="g6-right-slot"></div>
     </div>
     <div class="g6-overlay" id="g6-overlay" style="display:none;">
      <div class="g6-overlay-title" id="g6-overlay-title"></div>
      <div class="g6-overlay-text" id="g6-overlay-msg"></div>
      <button class="g6-restart-btn" id="g6-overlay-btn">Nochmal spielen</button>
     </div>
    </div>
    <div class="g6-status-banner" id="g6-status">Wähle eine Fracht für das Boot!</div>
    <div class="g6-controls">
     <button class="g6-action-btn" id="g6-row-btn">Rudern ➔</button>
    </div>
   `;
   root.appendChild(wrap);

   const ITEMS = {
    reindeer: { id: "reindeer", name: "Rentier", icon: "🦌" },
    cookie:   { id: "cookie",   name: "Plätzchen", icon: "🍪" },
    carrot:   { id: "carrot",   name: "Möhre",     icon: "🥕" }
   };

   let state = {
    boatSide: 0, // 0: left, 1: right
    boatCargo: null, // item id or null
    left: ["reindeer", "cookie", "carrot"],
    right: [],
    moving: false,
    gameOver: false,
    won: false
   };

   const boatEl = wrap.querySelector("#g6-boat");
   const boatPassenger = wrap.querySelector("#g6-boat-passenger");
   const leftSlot = wrap.querySelector("#g6-left-slot");
   const rightSlot = wrap.querySelector("#g6-right-slot");
   const rowBtn = wrap.querySelector("#g6-row-btn");
   const statusEl = wrap.querySelector("#g6-status");
   const overlay = wrap.querySelector("#g6-overlay");
   const overlayTitle = wrap.querySelector("#g6-overlay-title");
   const overlayMsg = wrap.querySelector("#g6-overlay-msg");
   const overlayBtn = wrap.querySelector("#g6-overlay-btn");

   function updateUI(){
    // Positions
    if(state.boatSide === 0){
     boatEl.style.left = "calc(32% - 24px)";
     rowBtn.textContent = "Rudern ➔";
    } else {
     boatEl.style.left = "calc(68% - 86px)";
     rowBtn.textContent = "⬅ Rudern";
    }

    // Cargo
    boatPassenger.innerHTML = "";
    if(state.boatCargo){
     const item = ITEMS[state.boatCargo];
     const btn = document.createElement("button");
     btn.className = "g6-item-btn";
     btn.style.width = "40px";
     btn.style.minHeight = "40px";
     btn.style.fontSize = "1.3rem";
     btn.textContent = item.icon;
     btn.title = item.name + " ausladen";
     btn.disabled = state.moving || state.gameOver;
     btn.onclick = () => unloadCargo();
     boatPassenger.appendChild(btn);
    }

    renderSlot(leftSlot, state.left, 0);
    renderSlot(rightSlot, state.right, 1);

    rowBtn.disabled = state.moving || state.gameOver;
   }

   function renderSlot(container, itemList, side){
    container.innerHTML = "";
    itemList.forEach(id => {
     const item = ITEMS[id];
     const card = document.createElement("div");
     card.style.display = "flex";
     card.style.flexDirection = "column";
     card.style.alignItems = "center";
     card.style.width = "100%";

     const btn = document.createElement("button");
     btn.className = "g6-item-btn";
     btn.textContent = item.icon;
     btn.disabled = state.moving || state.gameOver || state.boatSide !== side || state.boatCargo !== null;
     btn.onclick = () => loadCargo(id, side);

     const lbl = document.createElement("span");
     lbl.className = "g6-item-label";
     lbl.textContent = item.name;

     card.appendChild(btn);
     card.appendChild(lbl);
     container.appendChild(card);
    });
   }

   function loadCargo(id, side){
    if(state.moving || state.gameOver || state.boatCargo !== null || state.boatSide !== side) return;
    const arr = side === 0 ? state.left : state.right;
    const idx = arr.indexOf(id);
    if(idx !== -1){
     arr.splice(idx, 1);
     state.boatCargo = id;
     statusEl.textContent = `${ITEMS[id].name} eingestiegen.`;
     updateUI();
    }
   }

   function unloadCargo(){
    if(state.moving || state.gameOver || !state.boatCargo) return;
    const sideArr = state.boatSide === 0 ? state.left : state.right;
    const id = state.boatCargo;
    state.boatCargo = null;
    sideArr.push(id);
    statusEl.textContent = `${ITEMS[id].name} ausgeladen.`;
    updateUI();
   }

   function checkDanger(sideItems){
    const hasReindeer = sideItems.includes("reindeer");
    const hasCookie = sideItems.includes("cookie");
    const hasCarrot = sideItems.includes("carrot");

    if(hasReindeer && hasCookie){
     return { danger: true, reason: "Oh nein! Das Rentier hat unbeaufsichtigt das Plätzchen gefressen! 🦌💥🍪" };
    }
    if(hasCookie && hasCarrot){
     return { danger: true, reason: "Oh weh! Das Plätzchenmännchen hat die Möhre aufgeknabbert! 🍪💥🥕" };
    }
    return { danger: false };
   }

   function row(){
    if(state.moving || state.gameOver) return;
    state.moving = true;
    updateUI();

    const animDuration = root.__fast ? 100 : 450;
    boatEl.style.transition = `left ${animDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    state.boatSide = state.boatSide === 0 ? 1 : 0;
    statusEl.textContent = "Santa rudert über das Eis...";
    updateUI();

    setTimeout(() => {
     if(!root.isConnected) return;
     state.moving = false;

     // Check bank left behind (the one without Santa)
     const leftBehindBank = state.boatSide === 1 ? state.left : state.right;
     const res = checkDanger(leftBehindBank);

     if(res.danger){
      state.gameOver = true;
      updateUI();
      overlayTitle.textContent = "Verloren!";
      overlayTitle.style.color = "#d62839";
      overlayMsg.textContent = res.reason;
      overlay.style.display = "flex";
      return;
     }

     // Check victory condition
     if(state.boatSide === 1 && state.boatCargo === null && state.right.length === 3){
      triggerWin();
      return;
     }
     if(state.boatSide === 1 && state.boatCargo !== null && state.right.length === 2){
      // Can auto-unload or allow user to unload
      statusEl.textContent = "Fast geschafft! Lade die letzte Fracht aus.";
     } else {
      statusEl.textContent = "Sicher angekommen! Du kannst Fracht tauschen oder weiterfahren.";
     }
     updateUI();
    }, animDuration);
   }

   function triggerWin(){
    if(state.won) return;
    state.won = true;
    state.gameOver = true;
    updateUI();
    overlayTitle.textContent = "🎄 Gewonnen! 🎄";
    overlayTitle.style.color = "#f4c430";
    overlayMsg.textContent = "Alle Passagiere sind wohlbehalten am Ziel angekommen!";
    overlayBtn.style.display = "none";
    overlay.style.display = "flex";
    win();
   }

   rowBtn.onclick = () => row();

   function resetGame(){
    state = {
     boatSide: 0,
     boatCargo: null,
     left: ["reindeer", "cookie", "carrot"],
     right: [],
     moving: false,
     gameOver: false,
     won: false
    };
    overlay.style.display = "none";
    overlayBtn.style.display = "inline-block";
    statusEl.textContent = "Wähle eine Fracht für das Boot!";
    updateUI();
   }

   overlayBtn.onclick = resetGame;

   // Expose internals for fast bot
   root.__game6 = {
    loadCargo,
    unloadCargo,
    row,
    getState: () => state,
    reset: resetGame
   };

   updateUI();
  },

  async bot(root){
   // The classic solution:
   // 1. Take Cookie across (left: reindeer, carrot; boat: cookie -> right)
   // 2. Unload Cookie at right
   // 3. Row back empty (left: reindeer, carrot)
   // 4. Take Reindeer across (or Carrot)
   // 5. Unload Reindeer, load Cookie
   // 6. Row Cookie back to left
   // 7. Unload Cookie, load Carrot
   // 8. Row Carrot across to right
   // 9. Unload Carrot (right now has Reindeer and Carrot)
   // 10. Row back empty to left
   // 11. Load Cookie
   // 12. Row Cookie across to right
   // 13. Unload Cookie -> WIN!

   const g = root.__game6;
   if(!g) return;
   root.__fast = true;

   const delay = (ms) => new Promise(res => setTimeout(res, ms));

   async function waitMove(){
    await delay(root.__fast ? 120 : 500);
   }

   // Reset to ensure clean start
   g.reset();
   await delay(30);

   // Step 1: Load Cookie on Left
   g.loadCargo("cookie", 0);
   await delay(30);

   // Step 2: Row to Right
   g.row();
   await waitMove();

   // Step 3: Unload Cookie on Right
   g.unloadCargo();
   await delay(30);

   // Step 4: Row back to Left empty
   g.row();
   await waitMove();

   // Step 5: Load Reindeer on Left
   g.loadCargo("reindeer", 0);
   await delay(30);

   // Step 6: Row to Right
   g.row();
   await waitMove();

   // Step 7: Unload Reindeer on Right
   g.unloadCargo();
   await delay(30);

   // Step 8: Load Cookie on Right
   g.loadCargo("cookie", 1);
   await delay(30);

   // Step 9: Row Cookie back to Left
   g.row();
   await waitMove();

   // Step 10: Unload Cookie on Left
   g.unloadCargo();
   await delay(30);

   // Step 11: Load Carrot on Left
   g.loadCargo("carrot", 0);
   await delay(30);

   // Step 12: Row Carrot to Right
   g.row();
   await waitMove();

   // Step 13: Unload Carrot on Right
   g.unloadCargo();
   await delay(30);

   // Step 14: Row back empty to Left
   g.row();
   await waitMove();

   // Step 15: Load Cookie on Left
   g.loadCargo("cookie", 0);
   await delay(30);

   // Step 16: Row Cookie to Right
   g.row();
   await waitMove();

   // Step 17: Unload Cookie on Right -> WIN!
   g.unloadCargo();
   await delay(50);
  }
 };
})();