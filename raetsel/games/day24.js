(function(){
 Games[24] = {
  title: "Weihnachtstresor",
  hint: "Entschlüssle den 4-stelligen Tresorcode (Ziffern 0-9) anhand der 5 Hinweise!",
  init(root, win){
    root.innerHTML = "";
    
    // Cleanup any existing listeners
    if (root._cleanup) {
      root._cleanup();
    }

    const style = document.createElement("style");
    style.textContent = `
      .g24-container {
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
        padding: 12px;
        background: #0b1d33;
        color: #f5f9ff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        box-sizing: border-box;
        border-radius: 12px;
        user-select: none;
      }
      .g24-header {
        text-align: center;
        margin-bottom: 10px;
      }
      .g24-header h2 {
        margin: 0 0 4px 0;
        font-size: 1.35rem;
        color: #f4c430;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .g24-sub {
        font-size: 0.8rem;
        color: #cad8e6;
        line-height: 1.25;
      }
      .g24-status {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 8px 0;
        padding: 6px 10px;
        background: rgba(245, 249, 255, 0.06);
        border-radius: 6px;
        font-size: 0.85rem;
      }
      .g24-attempts-dots {
        display: flex;
        gap: 5px;
      }
      .g24-dot {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #f4c430;
        box-shadow: 0 0 6px rgba(244, 196, 48, 0.6);
        transition: all 0.3s ease;
      }
      .g24-dot.used {
        background: #44546a;
        box-shadow: none;
      }
      .g24-clues {
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(244, 196, 48, 0.3);
        border-radius: 8px;
        padding: 6px 8px;
        margin-bottom: 10px;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .g24-clue-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(255, 255, 255, 0.05);
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 0.78rem;
      }
      .g24-clue-code {
        display: flex;
        gap: 3px;
        font-family: monospace;
        font-weight: bold;
      }
      .g24-clue-digit {
        width: 22px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #172a45;
        border: 1px solid #f4c430;
        border-radius: 4px;
        color: #f4c430;
        font-size: 0.95rem;
      }
      .g24-clue-text {
        text-align: right;
        color: #f5f9ff;
        flex: 1;
        margin-left: 8px;
      }
      .g24-clue-text b {
        color: #f4c430;
      }
      .g24-vault-display {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin: 10px 0;
      }
      .g24-slot {
        width: 48px;
        height: 52px;
        background: #10243d;
        border: 2px solid #2b486d;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.6rem;
        font-weight: bold;
        color: #f5f9ff;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
        transition: all 0.2s;
      }
      .g24-slot.active {
        border-color: #f4c430;
        box-shadow: 0 0 10px rgba(244, 196, 48, 0.5);
      }
      .g24-slot.filled {
        color: #f4c430;
        border-color: #f4c430;
      }
      .g24-keypad {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        max-width: 320px;
        margin: 0 auto;
      }
      .g24-btn {
        min-height: 46px;
        border: none;
        border-radius: 8px;
        background: #172a45;
        color: #f5f9ff;
        font-size: 1.25rem;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 0 #081321;
        touch-action: manipulation;
        transition: transform 0.08s, background 0.15s;
      }
      .g24-btn:active {
        transform: translateY(2px);
        box-shadow: 0 1px 0 #081321;
      }
      .g24-btn-action {
        background: #1f7a4d;
        box-shadow: 0 3px 0 #0d4227;
      }
      .g24-btn-del {
        background: #8b2635;
        box-shadow: 0 3px 0 #4f111b;
      }
      .g24-message {
        text-align: center;
        min-height: 22px;
        font-size: 0.85rem;
        margin: 6px 0;
        font-weight: bold;
      }
      .g24-message.error {
        color: #ff5b69;
      }
      .g24-message.success {
        color: #4ade80;
      }
      .g24-modal {
        margin-top: 10px;
        padding: 12px;
        background: rgba(0,0,0,0.6);
        border: 2px solid #d62839;
        border-radius: 8px;
        text-align: center;
      }
      .g24-modal.win {
        border-color: #f4c430;
      }
      .g24-modal-btn {
        margin-top: 8px;
        padding: 10px 20px;
        background: #f4c430;
        color: #0b1d33;
        font-weight: bold;
        font-size: 1rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      }
      .g24-shake {
        animation: g24-shk 0.3s ease;
      }
      @keyframes g24-shk {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-6px); }
        75% { transform: translateX(6px); }
      }
    `;
    root.appendChild(style);

    // Puzzle generation & logic
    const ALL = [];
    for (let a = 0; a <= 9; a++) {
      for (let b = 0; b <= 9; b++) {
        if (b === a) continue;
        for (let c = 0; c <= 9; c++) {
          if (c === a || c === b) continue;
          for (let d = 0; d <= 9; d++) {
            if (d === a || d === b || d === c) continue;
            ALL.push(`${a}${b}${c}${d}`);
          }
        }
      }
    }

    function getScore(code, guess) {
      let well = 0, common = 0;
      for (let i = 0; i < 4; i++) {
        if (code[i] === guess[i]) well++;
        if (code.includes(guess[i])) common++;
      }
      return { well, wrong: common - well };
    }

    function createClueText(well, wrong) {
      if (well === 0 && wrong === 0) return "Keine Ziffer korrekt";
      if (well > 0 && wrong === 0) return `<b>${well}</b> richtig platziert`;
      if (well === 0 && wrong > 0) return `<b>${wrong}</b> richtig, aber falsche Stelle`;
      return `<b>${well}</b> richtig, <b>${wrong}</b> falsche Stelle`;
    }

    function generateUniquePuzzle() {
      const startTime = Date.now();
      while (Date.now() - startTime < 120) {
        const secret = ALL[Math.floor(Math.random() * ALL.length)];
        let pool = ALL.slice();
        const clues = [];

        for (let round = 0; round < 5; round++) {
          let bestGuess = null;
          let bestRem = 999999;
          for (let s = 0; s < 12; s++) {
            const g = ALL[Math.floor(Math.random() * ALL.length)];
            if (clues.some(c => c.guess === g)) continue;
            const sc = getScore(secret, g);
            let count = 0;
            for (let i = 0; i < pool.length; i++) {
              const sc2 = getScore(pool[i], g);
              if (sc2.well === sc.well && sc2.wrong === sc.wrong) count++;
            }
            if (count > 0 && count < bestRem) {
              bestRem = count;
              bestGuess = g;
            }
          }
          if (!bestGuess) break;
          const sc = getScore(secret, bestGuess);
          clues.push({ guess: bestGuess, well: sc.well, wrong: sc.wrong });
          pool = pool.filter(cand => {
            const cSc = getScore(cand, bestGuess);
            return cSc.well === sc.well && cSc.wrong === sc.wrong;
          });
          if (pool.length === 1 && clues.length === 5) {
            return { secret, clues };
          }
        }
        if (pool.length === 1 && clues.length === 5) {
          return { secret, clues };
        }
      }

      // Verified unique deductive fallbacks
      const fallbacks = [
        {
          secret: "0429",
          clues: [
            { guess: "9042", well: 0, wrong: 4 },
            { guess: "0135", well: 1, wrong: 0 },
            { guess: "6478", well: 1, wrong: 0 },
            { guess: "2408", well: 1, wrong: 2 },
            { guess: "5792", well: 0, wrong: 2 }
          ]
        },
        {
          secret: "1853",
          clues: [
            { guess: "1234", well: 1, wrong: 1 },
            { guess: "5678", well: 0, wrong: 2 },
            { guess: "8153", well: 2, wrong: 2 },
            { guess: "9024", well: 0, wrong: 0 },
            { guess: "1846", well: 2, wrong: 0 }
          ]
        }
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    const puzzle = generateUniquePuzzle();
    const secretCode = puzzle.secret;
    root.__secret = secretCode;

    let currentInput = "";
    let attemptsLeft = 5;
    let isFinished = false;

    // DOM Setup
    const container = document.createElement("div");
    container.className = "g24-container";

    container.innerHTML = `
      <div class="g24-header">
        <h2>🔒 Festlicher Tresor 🎁</h2>
        <div class="g24-sub">Ermittle den 4-stelligen Code aus den Hinweisen. Alle Ziffern sind verschieden!</div>
      </div>
      <div class="g24-status">
        <span>Versuche übrig:</span>
        <div class="g24-attempts-dots" id="g24-dots">
          <div class="g24-dot"></div>
          <div class="g24-dot"></div>
          <div class="g24-dot"></div>
          <div class="g24-dot"></div>
          <div class="g24-dot"></div>
        </div>
      </div>
      <div class="g24-clues">
        ${puzzle.clues.map(c => `
          <div class="g24-clue-row">
            <div class="g24-clue-code">
              ${c.guess.split("").map(d => `<span class="g24-clue-digit">${d}</span>`).join("")}
            </div>
            <div class="g24-clue-text">${createClueText(c.well, c.wrong)}</div>
          </div>
        `).join("")}
      </div>
      <div class="g24-vault-display" id="g24-display">
        <div class="g24-slot active" id="g24-s0"></div>
        <div class="g24-slot" id="g24-s1"></div>
        <div class="g24-slot" id="g24-s2"></div>
        <div class="g24-slot" id="g24-s3"></div>
      </div>
      <div class="g24-message" id="g24-msg">Code eingeben und mit ✓ bestätigen</div>
      <div class="g24-keypad">
        ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="g24-btn" data-key="${n}">${n}</button>`).join("")}
        <button class="g24-btn g24-btn-del" data-key="del">⌫</button>
        <button class="g24-btn" data-key="0">0</button>
        <button class="g24-btn g24-btn-action" data-key="enter">✓</button>
      </div>
      <div id="g24-modal-wrap"></div>
    `;

    root.appendChild(container);

    const msgEl = container.querySelector("#g24-msg");
    const dots = container.querySelectorAll(".g24-dot");
    const slots = [0,1,2,3].map(i => container.querySelector(`#g24-s${i}`));
    const displayEl = container.querySelector("#g24-display");
    const modalWrap = container.querySelector("#g24-modal-wrap");

    function updateSlots() {
      for (let i = 0; i < 4; i++) {
        const val = currentInput[i] || "";
        slots[i].textContent = val;
        slots[i].className = "g24-slot" + (val ? " filled" : "") + (i === currentInput.length ? " active" : "");
      }
    }

    function setMessage(text, type = "") {
      msgEl.textContent = text;
      msgEl.className = "g24-message " + type;
    }

    function onDigit(d) {
      if (isFinished || currentInput.length >= 4) return;
      currentInput += d;
      updateSlots();
      setMessage("...");
    }

    function onDelete() {
      if (isFinished || currentInput.length === 0) return;
      currentInput = currentInput.slice(0, -1);
      updateSlots();
    }

    function onSubmit() {
      if (isFinished) return;
      if (currentInput.length !== 4) {
        displayEl.classList.add("g24-shake");
        setTimeout(() => displayEl.classList.remove("g24-shake"), 300);
        setMessage("Bitte 4 Ziffern eingeben!", "error");
        return;
      }

      if (currentInput === secretCode) {
        isFinished = true;
        setMessage("Code korrekt! Tresor öffnet sich...", "success");
        slots.forEach(s => {
          s.style.borderColor = "#4ade80";
          s.style.color = "#4ade80";
        });
        modalWrap.innerHTML = `
          <div class="g24-modal win">
            <h3 style="color:#f4c430; margin:0 0 6px 0;">✨ Tresor geöffnet! ✨</h3>
            <p style="margin:0; font-size:0.9rem;">Du hast das Weihnachtsgeheimnis gelüftet!</p>
          </div>
        `;
        win();
      } else {
        attemptsLeft--;
        const usedIdx = 5 - attemptsLeft - 1;
        if (dots[usedIdx]) dots[usedIdx].classList.add("used");

        displayEl.classList.add("g24-shake");
        setTimeout(() => displayEl.classList.remove("g24-shake"), 300);

        if (attemptsLeft <= 0) {
          isFinished = true;
          setMessage(`Tresor gesperrt! Richtiger Code war: ${secretCode}`, "error");
          modalWrap.innerHTML = `
            <div class="g24-modal">
              <h3 style="color:#ff5b69; margin:0 0 6px 0;">🚨 Alarm ausgelöst! 🚨</h3>
              <p style="margin:0; font-size:0.85rem;">Keine Versuche mehr übrig.</p>
              <button class="g24-modal-btn" id="g24-retry-btn">Nochmal versuchen</button>
            </div>
          `;
          const rBtn = modalWrap.querySelector("#g24-retry-btn");
          rBtn.onclick = () => Games[24].init(root, win);
        } else {
          setMessage(`Falscher Code! Noch ${attemptsLeft} Versuch${attemptsLeft > 1 ? "e" : ""}.`, "error");
          currentInput = "";
          updateSlots();
        }
      }
    }

    // Direct exposed helper for Bot & interactions
    root.__pressKey = function(key) {
      if (key >= "0" && key <= "9") onDigit(key);
      else if (key === "del" || key === "Backspace") onDelete();
      else if (key === "enter" || key === "Enter") onSubmit();
    };

    container.querySelector(".g24-keypad").addEventListener("click", e => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const key = btn.dataset.key;
      root.__pressKey(key);
    });

    function keyHandler(e) {
      if (!root.isConnected) {
        window.removeEventListener("keydown", keyHandler);
        return;
      }
      if (e.key >= "0" && e.key <= "9") {
        root.__pressKey(e.key);
      } else if (e.key === "Backspace") {
        root.__pressKey("del");
      } else if (e.key === "Enter") {
        root.__pressKey("enter");
      }
    }
    window.addEventListener("keydown", keyHandler);

    root._cleanup = function() {
      window.removeEventListener("keydown", keyHandler);
    };
  },

  async bot(root) {
    const isFast = !!root.__fast;
    const delay = ms => new Promise(res => setTimeout(res, isFast ? ms / 5 : ms));

    while (!root.__secret) {
      await delay(20);
    }

    const code = root.__secret;
    for (let i = 0; i < code.length; i++) {
      await delay(80);
      root.__pressKey(code[i]);
    }
    await delay(120);
    root.__pressKey("enter");
  }
 };
})();