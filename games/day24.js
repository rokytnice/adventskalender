(function(){
  Games = window.Games || {};
  Games[24] = {
    title: "Geschenke-Regen Finale",
    hint: "Steuere den Schlitten: Fange 20 Geschenke und weiche den Steinen aus!",
    init(root, win){
      root.innerHTML = "";

      const style = document.createElement("style");
      style.textContent = `
        .g24-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #0b1d33;
          color: #f5f9ff;
          font-family: system-ui, -apple-system, sans-serif;
          padding: 10px;
          border-radius: 12px;
          user-select: none;
          touch-action: none;
          max-width: 520px;
          margin: 0 auto;
          box-sizing: border-box;
          position: relative;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .g24-hud {
          display: flex;
          justify-content: space-between;
          width: 100%;
          padding: 6px 12px;
          font-size: 1.1rem;
          font-weight: bold;
          box-sizing: border-box;
          background: rgba(11,29,51,0.85);
          border-radius: 8px;
          margin-bottom: 6px;
        }
        .g24-score { color: #f4c430; }
        .g24-lives { color: #d62839; letter-spacing: 2px; }
        .g24-canvas-box {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 5.2;
          max-height: 480px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid #1f7a4d;
          background: linear-gradient(180deg, #06111f 0%, #0d2542 60%, #153b66 100%);
        }
        .g24-canvas {
          width: 100%;
          height: 100%;
          display: block;
        }
        .g24-controls {
          display: flex;
          justify-content: space-between;
          width: 100%;
          gap: 12px;
          margin-top: 8px;
        }
        .g24-btn {
          flex: 1;
          height: 48px;
          background: #1f7a4d;
          border: 2px solid #f4c430;
          border-radius: 8px;
          color: #f5f9ff;
          font-size: 1.3rem;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, transform 0.1s;
        }
        .g24-btn:active {
          background: #28a745;
          transform: scale(0.97);
        }
        .g24-overlay {
          position: absolute;
          inset: 0;
          background: rgba(11, 29, 51, 0.92);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          z-index: 10;
          padding: 20px;
          text-align: center;
        }
        .g24-overlay.g24-hidden { display: none; }
        .g24-title { font-size: 1.6rem; margin-bottom: 10px; font-weight: 800; }
        .g24-win-title { color: #f4c430; }
        .g24-lose-title { color: #d62839; }
        .g24-sub { font-size: 1rem; margin-bottom: 20px; color: #f5f9ff; }
        .g24-retry-btn {
          min-width: 160px;
          min-height: 48px;
          background: #d62839;
          border: 2px solid #f4c430;
          color: #f5f9ff;
          font-size: 1.15rem;
          font-weight: bold;
          border-radius: 24px;
          cursor: pointer;
          padding: 8px 24px;
          transition: transform 0.1s;
        }
        .g24-retry-btn:active { transform: scale(0.96); }
      `;
      root.appendChild(style);

      const wrap = document.createElement("div");
      wrap.className = "g24-wrap";
      wrap.innerHTML = `
        <div class="g24-hud">
          <div class="g24-score">Geschenke: <span id="g24-val-score">0</span> / 20</div>
          <div class="g24-lives" id="g24-val-lives">❤️❤️❤️</div>
        </div>
        <div class="g24-canvas-box">
          <canvas class="g24-canvas" width="400" height="520"></canvas>
          <div class="g24-overlay g24-hidden" id="g24-overlay">
            <div class="g24-title" id="g24-ov-title"></div>
            <div class="g24-sub" id="g24-ov-sub"></div>
            <button class="g24-retry-btn" id="g24-retry-btn">Nochmal</button>
          </div>
        </div>
        <div class="g24-controls">
          <button class="g24-btn" id="g24-left-btn" aria-label="Links">◀</button>
          <button class="g24-btn" id="g24-right-btn" aria-label="Rechts">▶</button>
        </div>
      `;
      root.appendChild(wrap);

      const canvas = wrap.querySelector(".g24-canvas");
      const ctx = canvas.getContext("2d");
      const scoreEl = wrap.querySelector("#g24-val-score");
      const livesEl = wrap.querySelector("#g24-val-lives");
      const overlay = wrap.querySelector("#g24-overlay");
      const ovTitle = wrap.querySelector("#g24-ov-title");
      const ovSub = wrap.querySelector("#g24-ov-sub");
      const retryBtn = wrap.querySelector("#g24-retry-btn");
      const btnLeft = wrap.querySelector("#g24-left-btn");
      const btnRight = wrap.querySelector("#g24-right-btn");

      const CW = 400;
      const CH = 520;
      const TARGET_SCORE = 20;

      let score = 0;
      let lives = 3;
      let gameOver = false;
      let gameWon = false;
      let sleighX = CW / 2;
      const sleighY = 460;
      const sleighW = 76;
      const sleighH = 34;
      let moveDir = 0; // -1, 0, 1
      let items = [];
      let particles = [];
      let snowflakes = [];
      let lastSpawn = 0;
      let animId = null;

      // Background snowflakes
      for (let i = 0; i < 40; i++) {
        snowflakes.push({
          x: Math.random() * CW,
          y: Math.random() * CH,
          r: 1 + Math.random() * 2.5,
          speed: 0.8 + Math.random() * 1.5,
          drift: (Math.random() - 0.5) * 0.5
        });
      }

      function updateHUD() {
        scoreEl.textContent = score;
        livesEl.textContent = "❤️".repeat(Math.max(0, lives)) + "🖤".repeat(Math.max(0, 3 - lives));
      }

      function createExplosion(x, y, color) {
        for (let i = 0; i < 12; i++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = 1.5 + Math.random() * 3.5;
          particles.push({
            x, y,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            life: 1.0,
            color
          });
        }
      }

      function spawnItem() {
        const isRock = Math.random() < 0.28;
        const emojis = isRock ? ["🪨"] : ["🎁", "🎀", "📦", "⭐"];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        const x = 30 + Math.random() * (CW - 60);
        items.push({
          x,
          y: -20,
          type: isRock ? "rock" : "gift",
          emoji,
          size: 26,
          speed: 2.2 + Math.random() * 1.8
        });
      }

      function resetGame() {
        score = 0;
        lives = 3;
        gameOver = false;
        gameWon = false;
        items = [];
        particles = [];
        sleighX = CW / 2;
        moveDir = 0;
        lastSpawn = 0;
        updateHUD();
        overlay.classList.add("g24-hidden");
      }

      function showGameOver(won) {
        gameOver = true;
        gameWon = won;
        overlay.classList.remove("g24-hidden");
        if (won) {
          ovTitle.className = "g24-title g24-win-title";
          ovTitle.textContent = "🎉 Frohe Weihnachten!";
          ovSub.textContent = "Du hast 20 Geschenke sicher gefangen!";
          retryBtn.style.display = "none";
          createExplosion(CW / 2, CH / 2, "#f4c430");
          win();
        } else {
          ovTitle.className = "g24-title g24-lose-title";
          ovTitle.textContent = "Schlitten beschädigt!";
          ovSub.textContent = "Zu viele Steine getroffen. Versuch es noch einmal!";
          retryBtn.style.display = "inline-block";
        }
      }

      retryBtn.addEventListener("click", () => {
        resetGame();
      });

      // Controls
      const onKeyDown = (e) => {
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") moveDir = -1;
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") moveDir = 1;
      };
      const onKeyUp = (e) => {
        if ((e.key === "ArrowLeft" || e.key === "a" || e.key === "A") && moveDir === -1) moveDir = 0;
        if ((e.key === "ArrowRight" || e.key === "d" || e.key === "D") && moveDir === 1) moveDir = 0;
      };
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);

      const bindBtn = (btn, dir) => {
        const start = (e) => { e.preventDefault(); moveDir = dir; };
        const end = (e) => { e.preventDefault(); if (moveDir === dir) moveDir = 0; };
        btn.addEventListener("pointerdown", start);
        btn.addEventListener("pointerup", end);
        btn.addEventListener("pointercancel", end);
      };
      bindBtn(btnLeft, -1);
      bindBtn(btnRight, 1);

      // Pointer drag directly on canvas
      let isDragging = false;
      const setXFromPointer = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : sleighX);
        const ratio = CW / rect.width;
        sleighX = Math.max(sleighW / 2, Math.min(CW - sleighW / 2, (clientX - rect.left) * ratio));
      };
      canvas.addEventListener("pointerdown", (e) => {
        isDragging = true;
        setXFromPointer(e);
      });
      canvas.addEventListener("pointermove", (e) => {
        if (isDragging) setXFromPointer(e);
      });
      const stopDrag = () => { isDragging = false; };
      window.addEventListener("pointerup", stopDrag);

      // Draw Santa Sleigh
      function drawSleigh(x, y) {
        ctx.save();
        ctx.translate(x, y);

        // Runner (Gold)
        ctx.strokeStyle = "#f4c430";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-sleighW / 2 + 4, 14);
        ctx.lineTo(sleighW / 2 - 8, 14);
        ctx.quadraticCurveTo(sleighW / 2 + 6, 14, sleighW / 2 + 8, 4);
        ctx.stroke();

        // Runner supports
        ctx.beginPath();
        ctx.moveTo(-sleighW / 2 + 16, 14);
        ctx.lineTo(-sleighW / 2 + 16, 4);
        ctx.moveTo(sleighW / 2 - 16, 14);
        ctx.lineTo(sleighW / 2 - 16, 4);
        ctx.stroke();

        // Sleigh body (Red)
        ctx.fillStyle = "#d62839";
        ctx.beginPath();
        ctx.moveTo(-sleighW / 2, 4);
        ctx.quadraticCurveTo(-sleighW / 2 - 4, -14, -sleighW / 2 + 14, -12);
        ctx.lineTo(sleighW / 2 - 12, -12);
        ctx.quadraticCurveTo(sleighW / 2 + 2, -12, sleighW / 2, 4);
        ctx.closePath();
        ctx.fill();

        // Gold trim
        ctx.strokeStyle = "#f4c430";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Santa Emoji in sleigh
        ctx.font = "24px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🎅", -6, -10);

        ctx.restore();
      }

      // Loop
      function gameLoop(time) {
        if (!root.isConnected) {
          window.removeEventListener("keydown", onKeyDown);
          window.removeEventListener("keyup", onKeyUp);
          window.removeEventListener("pointerup", stopDrag);
          cancelAnimationFrame(animId);
          return;
        }

        const spdMult = root.__fast ? 5 : 1;

        // Clear canvas
        ctx.clearRect(0, 0, CW, CH);

        // Snowflakes
        ctx.fillStyle = "rgba(245, 249, 255, 0.75)";
        snowflakes.forEach(sf => {
          sf.y += sf.speed * spdMult;
          sf.x += sf.drift * spdMult;
          if (sf.y > CH) { sf.y = -5; sf.x = Math.random() * CW; }
          if (sf.x > CW) sf.x = 0;
          if (sf.x < 0) sf.x = CW;
          ctx.beginPath();
          ctx.arc(sf.x, sf.y, sf.r, 0, Math.PI * 2);
          ctx.fill();
        });

        // Snowy ground
        ctx.fillStyle = "#153b66";
        ctx.beginPath();
        ctx.arc(CW / 2, CH + 80, CW * 0.75, 0, Math.PI, true);
        ctx.fill();
        ctx.strokeStyle = "#f5f9ff";
        ctx.lineWidth = 3;
        ctx.stroke();

        if (!gameOver) {
          // Move sleigh
          if (moveDir !== 0) {
            sleighX += moveDir * 6 * spdMult;
            sleighX = Math.max(sleighW / 2, Math.min(CW - sleighW / 2, sleighX));
          }

          // Spawning
          const spawnInterval = 42 / spdMult;
          if (time - lastSpawn > spawnInterval * 16.6) {
            spawnItem();
            lastSpawn = time;
          }
        }

        // Draw sleigh
        drawSleigh(sleighX, sleighY);

        // Update & draw items
        for (let i = items.length - 1; i >= 0; i--) {
          const item = items[i];
          if (!gameOver) {
            item.y += item.speed * spdMult;
          }

          // Draw item
          ctx.font = `${item.size}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(item.emoji, item.x, item.y);

          // Collision detection with sleigh
          if (!gameOver) {
            const hitY = item.y >= sleighY - 20 && item.y <= sleighY + 16;
            const hitX = Math.abs(item.x - sleighX) < (sleighW / 2 + 10);
            if (hitY && hitX) {
              if (item.type === "gift") {
                score++;
                createExplosion(item.x, item.y, "#f4c430");
                updateHUD();
                items.splice(i, 1);
                if (score >= TARGET_SCORE) {
                  showGameOver(true);
                  break;
                }
              } else {
                lives--;
                createExplosion(item.x, item.y, "#d62839");
                updateHUD();
                items.splice(i, 1);
                if (lives <= 0) {
                  showGameOver(false);
                  break;
                }
              }
              continue;
            }

            // Fall off screen
            if (item.y > CH + 30) {
              items.splice(i, 1);
            }
          }
        }

        // Update & draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx * spdMult;
          p.y += p.vy * spdMult;
          p.life -= 0.035 * spdMult;
          if (p.life <= 0) {
            particles.splice(i, 1);
          } else {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          }
        }

        // Expose internal state for Bot
        root.__gameState = {
          sleighX,
          sleighY,
          sleighW,
          items,
          score,
          lives,
          gameOver,
          gameWon,
          setSleighX: (nx) => { sleighX = Math.max(sleighW / 2, Math.min(CW - sleighW / 2, nx)); }
        };

        animId = requestAnimationFrame(gameLoop);
      }

      resetGame();
      animId = requestAnimationFrame(gameLoop);
    },

    async bot(root){
      root.__fast = true;

      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (!root.isConnected) {
            clearInterval(interval);
            resolve();
            return;
          }

          const state = root.__gameState;
          if (!state) return;

          if (state.gameOver) {
            if (state.gameWon) {
              clearInterval(interval);
              resolve();
            } else {
              // Click restart if lost
              const retryBtn = root.querySelector("#g24-retry-btn");
              if (retryBtn) retryBtn.click();
            }
            return;
          }

          // Bot AI: Find the lowest falling gift that is below Y: -10 and dodge rocks
          let targetGift = null;
          let lowestY = -999;
          const imminentRocks = [];

          for (const item of state.items) {
            if (item.type === "gift") {
              if (item.y < state.sleighY && item.y > lowestY) {
                lowestY = item.y;
                targetGift = item;
              }
            } else if (item.type === "rock") {
              if (item.y > state.sleighY - 120 && item.y < state.sleighY + 20) {
                imminentRocks.push(item);
              }
            }
          }

          let desiredX = targetGift ? targetGift.x : 200;

          // Check if desiredX collides with any imminent rock
          for (const rock of imminentRocks) {
            if (Math.abs(desiredX - rock.x) < 45) {
              if (rock.x > 200) {
                desiredX = Math.max(45, rock.x - 55);
              } else {
                desiredX = Math.min(355, rock.x + 55);
              }
            }
          }

          // Move sleigh directly toward desiredX
          state.setSleighX(desiredX);
        }, 16);
      });
    }
  };
})();