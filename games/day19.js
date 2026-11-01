(function(){
  Games[19] = {
    title: "Glocken-Reaktion",
    hint: "Tippe blitzschnell, sobald die Glocke läutet! 5 Runden, Ziel: Schnitt unter 700 ms.",
    
    init(root, win){
      root.innerHTML = "";
      root.__winCalled = false;

      const styleId = "g19-style";
      let styleEl = document.getElementById(styleId);
      if(!styleEl){
        styleEl = document.createElement("style");
        styleEl.id = styleId;
        styleEl.textContent = `
          .g19-box * { box-sizing: border-box; user-select: none; -webkit-user-select: none; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          .g19-box {
            width: 100%;
            max-width: 520px;
            margin: 0 auto;
            background: #0b1d33;
            color: #f5f9ff;
            border-radius: 16px;
            padding: 18px 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(244,196,48,0.25);
            text-align: center;
          }
          .g19-title {
            color: #f4c430;
            font-size: 1.35rem;
            font-weight: 800;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
            text-shadow: 0 2px 6px rgba(0,0,0,0.6);
          }
          .g19-sub {
            font-size: 0.85rem;
            color: #d6e2f0;
            margin-bottom: 14px;
          }
          .g19-rounds {
            display: flex;
            gap: 8px;
            margin-bottom: 14px;
          }
          .g19-dot {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: rgba(255,255,255,0.15);
            border: 2px solid #1f7a4d;
            transition: all 0.25s ease;
          }
          .g19-dot.active {
            border-color: #f4c430;
            background: rgba(244,196,48,0.3);
            transform: scale(1.15);
          }
          .g19-dot.done {
            background: #1f7a4d;
            border-color: #1f7a4d;
          }
          .g19-dot.fail {
            background: #d62839;
            border-color: #d62839;
          }
          .g19-target-btn {
            width: 100%;
            min-height: 200px;
            background: radial-gradient(circle, #163255 0%, #0d223c 100%);
            border: 3px solid #1f7a4d;
            border-radius: 16px;
            cursor: pointer;
            outline: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 16px;
            position: relative;
            overflow: hidden;
            transition: transform 0.08s ease, border-color 0.2s, background 0.2s;
            touch-action: manipulation;
          }
          .g19-target-btn:active {
            transform: scale(0.98);
          }
          .g19-target-btn.waiting {
            border-color: #1f7a4d;
          }
          .g19-target-btn.ringing {
            background: radial-gradient(circle, #422915 0%, #1a1622 100%);
            border-color: #f4c430;
            box-shadow: 0 0 25px rgba(244,196,48,0.5), inset 0 0 15px rgba(244,196,48,0.3);
            animation: g19-pulse 0.4s infinite alternate;
          }
          .g19-target-btn.early {
            background: radial-gradient(circle, #44171d 0%, #1e0d11 100%);
            border-color: #d62839;
            box-shadow: 0 0 20px rgba(214,40,57,0.4);
          }
          @keyframes g19-pulse {
            0% { transform: scale(1.0); }
            100% { transform: scale(1.02); }
          }
          .g19-bell-svg {
            width: 90px;
            height: 90px;
            transition: transform 0.15s ease;
            filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));
          }
          .ringing .g19-bell-svg {
            animation: g19-shake 0.15s infinite;
          }
          @keyframes g19-shake {
            0% { transform: rotate(-14deg) scale(1.1); }
            50% { transform: rotate(14deg) scale(1.1); }
            100% { transform: rotate(-14deg) scale(1.1); }
          }
          .g19-status {
            margin-top: 10px;
            font-size: 1.2rem;
            font-weight: 700;
            min-height: 1.6rem;
            color: #f5f9ff;
          }
          .g19-substatus {
            font-size: 0.9rem;
            color: #ffd875;
            min-height: 1.2rem;
            margin-top: 2px;
          }
          .g19-table {
            width: 100%;
            margin-top: 14px;
            background: rgba(255,255,255,0.04);
            border-radius: 10px;
            padding: 8px 12px;
            font-size: 0.85rem;
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 4px;
          }
          .g19-cell {
            padding: 4px;
            border-radius: 6px;
            background: rgba(0,0,0,0.25);
          }
          .g19-cell .val {
            font-weight: 700;
            color: #f4c430;
          }
          .g19-cell .lbl {
            font-size: 0.7rem;
            color: #9ab4d0;
          }
          .g19-footer {
            margin-top: 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
          }
          .g19-avg-label {
            font-size: 0.95rem;
            font-weight: 600;
            color: #f5f9ff;
          }
          .g19-avg-val {
            font-size: 1.15rem;
            font-weight: 800;
            color: #f4c430;
          }
          .g19-btn {
            background: #d62839;
            color: #ffffff;
            border: none;
            border-radius: 8px;
            padding: 10px 18px;
            font-size: 0.95rem;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            min-height: 44px;
            min-width: 120px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: background 0.15s, transform 0.1s;
          }
          .g19-btn:active {
            transform: scale(0.96);
          }
          .g19-btn-gold {
            background: #f4c430;
            color: #0b1d33;
          }
          .g19-result-overlay {
            margin-top: 14px;
            padding: 12px;
            border-radius: 10px;
            width: 100%;
            background: rgba(0,0,0,0.4);
            border: 1px solid rgba(255,255,255,0.1);
          }
          .g19-win-text {
            color: #f4c430;
            font-size: 1.2rem;
            font-weight: 800;
          }
          .g19-lose-text {
            color: #d62839;
            font-size: 1.2rem;
            font-weight: 800;
          }
        `;
        document.head.appendChild(styleEl);
      }

      const TOTAL_ROUNDS = 5;
      const TARGET_AVG = 700;

      let currentRound = 0;
      let times = [];
      let state = "idle"; // "idle" | "waiting" | "ringing" | "cooldown" | "finished"
      let ringTimestamp = 0;
      let waitTimer = null;
      let cooldownTimer = null;

      const container = document.createElement("div");
      container.className = "g19-box";
      root.appendChild(container);

      function renderBase(){
        container.innerHTML = `
          <div class="g19-title">🔔 Festlicher Glocken-Test</div>
          <div class="g19-sub">Tippe blitzschnell, wenn die Glocke läutet! Schnitt &lt; 700 ms</div>
          <div class="g19-rounds" id="g19-dots">
            ${Array.from({length: TOTAL_ROUNDS}).map((_, i) => `<div class="g19-dot" id="g19-dot-${i}"></div>`).join("")}
          </div>
          <button class="g19-target-btn waiting" id="g19-bell-btn" type="button" aria-label="Glocke">
            <svg class="g19-bell-svg" viewBox="0 0 100 100" fill="none">
              <!-- Clapper / Klöppel -->
              <circle cx="50" cy="85" r="9" fill="#a07a10" />
              <!-- Bell body -->
              <path d="M50 14 C36 14 30 30 28 58 C25 72 15 78 15 82 C15 84 18 85 24 85 L76 85 C82 85 85 84 85 82 C85 78 75 72 72 58 C70 30 64 14 50 14 Z" fill="url(#g19-gold-grad)" />
              <!-- Top Ring -->
              <ellipse cx="50" cy="14" rx="8" ry="5" fill="#f4c430" stroke="#a07a10" stroke-width="2.5" />
              <!-- Highlights & Rim -->
              <path d="M18 82 C25 81 40 80 50 80 C60 80 75 81 82 82 C82 85 75 87 50 87 C25 87 18 85 18 82 Z" fill="#d69e12" />
              <path d="M35 32 C38 22 45 18 50 18" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
              <defs>
                <linearGradient id="g19-gold-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#fff099" />
                  <stop offset="45%" stop-color="#f4c430" />
                  <stop offset="100%" stop-color="#b2820a" />
                </linearGradient>
              </defs>
            </svg>
            <div class="g19-status" id="g19-status">Startbereit</div>
            <div class="g19-substatus" id="g19-substatus">Tippe auf die Glocke zum Starten</div>
          </button>
          <div class="g19-table" id="g19-table">
            ${Array.from({length: TOTAL_ROUNDS}).map((_, i) => `
              <div class="g19-cell">
                <div class="lbl">R${i+1}</div>
                <div class="val" id="g19-val-${i}">--</div>
              </div>
            `).join("")}
          </div>
          <div class="g19-footer">
            <div class="g19-avg-label">Schnitt: <span class="g19-avg-val" id="g19-avg">--</span></div>
            <button class="g19-btn" id="g19-action-btn" type="button">Start</button>
          </div>
          <div id="g19-result-panel"></div>
        `;
      }

      renderBase();

      const bellBtn = container.querySelector("#g19-bell-btn");
      const statusText = container.querySelector("#g19-status");
      const substatusText = container.querySelector("#g19-substatus");
      const avgText = container.querySelector("#g19-avg");
      const actionBtn = container.querySelector("#g19-action-btn");
      const resultPanel = container.querySelector("#g19-result-panel");

      function updateDots(){
        for(let i=0; i<TOTAL_ROUNDS; i++){
          const dot = container.querySelector(`#g19-dot-${i}`);
          if(!dot) continue;
          dot.className = "g19-dot";
          if(i < times.length){
            dot.classList.add(times[i] >= 1100 ? "fail" : "done");
          } else if(i === currentRound && state !== "finished"){
            dot.classList.add("active");
          }
        }
      }

      function updateTable(){
        times.forEach((t, i) => {
          const cell = container.querySelector(`#g19-val-${i}`);
          if(cell) {
            cell.textContent = t + " ms";
            cell.style.color = t >= 1100 ? "#d62839" : "#f4c430";
          }
        });
        if(times.length > 0){
          const sum = times.reduce((a, b) => a + b, 0);
          const avg = Math.round(sum / times.length);
          avgText.textContent = avg + " ms";
          avgText.style.color = avg <= TARGET_AVG ? "#1f7a4d" : "#d62839";
        } else {
          avgText.textContent = "--";
          avgText.style.color = "#f4c430";
        }
      }

      function cleanupTimers(){
        if(waitTimer){ clearTimeout(waitTimer); waitTimer = null; }
        if(cooldownTimer){ clearTimeout(cooldownTimer); cooldownTimer = null; }
      }

      function startRound(){
        if(!root.isConnected) return;
        cleanupTimers();
        state = "waiting";
        updateDots();

        bellBtn.className = "g19-target-btn waiting";
        statusText.textContent = "Warten auf das Läuten...";
        statusText.style.color = "#d6e2f0";
        substatusText.textContent = "Nicht zu früh tippen!";
        substatusText.style.color = "#9ab4d0";
        actionBtn.style.display = "none";

        const speedFactor = (root.__fast ? 5 : 1);
        const delay = (1000 + Math.random() * 2000) / speedFactor;

        waitTimer = setTimeout(() => {
          if(!root.isConnected || state !== "waiting") return;
          triggerRing();
        }, delay);
      }

      function triggerRing(){
        state = "ringing";
        ringTimestamp = performance.now();
        bellBtn.className = "g19-target-btn ringing";
        statusText.textContent = "JETZT TIPPEN!";
        statusText.style.color = "#f4c430";
        substatusText.textContent = "🔔 Bim-Bam! Schnell!";
        substatusText.style.color = "#fff";
      }

      function handleTap(){
        if(!root.isConnected) return;

        if(state === "idle"){
          startRound();
          return;
        }

        if(state === "waiting"){
          // Early tap penalty!
          cleanupTimers();
          state = "cooldown";
          const penaltyTime = 1200;
          times.push(penaltyTime);
          currentRound++;

          bellBtn.className = "g19-target-btn early";
          statusText.textContent = "Zu früh!";
          statusText.style.color = "#d62839";
          substatusText.textContent = "+1200 ms Strafe";
          substatusText.style.color = "#ff9494";

          updateTable();
          updateDots();

          const delay = (1100 / (root.__fast ? 5 : 1));
          cooldownTimer = setTimeout(() => {
            if(!root.isConnected) return;
            nextOrFinish();
          }, delay);
          return;
        }

        if(state === "ringing"){
          const reaction = Math.round(performance.now() - ringTimestamp);
          state = "cooldown";
          times.push(reaction);
          currentRound++;

          bellBtn.className = "g19-target-btn";
          statusText.textContent = `${reaction} ms!`;
          statusText.style.color = reaction <= TARGET_AVG ? "#75f493" : "#f4c430";
          substatusText.textContent = reaction <= TARGET_AVG ? "Klasse Reaktion!" : "Etwas gemächlich...";
          substatusText.style.color = "#d6e2f0";

          updateTable();
          updateDots();

          const delay = (800 / (root.__fast ? 5 : 1));
          cooldownTimer = setTimeout(() => {
            if(!root.isConnected) return;
            nextOrFinish();
          }, delay);
          return;
        }
      }

      function nextOrFinish(){
        if(!root.isConnected) return;
        if(currentRound >= TOTAL_ROUNDS){
          finishGame();
        } else {
          startRound();
        }
      }

      function finishGame(){
        state = "finished";
        bellBtn.className = "g19-target-btn";
        const sum = times.reduce((a, b) => a + b, 0);
        const finalAvg = Math.round(sum / TOTAL_ROUNDS);

        updateTable();
        updateDots();

        if(finalAvg <= TARGET_AVG){
          statusText.textContent = "🎉 Glückwunsch!";
          statusText.style.color = "#f4c430";
          substatusText.textContent = `Schnitt: ${finalAvg} ms (Ziel: < 700 ms)`;
          resultPanel.innerHTML = `
            <div class="g19-result-overlay">
              <div class="g19-win-text">🏆 Herausragende Reflexe!</div>
              <div style="font-size:0.9rem; color:#d6e2f0; margin-top:4px;">
                Du hast den Glocken-Test mit Bravour bestanden!
              </div>
            </div>
          `;
          actionBtn.style.display = "none";
          if(!root.__winCalled){
            root.__winCalled = true;
            win();
          }
        } else {
          statusText.textContent = "Zu langsam!";
          statusText.style.color = "#d62839";
          substatusText.textContent = `Schnitt: ${finalAvg} ms ist über 700 ms`;
          resultPanel.innerHTML = `
            <div class="g19-result-overlay">
              <div class="g19-lose-text">Leider knapp verpasst!</div>
              <div style="font-size:0.9rem; color:#d6e2f0; margin-top:4px;">
                Ziel ist ein Durchschnitt von unter 700 ms.
              </div>
            </div>
          `;
          actionBtn.style.display = "inline-flex";
          actionBtn.textContent = "Nochmal";
          actionBtn.className = "g19-btn g19-btn-gold";
        }
      }

      function resetGame(){
        cleanupTimers();
        currentRound = 0;
        times = [];
        state = "idle";
        resultPanel.innerHTML = "";
        for(let i=0; i<TOTAL_ROUNDS; i++){
          const c = container.querySelector(`#g19-val-${i}`);
          if(c) c.textContent = "--";
        }
        avgText.textContent = "--";
        actionBtn.style.display = "inline-flex";
        actionBtn.textContent = "Start";
        actionBtn.className = "g19-btn";
        bellBtn.className = "g19-target-btn waiting";
        statusText.textContent = "Startbereit";
        statusText.style.color = "#f5f9ff";
        substatusText.textContent = "Tippe auf Start oder die Glocke";
        updateDots();
      }

      bellBtn.addEventListener("click", () => handleTap());
      actionBtn.addEventListener("click", () => {
        if(state === "idle"){
          startRound();
        } else if(state === "finished"){
          resetGame();
          startRound();
        }
      });

      const onKeyDown = (e) => {
        if(!root.isConnected) return;
        if(e.code === "Space" || e.code === "Enter"){
          e.preventDefault();
          if(state === "finished" && actionBtn.style.display !== "none"){
            resetGame();
            startRound();
          } else {
            handleTap();
          }
        }
      };
      window.addEventListener("keydown", onKeyDown);

      // Clean listener when disconnected
      const checkConnInterval = setInterval(() => {
        if(!root.isConnected){
          cleanupTimers();
          clearInterval(checkConnInterval);
          window.removeEventListener("keydown", onKeyDown);
        }
      }, 500);

      // Expose internal hook for bot if needed
      root.__triggerTap = handleTap;
      root.__getState = () => state;
    },

    async bot(root){
      root.__fast = true;
      const sleep = (ms) => new Promise(res => setTimeout(res, ms));

      // Click start if idle
      const startBtn = root.querySelector("#g19-action-btn");
      if(startBtn && startBtn.style.display !== "none"){
        startBtn.click();
      }

      const bellBtn = root.querySelector("#g19-bell-btn");

      while(root.isConnected && !root.__winCalled){
        const state = root.__getState ? root.__getState() : null;
        if(state === "ringing"){
          // React swiftly with a realistic human-like fast bot reaction (~80ms)
          await sleep(60 + Math.floor(Math.random() * 40));
          if(bellBtn) bellBtn.click();
        } else if(state === "finished"){
          // Check if win called; if not, restart
          if(!root.__winCalled){
            const actionBtn = root.querySelector("#g19-action-btn");
            if(actionBtn) actionBtn.click();
          }
          break;
        } else if(state === "idle"){
          if(bellBtn) bellBtn.click();
        }
        await sleep(20);
      }
    }
  };
})();