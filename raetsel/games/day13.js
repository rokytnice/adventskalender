(function(){
 Games[13] = {
  title: "Eisrutsche",
  hint: "Wische oder nutze die Pfeiltasten: Rutsche über das Glatteis bis zum Ziel!",
  init(root, win){
    const styleId = "g13-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .g13-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
          padding: 12px;
          box-sizing: border-box;
          background: #0b1d33;
          color: #f5f9ff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          user-select: none;
          -webkit-user-select: none;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        }
        .g13-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-bottom: 10px;
        }
        .g13-title {
          font-size: 1.25rem;
          font-weight: bold;
          color: #f4c430;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .g13-status {
          font-size: 0.95rem;
          color: #f5f9ff;
          background: rgba(255,255,255,0.1);
          padding: 4px 10px;
          border-radius: 16px;
        }
        .g13-board-outer {
          position: relative;
          width: 100%;
          max-width: 336px;
          aspect-ratio: 1 / 1;
          background: #102a45;
          border: 3px solid #1f7a4d;
          border-radius: 10px;
          padding: 4px;
          box-sizing: border-box;
          box-shadow: inset 0 0 16px rgba(136,204,255,0.25), 0 4px 12px rgba(0,0,0,0.4);
          touch-action: none;
        }
        .g13-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-template-rows: repeat(7, 1fr);
          width: 100%;
          height: 100%;
          gap: 3px;
        }
        .g13-cell {
          background: #17385c;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          position: relative;
          box-shadow: inset 0 0 4px rgba(255,255,255,0.15);
        }
        .g13-rock {
          background: #1b4d3e;
          box-shadow: inset 0 0 6px #0b1d33;
        }
        .g13-goal {
          background: radial-gradient(circle, #f4c430 30%, #d62839 90%);
          animation: g13-pulse 1.4s infinite alternate;
          border-radius: 6px;
        }
        @keyframes g13-pulse {
          0% { transform: scale(0.92); opacity: 0.85; }
          100% { transform: scale(1.05); opacity: 1; }
        }
        .g13-player {
          position: absolute;
          width: calc((100% - 8px) / 7);
          height: calc((100% - 8px) / 7);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          z-index: 10;
          pointer-events: none;
          transition: left 0.18s cubic-bezier(0.25, 1, 0.5, 1), top 0.18s cubic-bezier(0.25, 1, 0.5, 1);
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.6));
        }
        .g13-dpad {
          display: grid;
          grid-template-columns: repeat(3, 52px);
          grid-template-rows: repeat(2, 48px);
          gap: 6px;
          margin-top: 14px;
        }
        .g13-btn {
          background: #1f7a4d;
          color: #f5f9ff;
          border: 2px solid #f4c430;
          border-radius: 8px;
          font-size: 1.2rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          min-width: 44px;
          min-height: 44px;
          touch-action: manipulation;
          transition: background 0.1s, transform 0.1s;
        }
        .g13-btn:active {
          background: #d62839;
          transform: scale(0.95);
        }
        .g13-btn-up { grid-column: 2; grid-row: 1; }
        .g13-btn-left { grid-column: 1; grid-row: 2; }
        .g13-btn-down { grid-column: 2; grid-row: 2; }
        .g13-btn-right { grid-column: 3; grid-row: 2; }
        .g13-restart-btn {
          margin-top: 10px;
          background: transparent;
          border: 1px solid #f4c430;
          color: #f4c430;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 0.95rem;
          cursor: pointer;
          min-height: 44px;
          min-width: 120px;
        }
        .g13-restart-btn:active {
          background: rgba(244,196,48,0.2);
        }
        .g13-overlay {
          position: absolute;
          inset: 0;
          background: rgba(11, 29, 51, 0.88);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          z-index: 20;
          text-align: center;
          padding: 16px;
        }
        .g13-overlay-title {
          font-size: 1.5rem;
          color: #f4c430;
          margin-bottom: 8px;
          font-weight: bold;
        }
      `;
      document.head.appendChild(style);
    }

    function solveBFS(sx, sy, gx, gy, rocks) {
      const dirs = [
        {dx: 0, dy: -1, name: 'up'},
        {dx: 0, dy: 1, name: 'down'},
        {dx: -1, dy: 0, name: 'left'},
        {dx: 1, dy: 0, name: 'right'}
      ];
      const queue = [{x: sx, y: sy, path: []}];
      const visited = new Set([sx + "," + sy]);

      while (queue.length > 0) {
        const curr = queue.shift();
        if (curr.x === gx && curr.y === gy) return curr.path;

        for (const d of dirs) {
          let nx = curr.x;
          let ny = curr.y;
          while (true) {
            const tx = nx + d.dx;
            const ty = ny + d.dy;
            if (tx < 0 || tx >= 7 || ty < 0 || ty >= 7) break;
            if (rocks.has(tx + "," + ty)) break;
            nx = tx;
            ny = ty;
            if (nx === gx && ny === gy) break;
          }
          if (nx !== curr.x || ny !== curr.y) {
            const key = nx + "," + ny;
            if (!visited.has(key)) {
              visited.add(key);
              queue.push({ x: nx, y: ny, path: curr.path.concat([d.name]) });
            }
          }
        }
      }
      return null;
    }

    function createLevel() {
      let seed = 202412;
      function rnd() {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      }
      while (true) {
        const rocks = new Set();
        while (rocks.size < 9) {
          const rx = Math.floor(rnd() * 7);
          const ry = Math.floor(rnd() * 7);
          if ((rx === 0 && ry === 0) || (rx === 5 && ry === 5)) continue;
          rocks.add(rx + "," + ry);
        }
        const path = solveBFS(0, 0, 5, 5, rocks);
        if (path && path.length >= 5 && path.length <= 8) {
          return { rocks, start: {x: 0, y: 0}, goal: {x: 5, y: 5}, path };
        }
        seed++;
      }
    }

    let level = createLevel();
    let px = level.start.x;
    let py = level.start.y;
    let moves = 0;
    let isMoving = false;
    let hasWon = false;
    const maxMoves = 35;

    root.innerHTML = `
      <div class="g13-wrap">
        <div class="g13-header">
          <div class="g13-title"><span>❄️</span> Eisrutsche</div>
          <div class="g13-status" id="g13-moves">Züge: 0 / ${maxMoves}</div>
        </div>
        <div class="g13-board-outer" id="g13-board">
          <div class="g13-grid" id="g13-grid"></div>
          <div class="g13-player" id="g13-player">🐧</div>
          <div class="g13-overlay" id="g13-overlay" style="display:none;"></div>
        </div>
        <div class="g13-dpad">
          <button class="g13-btn g13-btn-up" id="g13-b-up" aria-label="Hoch">▲</button>
          <button class="g13-btn g13-btn-left" id="g13-b-left" aria-label="Links">◀</button>
          <button class="g13-btn g13-btn-down" id="g13-b-down" aria-label="Runter">▼</button>
          <button class="g13-btn g13-btn-right" id="g13-b-right" aria-label="Rechts">▶</button>
        </div>
        <button class="g13-restart-btn" id="g13-btn-restart">🔄 Neu starten</button>
      </div>
    `;

    const boardEl = root.querySelector("#g13-board");
    const gridEl = root.querySelector("#g13-grid");
    const playerEl = root.querySelector("#g13-player");
    const movesEl = root.querySelector("#g13-moves");
    const overlayEl = root.querySelector("#g13-overlay");

    function renderGrid() {
      gridEl.innerHTML = "";
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          const cell = document.createElement("div");
          cell.className = "g13-cell";
          if (level.rocks.has(x + "," + y)) {
            cell.classList.add("g13-rock");
            cell.textContent = "🌲";
          } else if (x === level.goal.x && y === level.goal.y) {
            cell.classList.add("g13-goal");
            cell.textContent = "🐟";
          }
          gridEl.appendChild(cell);
        }
      }
      updatePlayerPos(false);
    }

    function updatePlayerPos(animate = true) {
      const step = 100 / 7;
      playerEl.style.transition = (animate && !root.__fast) ? "left 0.16s cubic-bezier(0.2, 0.8, 0.4, 1), top 0.16s cubic-bezier(0.2, 0.8, 0.4, 1)" : "none";
      playerEl.style.left = `calc(${px * step}% + 4px)`;
      playerEl.style.top = `calc(${py * step}% + 4px)`;
    }

    function slide(dirName) {
      if (isMoving || hasWon || !root.isConnected) return false;
      const dMap = {
        up: {dx: 0, dy: -1},
        down: {dx: 0, dy: 1},
        left: {dx: -1, dy: 0},
        right: {dx: 1, dy: 0}
      };
      const d = dMap[dirName];
      if (!d) return false;

      let nx = px;
      let ny = py;
      while (true) {
        const tx = nx + d.dx;
        const ty = ny + d.dy;
        if (tx < 0 || tx >= 7 || ty < 0 || ty >= 7) break;
        if (level.rocks.has(tx + "," + ty)) break;
        nx = tx;
        ny = ty;
        if (nx === level.goal.x && ny === level.goal.y) break;
      }

      if (nx === px && ny === py) return false;

      isMoving = true;
      px = nx;
      py = ny;
      moves++;
      movesEl.textContent = `Züge: ${moves} / ${maxMoves}`;
      updatePlayerPos(true);

      const delay = root.__fast ? 25 : 170;
      setTimeout(() => {
        isMoving = false;
        if (!root.isConnected) return;

        if (px === level.goal.x && py === level.goal.y) {
          hasWon = true;
          overlayEl.style.display = "flex";
          overlayEl.innerHTML = `
            <div class="g13-overlay-title">🌟 Geschafft! 🌟</div>
            <div style="font-size:1rem; margin-bottom:12px;">Pinguin ist satt und glücklich!</div>
          `;
          win();
        } else if (moves >= maxMoves) {
          overlayEl.style.display = "flex";
          overlayEl.innerHTML = `
            <div class="g13-overlay-title">Eingefroren! ❄️</div>
            <div style="font-size:1rem; margin-bottom:12px;">Maximale Züge erreicht.</div>
            <button class="g13-btn" style="padding:8px 16px; font-size:1rem;" id="g13-btn-retry">Nochmal</button>
          `;
          root.querySelector("#g13-btn-retry").addEventListener("click", reset);
        }
      }, delay);

      return true;
    }

    function reset() {
      px = level.start.x;
      py = level.start.y;
      moves = 0;
      isMoving = false;
      hasWon = false;
      overlayEl.style.display = "none";
      movesEl.textContent = `Züge: 0 / ${maxMoves}`;
      updatePlayerPos(false);
    }

    root.querySelector("#g13-b-up").addEventListener("click", () => slide("up"));
    root.querySelector("#g13-b-down").addEventListener("click", () => slide("down"));
    root.querySelector("#g13-b-left").addEventListener("click", () => slide("left"));
    root.querySelector("#g13-b-right").addEventListener("click", () => slide("right"));
    root.querySelector("#g13-btn-restart").addEventListener("click", reset);

    // Keyboard support
    function onKeyDown(e) {
      if (!root.isConnected) {
        window.removeEventListener("keydown", onKeyDown);
        return;
      }
      if (["ArrowUp", "KeyW"].includes(e.code)) { e.preventDefault(); slide("up"); }
      else if (["ArrowDown", "KeyS"].includes(e.code)) { e.preventDefault(); slide("down"); }
      else if (["ArrowLeft", "KeyA"].includes(e.code)) { e.preventDefault(); slide("left"); }
      else if (["ArrowRight", "KeyD"].includes(e.code)) { e.preventDefault(); slide("right"); }
    }
    window.addEventListener("keydown", onKeyDown);

    // Touch swipe support
    let touchStartX = 0;
    let touchStartY = 0;
    boardEl.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    boardEl.addEventListener("touchend", (e) => {
      if (e.changedTouches.length > 0) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        if (Math.max(absX, absY) > 20) {
          if (absX > absY) {
            slide(dx > 0 ? "right" : "left");
          } else {
            slide(dy > 0 ? "down" : "up");
          }
        }
      }
    }, { passive: true });

    renderGrid();

    // Hook internal solver and slide for bot
    root.__game = {
      solveBFS,
      slide,
      getState: () => ({ px, py, goal: level.goal, rocks: level.rocks, hasWon })
    };
  },

  async bot(root){
    root.__fast = true;
    while (root.isConnected) {
      const state = root.__game.getState();
      if (state.hasWon) return;

      const path = root.__game.solveBFS(state.px, state.py, state.goal.x, state.goal.y, state.rocks);
      if (!path || path.length === 0) return;

      for (const step of path) {
        if (!root.isConnected) return;
        root.__game.slide(step);
        await new Promise(r => setTimeout(r, 40));
      }

      await new Promise(r => setTimeout(r, 60));
      if (root.__game.getState().hasWon) break;
    }
  }
 };
})();