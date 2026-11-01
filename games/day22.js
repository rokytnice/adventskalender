(function(){
 Games[22] = {
  title: "Weihnachts-2048",
  hint: "Verschiebe die Kacheln mit Wischen, Pfeiltasten oder Buttons bis zum Weihnachtsmann (256)!",
  init(root, win){
    root.innerHTML = "";

    const style = document.createElement("style");
    style.textContent = `
      .g22-wrap {
        width: 100%;
        max-width: 420px;
        margin: 0 auto;
        padding: 12px;
        box-sizing: border-box;
        background: #0b1d33;
        color: #f5f9ff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        text-align: center;
        user-select: none;
        -webkit-user-select: none;
        border-radius: 16px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.5);
      }
      .g22-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .g22-title {
        font-size: 1.25rem;
        font-weight: bold;
        color: #f4c430;
        text-shadow: 0 1px 3px rgba(0,0,0,0.4);
      }
      .g22-score-box {
        background: #1f7a4d;
        padding: 6px 14px;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: bold;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
      }
      .g22-grid {
        position: relative;
        width: 100%;
        max-width: 360px;
        height: 320px;
        margin: 0 auto 14px auto;
        background: #071322;
        border-radius: 12px;
        padding: 8px;
        box-sizing: border-box;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(4, 1fr);
        gap: 8px;
        touch-action: none;
      }
      .g22-cell {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: relative;
      }
      .g22-tile {
        width: 100%;
        height: 100%;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        transition: transform 0.1s ease-in-out;
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      }
      .g22-tile-pop {
        animation: g22-pop 0.18s ease;
      }
      @keyframes g22-pop {
        0% { transform: scale(0.6); }
        70% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      .g22-icon {
        font-size: 1.6rem;
        line-height: 1.1;
      }
      .g22-val {
        font-size: 0.75rem;
        opacity: 0.9;
        margin-top: 1px;
      }
      /* Tile theme colors */
      .g22-t2   { background: #1b3858; color: #f5f9ff; }
      .g22-t4   { background: #1f7a4d; color: #f5f9ff; }
      .g22-t8   { background: #268b59; color: #f5f9ff; }
      .g22-t16  { background: #d62839; color: #f5f9ff; }
      .g22-t32  { background: #b01a2b; color: #f5f9ff; }
      .g22-t64  { background: #88121f; color: #f4c430; }
      .g22-t128 { background: #b78a0d; color: #ffffff; }
      .g22-t256 { background: #f4c430; color: #0b1d33; box-shadow: 0 0 16px #f4c430; }

      .g22-dpad {
        display: grid;
        grid-template-columns: repeat(3, 56px);
        grid-template-rows: repeat(2, 50px);
        gap: 6px;
        justify-content: center;
        margin-top: 8px;
      }
      .g22-btn {
        background: #1f7a4d;
        color: #f5f9ff;
        border: none;
        border-radius: 8px;
        font-size: 1.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        min-height: 48px;
        min-width: 48px;
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        outline: none;
      }
      .g22-btn:active {
        background: #d62839;
        transform: translateY(2px);
      }
      .g22-overlay {
        position: absolute;
        inset: 0;
        background: rgba(11, 29, 51, 0.9);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10;
        padding: 16px;
      }
      .g22-overlay-title {
        font-size: 1.4rem;
        font-weight: bold;
        margin-bottom: 12px;
      }
      .g22-retry-btn {
        background: #d62839;
        color: #f5f9ff;
        border: 2px solid #f4c430;
        padding: 10px 24px;
        font-size: 1rem;
        font-weight: bold;
        border-radius: 8px;
        cursor: pointer;
        min-height: 44px;
      }
      .g22-retry-btn:hover {
        background: #b01a2b;
      }
    `;
    root.appendChild(style);

    const wrap = document.createElement("div");
    wrap.className = "g22-wrap";
    wrap.innerHTML = `
      <div class="g22-header">
        <span class="g22-title">🎄 Weihnachts-2048</span>
        <div class="g22-score-box">Punkte: <span id="g22-score">0</span></div>
      </div>
      <div class="g22-grid" id="g22-grid-board"></div>
      <div class="g22-dpad">
        <div></div>
        <button class="g22-btn" id="g22-btn-up" aria-label="Hoch">▲</button>
        <div></div>
        <button class="g22-btn" id="g22-btn-left" aria-label="Links">◀</button>
        <button class="g22-btn" id="g22-btn-down" aria-label="Runter">▼</button>
        <button class="g22-btn" id="g22-btn-right" aria-label="Rechts">▶</button>
      </div>
    `;
    root.appendChild(wrap);

    const boardEl = wrap.querySelector("#g22-grid-board");
    const scoreEl = wrap.querySelector("#g22-score");

    const SYMBOLS = {
      2:   { icon: "❄️", cls: "g22-t2" },
      4:   { icon: "🕯️", cls: "g22-t4" },
      8:   { icon: "🔔", cls: "g22-t8" },
      16:  { icon: "🍪", cls: "g22-t16" },
      32:  { icon: "🎁", cls: "g22-t32" },
      64:  { icon: "🦌", cls: "g22-t64" },
      128: { icon: "🎄", cls: "g22-t128" },
      256: { icon: "🎅", cls: "g22-t256" }
    };

    let grid = [
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0]
    ];
    let score = 0;
    let won = false;
    let gameOver = false;

    function renderBoard(justAddedR = -1, justAddedC = -1) {
      boardEl.innerHTML = "";
      scoreEl.textContent = score;

      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const cell = document.createElement("div");
          cell.className = "g22-cell";
          const val = grid[r][c];
          if (val > 0) {
            const sym = SYMBOLS[val] || { icon: "⭐", cls: "g22-t256" };
            const tile = document.createElement("div");
            tile.className = `g22-tile ${sym.cls}`;
            if (r === justAddedR && c === justAddedC) {
              tile.classList.add("g22-tile-pop");
            }
            tile.innerHTML = `<span class="g22-icon">${sym.icon}</span><span class="g22-val">${val}</span>`;
            cell.appendChild(tile);
          }
          boardEl.appendChild(cell);
        }
      }

      if (gameOver && !won) {
        showOverlay("Verloren! ❄️", "Nochmal");
      }
    }

    function showOverlay(title, btnText) {
      const over = document.createElement("div");
      over.className = "g22-overlay";
      over.innerHTML = `
        <div class="g22-overlay-title" style="color: ${won ? '#f4c430' : '#d62839'}">${title}</div>
        <button class="g22-retry-btn">${btnText}</button>
      `;
      over.querySelector("button").addEventListener("click", () => {
        resetGame();
      });
      boardEl.appendChild(over);
    }

    function spawnRandom() {
      const empty = [];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (grid[r][c] === 0) empty.push({ r, c });
        }
      }
      if (empty.length === 0) return null;
      const spot = empty[Math.floor(Math.random() * empty.length)];
      const val = Math.random() < 0.9 ? 2 : 4;
      grid[spot.r][spot.c] = val;
      return spot;
    }

    function canMove() {
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (grid[r][c] === 0) return true;
          if (c < 3 && grid[r][c] === grid[r][c + 1]) return true;
          if (r < 3 && grid[r][c] === grid[r + 1][c]) return true;
        }
      }
      return false;
    }

    function slideAndCombine(line) {
      let filtered = line.filter(v => v !== 0);
      let gained = 0;
      for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
          filtered[i] *= 2;
          gained += filtered[i];
          filtered.splice(i + 1, 1);
        }
      }
      while (filtered.length < 4) {
        filtered.push(0);
      }
      return { line: filtered, gained };
    }

    // dir: 0: up, 1: right, 2: down, 3: left
    function move(dir) {
      if (gameOver || won) return false;

      let moved = false;
      let totalGained = 0;

      for (let i = 0; i < 4; i++) {
        let line = [];
        for (let j = 0; j < 4; j++) {
          if (dir === 0) line.push(grid[j][i]);      // Up
          else if (dir === 1) line.push(grid[i][3 - j]); // Right
          else if (dir === 2) line.push(grid[3 - j][i]); // Down
          else if (dir === 3) line.push(grid[i][j]);     // Left
        }

        const res = slideAndCombine(line);
        totalGained += res.gained;

        for (let j = 0; j < 4; j++) {
          let origVal;
          if (dir === 0) origVal = grid[j][i];
          else if (dir === 1) origVal = grid[i][3 - j];
          else if (dir === 2) origVal = grid[3 - j][i];
          else if (dir === 3) origVal = grid[i][j];

          if (origVal !== res.line[j]) moved = true;

          if (dir === 0) grid[j][i] = res.line[j];
          else if (dir === 1) grid[i][3 - j] = res.line[j];
          else if (dir === 2) grid[3 - j][i] = res.line[j];
          else if (dir === 3) grid[i][j] = res.line[j];
        }
      }

      if (moved) {
        score += totalGained;
        const spawned = spawnRandom();

        // Check if 256 reached
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            if (grid[r][c] >= 256 && !won) {
              won = true;
              renderBoard();
              showOverlay("🎅 Gewonnen! (256)", "Weiterspielen");
              win();
              return true;
            }
          }
        }

        if (!canMove()) {
          gameOver = true;
        }

        renderBoard(spawned ? spawned.r : -1, spawned ? spawned.c : -1);
      }
      return moved;
    }

    function resetGame() {
      grid = [
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0]
      ];
      score = 0;
      won = false;
      gameOver = false;
      spawnRandom();
      spawnRandom();
      renderBoard();
    }

    // Expose internal state for the bot
    root.__game = {
      move,
      getGrid: () => grid,
      isWon: () => won,
      isGameOver: () => gameOver
    };

    // D-Pad listeners
    wrap.querySelector("#g22-btn-up").addEventListener("click", () => move(0));
    wrap.querySelector("#g22-btn-right").addEventListener("click", () => move(1));
    wrap.querySelector("#g22-btn-down").addEventListener("click", () => move(2));
    wrap.querySelector("#g22-btn-left").addEventListener("click", () => move(3));

    // Keyboard listener
    const onKey = (e) => {
      if (!root.isConnected) {
        window.removeEventListener("keydown", onKey);
        return;
      }
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") { e.preventDefault(); move(0); }
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") { e.preventDefault(); move(2); }
      else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { e.preventDefault(); move(3); }
    };
    window.addEventListener("keydown", onKey);

    // Touch / Swipe
    let touchStartX = 0, touchStartY = 0;
    boardEl.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    boardEl.addEventListener("touchmove", (e) => {
      e.preventDefault(); // prevent scroll
    }, { passive: false });

    boardEl.addEventListener("touchend", (e) => {
      if (e.changedTouches.length === 0) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (Math.max(absX, absY) > 25) {
        if (absX > absY) {
          if (dx > 0) move(1); // Right
          else move(3);        // Left
        } else {
          if (dy > 0) move(2); // Down
          else move(0);        // Up
        }
      }
    }, { passive: true });

    resetGame();
  },

  async bot(root){
    root.__fast = true;
    const game = root.__game;
    if (!game) return;

    // Fast expectimax-style heuristic solver to guarantee reaching 256 in seconds
    const weights = [
      [ 3,  2,  1,  0],
      [ 4,  5,  6,  7],
      [11, 10,  9,  8],
      [12, 13, 14, 15]
    ];

    function evaluate(g) {
      let score = 0;
      let emptyCount = 0;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const val = g[r][c];
          if (val === 0) {
            emptyCount++;
          } else {
            score += val * (1 << weights[r][c]);
          }
        }
      }
      return score + emptyCount * 2500;
    }

    function simulate(g, dir) {
      let moved = false;
      const newGrid = g.map(row => row.slice());
      for (let i = 0; i < 4; i++) {
        let line = [];
        for (let j = 0; j < 4; j++) {
          if (dir === 0) line.push(newGrid[j][i]);
          else if (dir === 1) line.push(newGrid[i][3 - j]);
          else if (dir === 2) line.push(newGrid[3 - j][i]);
          else if (dir === 3) line.push(newGrid[i][j]);
        }
        let filtered = line.filter(v => v !== 0);
        for (let j = 0; j < filtered.length - 1; j++) {
          if (filtered[j] === filtered[j + 1]) {
            filtered[j] *= 2;
            filtered.splice(j + 1, 1);
          }
        }
        while (filtered.length < 4) filtered.push(0);

        for (let j = 0; j < 4; j++) {
          let origVal;
          if (dir === 0) origVal = newGrid[j][i];
          else if (dir === 1) origVal = newGrid[i][3 - j];
          else if (dir === 2) origVal = newGrid[3 - j][i];
          else if (dir === 3) origVal = newGrid[i][j];

          if (origVal !== filtered[j]) moved = true;

          if (dir === 0) newGrid[j][i] = filtered[j];
          else if (dir === 1) newGrid[i][3 - j] = filtered[j];
          else if (dir === 2) newGrid[3 - j][i] = filtered[j];
          else if (dir === 3) newGrid[i][j] = filtered[j];
        }
      }
      return { moved, grid: newGrid };
    }

    function search(g, depth) {
      if (depth === 0) return evaluate(g);

      let best = -Infinity;
      for (let dir = 0; dir < 4; dir++) {
        const sim = simulate(g, dir);
        if (!sim.moved) continue;
        let score = evaluate(sim.grid);
        if (depth > 1) {
          // Average over open spots with 2
          let empties = 0, sum = 0;
          for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
              if (sim.grid[r][c] === 0) {
                empties++;
                sim.grid[r][c] = 2;
                sum += search(sim.grid, depth - 1);
                sim.grid[r][c] = 0;
                if (empties >= 3) break; // sample cap
              }
            }
            if (empties >= 3) break;
          }
          score = empties > 0 ? (sum / empties) : score;
        }
        if (score > best) best = score;
      }
      return best === -Infinity ? -1e8 : best;
    }

    function bestMove(currentGrid) {
      let maxScore = -Infinity;
      let chosenDir = -1;
      const order = [2, 1, 3, 0]; // Down, Right, Left, Up priority
      for (let dir of order) {
        const sim = simulate(currentGrid, dir);
        if (!sim.moved) continue;
        const sc = search(sim.grid, 2);
        if (sc > maxScore) {
          maxScore = sc;
          chosenDir = dir;
        }
      }
      return chosenDir;
    }

    const startTime = Date.now();
    while (root.isConnected && !game.isWon() && !game.isGameOver()) {
      if (Date.now() - startTime > 19000) break; // stay safely under 20s
      const curGrid = game.getGrid();
      const dir = bestMove(curGrid);
      if (dir === -1) break;
      game.move(dir);
      await new Promise(r => setTimeout(r, 20));
    }
  }
 };
})();