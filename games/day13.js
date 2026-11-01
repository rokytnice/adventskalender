(function(){
 Games[13] = {
  title: "Weihnachts-Labyrinth",
  hint: "Führe den Weihnachtsmann zum Geschenk (Pfeiltasten, Swipe oder D-Pad)!",
  init(root, win){
   if (!document.getElementById("g13-style")) {
    const style = document.createElement("style");
    style.id = "g13-style";
    style.textContent = `
     .g13-wrap {
      box-sizing: border-box;
      width: 100%;
      max-width: 560px;
      margin: 0 auto;
      background-color: #0b1d33;
      color: #f5f9ff;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px;
      border-radius: 12px;
      position: relative;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
     }
     .g13-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-size: 15px;
      font-weight: bold;
     }
     .g13-badge {
      background: rgba(255,255,255,0.08);
      padding: 6px 14px;
      border-radius: 20px;
      border: 1px solid #f4c430;
      color: #f4c430;
     }
     .g13-canvas-wrap {
      width: 100%;
      max-width: 360px;
      aspect-ratio: 1;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
     }
     canvas.g13-canvas {
      width: 100%;
      height: 100%;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.6);
      background: #0b1d33;
      touch-action: none;
     }
     .g13-dpad {
      display: grid;
      grid-template-columns: repeat(3, 54px);
      grid-template-rows: repeat(2, 54px);
      gap: 8px;
      margin-top: 14px;
      justify-content: center;
     }
     .g13-btn {
      width: 54px;
      height: 54px;
      min-width: 44px;
      min-height: 44px;
      background-color: #d62839;
      color: #f5f9ff;
      border: 2px solid #f4c430;
      border-radius: 10px;
      font-size: 22px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
     }
     .g13-btn:active {
      background-color: #f4c430;
      color: #0b1d33;
     }
     .g13-overlay {
      position: absolute;
      inset: 0;
      background: rgba(11, 29, 51, 0.94);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      z-index: 10;
     }
     .g13-title {
      font-size: 26px;
      color: #f4c430;
      margin-bottom: 14px;
      font-weight: bold;
     }
     .g13-restart {
      padding: 12px 28px;
      font-size: 18px;
      background: #d62839;
      color: #f5f9ff;
      border: 2px solid #f4c430;
      border-radius: 25px;
      cursor: pointer;
      font-weight: bold;
      min-width: 130px;
      min-height: 44px;
     }
     .g13-restart:active {
      background-color: #f4c430;
      color: #0b1d33;
     }
    `;
    document.head.appendChild(style);
   }

   let isWon = false;
   let isGameOver = false;
   let timerId = null;
   let timeLeft = 45;
   let moveCount = 0;

   const GRID_SIZE = 11;
   let maze = [];
   let santaPos = { r: 1, c: 1 };
   const goalPos = { r: 9, c: 9 };

   function generateMaze() {
    const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(1));
    const stack = [[1, 1]];
    grid[1][1] = 0;
    const dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]];

    while (stack.length > 0) {
     const [r, c] = stack[stack.length - 1];
     const unvisited = [];
     for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr > 0 && nr < GRID_SIZE - 1 && nc > 0 && nc < GRID_SIZE - 1 && grid[nr][nc] === 1) {
       unvisited.push([nr, nc, dr, dc]);
      }
     }
     if (unvisited.length > 0) {
      const [nr, nc, dr, dc] = unvisited[Math.floor(Math.random() * unvisited.length)];
      grid[r + dr / 2][c + dc / 2] = 0;
      grid[nr][nc] = 0;
      stack.push([nr, nc]);
     } else {
      stack.pop();
     }
    }
    return grid;
   }

   function findPath(grid, start, goal) {
    const queue = [[start]];
    const visited = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
    visited[start.r][start.c] = true;
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (queue.length > 0) {
     const path = queue.shift();
     const curr = path[path.length - 1];
     if (curr.r === goal.r && curr.c === goal.c) return path;

     for (const [dr, dc] of dirs) {
      const nr = curr.r + dr, nc = curr.c + dc;
      if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && grid[nr][nc] === 0 && !visited[nr][nc]) {
       visited[nr][nc] = true;
       queue.push([...path, { r: nr, c: nc }]);
      }
     }
    }
    return [];
   }

   root.innerHTML = `
    <div class="g13-wrap">
     <div class="g13-header">
      <div class="g13-badge" id="g13-timer">Zeit: 45s</div>
      <div class="g13-badge" id="g13-moves">Schritte: 0</div>
     </div>
     <div class="g13-canvas-wrap">
      <canvas class="g13-canvas" id="g13-cv" width="330" height="330"></canvas>
     </div>
     <div class="g13-dpad">
      <div style="grid-column: 2; grid-row: 1;"><button class="g13-btn" id="g13-u">▲</button></div>
      <div style="grid-column: 1; grid-row: 2;"><button class="g13-btn" id="g13-l">◄</button></div>
      <div style="grid-column: 2; grid-row: 2;"><button class="g13-btn" id="g13-d">▼</button></div>
      <div style="grid-column: 3; grid-row: 2;"><button class="g13-btn" id="g13-r">►</button></div>
     </div>
     <div class="g13-overlay" id="g13-overlay" style="display:none;">
      <div class="g13-title" id="g13-ov-title">Zeit abgelaufen!</div>
      <button class="g13-restart" id="g13-restart">Nochmal</button>
     </div>
    </div>
   `;

   const canvas = root.querySelector("#g13-cv");
   const ctx = canvas.getContext("2d");
   const timerEl = root.querySelector("#g13-timer");
   const movesEl = root.querySelector("#g13-moves");
   const overlay = root.querySelector("#g13-overlay");
   const ovTitle = root.querySelector("#g13-ov-title");
   const restartBtn = root.querySelector("#g13-restart");

   function render() {
    const w = canvas.width;
    const cellSize = w / GRID_SIZE;
    ctx.clearRect(0, 0, w, w);

    for (let r = 0; r < GRID_SIZE; r++) {
     for (let c = 0; c < GRID_SIZE; c++) {
      const x = c * cellSize;
      const y = r * cellSize;
      if (maze[r][c] === 1) {
       ctx.fillStyle = "#1f7a4d";
       ctx.fillRect(x, y, cellSize, cellSize);
       ctx.strokeStyle = "#0b1d33";
       ctx.lineWidth = 1;
       ctx.strokeRect(x, y, cellSize, cellSize);

       ctx.fillStyle = "#f5f9ff";
       ctx.fillRect(x + 2, y + 2, cellSize - 4, 3);
      } else {
       ctx.fillStyle = "#0e243f";
       ctx.fillRect(x, y, cellSize, cellSize);
      }
     }
    }

    const gx = goalPos.c * cellSize + cellSize / 2;
    const gy = goalPos.r * cellSize + cellSize / 2;
    ctx.font = `${cellSize * 0.7}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎁", gx, gy);

    const sx = santaPos.c * cellSize + cellSize / 2;
    const sy = santaPos.r * cellSize + cellSize / 2;
    ctx.fillText("🎅", sx, sy);
   }

   function startTimer() {
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
     if (!root.isConnected) {
      clearInterval(timerId);
      return;
     }
     timeLeft--;
     timerEl.textContent = `Zeit: ${timeLeft}s`;
     if (timeLeft <= 0) {
      clearInterval(timerId);
      isGameOver = true;
      ovTitle.textContent = "Zeit abgelaufen!";
      overlay.style.display = "flex";
     }
    }, root.__fast ? 200 : 1000);
   }

   function moveTo(r, c) {
    if (isWon || isGameOver) return;
    if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && maze[r][c] === 0) {
     santaPos = { r, c };
     moveCount++;
     movesEl.textContent = `Schritte: ${moveCount}`;
     render();

     if (santaPos.r === goalPos.r && santaPos.c === goalPos.c) {
      isWon = true;
      clearInterval(timerId);
      win();
     }
    }
   }

   function tryMove(dr, dc) {
    moveTo(santaPos.r + dr, santaPos.c + dc);
   }

   function resetGame() {
    isWon = false;
    isGameOver = false;
    timeLeft = 45;
    moveCount = 0;
    timerEl.textContent = `Zeit: ${timeLeft}s`;
    movesEl.textContent = `Schritte: ${moveCount}`;
    overlay.style.display = "none";
    santaPos = { r: 1, c: 1 };
    maze = generateMaze();
    render();
    startTimer();
   }

   root.querySelector("#g13-u").onclick = () => tryMove(-1, 0);
   root.querySelector("#g13-d").onclick = () => tryMove(1, 0);
   root.querySelector("#g13-l").onclick = () => tryMove(0, -1);
   root.querySelector("#g13-r").onclick = () => tryMove(0, 1);
   restartBtn.onclick = () => resetGame();

   let touchStartX = 0, touchStartY = 0;
   canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length > 0) {
     touchStartX = e.touches[0].clientX;
     touchStartY = e.touches[0].clientY;
    }
   }, { passive: true });

   canvas.addEventListener("touchend", (e) => {
    if (e.changedTouches.length > 0) {
     const dx = e.changedTouches[0].clientX - touchStartX;
     const dy = e.changedTouches[0].clientY - touchStartY;
     if (Math.hypot(dx, dy) > 20) {
      if (Math.abs(dx) > Math.abs(dy)) {
       tryMove(0, dx > 0 ? 1 : -1);
      } else {
       tryMove(dx > 0 ? 0 : 0, dy > 0 ? 1 : -1);
      }
     }
    }
   }, { passive: true });

   function keyHandler(e) {
    if (!root.isConnected) {
     window.removeEventListener("keydown", keyHandler);
     return;
    }
    if (["ArrowUp", "KeyW"].includes(e.code)) { tryMove(-1, 0); e.preventDefault(); }
    else if (["ArrowDown", "KeyS"].includes(e.code)) { tryMove(1, 0); e.preventDefault(); }
    else if (["ArrowLeft", "KeyA"].includes(e.code)) { tryMove(0, -1); e.preventDefault(); }
    else if (["ArrowRight", "KeyD"].includes(e.code)) { tryMove(0, 1); e.preventDefault(); }
   }
   window.addEventListener("keydown", keyHandler);

   root.__g13_game = {
    solve: () => findPath(maze, santaPos, goalPos),
    stepTo: (r, c) => moveTo(r, c)
   };

   resetGame();
  },

  bot(root){
   return new Promise((resolve) => {
    const checkInt = setInterval(() => {
     if (!root.isConnected) {
      clearInterval(checkInt);
      resolve();
      return;
     }
     if (root.__g13_game) {
      clearInterval(checkInt);
      const game = root.__g13_game;
      const path = game.solve();
      let stepIndex = 1;

      const delay = root.__fast ? 15 : 60;
      const stepInt = setInterval(() => {
       if (!root.isConnected || stepIndex >= path.length) {
        clearInterval(stepInt);
        resolve();
        return;
       }
       game.stepTo(path[stepIndex].r, path[stepIndex].c);
       stepIndex++;
      }, delay);
     }
    }, 50);
   });
  }
 };
})();