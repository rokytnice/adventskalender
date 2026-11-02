(function(){
  const CSS = `
    .g20-wrap {
      width: 100%;
      max-width: 500px;
      margin: 0 auto;
      box-sizing: border-box;
      padding: 12px;
      background: #0b1d33;
      color: #f5f9ff;
      font-family: system-ui, -apple-system, sans-serif;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      user-select: none;
      -webkit-user-select: none;
    }
    .g20-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .g20-title {
      font-size: 1.1rem;
      font-weight: bold;
      color: #f4c430;
    }
    .g20-timer {
      font-size: 1rem;
      font-weight: bold;
      background: #122b49;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid #1f7a4d;
      color: #f5f9ff;
    }
    .g20-hint {
      font-size: 0.85rem;
      color: #f5f9ff;
      opacity: 0.9;
      margin-bottom: 10px;
      text-align: center;
    }
    .g20-board-container {
      position: relative;
      width: 100%;
      aspect-ratio: 1;
      max-width: 440px;
      background: #071322;
      border: 3px solid #1f7a4d;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    }
    .g20-canvas {
      width: 100%;
      height: 100%;
      display: block;
      cursor: pointer;
    }
    .g20-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(11, 29, 51, 0.88);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 12px;
      z-index: 10;
    }
    .g20-msg {
      font-size: 1.4rem;
      font-weight: bold;
      color: #d62839;
      text-shadow: 0 0 8px rgba(214, 40, 57, 0.6);
    }
    .g20-btn {
      min-width: 120px;
      min-height: 44px;
      padding: 10px 20px;
      background: #d62839;
      color: #f5f9ff;
      border: 2px solid #f4c430;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
    }
    .g20-btn:hover, .g20-btn:focus {
      background: #b51f2e;
      transform: scale(1.03);
      outline: none;
    }
  `;

  function injectStyle() {
    if (!document.getElementById("g20-style")) {
      const style = document.createElement("style");
      style.id = "g20-style";
      style.textContent = CSS;
      document.head.appendChild(style);
    }
  }

  function reflect(dx, dy, mode) {
    if (mode === 0) return dx !== 0 ? { dx: -dx, dy: dy } : { dx: dx, dy: dy };
    if (mode === 1) return { dx: -dy, dy: -dx };
    if (mode === 2) return dy !== 0 ? { dx: dx, dy: -dy } : { dx: dx, dy: dy };
    if (mode === 3) return { dx: dy, dy: dx };
    return { dx, dy };
  }

  function solveDFS(x, y, dx, dy, mirrorMap, visitedSet) {
    if (x === 5 && y === 5) return mirrorMap;
    if (x < 0 || x >= 6 || y < 0 || y >= 6) return null;

    const stateKey = x + "," + y + "," + dx + "," + dy;
    if (visitedSet.has(stateKey)) return null;
    const newVisited = new Set(visitedSet).add(stateKey);

    const posKey = x + "," + y;
    if (mirrorMap.hasOwnProperty(posKey)) {
      const mode = mirrorMap[posKey];
      const nextDir = reflect(dx, dy, mode);
      return solveDFS(x + nextDir.dx, y + nextDir.dy, nextDir.dx, nextDir.dy, mirrorMap, newVisited);
    } else {
      for (let mode = 0; mode < 4; mode++) {
        mirrorMap[posKey] = mode;
        const nextDir = reflect(dx, dy, mode);
        const res = solveDFS(x + nextDir.dx, y + nextDir.dy, nextDir.dx, nextDir.dy, mirrorMap, newVisited);
        if (res) return res;
      }
      delete mirrorMap[posKey];
      return null;
    }
  }

  Games[20] = {
    title: "Festlicher Lichtstrahl",
    hint: "Drehe die Spiegel per Tippen, um den Lichtstrahl vom Stern zum Tannenbaum zu leiten!",

    init(root, win) {
      injectStyle();
      root.innerHTML = "";

      let timerId = null;
      let animId = null;
      let isWon = false;
      let isGameOver = false;
      let timeLeft = 60;

      const grid = Array.from({ length: 6 }, () => Array(6).fill(0));
      let solvedSol = null;

      function generatePuzzle() {
        const sol = solveDFS(0, 0, 1, 0, {}, new Set());
        solvedSol = sol;
        for (let r = 0; r < 6; r++) {
          for (let c = 0; c < 6; c++) {
            const k = c + "," + r;
            const targetMode = sol && sol.hasOwnProperty(k) ? sol[k] : Math.floor(Math.random() * 4);
            const offset = Math.floor(Math.random() * 3) + 1;
            grid[r][c] = (targetMode + offset) % 4;
          }
        }
      }

      generatePuzzle();

      const container = document.createElement("div");
      container.className = "g20-wrap";

      const header = document.createElement("div");
      header.className = "g20-header";

      const titleEl = document.createElement("div");
      titleEl.className = "g20-title";
      titleEl.textContent = "⭐ Lichtstrahl-Spiegel";

      const timerEl = document.createElement("div");
      timerEl.className = "g20-timer";
      timerEl.textContent = "Zeit: " + timeLeft + "s";

      header.appendChild(titleEl);
      header.appendChild(timerEl);

      const hintEl = document.createElement("div");
      hintEl.className = "g20-hint";
      hintEl.textContent = this.hint;

      const boardWrap = document.createElement("div");
      boardWrap.className = "g20-board-container";

      const canvas = document.createElement("canvas");
      canvas.className = "g20-canvas";
      canvas.width = 360;
      canvas.height = 360;
      canvas.tabIndex = 0;
      canvas.setAttribute("aria-label", "Spiegel-Spielfeld");
      boardWrap.appendChild(canvas);

      const overlay = document.createElement("div");
      overlay.className = "g20-overlay";
      overlay.style.display = "none";

      const msgEl = document.createElement("div");
      msgEl.className = "g20-msg";
      msgEl.textContent = "Zeit abgelaufen!";

      const retryBtn = document.createElement("button");
      retryBtn.className = "g20-btn";
      retryBtn.textContent = "Nochmal";

      overlay.appendChild(msgEl);
      overlay.appendChild(retryBtn);
      boardWrap.appendChild(overlay);

      container.appendChild(header);
      container.appendChild(hintEl);
      container.appendChild(boardWrap);
      root.appendChild(container);

      let focusedX = 0, focusedY = 0;

      function traceBeam() {
        const path = [];
        let cx = 0, cy = 0;
        let cdx = 1, cdy = 0;
        const visited = new Set();
        let hitTree = false;

        while (cx >= 0 && cx < 6 && cy >= 0 && cy < 6) {
          path.push({ x: cx, y: cy, inDx: cdx, inDy: cdy });
          if (cx === 5 && cy === 5) {
            hitTree = true;
            break;
          }
          const key = cx + "," + cy + "," + cdx + "," + cdy;
          if (visited.has(key)) break;
          visited.add(key);

          const m = grid[cy][cx];
          const out = reflect(cdx, cdy, m);
          cdx = out.dx;
          cdy = out.dy;
          cx += cdx;
          cy += cdy;
        }

        return { path, hitTree };
      }

      function draw() {
        if (!root.isConnected) return;
        const ctx = canvas.getContext("2d");
        const cs = 60;

        ctx.fillStyle = "#071322";
        ctx.fillRect(0, 0, 360, 360);

        ctx.strokeStyle = "#122b49";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 6; i++) {
          ctx.beginPath();
          ctx.moveTo(i * cs, 0); ctx.lineTo(i * cs, 360);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i * cs); ctx.lineTo(360, i * cs);
          ctx.stroke();
        }

        for (let r = 0; r < 6; r++) {
          for (let c = 0; c < 6; c++) {
            const x = c * cs;
            const y = r * cs;

            ctx.fillStyle = "#0f233d";
            ctx.beginPath();
            ctx.roundRect(x + 3, y + 3, cs - 6, cs - 6, 6);
            ctx.fill();

            if (document.activeElement === canvas && focusedX === c && focusedY === r) {
              ctx.strokeStyle = "#f4c430";
              ctx.lineWidth = 2;
              ctx.stroke();
            }

            const m = grid[r][c];
            ctx.save();
            ctx.translate(x + cs / 2, y + cs / 2);

            let angle = 0;
            if (m === 0) angle = 0;
            if (m === 1) angle = Math.PI / 4;
            if (m === 2) angle = Math.PI / 2;
            if (m === 3) angle = (3 * Math.PI) / 4;
            ctx.rotate(angle);

            ctx.strokeStyle = "#f4c430";
            ctx.lineWidth = 4;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(0, -cs * 0.3);
            ctx.lineTo(0, cs * 0.3);
            ctx.stroke();

            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, -cs * 0.28);
            ctx.lineTo(0, cs * 0.28);
            ctx.stroke();

            ctx.restore();
          }
        }

        ctx.font = "24px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⭐", 0 * cs + cs / 2, 0 * cs + cs / 2);
        ctx.fillText("🎄", 5 * cs + cs / 2, 5 * cs + cs / 2);

        const { path, hitTree } = traceBeam();

        if (path.length > 0) {
          ctx.save();
          ctx.shadowColor = "#d62839";
          ctx.shadowBlur = 10;
          ctx.strokeStyle = "#d62839";
          ctx.lineWidth = 4;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          ctx.beginPath();
          ctx.moveTo(path[0].x * cs + cs / 2, path[0].y * cs + cs / 2);
          for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x * cs + cs / 2, path[i].y * cs + cs / 2);
          }
          ctx.stroke();

          ctx.strokeStyle = "#f4c430";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }

        if (hitTree && !isWon && !isGameOver) {
          isWon = true;
          clearInterval(timerId);
          setTimeout(() => win(), 200);
        }
      }

      function handleCellClick(c, r) {
        if (isWon || isGameOver) return;
        grid[r][c] = (grid[r][c] + 1) % 4;
        draw();
      }

      canvas.addEventListener("click", (e) => {
        const rect = canvas.getBoundingClientRect();
        const scale = 360 / rect.width;
        const cx = Math.floor((e.clientX - rect.left) * scale / 60);
        const cy = Math.floor((e.clientY - rect.top) * scale / 60);
        if (cx >= 0 && cx < 6 && cy >= 0 && cy < 6) {
          focusedX = cx; focusedY = cy;
          handleCellClick(cx, cy);
        }
      });

      canvas.addEventListener("keydown", (e) => {
        if (isWon || isGameOver) return;
        if (e.key === "ArrowLeft") { focusedX = Math.max(0, focusedX - 1); draw(); e.preventDefault(); }
        else if (e.key === "ArrowRight") { focusedX = Math.min(5, focusedX + 1); draw(); e.preventDefault(); }
        else if (e.key === "ArrowUp") { focusedY = Math.max(0, focusedY - 1); draw(); e.preventDefault(); }
        else if (e.key === "ArrowDown") { focusedY = Math.min(5, focusedY + 1); draw(); e.preventDefault(); }
        else if (e.key === " " || e.key === "Enter") {
          handleCellClick(focusedX, focusedY);
          e.preventDefault();
        }
      });

      function startTimer() {
        clearInterval(timerId);
        timerId = setInterval(() => {
          if (!root.isConnected) {
            clearInterval(timerId);
            return;
          }
          timeLeft--;
          timerEl.textContent = "Zeit: " + timeLeft + "s";
          if (timeLeft <= 0) {
            clearInterval(timerId);
            isGameOver = true;
            overlay.style.display = "flex";
          }
        }, root.__fast ? 200 : 1000);
      }

      function resetGame() {
        isWon = false;
        isGameOver = false;
        timeLeft = 60;
        timerEl.textContent = "Zeit: " + timeLeft + "s";
        overlay.style.display = "none";
        generatePuzzle();
        draw();
        startTimer();
      }

      retryBtn.addEventListener("click", resetGame);

      root._g20_state = { grid, draw };

      draw();
      startTimer();
    },

    async bot(root) {
      const isFast = !!root.__fast;
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, isFast ? ms / 5 : ms));

      while (!root._g20_state) {
        await delay(50);
      }

      const canvas = root.querySelector(".g20-canvas");
      if (!canvas) return;

      function getMirrorMap() {
        const map = {};
        for (let r = 0; r < 6; r++) {
          for (let c = 0; c < 6; c++) {
            map[c + "," + r] = root._g20_state.grid[r][c];
          }
        }
        return map;
      }

      const sol = solveDFS(0, 0, 1, 0, getMirrorMap(), new Set()) || solveDFS(0, 0, 1, 0, {}, new Set());

      if (!sol) return;

      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          const k = c + "," + r;
          if (sol.hasOwnProperty(k)) {
            const targetMode = sol[k];
            while (root._g20_state.grid[r][c] !== targetMode) {
              if (!root.isConnected) return;
              const rect = canvas.getBoundingClientRect();
              const clientX = rect.left + (c + 0.5) * (rect.width / 6);
              const clientY = rect.top + (r + 0.5) * (rect.height / 6);
              canvas.dispatchEvent(new MouseEvent("click", {
                clientX, clientY, bubbles: true
              }));
              await delay(60);
            }
          }
        }
      }
    }
  };
})();