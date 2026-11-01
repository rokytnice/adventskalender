(function(){
  if (!window.Games) window.Games = {};

  if (!document.getElementById('g7-style')) {
    const style = document.createElement('style');
    style.id = 'g7-style';
    style.textContent = `
      .g7-wrap {
        position: relative;
        width: 100%;
        max-width: 560px;
        margin: 0 auto;
        background: #0b1d33;
        color: #f5f9ff;
        font-family: system-ui, -apple-system, sans-serif;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
      }
      .g7-canvas {
        display: block;
        width: 100%;
        height: auto;
        background: #0b1d33;
      }
      .g7-overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(11, 29, 51, 0.88);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 14px;
        padding: 20px;
        text-align: center;
        box-sizing: border-box;
      }
      .g7-btn {
        background: #d62839;
        color: #f5f9ff;
        border: 2px solid #f4c430;
        padding: 12px 28px;
        font-size: 18px;
        font-weight: bold;
        border-radius: 24px;
        cursor: pointer;
        min-height: 48px;
        min-width: 140px;
        transition: transform 0.1s, background 0.2s;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      }
      .g7-btn:active {
        transform: scale(0.96);
        background: #b01e2c;
      }
      .g7-hud {
        position: absolute;
        top: 12px;
        left: 12px;
        right: 12px;
        display: flex;
        justify-content: space-between;
        font-size: 16px;
        font-weight: bold;
        color: #f4c430;
        text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }

  Games[7] = {
    title: "Rentier-Sprung",
    hint: "Tippe oder drücke die Leertaste zum Springen. Weiche Hindernissen aus und laufe 1500m!",

    init(root, win) {
      root.innerHTML = '';

      const wrap = document.createElement('div');
      wrap.className = 'g7-wrap';

      const canvas = document.createElement('canvas');
      canvas.className = 'g7-canvas';
      canvas.width = 480;
      canvas.height = 270;

      const hud = document.createElement('div');
      hud.className = 'g7-hud';
      hud.innerHTML = `<span>Ziel: 1500m</span><span id="g7-dist">0m</span>`;

      const overlay = document.createElement('div');
      overlay.className = 'g7-overlay';
      overlay.innerHTML = `
        <h2 style="color:#f4c430;margin:0;font-size:24px;">Rentier-Sprung 🦌</h2>
        <p style="margin:0;font-size:14px;color:#f5f9ff;">Hilf dem Rentier, 1500m weit zu laufen!</p>
        <button class="g7-btn" id="g7-start-btn">Start</button>
      `;

      wrap.appendChild(canvas);
      wrap.appendChild(hud);
      wrap.appendChild(overlay);
      root.appendChild(wrap);

      const ctx = canvas.getContext('2d');
      const distEl = hud.querySelector('#g7-dist');
      const startBtn = overlay.querySelector('#g7-start-btn');

      let state = 'INIT'; // INIT, RUNNING, GAMEOVER, WON
      let animId = null;
      let lastTime = 0;

      const TARGET_DIST = 1500;
      let distance = 0;
      let speed = 220;

      const groundY = 210;
      const player = {
        x: 70,
        y: groundY,
        vy: 0,
        grounded: true,
        jumpForce: -430,
        gravity: 1250
      };

      let obstacles = [];
      let nextObstacleTimer = 0;

      function resetGame() {
        distance = 0;
        speed = 220;
        player.y = groundY;
        player.vy = 0;
        player.grounded = true;
        obstacles = [];
        nextObstacleTimer = 0.6;
        if (distEl) distEl.textContent = '0m';
      }

      function doJump() {
        if (state === 'RUNNING' && player.grounded) {
          player.vy = player.jumpForce;
          player.grounded = false;
        }
      }

      const onKeyDown = (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
          if (state === 'RUNNING') {
            e.preventDefault();
            doJump();
          }
        }
      };
      window.addEventListener('keydown', onKeyDown);

      wrap.addEventListener('pointerdown', (e) => {
        if (state === 'RUNNING' && e.target !== startBtn) {
          doJump();
        }
      });

      root.__g7_doJump = doJump;
      root.__g7_getState = () => ({ state, player, obstacles, distance });

      function spawnObstacle() {
        const types = [
          { emoji: '🌲', w: 24, h: 36 },
          { emoji: '☃️', w: 24, h: 32 },
          { emoji: '🎁', w: 22, h: 24 },
          { emoji: '🪨', w: 22, h: 20 }
        ];
        const type = types[Math.floor(Math.random() * types.length)];
        obstacles.push({
          x: canvas.width + 20,
          y: groundY,
          w: type.w,
          h: type.h,
          emoji: type.emoji
        });
      }

      function gameLoop(timestamp) {
        if (!root.isConnected) {
          window.removeEventListener('keydown', onKeyDown);
          return;
        }

        if (!lastTime) lastTime = timestamp;
        let dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        const multiplier = root.__fast ? 3 : 1;
        dt = Math.min(dt, 0.1) * multiplier;

        if (state === 'RUNNING') {
          player.vy += player.gravity * dt;
          player.y += player.vy * dt;

          if (player.y >= groundY) {
            player.y = groundY;
            player.vy = 0;
            player.grounded = true;
          }

          const currentSpeed = speed + (distance * 0.04);
          distance += (currentSpeed * dt) / 10;
          if (distEl) distEl.textContent = `${Math.floor(distance)}m`;

          if (distance >= TARGET_DIST) {
            distance = TARGET_DIST;
            distEl.textContent = `${TARGET_DIST}m`;
            state = 'WON';
            overlay.style.display = 'flex';
            overlay.innerHTML = `
              <h2 style="color:#f4c430;margin:0;font-size:26px;">Gewonnen! 🎄</h2>
              <p style="margin:0;font-size:16px;color:#f5f9ff;">Du hast 1500m erreicht!</p>
            `;
            win();
            return;
          }

          nextObstacleTimer -= dt;
          if (nextObstacleTimer <= 0) {
            spawnObstacle();
            nextObstacleTimer = 1.1 + Math.random() * 1.3 - Math.min(0.2, distance / 6000);
          }

          const pBox = {
            left: player.x - 12,
            right: player.x + 12,
            top: player.y - 28,
            bottom: player.y
          };

          for (let i = obstacles.length - 1; i >= 0; i--) {
            const obs = obstacles[i];
            obs.x -= currentSpeed * dt;

            const oBox = {
              left: obs.x - obs.w / 2,
              right: obs.x + obs.w / 2,
              top: obs.y - obs.h,
              bottom: obs.y
            };

            if (pBox.right > oBox.left && pBox.left < oBox.right &&
                pBox.bottom > oBox.top && pBox.top < oBox.bottom) {
              state = 'GAMEOVER';
              overlay.style.display = 'flex';
              overlay.innerHTML = `
                <h2 style="color:#d62839;margin:0;font-size:24px;">Hoppla! 💥</h2>
                <p style="margin:0;font-size:16px;color:#f5f9ff;">Erreichte Strecke: ${Math.floor(distance)}m</p>
                <button class="g7-btn" id="g7-restart-btn">Nochmal</button>
              `;
              overlay.querySelector('#g7-restart-btn').onclick = start;
              return;
            }

            if (obs.x < -30) {
              obstacles.splice(i, 1);
            }
          }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0b1d33';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#f4c430';
        ctx.beginPath();
        ctx.arc(420, 45, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1f7a4d';
        ctx.fillRect(0, groundY + 4, canvas.width, canvas.height - groundY - 4);
        ctx.fillStyle = '#f5f9ff';
        ctx.fillRect(0, groundY, canvas.width, 6);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.font = '24px sans-serif';
        for (const obs of obstacles) {
          ctx.fillText(obs.emoji, obs.x, obs.y + 4);
        }

        ctx.font = '32px sans-serif';
        ctx.fillText('🦌', player.x, player.y + 4);

        if (root.isConnected) {
          animId = requestAnimationFrame(gameLoop);
        } else {
          window.removeEventListener('keydown', onKeyDown);
        }
      }

      function start() {
        resetGame();
        state = 'RUNNING';
        overlay.style.display = 'none';
      }

      startBtn.onclick = start;
      animId = requestAnimationFrame(gameLoop);
    },

    async bot(root) {
      root.__fast = true;

      const startBtn = root.querySelector('#g7-start-btn');
      if (startBtn) startBtn.click();

      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (!root.isConnected) {
            clearInterval(interval);
            resolve();
            return;
          }

          const stateGetter = root.__g7_getState;
          if (!stateGetter) return;
          const { state, player, obstacles, distance } = stateGetter();

          if (state === 'WON') {
            clearInterval(interval);
            resolve();
            return;
          }

          if (state === 'GAMEOVER') {
            const restartBtn = root.querySelector('#g7-restart-btn');
            if (restartBtn) restartBtn.click();
            return;
          }

          if (state === 'RUNNING') {
            const upcoming = obstacles
              .filter(o => o.x > player.x - 10)
              .sort((a, b) => a.x - b.x)[0];

            if (upcoming) {
              const distToObs = upcoming.x - player.x;
              if (distToObs > 0 && distToObs < 70 + (220 + distance * 0.04) * 0.12 && player.grounded) {
                if (root.__g7_doJump) root.__g7_doJump();
              }
            }
          }
        }, 16);
      });
    }
  };
})();