(function(){
  if (!window.Games) window.Games = {};

  const PREFIX = "g14-";

  function injectCSS() {
    if (document.getElementById(PREFIX + "style")) return;
    const style = document.createElement("style");
    style.id = PREFIX + "style";
    style.textContent = `
      .${PREFIX}root {
        width: 100%;
        max-width: 480px;
        margin: 0 auto;
        background: #0b1d33;
        color: #f5f9ff;
        font-family: system-ui, -apple-system, sans-serif;
        border-radius: 16px;
        padding: 16px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        user-select: none;
        position: relative;
        overflow: hidden;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      }
      .${PREFIX}header {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .${PREFIX}title {
        font-size: 1.2rem;
        font-weight: bold;
        color: #f4c430;
      }
      .${PREFIX}score {
        font-size: 1.1rem;
        font-weight: bold;
        background: #1f7a4d;
        padding: 6px 14px;
        border-radius: 20px;
        border: 2px solid #f4c430;
        color: #f5f9ff;
      }
      .${PREFIX}canvas-wrap {
        position: relative;
        width: 100%;
        aspect-ratio: 1 / 1;
        background: #071322;
        border-radius: 12px;
        border: 3px solid #1f7a4d;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .${PREFIX}canvas {
        width: 100%;
        height: 100%;
        display: block;
      }
      .${PREFIX}controls {
        margin-top: 14px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(2, 1fr);
        gap: 8px;
        width: 210px;
        height: 120px;
      }
      .${PREFIX}btn {
        background: #d62839;
        color: #f5f9ff;
        border: 2px solid #f4c430;
        border-radius: 10px;
        font-size: 1.4rem;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 48px;
        min-height: 48px;
        cursor: pointer;
        touch-action: manipulation;
        transition: transform 0.1s, background 0.1s;
      }
      .${PREFIX}btn:active {
        transform: scale(0.92);
        background: #b01e2c;
      }
      .${PREFIX}btn-up { grid-column: 2; grid-row: 1; }
      .${PREFIX}btn-left { grid-column: 1; grid-row: 2; }
      .${PREFIX}btn-down { grid-column: 2; grid-row: 2; }
      .${PREFIX}btn-right { grid-column: 3; grid-row: 2; }

      .${PREFIX}overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(11, 29, 51, 0.92);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        text-align: center;
        z-index: 10;
        border-radius: 12px;
      }
      .${PREFIX}overlay-title {
        font-size: 1.8rem;
        font-weight: bold;
        margin-bottom: 10px;
      }
      .${PREFIX}overlay-msg {
        font-size: 1rem;
        margin-bottom: 20px;
        color: #f5f9ff;
      }
      .${PREFIX}restart-btn {
        background: #1f7a4d;
        color: #f5f9ff;
        border: 2px solid #f4c430;
        padding: 12px 28px;
        font-size: 1.1rem;
        font-weight: bold;
        border-radius: 25px;
        cursor: pointer;
        min-height: 48px;
        touch-action: manipulation;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      }
      .${PREFIX}restart-btn:active {
        transform: scale(0.95);
      }
    `;
    document.head.appendChild(style);
  }

  Games[14] = {
    title: "Plätzchen-Snake",
    hint: "Sammle 12 Plätzchen mit Pfeiltasten, Buttons oder per Swipe!",

    init(root, win) {
      injectCSS();

      root.innerHTML = "";
      const container = document.createElement("div");
      container.className = PREFIX + "root";

      const header = document.createElement("div");
      header.className = PREFIX + "header";

      const titleEl = document.createElement("div");
      titleEl.className = PREFIX + "title";
      titleEl.textContent = "🎄 Plätzchen-Snake";

      const scoreEl = document.createElement("div");
      scoreEl.className = PREFIX + "score";
      scoreEl.textContent = "🍪 0 / 12";

      header.appendChild(titleEl);
      header.appendChild(scoreEl);
      container.appendChild(header);

      const canvasWrap = document.createElement("div");
      canvasWrap.className = PREFIX + "canvas-wrap";

      const canvas = document.createElement("canvas");
      canvas.className = PREFIX + "canvas";
      canvasWrap.appendChild(canvas);

      const overlay = document.createElement("div");
      overlay.className = PREFIX + "overlay";
      overlay.style.display = "none";
      canvasWrap.appendChild(overlay);

      container.appendChild(canvasWrap);

      const controls = document.createElement("div");
      controls.className = PREFIX + "controls";

      const btnUp = document.createElement("button");
      btnUp.className = PREFIX + "btn " + PREFIX + "btn-up";
      btnUp.textContent = "▲";

      const btnLeft = document.createElement("button");
      btnLeft.className = PREFIX + "btn " + PREFIX + "btn-left";
      btnLeft.textContent = "◄";

      const btnDown = document.createElement("button");
      btnDown.className = PREFIX + "btn " + PREFIX + "btn-down";
      btnDown.textContent = "▼";

      const btnRight = document.createElement("button");
      btnRight.className = PREFIX + "btn " + PREFIX + "btn-right";
      btnRight.textContent = "►";

      controls.appendChild(btnUp);
      controls.appendChild(btnLeft);
      controls.appendChild(btnDown);
      controls.appendChild(btnRight);
      container.appendChild(controls);

      root.appendChild(container);

      const GRID_SIZE = 12;
      const TARGET_SCORE = 12;

      let snake = [];
      let dir = { x: 1, y: 0 };
      let nextDir = { x: 1, y: 0 };
      let cookie = { x: 0, y: 0 };
      let score = 0;
      let gameOver = false;
      let won = false;
      let winCalled = false;
      let lastTime = 0;
      let animId = null;

      function spawnCookie() {
        const occ = new Set(snake.map(s => `${s.x},${s.y}`));
        const empty = [];
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (!occ.has(`${c},${r}`)) {
              empty.push({ x: c, y: r });
            }
          }
        }
        if (empty.length > 0) {
          cookie = empty[Math.floor(Math.random() * empty.length)];
        }
      }

      function resetGame() {
        snake = [
          { x: 3, y: 5 },
          { x: 2, y: 5 },
          { x: 1, y: 5 }
        ];
        dir = { x: 1, y: 0 };
        nextDir = { x: 1, y: 0 };
        score = 0;
        gameOver = false;
        won = false;
        scoreEl.textContent = `🍪 ${score} / ${TARGET_SCORE}`;
        overlay.style.display = "none";
        spawnCookie();
      }

      function setDirection(dx, dy) {
        if (dir.x + dx !== 0 || dir.y + dy !== 0) {
          nextDir = { x: dx, y: dy };
        }
      }

      root.__setDir = setDirection;
      root.__getGameState = () => ({ snake, cookie, score, gameOver, won, GRID_SIZE });

      btnUp.onclick = () => setDirection(0, -1);
      btnDown.onclick = () => setDirection(0, 1);
      btnLeft.onclick = () => setDirection(-1, 0);
      btnRight.onclick = () => setDirection(1, 0);

      const handleKeyDown = (e) => {
        if (!root.isConnected) return;
        switch (e.key) {
          case "ArrowUp": case "w": case "W":
            setDirection(0, -1); e.preventDefault(); break;
          case "ArrowDown": case "s": case "S":
            setDirection(0, 1); e.preventDefault(); break;
          case "ArrowLeft": case "a": case "A":
            setDirection(-1, 0); e.preventDefault(); break;
          case "ArrowRight": case "d": case "D":
            setDirection(1, 0); e.preventDefault(); break;
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      let touchX = 0, touchY = 0;
      canvasWrap.addEventListener("touchstart", (e) => {
        if (e.touches.length > 0) {
          touchX = e.touches[0].clientX;
          touchY = e.touches[0].clientY;
        }
      }, { passive: true });

      canvasWrap.addEventListener("touchend", (e) => {
        if (e.changedTouches.length > 0) {
          const dx = e.changedTouches[0].clientX - touchX;
          const dy = e.changedTouches[0].clientY - touchY;
          if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20) {
            setDirection(dx > 0 ? 1 : -1, 0);
          } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 20) {
            setDirection(0, dy > 0 ? 1 : -1);
          }
        }
      }, { passive: true });

      function showGameOver() {
        overlay.innerHTML = "";
        const title = document.createElement("div");
        title.className = PREFIX + "overlay-title";
        title.style.color = "#d62839";
        title.textContent = "Oje, verkrümelt! 🍪";

        const msg = document.createElement("div");
        msg.className = PREFIX + "overlay-msg";
        msg.textContent = `Du hast ${score} von ${TARGET_SCORE} Plätzchen gesammelt.`;

        const btn = document.createElement("button");
        btn.className = PREFIX + "restart-btn";
        btn.textContent = "Nochmal versuchen";
        btn.onclick = () => resetGame();

        overlay.appendChild(title);
        overlay.appendChild(msg);
        overlay.appendChild(btn);
        overlay.style.display = "flex";
      }

      function showWin() {
        overlay.innerHTML = "";
        const title = document.createElement("div");
        title.className = PREFIX + "overlay-title";
        title.style.color = "#f4c430";
        title.textContent = "Gewonnen! 🎉";

        const msg = document.createElement("div");
        msg.className = PREFIX + "overlay-msg";
        msg.textContent = `Ausgezeichnet! Alle ${TARGET_SCORE} Plätzchen sind eingepackt!`;

        overlay.appendChild(title);
        overlay.appendChild(msg);
        overlay.style.display = "flex";
      }

      function update() {
        dir = nextDir;
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          gameOver = true;
          showGameOver();
          return;
        }

        for (let i = 0; i < snake.length; i++) {
          if (snake[i].x === head.x && snake[i].y === head.y) {
            gameOver = true;
            showGameOver();
            return;
          }
        }

        snake.unshift(head);

        if (head.x === cookie.x && head.y === cookie.y) {
          score++;
          scoreEl.textContent = `🍪 ${score} / ${TARGET_SCORE}`;
          if (score >= TARGET_SCORE) {
            won = true;
            showWin();
            if (!winCalled) {
              winCalled = true;
              win();
            }
          } else {
            spawnCookie();
          }
        } else {
          snake.pop();
        }
      }

      function draw() {
        const rect = canvasWrap.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height) || 300;
        if (canvas.width !== size) {
          canvas.width = size;
          canvas.height = size;
        }

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, size, size);

        const cellSize = size / GRID_SIZE;

        ctx.strokeStyle = "rgba(245, 249, 255, 0.05)";
        ctx.lineWidth = 1;
        for (let i = 0; i <= GRID_SIZE; i++) {
          ctx.beginPath();
          ctx.moveTo(i * cellSize, 0);
          ctx.lineTo(i * cellSize, size);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i * cellSize);
          ctx.lineTo(size, i * cellSize);
          ctx.stroke();
        }

        if (cookie) {
          ctx.font = `${cellSize * 0.75}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("🍪", (cookie.x + 0.5) * cellSize, (cookie.y + 0.5) * cellSize);
        }

        for (let i = snake.length - 1; i >= 0; i--) {
          const seg = snake[i];
          const x = seg.x * cellSize;
          const y = seg.y * cellSize;
          const pad = 2;

          if (i === 0) {
            ctx.fillStyle = "#f4c430";
            ctx.beginPath();
            ctx.roundRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2, 8);
            ctx.fill();

            ctx.fillStyle = "#0b1d33";
            const eyeSize = cellSize * 0.12;
            ctx.beginPath();
            ctx.arc(x + cellSize * 0.3, y + cellSize * 0.35, eyeSize, 0, Math.PI * 2);
            ctx.arc(x + cellSize * 0.7, y + cellSize * 0.35, eyeSize, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = i % 2 === 0 ? "#1f7a4d" : "#289c63";
            ctx.beginPath();
            ctx.roundRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2, 6);
            ctx.fill();
          }
        }
      }

      function gameLoop(time) {
        if (!root.isConnected) {
          window.removeEventListener("keydown", handleKeyDown);
          if (animId) cancelAnimationFrame(animId);
          return;
        }

        const interval = root.__fast ? 25 : 130;
        if (!lastTime) lastTime = time;

        if (time - lastTime >= interval) {
          lastTime = time;
          if (!gameOver && !won) {
            update();
          }
        }

        draw();
        animId = requestAnimationFrame(gameLoop);
      }

      resetGame();
      animId = requestAnimationFrame(gameLoop);
    },

    async bot(root) {
      root.__fast = true;

      function bfsNextMove(state) {
        const { snake, cookie, GRID_SIZE } = state;
        const head = snake[0];
        const bodySet = new Set(snake.map(s => `${s.x},${s.y}`));

        const queue = [[head]];
        const visited = new Set([`${head.x},${head.y}`]);

        while (queue.length > 0) {
          const path = queue.shift();
          const curr = path[path.length - 1];

          if (curr.x === cookie.x && curr.y === cookie.y) {
            if (path.length > 1) {
              return { x: path[1].x - head.x, y: path[1].y - head.y };
            }
          }

          const neighbors = [
            { x: curr.x, y: curr.y - 1 },
            { x: curr.x + 1, y: curr.y },
            { x: curr.x, y: curr.y + 1 },
            { x: curr.x - 1, y: curr.y }
          ];

          for (const n of neighbors) {
            if (n.x >= 0 && n.x < GRID_SIZE && n.y >= 0 && n.y < GRID_SIZE) {
              const key = `${n.x},${n.y}`;
              if (!visited.has(key) && !bodySet.has(key)) {
                visited.add(key);
                queue.push([...path, n]);
              }
            }
          }
        }

        const fallbackDirs = [
          { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }
        ];
        for (const d of fallbackDirs) {
          const nx = head.x + d.x;
          const ny = head.y + d.y;
          if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
            if (!bodySet.has(`${nx},${ny}`)) {
              return d;
            }
          }
        }
        return { x: 1, y: 0 };
      }

      while (root.isConnected) {
        if (!root.__getGameState) {
          await new Promise(r => setTimeout(r, 20));
          continue;
        }

        const state = root.__getGameState();
        if (state.won) break;

        if (state.gameOver) {
          const restartBtn = root.querySelector("." + PREFIX + "restart-btn");
          if (restartBtn) restartBtn.click();
          await new Promise(r => setTimeout(r, 50));
          continue;
        }

        const move = bfsNextMove(state);
        if (root.__setDir) {
          root.__setDir(move.x, move.y);
        }

        await new Promise(r => setTimeout(r, 15));
      }
    }
  };
})();