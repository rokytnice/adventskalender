(function(){
  Games[3] = {
    title: "Geschenke-Türme von Hanoi",
    hint: "Staple alle 4 Geschenke auf den rechten Turm – nie ein größeres auf ein kleineres!",

    init(root, win){
      root.innerHTML = "";

      const style = document.createElement("style");
      style.textContent = `
        .g3-wrap {
          width: 100%;
          max-width: 540px;
          margin: 0 auto;
          box-sizing: border-box;
          background: #0b1d33;
          color: #f5f9ff;
          font-family: system-ui, -apple-system, sans-serif;
          user-select: none;
          -webkit-user-select: none;
          border-radius: 16px;
          padding: 16px 12px 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          position: relative;
          overflow: hidden;
        }
        .g3-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          padding: 0 8px;
        }
        .g3-stat {
          font-size: 14px;
          font-weight: 600;
          background: rgba(255,255,255,0.08);
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px solid rgba(244,196,48,0.3);
          color: #f5f9ff;
        }
        .g3-stat span {
          color: #f4c430;
          font-size: 16px;
        }
        .g3-stage {
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          height: 250px;
          background: linear-gradient(180deg, rgba(15,35,60,0.6) 0%, rgba(11,29,51,0.9) 100%);
          border-radius: 12px;
          position: relative;
          padding-bottom: 18px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .g3-base {
          position: absolute;
          bottom: 0;
          left: 4%;
          right: 4%;
          height: 18px;
          background: #f5f9ff;
          border-radius: 9px 9px 0 0;
          box-shadow: 0 -2px 10px rgba(245,249,255,0.3);
        }
        .g3-peg {
          flex: 1;
          height: 230px;
          max-width: 150px;
          position: relative;
          display: flex;
          flex-direction: column-reverse;
          align-items: center;
          cursor: pointer;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          border-radius: 10px;
          transition: background 0.2s;
        }
        .g3-peg:hover {
          background: rgba(255,255,255,0.04);
        }
        .g3-peg:active {
          background: rgba(244,196,48,0.08);
        }
        .g3-peg.g3-selected-source {
          background: rgba(244,196,48,0.12);
        }
        .g3-pole {
          position: absolute;
          bottom: 0;
          width: 10px;
          height: 190px;
          background: repeating-linear-gradient(
            45deg,
            #d62839,
            #d62839 10px,
            #f5f9ff 10px,
            #f5f9ff 20px
          );
          border-radius: 6px 6px 0 0;
          z-index: 1;
          pointer-events: none;
        }
        .g3-pole-cap {
          position: absolute;
          top: -8px;
          left: -4px;
          width: 18px;
          height: 14px;
          background: #f4c430;
          border-radius: 50%;
          box-shadow: 0 0 6px #f4c430;
        }
        .g3-disk {
          position: relative;
          height: 32px;
          border-radius: 7px;
          margin-bottom: 3px;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.4);
          transition: transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1.2), box-shadow 0.2s;
          pointer-events: none;
        }
        .g3-disk::before {
          content: "";
          position: absolute;
          left: 50%;
          width: 10px;
          height: 100%;
          transform: translateX(-50%);
          background: rgba(255,255,255,0.35);
        }
        .g3-disk::after {
          content: "🎀";
          position: absolute;
          top: -10px;
          font-size: 13px;
          line-height: 1;
          z-index: 3;
        }
        .g3-disk-1 { width: 50px; background: #f4c430; }
        .g3-disk-2 { width: 75px; background: #1f7a4d; }
        .g3-disk-3 { width: 102px; background: #d62839; }
        .g3-disk-4 { width: 130px; background: #2a5298; }

        .g3-disk.g3-lifted {
          transform: translateY(-38px) scale(1.05);
          box-shadow: 0 14px 20px rgba(0,0,0,0.5), 0 0 15px rgba(244,196,48,0.7);
        }
        .g3-shake {
          animation: g3-wiggle 0.35s ease-in-out;
        }
        @keyframes g3-wiggle {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        .g3-footer {
          margin-top: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        .g3-btn {
          min-height: 44px;
          padding: 8px 18px;
          font-size: 14px;
          font-weight: 700;
          border: none;
          border-radius: 22px;
          cursor: pointer;
          touch-action: manipulation;
          background: #d62839;
          color: #f5f9ff;
          box-shadow: 0 4px 12px rgba(214,40,57,0.3);
          transition: transform 0.1s, background 0.2s;
        }
        .g3-btn:active {
          transform: scale(0.96);
          background: #b51e2d;
        }
        .g3-msg {
          font-size: 13px;
          color: #f4c430;
          font-weight: 500;
          min-height: 18px;
          text-align: center;
          flex: 1;
        }
        .g3-overlay {
          position: absolute;
          inset: 0;
          background: rgba(11,29,51,0.92);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
          animation: g3-fade 0.3s ease;
          padding: 20px;
          text-align: center;
        }
        @keyframes g3-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .g3-win-title {
          font-size: 26px;
          font-weight: 800;
          color: #f4c430;
          margin-bottom: 8px;
        }
        .g3-win-desc {
          font-size: 15px;
          color: #f5f9ff;
          margin-bottom: 20px;
        }
      `;
      root.appendChild(style);

      const wrap = document.createElement("div");
      wrap.className = "g3-wrap";
      wrap.innerHTML = `
        <div class="g3-header">
          <div class="g3-stat">Züge: <span id="g3-move-count">0</span> <small style="color:#aaa;">(Min: 15)</small></div>
          <div class="g3-stat">Zeit: <span id="g3-time">00:00</span></div>
        </div>
        <div class="g3-stage" id="g3-stage">
          <div class="g3-base"></div>
          <div class="g3-peg" data-peg="0"><div class="g3-pole"><div class="g3-pole-cap"></div></div></div>
          <div class="g3-peg" data-peg="1"><div class="g3-pole"><div class="g3-pole-cap"></div></div></div>
          <div class="g3-peg" data-peg="2"><div class="g3-pole"><div class="g3-pole-cap"></div></div></div>
        </div>
        <div class="g3-footer">
          <div class="g3-msg" id="g3-status">Tippe auf Turm 1, um ein Geschenk zu heben.</div>
          <button class="g3-btn" id="g3-restart">Neu starten</button>
        </div>
      `;
      root.appendChild(wrap);

      // State
      let pegs = [[4, 3, 2, 1], [], []];
      let selectedPeg = null;
      let moves = 0;
      let startTime = null;
      let timerInterval = null;
      let won = false;

      const moveEl = wrap.querySelector("#g3-move-count");
      const timeEl = wrap.querySelector("#g3-time");
      const statusEl = wrap.querySelector("#g3-status");
      const pegEls = wrap.querySelectorAll(".g3-peg");
      const restartBtn = wrap.querySelector("#g3-restart");

      function updateTimer(){
        if (!root.isConnected) {
          clearInterval(timerInterval);
          return;
        }
        if (!startTime || won) return;
        const diff = Math.floor((Date.now() - startTime) / 1000);
        const m = String(Math.floor(diff / 60)).padStart(2, "0");
        const s = String(diff % 60).padStart(2, "0");
        timeEl.textContent = `${m}:${s}`;
      }

      function renderDisks(){
        pegEls.forEach((pegEl, pegIdx) => {
          pegEl.querySelectorAll(".g3-disk").forEach(el => el.remove());
          pegEl.classList.remove("g3-selected-source");

          const disks = pegs[pegIdx];
          disks.forEach((size, idx) => {
            const diskEl = document.createElement("div");
            diskEl.className = `g3-disk g3-disk-${size}`;
            if (selectedPeg === pegIdx && idx === disks.length - 1) {
              diskEl.classList.add("g3-lifted");
            }
            pegEl.appendChild(diskEl);
          });

          if (selectedPeg === pegIdx) {
            pegEl.classList.add("g3-selected-source");
          }
        });
      }

      function setMessage(txt, isError = false){
        statusEl.textContent = txt;
        statusEl.style.color = isError ? "#d62839" : "#f4c430";
      }

      function handlePegAction(pegIdx){
        if (won) return;

        if (startTime === null) {
          startTime = Date.now();
          timerInterval = setInterval(updateTimer, 500);
        }

        if (selectedPeg === null) {
          if (pegs[pegIdx].length === 0) {
            setMessage("Dieser Turm ist leer!", true);
            return;
          }
          selectedPeg = pegIdx;
          renderDisks();
          setMessage(`Geschenk gewählt. Wo soll es hin?`);
        } else if (selectedPeg === pegIdx) {
          selectedPeg = null;
          renderDisks();
          setMessage("Abgewählt. Wähle einen Turm.");
        } else {
          const sourcePeg = selectedPeg;
          const targetPeg = pegIdx;
          const movingDisk = pegs[sourcePeg][pegs[sourcePeg].length - 1];
          const targetTopDisk = pegs[targetPeg][pegs[targetPeg].length - 1];

          if (targetTopDisk !== undefined && targetTopDisk < movingDisk) {
            // Invalid move
            pegEls[targetPeg].classList.add("g3-shake");
            setTimeout(() => {
              if (root.isConnected) pegEls[targetPeg].classList.remove("g3-shake");
            }, 360);
            setMessage("Nicht erlaubt! Nur kleiner auf größer.", true);
            return;
          }

          // Valid move
          pegs[sourcePeg].pop();
          pegs[targetPeg].push(movingDisk);
          moves++;
          moveEl.textContent = moves;
          selectedPeg = null;
          renderDisks();
          setMessage("Guter Zug!");

          // Check win condition (all 4 on rightmost peg)
          if (pegs[2].length === 4) {
            won = true;
            clearInterval(timerInterval);
            showVictory();
            win();
          }
        }
      }

      function showVictory(){
        const overlay = document.createElement("div");
        overlay.className = "g3-overlay";
        overlay.innerHTML = `
          <div class="g3-win-title">✨ Frohes Fest! ✨</div>
          <div class="g3-win-desc">Alle Geschenke perfekt gestapelt in <strong>${moves}</strong> Zügen!</div>
          <button class="g3-btn" id="g3-win-btn">Nochmal spielen</button>
        `;
        wrap.appendChild(overlay);
        overlay.querySelector("#g3-win-btn").addEventListener("click", resetGame);
      }

      function resetGame(){
        clearInterval(timerInterval);
        const overlay = wrap.querySelector(".g3-overlay");
        if (overlay) overlay.remove();
        pegs = [[4, 3, 2, 1], [], []];
        selectedPeg = null;
        moves = 0;
        won = false;
        startTime = null;
        moveEl.textContent = "0";
        timeEl.textContent = "00:00";
        setMessage("Tippe auf Turm 1, um ein Geschenk zu heben.");
        renderDisks();
      }

      pegEls.forEach((pegEl) => {
        pegEl.addEventListener("click", () => {
          const idx = parseInt(pegEl.getAttribute("data-peg"), 10);
          handlePegAction(idx);
        });
      });

      restartBtn.addEventListener("click", resetGame);

      // Keyboard support: keys 1, 2, 3
      function handleKey(e){
        if (!root.isConnected) {
          window.removeEventListener("keydown", handleKey);
          return;
        }
        if (["1", "2", "3"].includes(e.key)) {
          const p = parseInt(e.key, 10) - 1;
          handlePegAction(p);
        }
      }
      window.addEventListener("keydown", handleKey);

      // Store triggers for bot
      root.__hanoi = {
        trigger: handlePegAction,
        reset: resetGame
      };

      renderDisks();
    },

    async bot(root){
      root.__fast = true;
      if (root.__hanoi && root.__hanoi.reset) {
        root.__hanoi.reset();
      }

      function getHanoiMoves(n, from, to, aux) {
        if (n === 0) return [];
        return [
          ...getHanoiMoves(n - 1, from, aux, to),
          [from, to],
          ...getHanoiMoves(n - 1, aux, to, from)
        ];
      }

      const moves = getHanoiMoves(4, 0, 2, 1);
      const delay = ms => new Promise(res => setTimeout(res, ms));
      const stepWait = root.__fast ? 25 : 120;

      for (const [from, to] of moves) {
        if (!root.isConnected) return;
        if (root.__hanoi && root.__hanoi.trigger) {
          root.__hanoi.trigger(from);
          await delay(stepWait);
          if (!root.isConnected) return;
          root.__hanoi.trigger(to);
          await delay(stepWait);
        }
      }
    }
  };
})();