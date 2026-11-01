(function(){
  if (!document.getElementById('g10-style')) {
    const style = document.createElement('style');
    style.id = 'g10-style';
    style.textContent = `
      .g10-wrap {
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
        box-sizing: border-box;
        background: #0b1d33;
        color: #f5f9ff;
        font-family: system-ui, -apple-system, sans-serif;
        padding: 16px;
        border-radius: 12px;
        text-align: center;
        user-select: none;
        position: relative;
        overflow: hidden;
      }
      .g10-title {
        font-size: 1.3rem;
        font-weight: bold;
        color: #f4c430;
        margin: 0 0 10px 0;
        text-shadow: 0 0 8px rgba(244, 196, 48, 0.4);
      }
      .g10-stats {
        display: flex;
        justify-content: space-around;
        background: rgba(31, 122, 77, 0.3);
        border: 1px solid #1f7a4d;
        border-radius: 8px;
        padding: 8px;
        margin-bottom: 14px;
        font-size: 0.95rem;
      }
      .g10-stat-val {
        color: #f4c430;
        font-weight: bold;
      }
      .g10-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 8px;
        margin: 0 auto 14px auto;
        max-width: 360px;
      }
      .g10-cell {
        aspect-ratio: 1;
        min-width: 44px;
        min-height: 44px;
        border-radius: 10px;
        border: 2px solid #1f7a4d;
        background: #162a45;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        outline: none;
        transition: transform 0.1s ease, background-color 0.2s ease, box-shadow 0.2s ease;
        -webkit-tap-highlight-color: transparent;
      }
      .g10-cell:hover, .g10-cell:focus-visible {
        border-color: #f4c430;
      }
      .g10-cell:active {
        transform: scale(0.92);
      }
      .g10-cell.g10-on {
        background: #d62839;
        border-color: #f4c430;
        box-shadow: 0 0 12px rgba(244, 196, 48, 0.7), inset 0 0 6px #f4c430;
      }
      .g10-icon {
        width: 65%;
        height: 65%;
        fill: #3a536b;
        transition: fill 0.2s ease, filter 0.2s ease;
      }
      .g10-on .g10-icon {
        fill: #f4c430;
        filter: drop-shadow(0 0 4px #ffffff);
      }
      .g10-btn {
        background: #d62839;
        color: #f5f9ff;
        border: none;
        padding: 10px 20px;
        font-size: 1rem;
        font-weight: bold;
        border-radius: 8px;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        transition: background-color 0.2s, transform 0.1s;
        min-height: 44px;
      }
      .g10-btn:hover {
        background: #e63946;
      }
      .g10-btn:active {
        transform: scale(0.96);
      }
      .g10-overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(11, 29, 51, 0.94);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        border-radius: 12px;
        z-index: 10;
        backdrop-filter: blur(4px);
      }
      .g10-overlay-title {
        font-size: 1.4rem;
        font-weight: bold;
        color: #f4c430;
        margin-bottom: 10px;
      }
      .g10-overlay-msg {
        font-size: 0.95rem;
        margin-bottom: 20px;
        color: #f5f9ff;
      }
      .g10-hidden {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  Games[10] = {
    title: "Festliche Lichterkette",
    hint: "Klicke auf die Lichter, um alle 25 Lichter der Kette auszuschalten!",

    init(root, win) {
      if (root.__g10_timer) {
        clearInterval(root.__g10_timer);
        root.__g10_timer = null;
      }

      let moves = 0;
      let timeLeft = 60;
      let gameActive = true;
      let hasWon = false;

      const grid = Array.from({ length: 5 }, () => Array(5).fill(false));
      const sol = Array.from({ length: 5 }, () => Array(5).fill(false));

      function toggle(r, c, recordSol = true) {
        if (recordSol) {
          sol[r][c] = !sol[r][c];
        }
        const coords = [
          [r, c], [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]
        ];
        for (const [nr, nc] of coords) {
          if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) {
            grid[nr][nc] = !grid[nr][nc];
          }
        }
      }

      function generateBoard() {
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 5; c++) {
            grid[r][c] = false;
            sol[r][c] = false;
          }
        }

        const positions = [];
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 5; c++) {
            positions.push([r, c]);
          }
        }
        for (let i = positions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        const numToggles = 10 + Math.floor(Math.random() * 4);
        for (let i = 0; i < numToggles; i++) {
          const [r, c] = positions[i];
          toggle(r, c, true);
        }

        let onCount = 0;
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 5; c++) {
            if (grid[r][c]) onCount++;
          }
        }

        if (onCount < 6) {
          generateBoard();
        }
      }

      generateBoard();

      root.innerHTML = `
        <div class="g10-wrap">
          <div class="g10-title">🎄 Festliche Lichterkette 🎄</div>
          <div class="g10-stats">
            <div>Züge: <span class="g10-stat-val" id="g10-moves">0</span></div>
            <div>Lichter an: <span class="g10-stat-val" id="g10-on-count">0</span></div>
            <div>Zeit: <span class="g10-stat-val" id="g10-time">60s</span></div>
          </div>
          <div class="g10-grid" id="g10-board"></div>
          <div class="g10-overlay g10-hidden" id="g10-overlay">
            <div class="g10-overlay-title" id="g10-ov-title"></div>
            <div class="g10-overlay-msg" id="g10-ov-msg"></div>
            <button class="g10-btn" id="g10-restart-btn">Nochmal spielen</button>
          </div>
        </div>
      `;

      const boardEl = root.querySelector('#g10-board');
      const movesEl = root.querySelector('#g10-moves');
      const onCountEl = root.querySelector('#g10-on-count');
      const timeEl = root.querySelector('#g10-time');
      const overlayEl = root.querySelector('#g10-overlay');
      const ovTitleEl = root.querySelector('#g10-ov-title');
      const ovMsgEl = root.querySelector('#g10-ov-msg');
      const restartBtn = root.querySelector('#g10-restart-btn');

      const bulbSvg = `<svg class="g10-icon" viewBox="0 0 24 24"><path d="M12 2C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm-3 18c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1z"/></svg>`;

      const buttons = [];
      for (let r = 0; r < 5; r++) {
        buttons[r] = [];
        for (let c = 0; c < 5; c++) {
          const btn = document.createElement('button');
          btn.className = 'g10-cell';
          btn.setAttribute('data-r', r);
          btn.setAttribute('data-c', c);
          btn.setAttribute('aria-label', `Licht Zeile ${r+1}, Spalte ${c+1}`);
          btn.innerHTML = bulbSvg;

          btn.addEventListener('click', () => {
            if (!gameActive) return;
            userClick(r, c);
          });

          boardEl.appendChild(btn);
          buttons[r][c] = btn;
        }
      }

      function updateUI() {
        let onCount = 0;
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 5; c++) {
            if (grid[r][c]) {
              onCount++;
              buttons[r][c].classList.add('g10-on');
              buttons[r][c].setAttribute('aria-pressed', 'true');
            } else {
              buttons[r][c].classList.remove('g10-on');
              buttons[r][c].setAttribute('aria-pressed', 'false');
            }
          }
        }
        onCountEl.textContent = `${onCount}/25`;
        movesEl.textContent = moves;
        timeEl.textContent = `${timeLeft}s`;

        if (onCount === 0 && gameActive && !hasWon) {
          hasWon = true;
          gameActive = false;
          if (root.__g10_timer) clearInterval(root.__g10_timer);

          ovTitleEl.textContent = '✨ Phantastisch! ✨';
          ovMsgEl.textContent = `Du hast alle Lichter in ${moves} Zügen ausgeschaltet!`;
          overlayEl.classList.remove('g10-hidden');

          win();
        }
      }

      function userClick(r, c) {
        moves++;
        toggle(r, c, true);
        updateUI();
      }

      root.__g10_sol = () => sol;
      root.__g10_click = (r, c) => {
        if (gameActive) userClick(r, c);
      };

      function resetGame() {
        if (root.__g10_timer) clearInterval(root.__g10_timer);
        moves = 0;
        timeLeft = 60;
        gameActive = true;
        hasWon = false;
        overlayEl.classList.add('g10-hidden');
        generateBoard();
        updateUI();
        startTimer();
      }

      restartBtn.addEventListener('click', resetGame);

      function startTimer() {
        if (root.__g10_timer) clearInterval(root.__g10_timer);
        root.__g10_timer = setInterval(() => {
          if (!root.isConnected) {
            clearInterval(root.__g10_timer);
            return;
          }
          if (!gameActive) return;

          timeLeft--;
          timeEl.textContent = `${timeLeft}s`;

          if (timeLeft <= 0) {
            gameActive = false;
            clearInterval(root.__g10_timer);
            ovTitleEl.textContent = '❄️ Zeit abgelaufen! ❄️';
            ovMsgEl.textContent = 'Die Kette leuchtet leider noch. Versuche es gleich nochmal!';
            overlayEl.classList.remove('g10-hidden');
          }
        }, root.__fast ? 200 : 1000);
      }

      updateUI();
      startTimer();
    },

    async bot(root) {
      while (root.isConnected) {
        const getSol = root.__g10_sol;
        if (!getSol) break;
        const sol = getSol();

        let target = null;
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 5; c++) {
            if (sol[r][c]) {
              target = { r, c };
              break;
            }
          }
          if (target) break;
        }

        if (!target) break;

        if (root.__g10_click) {
          root.__g10_click(target.r, target.c);
        }

        const delay = root.__fast ? 10 : 50;
        await new Promise(res => setTimeout(res, delay));
      }
    }
  };
})();