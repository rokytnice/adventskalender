(function(){
  if (typeof window.Games === 'undefined') window.Games = {};

  if (!document.getElementById('g9-style')) {
    const style = document.createElement('style');
    style.id = 'g9-style';
    style.textContent = `
      .g9-wrap {
        background: #0b1d33;
        color: #f5f9ff;
        font-family: system-ui, -apple-system, sans-serif;
        padding: 12px;
        border-radius: 12px;
        box-sizing: border-box;
        width: 100%;
        max-width: 440px;
        margin: 0 auto;
        text-align: center;
        user-select: none;
        position: relative;
      }
      .g9-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        gap: 8px;
      }
      .g9-badge {
        background: rgba(255,255,255,0.08);
        padding: 6px 12px;
        border-radius: 20px;
        border: 1px solid #f4c430;
        color: #f4c430;
        font-size: 13px;
        font-weight: bold;
      }
      .g9-board-container {
        position: relative;
        width: 100%;
        padding-bottom: 100%;
        background: #050d17;
        border-radius: 12px;
        border: 3px solid #f4c430;
        overflow: hidden;
        box-shadow: 0 6px 20px rgba(0,0,0,0.6);
      }
      .g9-board {
        position: absolute;
        inset: 0;
        padding: 4px;
        box-sizing: border-box;
      }
      .g9-tile {
        position: absolute;
        width: calc(33.333% - 6px);
        height: calc(33.333% - 6px);
        box-sizing: border-box;
        border-radius: 8px;
        border: 2px solid #f4c430;
        cursor: pointer;
        transition: left 0.15s ease-out, top 0.15s ease-out;
        box-shadow: inset 0 0 8px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3);
        touch-action: manipulation;
        background-repeat: no-repeat;
      }
      .g9-tile:active {
        border-color: #f5f9ff;
      }
      .g9-tile-num {
        position: absolute;
        top: 4px;
        left: 4px;
        background: rgba(11, 29, 51, 0.85);
        color: #f4c430;
        font-size: 11px;
        font-weight: bold;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #f4c430;
        pointer-events: none;
      }
      .g9-controls {
        margin-top: 12px;
        display: flex;
        gap: 8px;
        justify-content: center;
      }
      .g9-btn {
        background: #d62839;
        color: #f5f9ff;
        border: 1px solid #f4c430;
        padding: 10px 16px;
        min-height: 44px;
        min-width: 44px;
        border-radius: 8px;
        font-weight: bold;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      }
      .g9-btn:active {
        transform: scale(0.96);
      }
      .g9-btn-sec {
        background: #1f7a4d;
      }
      .g9-overlay {
        position: absolute;
        inset: 0;
        background: rgba(11, 29, 51, 0.94);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
        border-radius: 12px;
        padding: 16px;
      }
      .g9-title {
        font-size: 22px;
        color: #f4c430;
        margin-bottom: 8px;
        font-weight: bold;
      }
      .g9-msg {
        font-size: 15px;
        color: #f5f9ff;
        margin-bottom: 16px;
      }
    `;
    document.head.appendChild(style);
  }

  function createFestiveImage() {
    const cv = document.createElement('canvas');
    cv.width = 300;
    cv.height = 300;
    const ctx = cv.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 300);
    grad.addColorStop(0, '#0b1d33');
    grad.addColorStop(1, '#050d17');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 300, 300);

    ctx.fillStyle = '#f5f9ff';
    const dots = [[30,30],[270,40],[40,110],[260,130],[70,210],[230,220],[150,25],[25,260],[275,270]];
    dots.forEach(([x,y]) => {
      ctx.beginPath();
      ctx.arc(x, y, (x*y)%3 + 1.5, 0, Math.PI*2);
      ctx.fill();
    });

    ctx.fillStyle = '#1f7a4d';
    ctx.beginPath();
    ctx.moveTo(150, 35);
    ctx.lineTo(90, 110); ctx.lineTo(115, 110);
    ctx.lineTo(65, 175); ctx.lineTo(95, 175);
    ctx.lineTo(45, 235); ctx.lineTo(255, 235);
    ctx.lineTo(205, 175); ctx.lineTo(235, 175);
    ctx.lineTo(185, 110); ctx.lineTo(210, 110);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(135, 235, 30, 30);

    ctx.fillStyle = '#f4c430';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⭐', 150, 35);

    const ornaments = [
      [150, 80, '#d62839'], [130, 130, '#f4c430'], [170, 140, '#d62839'],
      [105, 195, '#f4c430'], [150, 185, '#3a86ff'], [195, 205, '#d62839']
    ];
    ornaments.forEach(([x, y, color]) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI*2);
      ctx.fill();
    });

    ctx.fillStyle = '#d62839';
    ctx.fillRect(80, 242, 32, 26);
    ctx.fillStyle = '#f4c430';
    ctx.fillRect(93, 242, 6, 26);

    ctx.fillStyle = '#3a86ff';
    ctx.fillRect(188, 246, 28, 22);
    ctx.fillStyle = '#f5f9ff';
    ctx.fillRect(199, 246, 5, 22);

    ctx.fillStyle = '#f4c430';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('🎄 FROHE WEIHNACHTEN 🎄', 150, 288);

    return cv.toDataURL();
  }

  function manhattan(board) {
    let dist = 0;
    for (let i = 0; i < 9; i++) {
      const val = board[i];
      if (val !== 0) {
        const tr = Math.floor((val - 1) / 3);
        const tc = (val - 1) % 3;
        const cr = Math.floor(i / 3);
        const cc = i % 3;
        dist += Math.abs(tr - cr) + Math.abs(tc - cc);
      }
    }
    return dist;
  }

  function solvePuzzle(startBoard) {
    const targetKey = '1,2,3,4,5,6,7,8,0';
    if (startBoard.join(',') === targetKey) return [];

    const pq = [];
    const visited = new Map();

    const startNode = {
      board: startBoard.slice(),
      g: 0,
      h: manhattan(startBoard),
      parent: null,
      movedTile: null
    };
    startNode.f = startNode.g + startNode.h;

    pq.push(startNode);
    visited.set(startBoard.join(','), 0);

    while (pq.length > 0) {
      let minIdx = 0;
      for (let i = 1; i < pq.length; i++) {
        if (pq[i].f < pq[minIdx].f) minIdx = i;
      }
      const current = pq.splice(minIdx, 1)[0];

      if (current.board.join(',') === targetKey) {
        const path = [];
        let curr = current;
        while (curr.parent) {
          path.unshift(curr.movedTile);
          curr = curr.parent;
        }
        return path;
      }

      const blank = current.board.indexOf(0);
      const r = Math.floor(blank / 3);
      const c = Math.floor(blank % 3);

      const adj = [];
      if (r > 0) adj.push(blank - 3);
      if (r < 2) adj.push(blank + 3);
      if (c > 0) adj.push(blank - 1);
      if (c < 2) adj.push(blank + 1);

      for (let pos of adj) {
        const newBoard = current.board.slice();
        const tileVal = newBoard[pos];
        newBoard[blank] = tileVal;
        newBoard[pos] = 0;

        const newKey = newBoard.join(',');
        const newG = current.g + 1;

        if (!visited.has(newKey) || newG < visited.get(newKey)) {
          visited.set(newKey, newG);
          const h = manhattan(newBoard);
          pq.push({
            board: newBoard,
            g: newG,
            h: h,
            f: newG + h,
            parent: current,
            movedTile: tileVal
          });
        }
      }
    }
    return [];
  }

  Games[9] = {
    title: "Weihnachts-Schiebepuzzle",
    hint: "Klicke oder nutze die Pfeiltasten, um das Weihnachtsbild zu vervollständigen!",

    init(root, win) {
      root.innerHTML = '';
      const bgImg = createFestiveImage();

      let board = [1, 2, 3, 4, 5, 6, 7, 8, 0];
      let moveCount = 0;
      let timeLeft = 180;
      let timerId = null;
      let isWon = false;
      let isGameOver = false;

      function shuffleBoard() {
        board = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        let lastBlank = -1;
        const shuffleSteps = 40;
        for (let i = 0; i < shuffleSteps; i++) {
          const blank = board.indexOf(0);
          const r = Math.floor(blank / 3);
          const c = blank % 3;
          const validMoves = [];
          if (r > 0 && blank - 3 !== lastBlank) validMoves.push(blank - 3);
          if (r < 2 && blank + 3 !== lastBlank) validMoves.push(blank + 3);
          if (c > 0 && blank - 1 !== lastBlank) validMoves.push(blank - 1);
          if (c < 2 && blank + 1 !== lastBlank) validMoves.push(blank + 1);

          const choice = validMoves[Math.floor(Math.random() * validMoves.length)];
          lastBlank = blank;
          board[blank] = board[choice];
          board[choice] = 0;
        }
      }

      shuffleBoard();

      const wrap = document.createElement('div');
      wrap.className = 'g9-wrap';

      const header = document.createElement('div');
      header.className = 'g9-header';
      header.innerHTML = `
        <div class="g9-badge" id="g9-moves">Züge: 0</div>
        <div class="g9-badge" id="g9-timer">Zeit: 180s</div>
      `;
      wrap.appendChild(header);

      const boardContainer = document.createElement('div');
      boardContainer.className = 'g9-board-container';

      const boardEl = document.createElement('div');
      boardEl.className = 'g9-board';
      boardContainer.appendChild(boardEl);

      const overlay = document.createElement('div');
      overlay.className = 'g9-overlay';
      overlay.style.display = 'none';
      boardContainer.appendChild(overlay);

      wrap.appendChild(boardContainer);

      const controls = document.createElement('div');
      controls.className = 'g9-controls';
      const resetBtn = document.createElement('button');
      resetBtn.className = 'g9-btn g9-btn-sec';
      resetBtn.textContent = '🔄 Neu Mischen';
      resetBtn.onclick = () => resetGame();
      controls.appendChild(resetBtn);
      wrap.appendChild(controls);

      root.appendChild(wrap);

      const tileEls = {};

      function createTiles() {
        boardEl.innerHTML = '';
        for (let v = 1; v <= 8; v++) {
          const tile = document.createElement('div');
          tile.className = 'g9-tile';
          tile.style.backgroundImage = `url("${bgImg}")`;
          tile.style.backgroundSize = '300% 300%';

          const rTarget = Math.floor((v - 1) / 3);
          const cTarget = (v - 1) % 3;
          tile.style.backgroundPosition = `${cTarget * 50}% ${rTarget * 50}%`;

          const num = document.createElement('div');
          num.className = 'g9-tile-num';
          num.textContent = v;
          tile.appendChild(num);

          tile.addEventListener('click', () => handleTileClick(v));
          tileEls[v] = tile;
          boardEl.appendChild(tile);
        }
      }

      function updateTilePositions() {
        for (let i = 0; i < 9; i++) {
          const v = board[i];
          if (v !== 0 && tileEls[v]) {
            const r = Math.floor(i / 3);
            const c = i % 3;
            tileEls[v].style.left = `calc(${c * 33.333}% + 3px)`;
            tileEls[v].style.top = `calc(${r * 33.333}% + 3px)`;
          }
        }
      }

      function handleTileClick(v) {
        if (isWon || isGameOver) return;
        const idx = board.indexOf(v);
        const blank = board.indexOf(0);

        const r1 = Math.floor(idx / 3), c1 = idx % 3;
        const r2 = Math.floor(blank / 3), c2 = blank % 3;

        if ((Math.abs(r1 - r2) === 1 && c1 === c2) || (Math.abs(c1 - c2) === 1 && r1 === r2)) {
          moveTile(v);
        }
      }

      function moveTile(v) {
        const idx = board.indexOf(v);
        const blank = board.indexOf(0);
        board[blank] = v;
        board[idx] = 0;
        moveCount++;

        const movesEl = root.querySelector('#g9-moves');
        if (movesEl) movesEl.textContent = `Züge: ${moveCount}`;

        updateTilePositions();
        checkWin();
      }

      function checkWin() {
        const target = '1,2,3,4,5,6,7,8,0';
        if (board.join(',') === target) {
          isWon = true;
          clearInterval(timerId);

          const tile9 = document.createElement('div');
          tile9.className = 'g9-tile';
          tile9.style.backgroundImage = `url("${bgImg}")`;
          tile9.style.backgroundSize = '300% 300%';
          tile9.style.backgroundPosition = '100% 100%';
          tile9.style.left = 'calc(66.666% + 3px)';
          tile9.style.top = 'calc(66.666% + 3px)';
          boardEl.appendChild(tile9);

          setTimeout(() => {
            win();
          }, 300);
        }
      }

      function gameOver() {
        isGameOver = true;
        clearInterval(timerId);
        overlay.style.display = 'flex';
        overlay.innerHTML = `
          <div class="g9-title">Zeit abgelaufen! ❄️</div>
          <div class="g9-msg">Versuche es noch einmal!</div>
          <button class="g9-btn" id="g9-retry-btn">Nochmal</button>
        `;
        overlay.querySelector('#g9-retry-btn').onclick = () => resetGame();
      }

      function resetGame() {
        isWon = false;
        isGameOver = false;
        moveCount = 0;
        timeLeft = 180;
        overlay.style.display = 'none';
        const movesEl = root.querySelector('#g9-moves');
        const timerEl = root.querySelector('#g9-timer');
        if (movesEl) movesEl.textContent = 'Züge: 0';
        if (timerEl) timerEl.textContent = 'Zeit: 180s';

        shuffleBoard();
        createTiles();
        updateTilePositions();
        startTimer();
      }

      function startTimer() {
        if (timerId) clearInterval(timerId);
        const speed = root.__fast ? 200 : 1000;
        timerId = setInterval(() => {
          if (!root.isConnected) {
            clearInterval(timerId);
            return;
          }
          timeLeft--;
          const timerEl = root.querySelector('#g9-timer');
          if (timerEl) timerEl.textContent = `Zeit: ${timeLeft}s`;

          if (timeLeft <= 0) {
            gameOver();
          }
        }, speed);
      }

      const handleKeyDown = (e) => {
        if (!root.isConnected) {
          window.removeEventListener('keydown', handleKeyDown);
          return;
        }
        if (isWon || isGameOver) return;

        const blank = board.indexOf(0);
        const r = Math.floor(blank / 3);
        const c = blank % 3;
        let targetIdx = -1;

        if (e.key === 'ArrowUp' && r < 2) targetIdx = blank + 3;
        else if (e.key === 'ArrowDown' && r > 0) targetIdx = blank - 3;
        else if (e.key === 'ArrowLeft' && c < 2) targetIdx = blank + 1;
        else if (e.key === 'ArrowRight' && c > 0) targetIdx = blank - 1;

        if (targetIdx !== -1) {
          e.preventDefault();
          moveTile(board[targetIdx]);
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      root.__g9_state = {
        getBoard: () => board.slice(),
        moveTile: (v) => moveTile(v)
      };

      createTiles();
      updateTilePositions();
      startTimer();
    },

    bot: async function(root) {
      const speed = root.__fast ? 20 : 120;
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      while (root.isConnected) {
        const state = root.__g9_state;
        if (!state) {
          await delay(50);
          continue;
        }

        const curBoard = state.getBoard();
        const path = solvePuzzle(curBoard);

        for (let tileVal of path) {
          if (!root.isConnected) return;
          state.moveTile(tileVal);
          await delay(speed);
        }

        if (state.getBoard().join(',') === '1,2,3,4,5,6,7,8,0') {
          break;
        }
        await delay(100);
      }
    }
  };
})();