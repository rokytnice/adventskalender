(function(){
  Games[17] = {
    title: "Weihnachts-Tic-Tac-Toe",
    hint: "Setze 3 Tannenbäume in eine Reihe, um den Sternen-Bot zu schlagen!",
    init(root, win){
      let style = document.getElementById("g17-style");
      if(!style){
        style = document.createElement("style");
        style.id = "g17-style";
        style.textContent = `
          .g17-wrap {
            background-color: #0b1d33;
            color: #f5f9ff;
            font-family: system-ui, -apple-system, sans-serif;
            padding: 16px;
            border-radius: 16px;
            box-sizing: border-box;
            width: 100%;
            max-width: 500px;
            margin: 0 auto;
            text-align: center;
            user-select: none;
          }
          .g17-title {
            font-size: 1.3rem;
            font-weight: bold;
            color: #f4c430;
            margin-bottom: 8px;
          }
          .g17-status {
            font-size: 1.05rem;
            margin-bottom: 16px;
            min-height: 1.6em;
            color: #f5f9ff;
          }
          .g17-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            width: 100%;
            max-width: 320px;
            margin: 0 auto 16px auto;
          }
          .g17-cell {
            aspect-ratio: 1 / 1;
            min-height: 60px;
            background: #1f7a4d;
            border: 2px solid #f4c430;
            border-radius: 12px;
            font-size: 2.2rem;
            color: #f5f9ff;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            outline: none;
            transition: transform 0.1s, background-color 0.2s;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
          }
          .g17-cell:hover:not(:disabled), .g17-cell:focus-visible:not(:disabled) {
            background: #289b63;
            transform: scale(1.03);
          }
          .g17-cell:disabled {
            cursor: default;
          }
          .g17-cell.g17-win {
            background: #d62839 !important;
            animation: g17-pulse 0.6s infinite alternate;
          }
          @keyframes g17-pulse {
            from { transform: scale(1); }
            to { transform: scale(1.06); }
          }
          .g17-btn {
            background: #d62839;
            color: #f5f9ff;
            border: 2px solid #f4c430;
            padding: 12px 24px;
            font-size: 1rem;
            font-weight: bold;
            border-radius: 8px;
            cursor: pointer;
            min-height: 44px;
            min-width: 120px;
            margin-top: 4px;
            transition: background-color 0.2s;
          }
          .g17-btn:hover, .g17-btn:focus-visible {
            background: #ef2d42;
          }
        `;
        document.head.appendChild(style);
      }

      root.innerHTML = `
        <div class="g17-wrap">
          <div class="g17-title">🌲 Tic-Tac-Toe ⭐</div>
          <div class="g17-status" id="g17-status">Du bist 🌲! Du fängst an.</div>
          <div class="g17-grid" id="g17-grid"></div>
          <div id="g17-action"></div>
        </div>
      `;

      const gridEl = root.querySelector('#g17-grid');
      const statusEl = root.querySelector('#g17-status');
      const actionEl = root.querySelector('#g17-action');

      let board = Array(9).fill(null);
      let turn = 'user';
      let gameOver = false;
      let wonCalled = false;
      let pendingTimeout = null;

      const lines = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
      ];

      function render() {
        gridEl.innerHTML = '';
        board.forEach((val, i) => {
          const btn = document.createElement('button');
          btn.className = 'g17-cell';
          btn.setAttribute('aria-label', `Feld ${i+1}`);
          btn.dataset.index = i;
          if (val === 'X') btn.textContent = '🌲';
          else if (val === 'O') btn.textContent = '⭐';
          else btn.textContent = '';

          if (val || gameOver || turn !== 'user') {
            btn.disabled = true;
          }

          btn.addEventListener('click', () => handleUserMove(i));
          gridEl.appendChild(btn);
        });
      }

      function checkWinner(b) {
        for (let l of lines) {
          const [a, bIdx, c] = l;
          if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
            return { winner: b[a], line: l };
          }
        }
        if (b.every(cell => cell !== null)) {
          return { winner: 'draw', line: [] };
        }
        return null;
      }

      function handleUserMove(idx) {
        if (board[idx] || gameOver || turn !== 'user') return;

        board[idx] = 'X';
        render();

        const res = checkWinner(board);
        if (res) {
          endGame(res);
        } else {
          turn = 'ai';
          statusEl.textContent = "Sternen-Bot überlegt...";
          const delay = root.__fast ? 40 : 300;
          pendingTimeout = setTimeout(() => {
            if (root.isConnected) aiMove();
          }, delay);
        }
      }

      function aiMove() {
        if (gameOver) return;

        let chosen = -1;

        // 1. Can AI win immediately?
        const aiWinMove = findWinningMove('O');
        if (aiWinMove !== -1 && Math.random() < 0.7) {
          chosen = aiWinMove;
        }

        // 2. Can Player win immediately? Block it with moderate chance (making AI beatable)
        if (chosen === -1) {
          const playerWinMove = findWinningMove('X');
          if (playerWinMove !== -1 && Math.random() < 0.5) {
            chosen = playerWinMove;
          }
        }

        // 3. Otherwise pick random open cell
        if (chosen === -1) {
          const empty = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
          if (empty.length > 0) {
            chosen = empty[Math.floor(Math.random() * empty.length)];
          }
        }

        if (chosen !== -1) {
          board[chosen] = 'O';
        }

        render();

        const res = checkWinner(board);
        if (res) {
          endGame(res);
        } else {
          turn = 'user';
          statusEl.textContent = "Du bist am Zug! 🌲";
          render();
        }
      }

      function findWinningMove(symbol) {
        for (let l of lines) {
          const [a, bIdx, c] = l;
          const vals = [board[a], board[bIdx], board[c]];
          if (vals.filter(v => v === symbol).length === 2 && vals.includes(null)) {
            if (board[a] === null) return a;
            if (board[bIdx] === null) return bIdx;
            if (board[c] === null) return c;
          }
        }
        return -1;
      }

      function endGame(res) {
        gameOver = true;
        render();

        if (res.winner === 'X') {
          statusEl.textContent = "🎉 Gewonnen! Dreier-Reihe mit 🌲!";
          res.line.forEach(i => {
            if (gridEl.children[i]) gridEl.children[i].classList.add('g17-win');
          });
          if (!wonCalled) {
            wonCalled = true;
            win();
          }
        } else if (res.winner === 'O') {
          statusEl.textContent = "⭐ Der Sternen-Bot hat gewonnen!";
          res.line.forEach(i => {
            if (gridEl.children[i]) gridEl.children[i].classList.add('g17-win');
          });
          showRestartBtn();
        } else {
          statusEl.textContent = "🤝 Unentschieden!";
          showRestartBtn();
        }
      }

      function showRestartBtn() {
        actionEl.innerHTML = '<button class="g17-btn" id="g17-btn-restart">Nochmal</button>';
        const btn = actionEl.querySelector('#g17-btn-restart');
        btn.addEventListener('click', reset);
      }

      function reset() {
        if (pendingTimeout) clearTimeout(pendingTimeout);
        board = Array(9).fill(null);
        turn = 'user';
        gameOver = false;
        actionEl.innerHTML = '';
        statusEl.textContent = "Du bist 🌲! Du fängst an.";
        render();
      }

      reset();

      const cleanupCheck = setInterval(() => {
        if (!root.isConnected) {
          clearInterval(cleanupCheck);
          if (pendingTimeout) clearTimeout(pendingTimeout);
        }
      }, 400);

      root._g17_state = () => ({ board, turn, gameOver, wonCalled });
    },

    async bot(root){
      const sleep = (ms) => new Promise(r => setTimeout(r, root.__fast ? Math.max(10, ms / 5) : ms));

      while (root.isConnected) {
        const state = root._g17_state ? root._g17_state() : null;
        if (!state || state.wonCalled) break;

        if (state.gameOver) {
          const restartBtn = root.querySelector('#g17-btn-restart');
          if (restartBtn) {
            restartBtn.click();
            await sleep(80);
            continue;
          }
        }

        if (state.turn === 'user' && !state.gameOver) {
          const b = state.board;
          const lines = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
          ];

          let target = -1;

          // Win if possible
          for (let l of lines) {
            const [a, bIdx, c] = l;
            const vals = [b[a], b[bIdx], b[c]];
            if (vals.filter(v => v === 'X').length === 2 && vals.includes(null)) {
              target = l[vals.indexOf(null)];
              break;
            }
          }

          // Block O
          if (target === -1) {
            for (let l of lines) {
              const [a, bIdx, c] = l;
              const vals = [b[a], b[bIdx], b[c]];
              if (vals.filter(v => v === 'O').length === 2 && vals.includes(null)) {
                target = l[vals.indexOf(null)];
                break;
              }
            }
          }

          // Center
          if (target === -1 && b[4] === null) target = 4;

          // Corner
          if (target === -1) {
            const corners = [0, 2, 6, 8].filter(i => b[i] === null);
            if (corners.length > 0) target = corners[Math.floor(Math.random() * corners.length)];
          }

          // Any open cell
          if (target === -1) {
            const open = b.map((v, i) => v === null ? i : null).filter(v => v !== null);
            if (open.length > 0) target = open[0];
          }

          if (target !== -1) {
            const cells = root.querySelectorAll('.g17-cell');
            if (cells[target]) {
              cells[target].click();
            }
          }
        }

        await sleep(100);
      }
    }
  };
})();