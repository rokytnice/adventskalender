(function(){
  if (!document.getElementById("g3-style")) {
    const style = document.createElement("style");
    style.id = "g3-style";
    style.textContent = `
      .g3-container {
        box-sizing: border-box;
        width: 100%;
        max-width: 560px;
        margin: 0 auto;
        background: #0b1d33;
        color: #f5f9ff;
        font-family: system-ui, -apple-system, sans-serif;
        padding: 16px;
        border-radius: 12px;
        user-select: none;
        -webkit-user-select: none;
        position: relative;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      }
      .g3-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-size: 1.1rem;
        font-weight: bold;
      }
      .g3-badge {
        background: #1f7a4d;
        padding: 8px 14px;
        border-radius: 20px;
        border: 1px solid #f4c430;
        color: #f5f9ff;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        min-height: 44px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
      }
      .g3-badge-time {
        background: #d62839;
      }
      .g3-board {
        position: relative;
        width: 100%;
        height: 360px;
        background: radial-gradient(circle at center, #132a48 0%, #0b1d33 100%);
        border: 2px solid #f4c430;
        border-radius: 8px;
        overflow: hidden;
        touch-action: manipulation;
      }
      .g3-cookie {
        position: absolute;
        width: 56px;
        height: 56px;
        margin-left: -28px;
        margin-top: -28px;
        cursor: pointer;
        border: none;
        background: none;
        padding: 0;
        outline: none;
        transform: scale(1);
        transition: transform 0.08s ease-out;
        touch-action: manipulation;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .g3-cookie:active, .g3-cookie:focus {
        transform: scale(0.88);
      }
      .g3-cookie svg {
        width: 100%;
        height: 100%;
        pointer-events: none;
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));
      }
      .g3-pop {
        position: absolute;
        color: #f4c430;
        font-weight: bold;
        font-size: 1.3rem;
        pointer-events: none;
        animation: g3-float 0.4s ease-out forwards;
        transform: translate(-50%, -50%);
        text-shadow: 0 2px 4px rgba(0,0,0,0.8);
      }
      @keyframes g3-float {
        0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -85%) scale(1.3); }
      }
      .g3-overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(11, 29, 51, 0.92);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 16px;
        z-index: 10;
        padding: 20px;
        text-align: center;
      }
      .g3-btn {
        background: #d62839;
        color: #f5f9ff;
        border: 2px solid #f4c430;
        padding: 12px 24px;
        font-size: 1.1rem;
        font-weight: bold;
        border-radius: 25px;
        cursor: pointer;
        min-width: 150px;
        min-height: 44px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        transition: background 0.2s, transform 0.1s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .g3-btn:hover {
        background: #e63946;
      }
      .g3-btn:active {
        transform: scale(0.95);
      }
      .g3-title-text {
        font-size: 1.5rem;
        color: #f4c430;
        margin: 0;
      }
      .g3-msg-text {
        font-size: 1.05rem;
        color: #f5f9ff;
        margin: 0;
      }
    `;
    document.head.appendChild(style);
  }

  if (typeof window.Games === 'undefined') window.Games = {};

  window.Games[3] = {
    title: "Plätzchen-Klicker",
    hint: "Klicke in 20 Sekunden mindestens 40 Plätzchen an!",
    init(root, win) {
      if (root._g3_cleanup) root._g3_cleanup();

      root.innerHTML = `
        <div class="g3-container">
          <div class="g3-header">
            <div class="g3-badge" id="g3-score">Plätzchen: 0 / 40</div>
            <div class="g3-badge g3-badge-time" id="g3-timer">20.0s</div>
          </div>
          <div class="g3-board" id="g3-board">
            <div class="g3-overlay" id="g3-overlay">
              <h2 class="g3-title-text">Plätzchen-Klicker</h2>
              <p class="g3-msg-text">Sammle 40 Plätzchen vor Ablauf der Zeit!</p>
              <button class="g3-btn" id="g3-start-btn">Start</button>
            </div>
          </div>
        </div>
      `;

      const board = root.querySelector("#g3-board");
      const scoreEl = root.querySelector("#g3-score");
      const timerEl = root.querySelector("#g3-timer");
      const overlay = root.querySelector("#g3-overlay");
      const startBtn = root.querySelector("#g3-start-btn");

      let score = 0;
      let timeLeft = 20.0;
      let gameRunning = false;
      let won = false;
      let animId = null;
      let lastTime = null;
      const TARGET_SCORE = 40;
      const MAX_COOKIES = 3;

      const cookieSVG = `
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="#c88b48" stroke="#8b5a2b" stroke-width="4"/>
          <circle cx="35" cy="35" r="7" fill="#4a2e18"/>
          <circle cx="65" cy="30" r="6" fill="#4a2e18"/>
          <circle cx="50" cy="60" r="8" fill="#4a2e18"/>
          <circle cx="70" cy="65" r="5" fill="#4a2e18"/>
          <circle cx="28" cy="62" r="6" fill="#4a2e18"/>
          <circle cx="45" cy="20" r="3" fill="#e6b87d" opacity="0.6"/>
        </svg>
      `;

      function spawnCookie() {
        if (!gameRunning) return;
        const btn = document.createElement("button");
        btn.className = "g3-cookie";
        btn.innerHTML = cookieSVG;
        btn.setAttribute("aria-label", "Plätzchen");

        const w = board.clientWidth || 320;
        const h = board.clientHeight || 360;
        const pad = 40;
        const x = Math.floor(pad + Math.random() * Math.max(10, w - 2 * pad));
        const y = Math.floor(pad + Math.random() * Math.max(10, h - 2 * pad));

        btn.style.left = x + "px";
        btn.style.top = y + "px";

        const handleInteraction = (e) => {
          e.preventDefault();
          onCookieClick(btn, x, y);
        };

        btn.addEventListener("pointerdown", handleInteraction);
        btn.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleInteraction(e);
          }
        });

        board.appendChild(btn);
      }

      function onCookieClick(btn, x, y) {
        if (!gameRunning) return;
        btn.remove();
        score++;
        scoreEl.textContent = `Plätzchen: ${score} / ${TARGET_SCORE}`;

        const pop = document.createElement("div");
        pop.className = "g3-pop";
        pop.textContent = "+1";
        pop.style.left = x + "px";
        pop.style.top = y + "px";
        board.appendChild(pop);
        setTimeout(() => pop.remove(), 400);

        if (score >= TARGET_SCORE) {
          gameWon();
        } else {
          spawnCookie();
        }
      }

      function update(timestamp) {
        if (!root.isConnected) {
          stopGame();
          return;
        }

        if (gameRunning) {
          if (lastTime !== null) {
            const dt = (timestamp - lastTime) / 1000;
            const speed = root.__fast ? 5 : 1;
            timeLeft -= dt * speed;

            if (timeLeft <= 0) {
              timeLeft = 0;
              timerEl.textContent = "0.0s";
              if (score >= TARGET_SCORE) {
                gameWon();
              } else {
                gameOver();
              }
              return;
            }
            timerEl.textContent = timeLeft.toFixed(1) + "s";
          }
          lastTime = timestamp;
          animId = requestAnimationFrame(update);
        }
      }

      function startGame() {
        score = 0;
        timeLeft = 20.0;
        gameRunning = true;
        won = false;
        scoreEl.textContent = `Plätzchen: 0 / ${TARGET_SCORE}`;
        timerEl.textContent = "20.0s";
        overlay.style.display = "none";

        const oldElements = board.querySelectorAll(".g3-cookie, .g3-pop");
        oldElements.forEach(el => el.remove());

        for (let i = 0; i < MAX_COOKIES; i++) {
          spawnCookie();
        }

        lastTime = null;
        if (animId) cancelAnimationFrame(animId);
        animId = requestAnimationFrame(update);
      }

      function gameOver() {
        gameRunning = false;
        if (animId) cancelAnimationFrame(animId);
        overlay.style.display = "flex";
        overlay.innerHTML = `
          <h2 class="g3-title-text">Zeit abgelaufen!</h2>
          <p class="g3-msg-text">Du hast ${score} von ${TARGET_SCORE} Plätzchen geschafft.</p>
          <button class="g3-btn" id="g3-retry-btn">Nochmal</button>
        `;
        overlay.querySelector("#g3-retry-btn").addEventListener("click", startGame);
      }

      function gameWon() {
        if (won) return;
        gameRunning = false;
        won = true;
        if (animId) cancelAnimationFrame(animId);

        overlay.style.display = "flex";
        overlay.innerHTML = `
          <h2 class="g3-title-text">Gewonnen! 🎉</h2>
          <p class="g3-msg-text">Du hast ${score} Plätzchen gebacken!</p>
        `;

        win();
      }

      function stopGame() {
        gameRunning = false;
        if (animId) cancelAnimationFrame(animId);
      }

      startBtn.addEventListener("click", startGame);
      root._g3_cleanup = stopGame;
    },

    async bot(root) {
      root.__fast = true;
      const delay = (ms) => new Promise(res => setTimeout(res, ms));

      while (root.isConnected) {
        const startBtn = root.querySelector("#g3-start-btn");
        if (startBtn && startBtn.offsetParent !== null) {
          startBtn.click();
          await delay(30);
        }

        const retryBtn = root.querySelector("#g3-retry-btn");
        if (retryBtn && retryBtn.offsetParent !== null) {
          retryBtn.click();
          await delay(30);
        }

        const cookie = root.querySelector(".g3-cookie");
        if (cookie) {
          cookie.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
        }

        const title = root.querySelector(".g3-title-text");
        if (title && title.textContent.includes("Gewonnen")) {
          break;
        }

        await delay(15);
      }
    }
  };
})();