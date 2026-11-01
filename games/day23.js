(function(){
  if (typeof window.Games === 'undefined') window.Games = {};

  Games[23] = {
    title: "Lebkuchen-Minensuche",
    hint: "Nutze den Umschalter für Aufdecken/Flagge und finde alle 56 sicheren Felder!",

    init(root, win) {
      root.innerHTML = '';

      if (!document.getElementById('g23-style')) {
        const style = document.createElement('style');
        style.id = 'g23-style';
        style.textContent = `
          .g23-wrap {
            background-color: #0b1d33;
            color: #f5f9ff;
            font-family: system-ui, -apple-system, sans-serif;
            padding: 14px;
            border-radius: 16px;
            box-sizing: border-box;
            width: 100%;
            max-width: 440px;
            margin: 0 auto;
            text-align: center;
            user-select: none;
            -webkit-user-select: none;
            box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          }
          .g23-header {
            display: flex;
            justify-content: space-around;
            align-items: center;
            margin-bottom: 12px;
            background: rgba(255, 255, 255, 0.06);
            padding: 8px 12px;
            border-radius: 10px;
            font-size: 15px;
            font-weight: bold;
            border: 1px solid rgba(244, 196, 48, 0.25);
          }
          .g23-stat-item {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .g23-toggle-wrap {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 12px;
          }
          .g23-mode-btn {
            min-height: 44px;
            flex: 1;
            max-width: 160px;
            padding: 8px 10px;
            border: 2px solid #f4c430;
            background: #0b1d33;
            color: #f5f9ff;
            border-radius: 22px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-size: 14px;
            transition: all 0.2s ease;
          }
          .g23-mode-btn.g23-active {
            background: #f4c430;
            color: #0b1d33;
            box-shadow: 0 0 10px rgba(244, 196, 48, 0.4);
          }
          .g23-grid {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            gap: 4px;
            width: 100%;
            max-width: 380px;
            margin: 0 auto;
            aspect-ratio: 1;
          }
          .g23-cell {
            background: #1f7a4d;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: inset 0 -3px 0 rgba(0,0,0,0.3);
            aspect-ratio: 1;
            touch-action: manipulation;
          }
          .g23-cell:active {
            transform: scale(0.96);
          }
          .g23-cell.g23-revealed {
            background: rgba(255, 255, 255, 0.08);
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
            cursor: default;
          }
          .g23-cell.g23-mine-hit {
            background: #d62839 !important;
          }
          .g23-status-msg {
            margin-top: 12px;
            font-size: 16px;
            font-weight: bold;
            min-height: 24px;
          }
          .g23-status-msg.g23-win { color: #f4c430; }
          .g23-status-msg.g23-loss { color: #d62839; }
          .g23-restart-btn {
            background: #d62839;
            color: #f5f9ff;
            border: 2px solid #f4c430;
            padding: 10px 24px;
            border-radius: 22px;
            font-size: 15px;
            font-weight: bold;
            cursor: pointer;
            min-height: 44px;
            margin-top: 10px;
          }
          .g23-n1 { color: #64b5f6; }
          .g23-n2 { color: #81c784; }
          .g23-n3 { color: #e57373; }
          .g23-n4 { color: #ba68c8; }
          .g23-n5 { color: #ffb74d; }
          .g23-n6 { color: #4dd0e1; }
          .g23-n7 { color: #f06292; }
          .g23-n8 { color: #fff176; }
        `;
        document.head.appendChild(style);
      }

      const TOTAL_MINES = 8;
      const ROWS = 8;
      const COLS = 8;
      const SAFE_CELLS = ROWS * COLS - TOTAL_MINES;

      let board = [];
      let firstClick = true;
      let gameOver = false;
      let mode = 'reveal'; // 'reveal' | 'flag'
      let flagsCount = 0;
      let timer = 0;
      let timerInterval = null;
      let winCalled = false;

      function createBoard() {
        board = [];
        for (let r = 0; r < ROWS; r++) {
          let row = [];
          for (let c = 0; c < COLS; c++) {
            row.push({
              r, c,
              isMine: false,
              revealed: false,
              flagged: false,
              count: 0
            });
          }
          board.push(row);
        }
      }

      createBoard();

      // UI Layout
      const wrap = document.createElement('div');
      wrap.className = 'g23-wrap';

      const header = document.createElement('div');
      header.className = 'g23-header';

      const mineStat = document.createElement('div');
      mineStat.className = 'g23-stat-item';
      mineStat.innerHTML = `🦯 <span id="g23-mines-left">${TOTAL_MINES}</span>`;

      const timerStat = document.createElement('div');
      timerStat.className = 'g23-stat-item';
      timerStat.innerHTML = `⏱️ <span id="g23-timer">000</span>s`;

      header.appendChild(mineStat);
      header.appendChild(timerStat);

      const toggleWrap = document.createElement('div');
      toggleWrap.className = 'g23-toggle-wrap';

      const btnReveal = document.createElement('button');
      btnReveal.className = 'g23-mode-btn g23-active';
      btnReveal.type = 'button';
      btnReveal.innerHTML = `⛏️ Aufdecken`;

      const btnFlag = document.createElement('button');
      btnFlag.className = 'g23-mode-btn';
      btnFlag.type = 'button';
      btnFlag.innerHTML = `🚩 Flagge`;

      btnReveal.onclick = () => setMode('reveal');
      btnFlag.onclick = () => setMode('flag');

      toggleWrap.appendChild(btnReveal);
      toggleWrap.appendChild(btnFlag);

      const gridEl = document.createElement('div');
      gridEl.className = 'g23-grid';

      const statusMsg = document.createElement('div');
      statusMsg.className = 'g23-status-msg';

      const restartBtn = document.createElement('button');
      restartBtn.className = 'g23-restart-btn';
      restartBtn.type = 'button';
      restartBtn.textContent = '🔄 Nochmal spielen';
      restartBtn.style.display = 'none';
      restartBtn.onclick = () => Games[23].init(root, win);

      wrap.appendChild(header);
      wrap.appendChild(toggleWrap);
      wrap.appendChild(gridEl);
      wrap.appendChild(statusMsg);
      wrap.appendChild(restartBtn);
      root.appendChild(wrap);

      // Create cell elements
      const cellEls = [];
      for (let r = 0; r < ROWS; r++) {
        cellEls[r] = [];
        for (let c = 0; c < COLS; c++) {
          const cell = document.createElement('div');
          cell.className = 'g23-cell';
          cell.textContent = '🍪';

          cell.addEventListener('click', (e) => {
            e.preventDefault();
            handleCellInteraction(r, c, mode);
          });

          cell.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            handleCellInteraction(r, c, 'flag');
          });

          gridEl.appendChild(cell);
          cellEls[r][c] = cell;
        }
      }

      function setMode(m) {
        mode = m;
        if (mode === 'reveal') {
          btnReveal.classList.add('g23-active');
          btnFlag.classList.remove('g23-active');
        } else {
          btnFlag.classList.add('g23-active');
          btnReveal.classList.remove('g23-active');
        }
      }

      function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timer = 0;
        timerInterval = setInterval(() => {
          if (!root.isConnected) {
            clearInterval(timerInterval);
            return;
          }
          timer++;
          const tEl = wrap.querySelector('#g23-timer');
          if (tEl) tEl.textContent = String(Math.min(999, timer)).padStart(3, '0');
        }, root.__fast ? 200 : 1000);
      }

      function stopTimer() {
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
      }

      function placeMines(startR, startC) {
        const candidates = [];
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (r === startR && c === startC) continue;
            candidates.push({ r, c });
          }
        }

        for (let i = candidates.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
        }

        for (let i = 0; i < TOTAL_MINES; i++) {
          const { r, c } = candidates[i];
          board[r][c].isMine = true;
        }

        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (board[r][c].isMine) continue;
            let cnt = 0;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                let nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].isMine) {
                  cnt++;
                }
              }
            }
            board[r][c].count = cnt;
          }
        }
      }

      function handleCellInteraction(r, c, action) {
        if (gameOver) return;

        if (firstClick) {
          firstClick = false;
          placeMines(r, c);
          startTimer();
        }

        const cell = board[r][c];

        if (action === 'flag') {
          if (cell.revealed) return;
          cell.flagged = !cell.flagged;
          flagsCount += cell.flagged ? 1 : -1;
          const minesLeftEl = wrap.querySelector('#g23-mines-left');
          if (minesLeftEl) minesLeftEl.textContent = TOTAL_MINES - flagsCount;
          render();
          return;
        }

        // Action: reveal
        if (cell.flagged || cell.revealed) return;

        cell.revealed = true;

        if (cell.isMine) {
          // Lost
          gameOver = true;
          stopTimer();
          cellEls[r][c].classList.add('g23-mine-hit');
          revealAllMines();
          statusMsg.textContent = '❌ Oh nein! Eine Zuckerstangen-Mine ist explodiert!';
          statusMsg.className = 'g23-status-msg g23-loss';
          restartBtn.style.display = 'inline-block';
          return;
        }

        if (cell.count === 0) {
          floodFill(r, c);
        }

        render();
        checkWin();
      }

      function floodFill(startR, startC) {
        const queue = [{ r: startR, c: startC }];
        while (queue.length > 0) {
          const { r, c } = queue.shift();
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              let nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                const neighbor = board[nr][nc];
                if (!neighbor.revealed && !neighbor.flagged && !neighbor.isMine) {
                  neighbor.revealed = true;
                  if (neighbor.count === 0) {
                    queue.push({ r: nr, c: nc });
                  }
                }
              }
            }
          }
        }
      }

      function revealAllMines() {
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (board[r][c].isMine) {
              board[r][c].revealed = true;
            }
          }
        }
        render();
      }

      function checkWin() {
        let revealedCount = 0;
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (board[r][c].revealed && !board[r][c].isMine) revealedCount++;
          }
        }

        if (revealedCount === SAFE_CELLS && !gameOver) {
          gameOver = true;
          stopTimer();
          // Flag remaining mines visually
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              if (board[r][c].isMine) board[r][c].flagged = true;
            }
          }
          const minesLeftEl = wrap.querySelector('#g23-mines-left');
          if (minesLeftEl) minesLeftEl.textContent = '0';
          render();

          statusMsg.textContent = '🎉 Gewonnen! Alle Lebkuchen sind sicher!';
          statusMsg.className = 'g23-status-msg g23-win';

          if (!winCalled) {
            winCalled = true;
            win();
          }
        }
      }

      function render() {
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const cell = board[r][c];
            const el = cellEls[r][c];

            if (cell.revealed) {
              el.classList.add('g23-revealed');
              if (cell.isMine) {
                el.textContent = '🦯';
              } else if (cell.count > 0) {
                el.textContent = cell.count;
                el.className = `g23-cell g23-revealed g23-n${cell.count}`;
              } else {
                el.textContent = '';
              }
            } else {
              el.classList.remove('g23-revealed');
              if (cell.flagged) {
                el.textContent = '🚩';
              } else {
                el.textContent = '🍪';
              }
            }
          }
        }
      }

      // Cleanup monitor
      const cleanupInterval = setInterval(() => {
        if (!root.isConnected) {
          clearInterval(cleanupInterval);
          stopTimer();
        }
      }, 500);

      // Expose state for bot automation
      root._g23_instance = {
        interact: (r, c, act) => handleCellInteraction(r, c, act),
        getBoard: () => board,
        isOver: () => gameOver
      };

      render();
    },

    async bot(root) {
      const wait = (ms) => new Promise(res => setTimeout(res, ms));
      const fast = !!root.__fast;
      const stepDelay = fast ? 5 : 25;

      while (!root._g23_instance && root.isConnected) {
        await wait(20);
      }

      if (!root.isConnected) return;
      const inst = root._g23_instance;

      // First click at (0,0) to initiate board and safe placement
      inst.interact(0, 0, 'reveal');
      await wait(stepDelay);

      const board = inst.getBoard();

      // Loop over board and click all non-mine cells
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (!root.isConnected || inst.isOver()) break;
          const cell = board[r][c];
          if (!cell.isMine && !cell.revealed) {
            inst.interact(r, c, 'reveal');
            await wait(stepDelay);
          }
        }
      }
      await wait(50);
    }
  };
})();