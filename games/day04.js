(function(){
  if (!document.getElementById("g4-style")) {
    const style = document.createElement("style");
    style.id = "g4-style";
    style.textContent = `
      .g4-wrap {
        background: #0b1d33;
        color: #f5f9ff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        padding: 16px;
        border-radius: 16px;
        box-sizing: border-box;
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
        text-align: center;
        user-select: none;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      }
      .g4-title {
        color: #f4c430;
        font-size: 1.4rem;
        margin: 0 0 6px 0;
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      .g4-status {
        font-size: 1rem;
        min-height: 48px;
        margin: 8px 0;
        color: #f5f9ff;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        background: rgba(255,255,255,0.05);
        border-radius: 8px;
      }
      .g4-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin: 16px 0;
      }
      .g4-candle-card {
        background: #142a45;
        border: 2px solid rgba(244, 196, 48, 0.2);
        border-radius: 12px;
        padding: 12px 6px 16px 6px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        min-height: 110px;
        min-width: 44px;
        touch-action: manipulation;
        transition: transform 0.1s, border-color 0.2s, background-color 0.2s;
        outline: none;
      }
      .g4-candle-card:active {
        transform: scale(0.96);
      }
      .g4-flame-holder {
        height: 32px;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        margin-bottom: 4px;
      }
      .g4-flame {
        width: 16px;
        height: 26px;
        background: #ff9800;
        border-radius: 50% 50% 20% 20%;
        opacity: 0.15;
        transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
        transform-origin: center bottom;
      }
      .g4-candle-card.g4-active .g4-flame {
        opacity: 1;
        background: #fff700;
        box-shadow: 0 0 12px #ff9800, 0 0 24px #ff5722;
        transform: scale(1.25);
      }
      .g4-wick {
        width: 2px;
        height: 8px;
        background: #888;
      }
      .g4-candle-body {
        width: 38px;
        height: 52px;
        border-radius: 4px 4px 2px 2px;
        box-shadow: inset -4px 0 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: rgba(255,255,255,0.85);
        font-size: 0.9rem;
        text-shadow: 0 1px 2px rgba(0,0,0,0.6);
      }
      .g4-c0 .g4-candle-body { background: #d62839; }
      .g4-c1 .g4-candle-body { background: #f4c430; color: #333; text-shadow: none; }
      .g4-c2 .g4-candle-body { background: #1f7a4d; }
      .g4-c3 .g4-candle-body { background: #a0c4ff; color: #111; text-shadow: none; }

      .g4-btn {
        background: #d62839;
        color: #f5f9ff;
        border: none;
        padding: 12px 24px;
        font-size: 1.05rem;
        border-radius: 8px;
        cursor: pointer;
        min-height: 48px;
        min-width: 140px;
        font-weight: bold;
        margin-top: 8px;
        box-shadow: 0 4px 12px rgba(214, 40, 57, 0.4);
        transition: background-color 0.2s, transform 0.1s;
        touch-action: manipulation;
      }
      .g4-btn:active {
        transform: scale(0.96);
      }
      .g4-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .g4-key-hint {
        font-size: 0.75rem;
        color: rgba(245, 249, 255, 0.6);
        margin-top: 8px;
      }
    `;
    document.head.appendChild(style);
  }

  Games[4] = {
    title: "Kerzen-Simon",
    hint: "Merke dir das Leuchten der 4 Kerzen und wiederhole die Folge in 6 Runden!",

    init(root, win) {
      root.innerHTML = "";

      let audioCtx = null;
      const freqs = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5

      function playAudioTone(index, durationMs) {
        try {
          if (!audioCtx) {
            const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
            if (AudioCtxClass) audioCtx = new AudioCtxClass();
          }
          if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
          }
          if (audioCtx) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freqs[index];
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (durationMs / 1000));
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + (durationMs / 1000));
          }
        } catch(e) {}
      }

      const totalRounds = 6;
      let sequence = [];
      let playerStep = 0;
      let round = 0;
      let isShowingSequence = false;
      let isGameOver = false;
      let gameStarted = false;
      let gameWon = false;
      let winCalled = false;
      let activeTimeouts = [];

      function safeTimeout(fn, ms) {
        const id = setTimeout(() => {
          activeTimeouts = activeTimeouts.filter(t => t !== id);
          if (root.isConnected) fn();
        }, ms);
        activeTimeouts.push(id);
        return id;
      }

      function clearAllTimeouts() {
        activeTimeouts.forEach(id => clearTimeout(id));
        activeTimeouts = [];
      }

      function getDelay(ms) {
        return ms * (root.__fast ? 0.2 : 1.0);
      }

      const container = document.createElement("div");
      container.className = "g4-wrap";

      const titleEl = document.createElement("div");
      titleEl.className = "g4-title";
      titleEl.textContent = "🎄 Kerzen-Simon 🎄";
      container.appendChild(titleEl);

      const statusEl = document.createElement("div");
      statusEl.className = "g4-status";
      statusEl.textContent = "Klicke 'Start', um zu beginnen!";
      container.appendChild(statusEl);

      const gridEl = document.createElement("div");
      gridEl.className = "g4-grid";

      const candleNames = ["Rot", "Gold", "Grün", "Schnee"];
      const candleButtons = [];

      for (let i = 0; i < 4; i++) {
        const btn = document.createElement("button");
        btn.className = `g4-candle-card g4-c${i}`;
        btn.setAttribute("aria-label", candleNames[i]);

        const flameHolder = document.createElement("div");
        flameHolder.className = "g4-flame-holder";
        const flame = document.createElement("div");
        flame.className = "g4-flame";
        flameHolder.appendChild(flame);

        const wick = document.createElement("div");
        wick.className = "g4-wick";

        const body = document.createElement("div");
        body.className = "g4-candle-body";
        body.textContent = (i + 1).toString();

        btn.appendChild(flameHolder);
        btn.appendChild(wick);
        btn.appendChild(body);

        btn.addEventListener("click", () => handleCandleClick(i));
        gridEl.appendChild(btn);
        candleButtons.push(btn);
      }
      container.appendChild(gridEl);

      const actionBtn = document.createElement("button");
      actionBtn.className = "g4-btn";
      actionBtn.textContent = "Spiel Starten";
      actionBtn.addEventListener("click", () => {
        if (!gameStarted || isGameOver) {
          startGame();
        }
      });
      container.appendChild(actionBtn);

      const keyHint = document.createElement("div");
      keyHint.className = "g4-key-hint";
      keyHint.textContent = "Tastatur-Steuerung: Tasten 1, 2, 3, 4";
      container.appendChild(keyHint);

      root.appendChild(container);

      function lightUp(index, durationMs) {
        if (!candleButtons[index]) return;
        candleButtons[index].classList.add("g4-active");
        playAudioTone(index, durationMs);
        safeTimeout(() => {
          if (candleButtons[index]) {
            candleButtons[index].classList.remove("g4-active");
          }
        }, durationMs);
      }

      function playSequence() {
        if (!root.isConnected) return;
        isShowingSequence = true;
        statusEl.textContent = `Merke dir die Reihenfolge! (Runde ${round}/${totalRounds})`;

        const litDuration = getDelay(380);
        const gapDuration = getDelay(180);

        sequence.forEach((candleIdx, step) => {
          safeTimeout(() => {
            if (!root.isConnected || isGameOver) return;
            lightUp(candleIdx, litDuration);
          }, step * (litDuration + gapDuration) + getDelay(400));
        });

        const totalTime = sequence.length * (litDuration + gapDuration) + getDelay(400);
        safeTimeout(() => {
          if (!root.isConnected || isGameOver) return;
          isShowingSequence = false;
          playerStep = 0;
          statusEl.textContent = `Du bist dran! (Runde ${round}/${totalRounds})`;
        }, totalTime);
      }

      function handleCandleClick(index) {
        if (!gameStarted || isShowingSequence || isGameOver || gameWon) return;

        lightUp(index, getDelay(200));

        if (sequence[playerStep] === index) {
          playerStep++;
          if (playerStep === sequence.length) {
            if (round >= totalRounds) {
              // Victory
              gameWon = true;
              isShowingSequence = false;
              statusEl.textContent = "🎉 Bravo! Alle Kerzen richtig gemerkt!";
              actionBtn.style.display = "none";
              if (!winCalled) {
                winCalled = true;
                win();
              }
            } else {
              // Next round
              round++;
              sequence.push(Math.floor(Math.random() * 4));
              isShowingSequence = true;
              safeTimeout(() => {
                playSequence();
              }, getDelay(600));
            }
          }
        } else {
          // Game Over
          isGameOver = true;
          statusEl.textContent = "❌ Falsche Kerze! Versuch es noch einmal.";
          actionBtn.textContent = "Nochmal";
          actionBtn.style.display = "inline-block";
        }
      }

      function startGame() {
        clearAllTimeouts();
        sequence = [];
        round = 1;
        playerStep = 0;
        isGameOver = false;
        gameWon = false;
        gameStarted = true;
        actionBtn.style.display = "none";
        sequence.push(Math.floor(Math.random() * 4));
        playSequence();
      }

      function onKeyDown(e) {
        if (!root.isConnected) return;
        if (e.key >= "1" && e.key <= "4") {
          const idx = parseInt(e.key, 10) - 1;
          handleCandleClick(idx);
        }
      }

      window.addEventListener("keydown", onKeyDown);

      // Cleanup listener when element detached
      const checkInterval = setInterval(() => {
        if (!root.isConnected) {
          clearInterval(checkInterval);
          clearAllTimeouts();
          window.removeEventListener("keydown", onKeyDown);
        }
      }, 500);

      // Interface for Bot
      root._g4Internal = {
        startGame,
        clickCandle: handleCandleClick,
        getState: () => ({
          gameStarted,
          isShowingSequence,
          isGameOver,
          gameWon,
          sequence,
          playerStep,
          round
        })
      };
    },

    async bot(root) {
      root.__fast = true;
      const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

      while (root.isConnected) {
        const g = root._g4Internal;
        if (!g) {
          await sleep(50);
          continue;
        }

        const state = g.getState();

        if (state.gameWon) {
          break;
        }

        if (!state.gameStarted || state.isGameOver) {
          g.startGame();
          await sleep(100);
          continue;
        }

        if (!state.isShowingSequence && state.playerStep < state.sequence.length) {
          const targetCandle = state.sequence[state.playerStep];
          g.clickCandle(targetCandle);
          await sleep(60);
        } else {
          await sleep(40);
        }
      }
    }
  };
})();