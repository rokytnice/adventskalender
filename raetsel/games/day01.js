(function(){
  if (typeof window.Games === 'undefined') {
    window.Games = {};
  }

  const EMOJIS = ['🎄', '🎁', '⭐', '🎅'];
  const SOLUTION = [
    [0, 1, 2, 3],
    [2, 3, 0, 1],
    [1, 0, 3, 2],
    [3, 2, 1, 0]
  ];
  const INITIAL = [
    [0, -1, 2, -1],
    [-1, 3, -1, 1],
    [1, -1, 3, -1],
    [-1, 2, -1, 0]
  ];

  function injectCSS() {
    if (document.getElementById('g1-style')) return;
    const style = document.createElement('style');
    style.id = 'g1-style';
    style.textContent = `
      .g1-wrap {
        background-color: #0b1d33;
        color: #f5f9ff;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        padding: 16px;
        border-radius: 12px;
        max-width: 100%;
        box-sizing: border-box;
        text-align: center;
        user-select: none;
      }
      .g1-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .g1-title {
        font-size: 1.1rem;
        font-weight: bold;
        color: #f4c430;
      }
      .g1-timer {
        font-size: 0.95rem;
        background: #1f7a4d;
        padding: 6px 12px;
        border-radius: 16px;
        font-weight: bold;
      }
      .g1-grid-container {
        display: flex;
        justify-content: center;
        margin: 12px 0;
      }
      .g1-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
        background: #f4c430;
        padding: 8px;
        border-radius: 10px;
        width: 100%;
        max-width: 320px;
        box-sizing: border-box;
      }
      .g1-cell {
        aspect-ratio: 1;
        background: #0b1d33;
        border: 2px solid transparent;
        border-radius: 6px;
        font-size: 1.6rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        min-width: 44px;
        min-height: 44px;
        outline: none;
        transition: background 0.15s, border-color 0.15s;
        box-sizing: border-box;
      }
      .g1-cell[data-r="1"] { margin-bottom: 4px; }
      .g1-cell[data-c="1"] { margin-right: 4px; }
      .g1-cell.g1-fixed {
        background: #1f7a4d;
        color: #f5f9ff;
        cursor: default;
      }
      .g1-cell.g1-selected {
        border-color: #d62839;
        background: #183354;
        box-shadow: 0 0 6px #f4c430;
      }
      .g1-palette {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 16px;
        flex-wrap: wrap;
      }
      .g1-pal-btn {
        width: 52px;
        height: 52px;
        font-size: 1.5rem;
        background: #1f7a4d;
        border: 2px solid #f4c430;
        border-radius: 8px;
        color: #f5f9ff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 44px;
        min-height: 44px;
        outline: none;
      }
      .g1-pal-btn:active {
        transform: scale(0.95);
        background: #d62839;
      }
      .g1-pal-btn.g1-clear {
        background: #d62839;
        font-size: 1.1rem;
        font-weight: bold;
      }
      .g1-status-box {
        margin-top: 14px;
        padding: 10px;
        border-radius: 8px;
        background: #d62839;
        color: #f5f9ff;
        font-weight: bold;
      }
      .g1-btn-again {
        margin-top: 8px;
        padding: 10px 20px;
        font-size: 1rem;
        font-weight: bold;
        background: #f4c430;
        color: #0b1d33;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        min-height: 44px;
      }
    `;
    document.head.appendChild(style);
  }

  Games[1] = {
    title: "Weihnachts-Sudoku",
    hint: "Fülle das 4x4-Gitter so aus, dass jedes Emoji in jeder Zeile, Spalte und 2x2-Box genau einmal vorkommt.",
    
    init(root, win) {
      injectCSS();

      let gridState = INITIAL.map(row => [...row]);
      let selectedCell = null;
      let timeLeft = 90;
      let isWon = false;
      let isLost = false;
      let hasCalledWin = false;
      let timerInterval = null;

      const self = this;

      function render() {
        root.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.className = 'g1-wrap';

        const header = document.createElement('div');
        header.className = 'g1-header';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'g1-title';
        titleEl.textContent = '🎄 Mini-Sudoku 4x4';

        const timerEl = document.createElement('div');
        timerEl.className = 'g1-timer';
        timerEl.textContent = `⏱️ ${timeLeft}s`;

        header.appendChild(titleEl);
        header.appendChild(timerEl);
        wrap.appendChild(header);

        const gridContainer = document.createElement('div');
        gridContainer.className = 'g1-grid-container';

        const gridEl = document.createElement('div');
        gridEl.className = 'g1-grid';

        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            const cellBtn = document.createElement('button');
            cellBtn.className = 'g1-cell';
            cellBtn.setAttribute('data-r', r);
            cellBtn.setAttribute('data-c', c);

            const isFixed = INITIAL[r][c] !== -1;
            if (isFixed) {
              cellBtn.classList.add('g1-fixed');
            } else if (selectedCell && selectedCell.r === r && selectedCell.c === c) {
              cellBtn.classList.add('g1-selected');
            }

            const val = gridState[r][c];
            cellBtn.textContent = val !== -1 ? EMOJIS[val] : '';

            if (!isWon && !isLost && !isFixed) {
              cellBtn.addEventListener('click', () => {
                selectedCell = { r, c };
                updateGridVisuals();
              });
            }

            gridEl.appendChild(cellBtn);
          }
        }
        gridContainer.appendChild(gridEl);
        wrap.appendChild(gridContainer);

        if (!isWon && !isLost) {
          const palette = document.createElement('div');
          palette.className = 'g1-palette';

          EMOJIS.forEach((emoji, idx) => {
            const btn = document.createElement('button');
            btn.className = 'g1-pal-btn';
            btn.setAttribute('data-val', idx);
            btn.textContent = emoji;
            btn.addEventListener('click', () => {
              if (selectedCell) {
                gridState[selectedCell.r][selectedCell.c] = idx;
                updateGridVisuals();
                checkWinCondition();
              }
            });
            palette.appendChild(btn);
          });

          const eraseBtn = document.createElement('button');
          eraseBtn.className = 'g1-pal-btn g1-clear';
          eraseBtn.setAttribute('data-val', -1);
          eraseBtn.textContent = '❌';
          eraseBtn.addEventListener('click', () => {
            if (selectedCell) {
              gridState[selectedCell.r][selectedCell.c] = -1;
              updateGridVisuals();
            }
          });
          palette.appendChild(eraseBtn);

          wrap.appendChild(palette);
        }

        if (isLost) {
          const statusBox = document.createElement('div');
          statusBox.className = 'g1-status-box';
          statusBox.textContent = 'Zeit abgelaufen! ❄️';
          
          const resetBtn = document.createElement('button');
          resetBtn.className = 'g1-btn-again';
          resetBtn.textContent = 'Nochmal';
          resetBtn.addEventListener('click', () => {
            if (timerInterval) clearInterval(timerInterval);
            self.init(root, win);
          });

          statusBox.appendChild(document.createElement('br'));
          statusBox.appendChild(resetBtn);
          wrap.appendChild(statusBox);
        }

        root.appendChild(wrap);

        function updateGridVisuals() {
          const cells = gridEl.querySelectorAll('.g1-cell');
          cells.forEach(cell => {
            const r = parseInt(cell.getAttribute('data-r'), 10);
            const c = parseInt(cell.getAttribute('data-c'), 10);
            const isFixed = INITIAL[r][c] !== -1;
            
            cell.classList.remove('g1-selected');
            if (!isFixed && selectedCell && selectedCell.r === r && selectedCell.c === c) {
              cell.classList.add('g1-selected');
            }

            const val = gridState[r][c];
            cell.textContent = val !== -1 ? EMOJIS[val] : '';
          });
        }

        function checkWinCondition() {
          let solved = true;
          for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
              if (gridState[r][c] !== SOLUTION[r][c]) {
                solved = false;
                break;
              }
            }
          }
          if (solved && !hasCalledWin) {
            isWon = true;
            hasCalledWin = true;
            if (timerInterval) clearInterval(timerInterval);
            win();
          }
        }
      }

      render();

      const intervalSpeed = root.__fast ? 200 : 1000;
      timerInterval = setInterval(() => {
        if (!root.isConnected) {
          clearInterval(timerInterval);
          return;
        }
        if (isWon || isLost) return;

        timeLeft--;
        const timerEl = root.querySelector('.g1-timer');
        if (timerEl) {
          timerEl.textContent = `⏱️ ${timeLeft}s`;
        }

        if (timeLeft <= 0) {
          isLost = true;
          clearInterval(timerInterval);
          render();
        }
      }, intervalSpeed);
    },

    async bot(root) {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      const speed = root.__fast ? 20 : 80;

      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (!root.isConnected) return;
          if (INITIAL[r][c] === -1) {
            const targetVal = SOLUTION[r][c];
            
            const cell = root.querySelector(`.g1-cell[data-r="${r}"][data-c="${c}"]`);
            if (cell) {
              cell.click();
              await sleep(speed);
            }

            const palBtn = root.querySelector(`.g1-pal-btn[data-val="${targetVal}"]`);
            if (palBtn) {
              palBtn.click();
              await sleep(speed);
            }
          }
        }
      }
    }
  };
})();