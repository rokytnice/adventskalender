(function(){
  window.Games = window.Games || {};
  Games[2] = {
    title: "Festliches Kugel-Labyrinth",
    hint: "Bringe die Weihnachtskugel mit Pfeilen, Touch-Buttons oder Ziehen sicher ins Ziel!",
    init(root, win){
      root.innerHTML = "";

      const style = document.createElement("style");
      style.textContent = `
        .g2-wrap {
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #0b1d33;
          color: #f5f9ff;
          border-radius: 14px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          user-select: none;
          -webkit-user-select: none;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        }
        .g2-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .g2-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #f4c430;
          letter-spacing: 0.5px;
        }
        .g2-status {
          font-size: 0.9rem;
          color: #f5f9ff;
          font-weight: 600;
        }
        .g2-canvas-box {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          max-width: 380px;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.6);
          border: 3px solid #f4c430;
          background: #081524;
          touch-action: none;
        }
        .g2-canvas {
          display: block;
          width: 100%;
          height: 100%;
        }
        .g2-overlay {
          position: absolute;
          inset: 0;
          background: rgba(11, 29, 51, 0.88);
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 12px;
          padding: 16px;
          text-align: center;
          z-index: 10;
        }
        .g2-overlay.g2-show {
          display: flex;
        }
        .g2-msg {
          font-size: 1.25rem;
          font-weight: bold;
        }
        .g2-msg.g2-win {
          color: #f4c430;
        }
        .g2-msg.g2-lose {
          color: #d62839;
        }
        .g2-btn {
          min-width: 44px;
          min-height: 44px;
          padding: 10px 18px;
          background: #d62839;
          color: #f5f9ff;
          border: 2px solid #f4c430;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.1s, background 0.2s;
          display: inline-flex;
          justify-content: center;
          align-items: center;
        }
        .g2-btn:active {
          transform: scale(0.95);
          background: #b51e2d;
        }
        .g2-dpad {
          display: grid;
          grid-template-columns: repeat(3, 48px);
          grid-template-rows: repeat(2, 48px);
          gap: 6px;
          margin-top: 10px;
          justify-content: center;
        }
        .g2-pad-btn {
          width: 48px;
          height: 48px;
          background: #1f7a4d;
          border: 2px solid #f4c430;
          border-radius: 8px;
          color: #f5f9ff;
          font-size: 1.3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          user-select: none;
          touch-action: none;
        }
        .g2-pad-btn:active, .g2-pad-btn.g2-active {
          background: #f4c430;
          color: #0b1d33;
          transform: scale(0.95);
        }
      `;
      root.appendChild(style);

      const wrap = document.createElement("div");
      wrap.className = "g2-wrap";
      wrap.innerHTML = `
        <div class="g2-header">
          <span class="g2-title">🎄 Kugel-Labyrinth</span>
          <span class="g2-status" id="g2-timer">Zeit: 0s</span>
        </div>
        <div class="g2-canvas-box" id="g2-cbox">
          <canvas class="g2-canvas" id="g2-canvas" width="360" height="360"></canvas>
          <div class="g2-overlay" id="g2-overlay">
            <div class="g2-msg" id="g2-msg"></div>
            <button class="g2-btn" id="g2-retry-btn">Nochmal 🔄</button>
          </div>
        </div>
        <div class="g2-dpad">
          <div style="grid-column: 2;" class="g2-pad-btn" data-dir="up">⬆️</div>
          <div style="grid-column: 1; grid-row: 2;" class="g2-pad-btn" data-dir="left">⬅️</div>
          <div style="grid-column: 2; grid-row: 2;" class="g2-pad-btn" data-dir="down">⬇️</div>
          <div style="grid-column: 3; grid-row: 2;" class="g2-pad-btn" data-dir="right">➡️</div>
        </div>
      `;
      root.appendChild(wrap);

      const canvas = wrap.querySelector("#g2-canvas");
      const ctx = canvas.getContext("2d");
      const overlay = wrap.querySelector("#g2-overlay");
      const msgBox = wrap.querySelector("#g2-msg");
      const retryBtn = wrap.querySelector("#g2-retry-btn");
      const timerLabel = wrap.querySelector("#g2-timer");
      const cbox = wrap.querySelector("#g2-cbox");

      const W = 11, H = 11;
      let grid = [];
      let holes = [];
      let startCell = { x: 1, y: 1 };
      let goalCell = { x: 9, y: 9 };
      let ball = { x: 0, y: 0, vx: 0, vy: 0, r: 0 };
      let won = false;
      let lost = false;
      let winNotified = false;
      let startTime = Date.now();
      let cs = canvas.width / W;
      ball.r = cs * 0.35;

      const keysDown = { up: false, down: false, left: false, right: false };
      let dragVector = { x: 0, y: 0 };
      let isDragging = false;
      let dragStart = { x: 0, y: 0 };

      function generateMaze() {
        grid = Array.from({ length: H }, () => Array(W).fill(1));
        function carve(x, y) {
          grid[y][x] = 0;
          const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]].sort(() => Math.random() - 0.5);
          for (const [dx, dy] of dirs) {
            const nx = x + dx, ny = y + dy;
            if (nx > 0 && nx < W - 1 && ny > 0 && ny < H - 1 && grid[ny][nx] === 1) {
              grid[y + dy / 2][x + dx / 2] = 0;
              carve(nx, ny);
            }
          }
        }
        carve(1, 1);
        grid[H - 2][W - 2] = 0;

        const path = findBFSPath(1, 1, W - 2, H - 2);
        const pathSet = new Set(path.map(p => `${p.x},${p.y}`));

        const candidates = [];
        for (let r = 1; r < H - 1; r++) {
          for (let c = 1; c < W - 1; c++) {
            if (grid[r][c] === 0 && !pathSet.has(`${c},${r}`)) {
              if (Math.hypot(c - 1, r - 1) > 2) {
                candidates.push({ x: c, y: r });
              }
            }
          }
        }
        candidates.sort(() => Math.random() - 0.5);
        holes = candidates.slice(0, Math.min(4, candidates.length));
        return path;
      }

      function findBFSPath(sx, sy, gx, gy) {
        const queue = [[sx, sy]];
        const parent = {};
        const visited = new Set([`${sx},${sy}`]);
        while (queue.length > 0) {
          const [cx, cy] = queue.shift();
          if (cx === gx && cy === gy) {
            const path = [];
            let curr = `${gx},${gy}`;
            while (curr) {
              const [x, y] = curr.split(",").map(Number);
              path.unshift({ x, y });
              curr = parent[curr];
            }
            return path;
          }
          const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
          for (const [dx, dy] of dirs) {
            const nx = cx + dx, ny = cy + dy;
            if (nx >= 0 && nx < W && ny >= 0 && ny < H && grid[ny][nx] === 0) {
              const key = `${nx},${ny}`;
              if (!visited.has(key)) {
                visited.add(key);
                parent[key] = `${cx},${cy}`;
                queue.push([nx, ny]);
              }
            }
          }
        }
        return [];
      }

      let solutionPath = [];

      function resetGame() {
        won = false;
        lost = false;
        overlay.classList.remove("g2-show");
        solutionPath = generateMaze();
        cs = canvas.width / W;
        ball.r = cs * 0.35;
        ball.x = (startCell.x + 0.5) * cs;
        ball.y = (startCell.y + 0.5) * cs;
        ball.vx = 0;
        ball.vy = 0;
        startTime = Date.now();
      }

      function canMoveTo(nx, ny, r) {
        const minC = Math.floor((nx - r) / cs);
        const maxC = Math.floor((nx + r) / cs);
        const minR = Math.floor((ny - r) / cs);
        const maxR = Math.floor((ny + r) / cs);
        for (let row = minR; row <= maxR; row++) {
          for (let col = minC; col <= maxC; col++) {
            if (row < 0 || row >= H || col < 0 || col >= W || grid[row][col] === 1) {
              const nearX = Math.max(col * cs, Math.min(nx, (col + 1) * cs));
              const nearY = Math.max(row * cs, Math.min(ny, (row + 1) * cs));
              const d2 = (nx - nearX) ** 2 + (ny - nearY) ** 2;
              if (d2 < r * r) return false;
            }
          }
        }
        return true;
      }

      function update(dt) {
        if (won || lost) return;

        let ax = 0, ay = 0;
        if (keysDown.up) ay -= 1;
        if (keysDown.down) ay += 1;
        if (keysDown.left) ax -= 1;
        if (keysDown.right) ax += 1;

        if (isDragging) {
          ax += dragVector.x;
          ay += dragVector.y;
        }

        const len = Math.hypot(ax, ay);
        if (len > 1) {
          ax /= len;
          ay /= len;
        }

        const accel = cs * 1.5;
        ball.vx += ax * accel * dt;
        ball.vy += ay * accel * dt;

        ball.vx *= Math.pow(0.2, dt);
        ball.vy *= Math.pow(0.2, dt);

        const newX = ball.x + ball.vx * dt * 60;
        if (canMoveTo(newX, ball.y, ball.r)) {
          ball.x = newX;
        } else {
          ball.vx = 0;
        }

        const newY = ball.y + ball.vy * dt * 60;
        if (canMoveTo(ball.x, newY, ball.r)) {
          ball.y = newY;
        } else {
          ball.vy = 0;
        }

        for (const hole of holes) {
          const hx = (hole.x + 0.5) * cs;
          const hy = (hole.y + 0.5) * cs;
          if (Math.hypot(ball.x - hx, ball.y - hy) < cs * 0.45) {
            lost = true;
            msgBox.textContent = "Hineingefallen! 🕳️";
            msgBox.className = "g2-msg g2-lose";
            overlay.classList.add("g2-show");
            return;
          }
        }

        const gx = (goalCell.x + 0.5) * cs;
        const gy = (goalCell.y + 0.5) * cs;
        if (Math.hypot(ball.x - gx, ball.y - gy) < cs * 0.45) {
          won = true;
          msgBox.textContent = "Geschafft! Frohes Fest! 🎁";
          msgBox.className = "g2-msg g2-win";
          overlay.classList.add("g2-show");
          if (!winNotified) {
            winNotified = true;
            win();
          }
        }
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let r = 0; r < H; r++) {
          for (let c = 0; c < W; c++) {
            const x = c * cs, y = r * cs;
            if (grid[r][c] === 1) {
              ctx.fillStyle = "#1f7a4d";
              ctx.fillRect(x, y, cs, cs);
              ctx.fillStyle = "rgba(245, 249, 255, 0.25)";
              ctx.fillRect(x, y, cs, 2);
            } else {
              ctx.fillStyle = "#132a45";
              ctx.fillRect(x, y, cs, cs);
            }
          }
        }

        const gx = (goalCell.x + 0.5) * cs;
        const gy = (goalCell.y + 0.5) * cs;
        ctx.beginPath();
        ctx.arc(gx, gy, cs * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = "#f4c430";
        ctx.shadowColor = "#f4c430";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.font = `${Math.floor(cs * 0.5)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⭐", gx, gy);

        for (const h of holes) {
          const hx = (h.x + 0.5) * cs;
          const hy = (h.y + 0.5) * cs;
          ctx.beginPath();
          ctx.arc(hx, hy, cs * 0.38, 0, Math.PI * 2);
          ctx.fillStyle = "#050e1a";
          ctx.fill();
          ctx.strokeStyle = "#d62839";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(
          ball.x - ball.r * 0.3, ball.y - ball.r * 0.3, ball.r * 0.1,
          ball.x, ball.y, ball.r
        );
        grad.addColorStop(0, "#ff808b");
        grad.addColorStop(0.7, "#d62839");
        grad.addColorStop(1, "#80121d");
        ctx.fillStyle = grad;
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(ball.x - ball.r * 0.35, ball.y - ball.r * 0.35, ball.r * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fill();
      }

      function onKeyDown(e) {
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keysDown.up = true;
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") keysDown.down = true;
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keysDown.left = true;
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keysDown.right = true;
      }
      function onKeyUp(e) {
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keysDown.up = false;
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") keysDown.down = false;
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keysDown.left = false;
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keysDown.right = false;
      }

      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);

      wrap.querySelectorAll(".g2-pad-btn").forEach(btn => {
        const dir = btn.dataset.dir;
        const setPress = (val) => {
          if (dir in keysDown) keysDown[dir] = val;
          btn.classList.toggle("g2-active", val);
        };
        btn.addEventListener("pointerdown", (e) => { e.preventDefault(); setPress(true); });
        btn.addEventListener("pointerup", (e) => { e.preventDefault(); setPress(false); });
        btn.addEventListener("pointercancel", (e) => { e.preventDefault(); setPress(false); });
        btn.addEventListener("mouseleave", () => setPress(false));
      });

      cbox.addEventListener("pointerdown", (e) => {
        isDragging = true;
        const rect = cbox.getBoundingClientRect();
        dragStart = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        dragVector = { x: 0, y: 0 };
      });
      window.addEventListener("pointermove", (e) => {
        if (!isDragging) return;
        const rect = cbox.getBoundingClientRect();
        const curX = e.clientX - rect.left;
        const curY = e.clientY - rect.top;
        const dx = curX - dragStart.x;
        const dy = curY - dragStart.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 5) {
          dragVector = { x: dx / dist, y: dy / dist };
        } else {
          dragVector = { x: 0, y: 0 };
        }
      });
      window.addEventListener("pointerup", () => {
        isDragging = false;
        dragVector = { x: 0, y: 0 };
      });

      retryBtn.addEventListener("click", () => resetGame());

      let lastTime = performance.now();
      let animId = null;

      function loop(now) {
        if (!root.isConnected) {
          window.removeEventListener("keydown", onKeyDown);
          window.removeEventListener("keyup", onKeyUp);
          if (animId) cancelAnimationFrame(animId);
          return;
        }

        let dt = (now - lastTime) / 1000;
        lastTime = now;
        if (dt > 0.1) dt = 0.1;

        const mult = root.__fast ? 5 : 1;
        update(dt * mult);
        draw();

        if (!won && !lost) {
          const sec = Math.floor((Date.now() - startTime) / 1000);
          timerLabel.textContent = `Zeit: ${sec}s`;
        }

        animId = requestAnimationFrame(loop);
      }

      resetGame();
      animId = requestAnimationFrame(loop);

      root.__g2 = {
        resetGame,
        getBall: () => ball,
        getGoal: () => goalCell,
        getCS: () => cs,
        getPath: () => solutionPath,
        isWon: () => won,
        isLost: () => lost,
        stepTo: (tx, ty, boost) => {
          const dx = tx - ball.x;
          const dy = ty - ball.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0.1) {
            const spd = (boost ? 8 : 3.5) * cs;
            ball.vx = (dx / dist) * spd;
            ball.vy = (dy / dist) * spd;
          }
        }
      };
    },

    async bot(root) {
      root.__fast = true;
      while (!root.__g2) {
        await new Promise(r => setTimeout(r, 20));
      }
      const g2 = root.__g2;

      while (root.isConnected && !g2.isWon()) {
        if (g2.isLost()) {
          g2.resetGame();
          await new Promise(r => setTimeout(r, 50));
          continue;
        }

        const path = g2.getPath();
        const cs = g2.getCS();
        let currentTargetIdx = 0;

        while (currentTargetIdx < path.length && !g2.isWon() && !g2.isLost() && root.isConnected) {
          const target = path[currentTargetIdx];
          const tx = (target.x + 0.5) * cs;
          const ty = (target.y + 0.5) * cs;
          const ball = g2.getBall();
          const dist = Math.hypot(ball.x - tx, ball.y - ty);

          if (dist < cs * 0.45) {
            currentTargetIdx++;
          } else {
            g2.stepTo(tx, ty, true);
          }
          await new Promise(r => setTimeout(r, 16));
        }

        if (g2.isWon()) break;
        await new Promise(r => setTimeout(r, 20));
      }
    }
  };
})();