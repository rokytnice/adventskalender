(function(){
 Games[5] = {
  title: "Weihnachts-Nonogramm",
  hint: "Nutze die Zahlenhinweise an den Rändern, um das festliche 5x5-Bild freizulegen!",
  init(root, win){
    const SOLUTION = [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0]
    ];
    const COL_HINTS = [["1"], ["2", "1"], ["5"], ["2", "1"], ["1"]];
    const ROW_HINTS = [["1"], ["3"], ["5"], ["1"], ["3"]];

    let grid = [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];

    let currentMode = 1; // 1 = Füllen, 2 = Kreuzen
    let won = false;
    let timerId = null;
    let timeLeft = 60;

    root.innerHTML = `
      <style>
        .g5-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 100%;
          padding: 12px 8px;
          box-sizing: border-box;
          background: #0b1d33;
          color: #f5f9ff;
          font-family: system-ui, -apple-system, sans-serif;
          user-select: none;
          touch-action: manipulation;
        }
        .g5-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 340px;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: bold;
        }
        .g5-timer {
          background: rgba(245, 249, 255, 0.1);
          padding: 6px 12px;
          border-radius: 16px;
          border: 1px solid #f4c430;
          color: #f4c430;
          font-variant-numeric: tabular-nums;
        }
        .g5-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }
        .g5-btn-mode {
          display: flex;
          align-items: center;
          gap: 6px;
          min-height: 44px;
          padding: 0 16px;
          border-radius: 22px;
          border: 2px solid transparent;
          background: #142c4a;
          color: #f5f9ff;
          font-size: 15px;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.1s, background 0.2s, border-color 0.2s;
        }
        .g5-btn-mode.g5-active {
          background: #1f7a4d;
          border-color: #f4c430;
          box-shadow: 0 0 10px rgba(244, 196, 48, 0.4);
        }
        .g5-btn-mode:active {
          transform: scale(0.96);
        }
        .g5-board {
          display: grid;
          grid-template-columns: 44px repeat(5, 46px);
          grid-template-rows: 44px repeat(5, 46px);
          gap: 3px;
          background: #061220;
          padding: 6px;
          border-radius: 12px;
          border: 2px solid #f4c430;
          box-shadow: 0 8px 24px rgba(0,0,0,0.6);
        }
        .g5-corner {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        .g5-hint-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding-bottom: 4px;
          color: #f4c430;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.1;
        }
        .g5-hint-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 6px;
          gap: 4px;
          color: #f4c430;
          font-size: 13px;
          font-weight: 700;
        }
        .g5-cell {
          width: 46px;
          height: 46px;
          min-width: 44px;
          min-height: 44px;
          background: #10263f;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 22px;
          transition: background 0.15s, transform 0.1s;
        }
        .g5-cell:active {
          transform: scale(0.92);
        }
        .g5-cell.g5-filled {
          background: #1f7a4d;
          box-shadow: inset 0 0 6px rgba(0,0,0,0.4);
        }
        .g5-cell.g5-filled::after {
          content: '🎄';
          font-size: 22px;
        }
        .g5-cell.g5-crossed {
          background: #162a42;
          color: #d62839;
        }
        .g5-cell.g5-crossed::after {
          content: '✖';
          font-size: 18px;
          opacity: 0.85;
        }
        .g5-cell.g5-win-sparkle {
          animation: g5-pulse 0.8s infinite alternate;
        }
        @keyframes g5-pulse {
          from { transform: scale(1); filter: brightness(1); }
          to { transform: scale(1.06); filter: brightness(1.3); }
        }
        .g5-overlay {
          position: absolute;
          inset: 0;
          background: rgba(11, 29, 51, 0.92);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          z-index: 10;
          padding: 20px;
          text-align: center;
        }
        .g5-overlay h2 {
          color: #f4c430;
          margin: 0 0 8px 0;
          font-size: 24px;
        }
        .g5-overlay p {
          color: #f5f9ff;
          margin: 0 0 20px 0;
          font-size: 15px;
        }
        .g5-btn-retry {
          min-height: 44px;
          padding: 0 24px;
          background: #d62839;
          color: #fff;
          border: none;
          border-radius: 22px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(214, 40, 57, 0.4);
        }
        .g5-btn-retry:active {
          transform: scale(0.96);
        }
      </style>
      <div class="g5-wrap" style="position: relative;">
        <div class="g5-header">
          <span>🎄 Tannenbaum-Rätsel</span>
          <div class="g5-timer">⏳ <span class="g5-time-sec">60</span>s</div>
        </div>
        <div class="g5-controls">
          <button class="g5-btn-mode g5-active" data-mode="1">🎄 Ausmalen</button>
          <button class="g5-btn-mode" data-mode="2">✖️ Streichen</button>
        </div>
        <div class="g5-board" id="g5-grid"></div>
      </div>
    `;

    const boardEl = root.querySelector('#g5-grid');
    const timerText = root.querySelector('.g5-time-sec');
    const modeBtns = root.querySelectorAll('.g5-btn-mode');

    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('g5-active'));
        btn.classList.add('g5-active');
        currentMode = parseInt(btn.dataset.mode, 10);
      });
    });

    function renderBoard(){
      boardEl.innerHTML = '';
      // Corner
      const corner = document.createElement('div');
      corner.className = 'g5-corner';
      corner.textContent = '⭐';
      boardEl.appendChild(corner);

      // Col hints
      for(let c = 0; c < 5; c++){
        const colHint = document.createElement('div');
        colHint.className = 'g5-hint-col';
        COL_HINTS[c].forEach(num => {
          const span = document.createElement('span');
          span.textContent = num;
          colHint.appendChild(span);
        });
        boardEl.appendChild(colHint);
      }

      // Rows + Cells
      for(let r = 0; r < 5; r++){
        const rowHint = document.createElement('div');
        rowHint.className = 'g5-hint-row';
        ROW_HINTS[r].forEach(num => {
          const span = document.createElement('span');
          span.textContent = num;
          rowHint.appendChild(span);
        });
        boardEl.appendChild(rowHint);

        for(let c = 0; c < 5; c++){
          const cell = document.createElement('div');
          cell.className = 'g5-cell';
          cell.dataset.r = r;
          cell.dataset.c = c;
          updateCellClass(cell, grid[r][c]);
          cell.addEventListener('click', () => onCellClick(r, c));
          boardEl.appendChild(cell);
        }
      }
    }

    function updateCellClass(cell, val){
      cell.classList.remove('g5-filled', 'g5-crossed');
      if (val === 1) cell.classList.add('g5-filled');
      else if (val === 2) cell.classList.add('g5-crossed');
    }

    function checkWin(){
      for(let r = 0; r < 5; r++){
        for(let c = 0; c < 5; c++){
          const isTarget = SOLUTION[r][c] === 1;
          const isFilled = grid[r][c] === 1;
          if (isTarget !== isFilled) return false;
        }
      }
      return true;
    }

    function triggerWin(){
      won = true;
      clearInterval(timerId);
      const cells = boardEl.querySelectorAll('.g5-cell');
      cells.forEach(c => {
        if (c.classList.contains('g5-filled')) {
          c.classList.add('g5-win-sparkle');
        }
      });
      setTimeout(() => {
        if (root.isConnected) win();
      }, 500);
    }

    function showDefeat(){
      clearInterval(timerId);
      const wrap = root.querySelector('.g5-wrap');
      const overlay = document.createElement('div');
      overlay.className = 'g5-overlay';
      overlay.innerHTML = `
        <h2>Zeit abgelaufen! ❄️</h2>
        <p>Der Weihnachtszauber braucht noch etwas Geduld.</p>
        <button class="g5-btn-retry">Nochmal versuchen</button>
      `;
      overlay.querySelector('.g5-btn-retry').addEventListener('click', () => {
        Games[5].init(root, win);
      });
      wrap.appendChild(overlay);
    }

    function onCellClick(r, c){
      if (won || timeLeft <= 0) return;
      const currentVal = grid[r][c];
      if (currentVal === currentMode) {
        grid[r][c] = 0;
      } else {
        grid[r][c] = currentMode;
      }
      const cell = boardEl.querySelector(`[data-r="${r}"][data-c="${c}"]`);
      if (cell) updateCellClass(cell, grid[r][c]);

      if (checkWin()) {
        triggerWin();
      }
    }

    function startTimer(){
      if (timerId) clearInterval(timerId);
      timeLeft = 60;
      timerText.textContent = timeLeft;
      const intervalMs = root.__fast ? 200 : 1000;
      timerId = setInterval(() => {
        if (!root.isConnected) {
          clearInterval(timerId);
          return;
        }
        timeLeft--;
        timerText.textContent = Math.max(0, timeLeft);
        if (timeLeft <= 0) {
          clearInterval(timerId);
          showDefeat();
        }
      }, intervalMs);
    }

    // Expose click helper for bot/automation
    root.__clickCell = onCellClick;
    root.__setMode = (m) => {
      currentMode = m;
      modeBtns.forEach(b => {
        b.classList.toggle('g5-active', parseInt(b.dataset.mode, 10) === m);
      });
    };

    renderBoard();
    startTimer();
  },

  async bot(root){
    const delay = ms => new Promise(r => setTimeout(r, ms));
    const fast = root.__fast;
    const waitStep = fast ? 15 : 60;

    // Set to fill mode
    if (typeof root.__setMode === 'function') {
      root.__setMode(1);
    } else {
      const fillBtn = root.querySelector('.g5-btn-mode[data-mode="1"]');
      if (fillBtn) fillBtn.click();
    }
    await delay(waitStep);

    const targets = [
      [0, 2],
      [1, 1], [1, 2], [1, 3],
      [2, 0], [2, 1], [2, 2], [2, 3], [2, 4],
      [3, 2],
      [4, 1], [4, 2], [4, 3]
    ];

    for (const [r, c] of targets) {
      if (!root.isConnected) return;
      const cell = root.querySelector(`[data-r="${r}"][data-c="${c}"]`);
      if (cell) cell.click();
      await delay(waitStep);
    }
  }
 };
})();