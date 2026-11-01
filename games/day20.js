(function(){
  Games[20] = {
    title: "Geschenkpapier-Lichtmuster",
    hint: "Präge dir das 5x5-Lichtmuster ein und baue alle 4 Geschenk-Designs fehlerfrei nach!",
    init(root, win){
      root.innerHTML = "";

      const style = document.createElement("style");
      style.textContent = `
        .g20-container {
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
          box-sizing: border-box;
          padding: 12px;
          background: #0b1d33;
          color: #f5f9ff;
          font-family: system-ui, -apple-system, sans-serif;
          border-radius: 14px;
          border: 2px solid #f4c430;
          box-shadow: 0 8px 24px rgba(0,0,0,0.45);
          display: flex;
          flex-direction: column;
          align-items: center;
          user-select: none;
          touch-action: manipulation;
        }
        .g20-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-bottom: 8px;
        }
        .g20-badge {
          background: #1f7a4d;
          color: #f4c430;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 14px;
          border: 1px solid #f4c430;
        }
        .g20-status {
          font-size: 15px;
          color: #f5f9ff;
          font-weight: 600;
          min-height: 22px;
          text-align: center;
          margin: 4px 0 8px 0;
        }
        .g20-bar-wrap {
          width: 100%;
          height: 8px;
          background: rgba(255,255,255,0.15);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .g20-bar {
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, #f4c430, #d62839);
          transition: width 0.1s linear;
        }
        .g20-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 7px;
          width: 100%;
          max-width: 320px;
          aspect-ratio: 1;
          margin: 0 auto 14px auto;
        }
        .g20-cell {
          background: rgba(245, 249, 255, 0.08);
          border: 2px solid rgba(244, 196, 48, 0.3);
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transition: transform 0.1s, background-color 0.2s, box-shadow 0.2s;
          min-width: 44px;
          min-height: 44px;
          outline: none;
          padding: 0;
        }
        .g20-cell:active {
          transform: scale(0.93);
        }
        .g20-cell.g20-lit {
          background: #f4c430;
          color: #0b1d33;
          border-color: #fff;
          box-shadow: 0 0 12px #f4c430, inset 0 0 4px #fff;
        }
        .g20-cell.g20-user-active {
          background: #d62839;
          color: #fff;
          border-color: #f4c430;
          box-shadow: 0 0 10px #d62839;
        }
        .g20-cell.g20-correct {
          background: #1f7a4d !important;
          color: #f4c430 !important;
          border-color: #f4c430 !important;
          box-shadow: 0 0 10px #1f7a4d !important;
        }
        .g20-cell.g20-wrong {
          background: #77141f !important;
          border-color: #ff4d5a !important;
        }
        .g20-actions {
          display: flex;
          gap: 10px;
          width: 100%;
          justify-content: center;
        }
        .g20-btn {
          min-height: 46px;
          min-width: 130px;
          padding: 0 18px;
          font-size: 15px;
          font-weight: 700;
          color: #0b1d33;
          background: #f4c430;
          border: 2px solid #fff;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .g20-btn:active {
          transform: scale(0.96);
        }
        .g20-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .g20-btn-secondary {
          background: transparent;
          color: #f5f9ff;
          border-color: rgba(245, 249, 255, 0.4);
        }
        .g20-overlay {
          position: absolute;
          inset: 0;
          background: rgba(11, 29, 51, 0.92);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          text-align: center;
        }
        .g20-wrap-rel {
          position: relative;
          width: 100%;
        }
      `;
      root.appendChild(style);

      const wrap = document.createElement("div");
      wrap.className = "g20-container";

      const header = document.createElement("div");
      header.className = "g20-header";
      header.innerHTML = `
        <span class="g20-badge" id="g20-round-info">Muster 1 / 4</span>
        <span style="font-size:18px;">🎁 ✨ 🎄</span>
      `;
      wrap.appendChild(header);

      const statusBar = document.createElement("div");
      statusBar.className = "g20-status";
      statusBar.id = "g20-status-text";
      statusBar.textContent = "Präge dir das Geschenkpapier-Muster ein!";
      wrap.appendChild(statusBar);

      const barWrap = document.createElement("div");
      barWrap.className = "g20-bar-wrap";
      const bar = document.createElement("div");
      bar.className = "g20-bar";
      bar.id = "g20-progress-bar";
      barWrap.appendChild(bar);
      wrap.appendChild(barWrap);

      const relWrap = document.createElement("div");
      relWrap.className = "g20-wrap-rel";

      const gridEl = document.createElement("div");
      gridEl.className = "g20-grid";
      relWrap.appendChild(gridEl);

      const overlay = document.createElement("div");
      overlay.className = "g20-overlay";
      overlay.style.display = "none";
      relWrap.appendChild(overlay);

      wrap.appendChild(relWrap);

      const actions = document.createElement("div");
      actions.className = "g20-actions";
      const checkBtn = document.createElement("button");
      checkBtn.className = "g20-btn";
      checkBtn.id = "g20-btn-check";
      checkBtn.textContent = "Fertig geprüft ✓";
      checkBtn.disabled = true;

      const clearBtn = document.createElement("button");
      clearBtn.className = "g20-btn g20-btn-secondary";
      clearBtn.id = "g20-btn-clear";
      clearBtn.textContent = "Löschen";
      clearBtn.disabled = true;

      actions.appendChild(clearBtn);
      actions.appendChild(checkBtn);
      wrap.appendChild(actions);
      root.appendChild(wrap);

      // Game State
      const TOTAL_ROUNDS = 4;
      const PATTERN_SIZES = [5, 6, 7, 8];
      let currentRound = 0;
      let targetPattern = new Set();
      let userPattern = new Set();
      let phase = "INIT"; // PREVIEW, INPUT, RESULT, GAME_OVER, WON
      let timerId = null;
      let animFrame = null;
      let hasWon = false;

      // Internal State reference for Bot
      root._g20_state = {
        getTarget: () => Array.from(targetPattern),
        getPhase: () => phase,
        isFast: () => !!root.__fast,
        clickCell: (idx) => {
          const cells = gridEl.querySelectorAll(".g20-cell");
          if (cells[idx]) cells[idx].click();
        },
        clickCheck: () => {
          checkBtn.click();
        }
      };

      // Build 5x5 cells
      const cells = [];
      for (let i = 0; i < 25; i++) {
        const c = document.createElement("button");
        c.className = "g20-cell";
        c.setAttribute("data-index", i);
        c.setAttribute("aria-label", "Feld " + (i + 1));
        c.addEventListener("click", () => handleCellClick(i));
        gridEl.appendChild(c);
        cells.push(c);
      }

      function cleanupTimers() {
        if (timerId) clearTimeout(timerId);
        if (animFrame) cancelAnimationFrame(animFrame);
        timerId = null;
        animFrame = null;
      }

      function handleCellClick(idx) {
        if (!root.isConnected) return;
        if (phase !== "INPUT") return;

        if (userPattern.has(idx)) {
          userPattern.delete(idx);
          cells[idx].classList.remove("g20-user-active");
          cells[idx].textContent = "";
        } else {
          userPattern.add(idx);
          cells[idx].classList.add("g20-user-active");
          cells[idx].textContent = "★";
        }
        updateButtonStates();
      }

      function updateButtonStates() {
        if (phase === "INPUT") {
          checkBtn.disabled = userPattern.size === 0;
          clearBtn.disabled = userPattern.size === 0;
          statusBar.textContent = `Ausgewählt: ${userPattern.size} von ${targetPattern.size} Sternen`;
        } else {
          checkBtn.disabled = true;
          clearBtn.disabled = true;
        }
      }

      clearBtn.addEventListener("click", () => {
        if (phase !== "INPUT") return;
        userPattern.clear();
        cells.forEach(c => {
          c.classList.remove("g20-user-active");
          c.textContent = "";
        });
        updateButtonStates();
      });

      checkBtn.addEventListener("click", () => {
        if (phase !== "INPUT") return;
        evaluateAnswer();
      });

      function generatePattern(count) {
        const p = new Set();
        while (p.size < count) {
          p.add(Math.floor(Math.random() * 25));
        }
        return p;
      }

      function startRound(rIdx) {
        if (!root.isConnected) return;
        cleanupTimers();

        currentRound = rIdx;
        document.getElementById("g20-round-info").textContent = `Muster ${currentRound + 1} / ${TOTAL_ROUNDS}`;
        phase = "PREVIEW";
        userPattern.clear();
        updateButtonStates();

        targetPattern = generatePattern(PATTERN_SIZES[currentRound]);

        cells.forEach((cell, idx) => {
          cell.className = "g20-cell";
          if (targetPattern.has(idx)) {
            cell.classList.add("g20-lit");
            cell.textContent = "✨";
          } else {
            cell.textContent = "";
          }
        });

        statusBar.textContent = `Präge dir ${targetPattern.size} Lichter ein!`;

        const duration = (root.__fast ? 400 : 2600);
        const startTime = Date.now();

        function tick() {
          if (!root.isConnected) return;
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, 1 - elapsed / duration);
          bar.style.width = (remaining * 100) + "%";

          if (elapsed < duration) {
            animFrame = requestAnimationFrame(tick);
          } else {
            bar.style.width = "0%";
            switchToInputPhase();
          }
        }
        animFrame = requestAnimationFrame(tick);
      }

      function switchToInputPhase() {
        if (!root.isConnected) return;
        phase = "INPUT";
        cells.forEach(cell => {
          cell.className = "g20-cell";
          cell.textContent = "";
        });
        statusBar.textContent = `Muster nachbauen (${targetPattern.size} Sterne)!`;
        updateButtonStates();
      }

      function evaluateAnswer() {
        phase = "RESULT";
        updateButtonStates();

        let isCorrect = (targetPattern.size === userPattern.size);
        if (isCorrect) {
          targetPattern.forEach(i => {
            if (!userPattern.has(i)) isCorrect = false;
          });
        }

        cells.forEach((cell, idx) => {
          const inTarget = targetPattern.has(idx);
          const inUser = userPattern.has(idx);
          if (inTarget && inUser) {
            cell.className = "g20-cell g20-correct";
            cell.textContent = "✔";
          } else if (!inTarget && inUser) {
            cell.className = "g20-cell g20-wrong";
            cell.textContent = "✖";
          } else if (inTarget && !inUser) {
            cell.className = "g20-cell g20-lit";
            cell.textContent = "!";
          }
        });

        if (isCorrect) {
          statusBar.textContent = "Perfekt getroffen! 🌟";
          const delay = (root.__fast ? 250 : 1000);
          timerId = setTimeout(() => {
            if (!root.isConnected) return;
            if (currentRound + 1 >= TOTAL_ROUNDS) {
              handleWin();
            } else {
              startRound(currentRound + 1);
            }
          }, delay);
        } else {
          statusBar.textContent = "Leider nicht ganz richtig!";
          const delay = (root.__fast ? 300 : 1200);
          timerId = setTimeout(() => {
            if (!root.isConnected) return;
            showGameOver();
          }, delay);
        }
      }

      function showGameOver() {
        phase = "GAME_OVER";
        overlay.style.display = "flex";
        overlay.innerHTML = `
          <div style="font-size:38px;margin-bottom:8px;">🎄💔</div>
          <h3 style="margin:0 0 8px 0;color:#f4c430;font-size:20px;">Das Muster war verstimmt!</h3>
          <p style="margin:0 0 16px 0;font-size:14px;color:#f5f9ff;">Du hast Muster ${currentRound + 1} von ${TOTAL_ROUNDS} nicht ganz erwischt.</p>
          <button class="g20-btn" id="g20-btn-restart">Nochmal versuchen 🔄</button>
        `;
        overlay.querySelector("#g20-btn-restart").addEventListener("click", () => {
          overlay.style.display = "none";
          resetGame();
        });
      }

      function handleWin() {
        phase = "WON";
        overlay.style.display = "flex";
        overlay.innerHTML = `
          <div style="font-size:44px;margin-bottom:8px;">🎁🏆⭐</div>
          <h3 style="margin:0 0 8px 0;color:#f4c430;font-size:22px;">Meister der Geschenke!</h3>
          <p style="margin:0 0 8px 0;font-size:15px;color:#f5f9ff;">Alle 4 Festtags-Muster fehlerfrei verpackt!</p>
        `;
        if (!hasWon) {
          hasWon = true;
          win();
        }
      }

      function resetGame() {
        cleanupTimers();
        overlay.style.display = "none";
        userPattern.clear();
        targetPattern.clear();
        startRound(0);
      }

      // Initial start
      resetGame();
    },

    async bot(root){
      root.__fast = true;
      const sleep = ms => new Promise(r => setTimeout(r, ms));

      while (root.isConnected) {
        const state = root._g20_state;
        if (!state) {
          await sleep(50);
          continue;
        }

        const currentPhase = state.getPhase();
        if (currentPhase === "WON") {
          break;
        }
        if (currentPhase === "GAME_OVER") {
          const restartBtn = root.querySelector("#g20-btn-restart");
          if (restartBtn) restartBtn.click();
          await sleep(100);
          continue;
        }
        if (currentPhase === "INPUT") {
          const target = state.getTarget();
          for (const cellIdx of target) {
            state.clickCell(cellIdx);
            await sleep(20);
          }
          await sleep(30);
          state.clickCheck();
          await sleep(150);
        } else {
          await sleep(50);
        }
      }
    }
  };
})();