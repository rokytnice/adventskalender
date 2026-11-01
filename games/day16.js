(function(){
 window.Games = window.Games || {};

 const CSS_ID = "g16-style";
 if (!document.getElementById(CSS_ID)) {
  const style = document.createElement("style");
  style.id = CSS_ID;
  style.textContent = `
   .g16-wrap {
    position: relative;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    background: #0b1d33;
    color: #f5f9ff;
    font-family: system-ui, -apple-system, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    padding: 12px;
    border-radius: 12px;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    overflow: hidden;
   }
   .g16-hud {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 10px;
   }
   .g16-hud-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-weight: bold;
    color: #f4c430;
   }
   .g16-progress-bg {
    width: 100%;
    height: 12px;
    background: rgba(245, 249, 255, 0.15);
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid rgba(244, 196, 48, 0.3);
   }
   .g16-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #1f7a4d, #f4c430);
    width: 0%;
    transition: width 0.1s linear;
   }
   .g16-canvas-container {
    position: relative;
    width: 100%;
    height: 340px;
    border: 2px solid #1f7a4d;
    border-radius: 8px;
    background: linear-gradient(180deg, #050d18 0%, #0b1d33 100%);
    overflow: hidden;
   }
   .g16-canvas {
    width: 100%;
    height: 100%;
    display: block;
   }
   .g16-controls {
    display: flex;
    width: 100%;
    gap: 12px;
    margin-top: 12px;
   }
   .g16-btn {
    flex: 1;
    height: 52px;
    min-height: 44px;
    background: #d62839;
    color: #f5f9ff;
    border: 2px solid #f4c430;
    border-radius: 8px;
    font-size: 22px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    outline: none;
   }
   .g16-btn:active {
    transform: translateY(2px);
    background: #b01e2c;
   }
   .g16-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(11, 29, 51, 0.9);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 10;
    border-radius: 8px;
    padding: 20px;
    box-sizing: border-box;
    text-align: center;
   }
   .g16-overlay-title {
    font-size: 26px;
    color: #d62839;
    font-weight: bold;
    margin-bottom: 8px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
   }
   .g16-overlay-sub {
    font-size: 15px;
    color: #f5f9ff;
    margin-bottom: 20px;
   }
   .g16-overlay-btn {
    min-width: 140px;
    height: 48px;
    min-height: 44px;
    background: #f4c430;
    color: #0b1d33;
    border: none;
    border-radius: 8px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(0,0,0,0.4);
   }
   .g16-overlay-btn:active {
    transform: scale(0.96);
   }
  `;
  document.head.appendChild(style);
 }

 Games[16] = {
  title: "Schlitten-Ausweichen",
  hint: "Weiche den Hindernissen in 3 Spuren aus und überlebe 25 Sekunden!",

  init(root, win) {
   root.innerHTML = `
    <div class="g16-wrap">
     <div class="g16-hud">
      <div class="g16-hud-top">
       <span>🛷 Schlittenfahrt</span>
       <span id="g16-timer">25.0s</span>
      </div>
      <div class="g16-progress-bg">
       <div id="g16-progress" class="g16-progress-fill"></div>
      </div>
     </div>
     <div class="g16-canvas-container" id="g16-container">
      <canvas id="g16-canvas" class="g16-canvas"></canvas>
      <div id="g16-overlay" class="g16-overlay" style="display: none;">
       <div id="g16-overlay-title" class="g16-overlay-title">Kollision!</div>
       <div id="g16-overlay-sub" class="g16-overlay-sub">Du bist gegen ein Hindernis geprallt.</div>
       <button id="g16-retry-btn" class="g16-overlay-btn">Nochmal</button>
      </div>
     </div>
     <div class="g16-controls">
      <button id="g16-btn-left" class="g16-btn" aria-label="Links">◀</button>
      <button id="g16-btn-right" class="g16-btn" aria-label="Rechts">▶</button>
     </div>
    </div>
   `;

   const canvas = root.querySelector("#g16-canvas");
   const ctx = canvas.getContext("2d");
   const container = root.querySelector("#g16-container");
   const timerEl = root.querySelector("#g16-timer");
   const progressEl = root.querySelector("#g16-progress");
   const overlay = root.querySelector("#g16-overlay");
   const overlayTitle = root.querySelector("#g16-overlay-title");
   const overlaySub = root.querySelector("#g16-overlay-sub");
   const retryBtn = root.querySelector("#g16-retry-btn");
   const btnLeft = root.querySelector("#g16-btn-left");
   const btnRight = root.querySelector("#g16-btn-right");

   const TOTAL_TIME = 25.0;
   const OBSTACLE_TYPES = ["🎄", "☃️", "🪨"];

   let state = {
    lane: 1, // 0, 1, 2
    targetLane: 1,
    lanePos: 1, // for smooth transition
    timeRemaining: TOTAL_TIME,
    obstacles: [],
    snowflakes: [],
    spawnTimer: 0,
    spawnInterval: 0.85,
    isGameOver: false,
    isWon: false,
    hasCalledWin: false,
    lastTime: performance.now()
   };

   // Expose state for bot
   root.__g16_state = {
    get playerLane() { return state.lane; },
    get targetLane() { return state.targetLane; },
    get obstacles() { return state.obstacles; },
    get isGameOver() { return state.isGameOver; },
    get isWon() { return state.isWon; },
    moveLeft: () => move(-1),
    moveRight: () => move(1),
    setLane: (l) => {
     if (l >= 0 && l <= 2) {
      state.lane = l;
      state.targetLane = l;
     }
    }
   };

   // Initialize Snowflakes
   for (let i = 0; i < 30; i++) {
    state.snowflakes.push({
     x: Math.random(),
     y: Math.random(),
     r: Math.random() * 2 + 1,
     speed: Math.random() * 0.3 + 0.2
    });
   }

   function resize() {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width || 320;
    canvas.height = rect.height || 340;
   }

   function move(dir) {
    if (state.isGameOver || state.isWon) return;
    state.targetLane = Math.max(0, Math.min(2, state.targetLane + dir));
   }

   function handleKeyDown(e) {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
     move(-1);
    } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
     move(1);
    }
   }

   function resetGame() {
    state.lane = 1;
    state.targetLane = 1;
    state.lanePos = 1;
    state.timeRemaining = TOTAL_TIME;
    state.obstacles = [];
    state.spawnTimer = 0;
    state.isGameOver = false;
    state.isWon = false;
    state.hasCalledWin = false;
    state.lastTime = performance.now();
    overlay.style.display = "none";
    progressEl.style.width = "0%";
    timerEl.textContent = TOTAL_TIME.toFixed(1) + "s";
   }

   // Touch / Click event listeners
   btnLeft.addEventListener("click", () => move(-1));
   btnRight.addEventListener("click", () => move(1));
   retryBtn.addEventListener("click", resetGame);

   // Tap directly on canvas sides
   canvas.addEventListener("pointerdown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
     move(-1);
    } else {
     move(1);
    }
   });

   window.addEventListener("keydown", handleKeyDown);

   // Spawn obstacle
   function spawnObstacle() {
    // Choose 1 or 2 lanes to block, ensure at least 1 lane is open
    const numObstacles = Math.random() < 0.3 ? 2 : 1;
    const availableLanes = [0, 1, 2];
    
    // Shuffle available lanes
    for (let i = availableLanes.length - 1; i > 0; i--) {
     const j = Math.floor(Math.random() * (i + 1));
     [availableLanes[i], availableLanes[j]] = [availableLanes[j], availableLanes[i]];
    }

    for (let i = 0; i < numObstacles; i++) {
     const lane = availableLanes.pop();
     const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
     state.obstacles.push({
      lane: lane,
      y: -40,
      type: type,
      speed: 0.55 + Math.random() * 0.1
     });
    }
   }

   let animationFrameId = null;

   function gameLoop(now) {
    if (!root.isConnected) {
     window.removeEventListener("keydown", handleKeyDown);
     if (animationFrameId) cancelAnimationFrame(animationFrameId);
     return;
    }

    resize();

    let dt = (now - state.lastTime) / 1000;
    state.lastTime = now;

    // Fast mode check for bot
    if (root.__fast) {
     dt *= 5;
    }

    // Limit dt cap
    if (dt > 0.2) dt = 0.2;

    if (!state.isGameOver && !state.isWon) {
     // Time updates
     state.timeRemaining -= dt;
     if (state.timeRemaining <= 0) {
      state.timeRemaining = 0;
      state.isWon = true;
     }

     timerEl.textContent = state.timeRemaining.toFixed(1) + "s";
     const progressPct = Math.min(100, ((TOTAL_TIME - state.timeRemaining) / TOTAL_TIME) * 100);
     progressEl.style.width = progressPct + "%";

     // Lane interpolation
     state.lanePos += (state.targetLane - state.lanePos) * Math.min(1, dt * 18);
     if (Math.abs(state.lanePos - state.targetLane) < 0.01) {
      state.lanePos = state.targetLane;
      state.lane = state.targetLane;
     }

     // Spawn obstacles
     state.spawnTimer += dt;
     if (state.spawnTimer >= state.spawnInterval) {
      state.spawnTimer = 0;
      spawnObstacle();
     }

     // Move obstacles
     const H = canvas.height;
     const playerY = H - 55;

     for (let i = state.obstacles.length - 1; i >= 0; i--) {
      const obs = state.obstacles[i];
      obs.y += obs.speed * H * dt;

      // Collision Check
      if (Math.abs(obs.y - playerY) < 32) {
       // Player active lane range
       if (Math.abs(obs.lane - state.lanePos) < 0.55) {
        state.isGameOver = true;
       }
      }

      // Remove offscreen
      if (obs.y > H + 50) {
       state.obstacles.splice(i, 1);
      }
     }
    }

    // Handle Victory State
    if (state.isWon && !state.hasCalledWin) {
     state.hasCalledWin = true;
     win();
    } else if (state.isGameOver && overlay.style.display !== "flex") {
     overlayTitle.textContent = "Kollision!";
     overlaySub.textContent = "Du bist gegen ein Hindernis geprallt.";
     overlay.style.display = "flex";
    }

    // --- RENDER ---
    const W = canvas.width;
    const H = canvas.height;
    const laneWidth = W / 3;

    ctx.clearRect(0, 0, W, H);

    // Draw falling snow
    ctx.fillStyle = "#f5f9ff";
    for (let flake of state.snowflakes) {
     if (!state.isGameOver) {
      flake.y += flake.speed * dt * (root.__fast ? 5 : 1);
      if (flake.y > 1) flake.y = 0;
     }
     ctx.beginPath();
     ctx.arc(flake.x * W, flake.y * H, flake.r, 0, Math.PI * 2);
     ctx.fill();
    }

    // Draw Lane Dividers
    ctx.strokeStyle = "rgba(244, 196, 48, 0.25)";
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 12]);
    for (let i = 1; i < 3; i++) {
     ctx.beginPath();
     ctx.moveTo(i * laneWidth, 0);
     ctx.lineTo(i * laneWidth, H);
     ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw Obstacles
    ctx.font = "28px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let obs of state.obstacles) {
     const x = obs.lane * laneWidth + laneWidth / 2;
     ctx.fillText(obs.type, x, obs.y);
    }

    // Draw Player Sled
    const playerX = state.lanePos * laneWidth + laneWidth / 2;
    const playerY = H - 55;

    ctx.font = "36px sans-serif";
    ctx.fillText("🛷", playerX, playerY);

    animationFrameId = requestAnimationFrame(gameLoop);
   }

   animationFrameId = requestAnimationFrame(gameLoop);
  },

  bot(root) {
   return new Promise((resolve) => {
    root.__fast = true;

    const botInterval = setInterval(() => {
     if (!root.isConnected) {
      clearInterval(botInterval);
      return;
     }

     const state = root.__g16_state;
     if (!state) return;

     if (state.isWon) {
      clearInterval(botInterval);
      resolve();
      return;
     }

     if (state.isGameOver) {
      const retryBtn = root.querySelector("#g16-retry-btn");
      if (retryBtn) retryBtn.click();
      return;
     }

     // AI logic: Look for obstacles in current or upcoming y range
     const container = root.querySelector("#g16-container");
     const H = container ? container.clientHeight : 340;
     const playerY = H - 55;

     // Find dangerous obstacles coming towards player
     const dangerZoneTop = playerY - 140;
     const dangerZoneBottom = playerY + 30;

     const blockedLanes = new Set();
     for (let obs of state.obstacles) {
      if (obs.y >= dangerZoneTop && obs.y <= dangerZoneBottom) {
       blockedLanes.add(obs.lane);
      }
     }

     const currentTarget = state.targetLane;

     // If current targeted lane is blocked, pick a free lane
     if (blockedLanes.has(currentTarget)) {
      let safeLane = -1;
      // Prefer moving to center if available, otherwise any non-blocked lane
      const laneCandidates = [1, 0, 2];
      for (let l of laneCandidates) {
       if (!blockedLanes.has(l)) {
        safeLane = l;
        break;
       }
      }

      if (safeLane !== -1) {
       state.setLane(safeLane);
      }
     }
    }, 30);
   });
  }
 };
})();