(function(){
  if (!document.getElementById("g2-styles")) {
    const style = document.createElement("style");
    style.id = "g2-styles";
    style.textContent = `
      .g2-container {
        position: relative;
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
        background: #0b1d33;
        color: #f5f9ff;
        font-family: system-ui, -apple-system, sans-serif;
        box-sizing: border-box;
        border-radius: 12px;
        overflow: hidden;
        user-select: none;
        touch-action: none;
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      }
      .g2-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: rgba(31, 122, 77, 0.4);
        border-bottom: 2px solid #1f7a4d;
        font-weight: bold;
        font-size: 1.1rem;
      }
      .g2-canvas {
        display: block;
        width: 100%;
        height: auto;
        aspect-ratio: 4/5;
        background: radial-gradient(circle at center, #132a47 0%, #0b1d33 100%);
        cursor: pointer;
      }
      .g2-overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(11, 29, 51, 0.88);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 16px;
        z-index: 10;
        padding: 20px;
        text-align: center;
      }
      .g2-overlay.g2-hidden {
        display: none;
      }
      .g2-btn {
        background: #d62839;
        color: #f5f9ff;
        border: 2px solid #f4c430;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 1.1rem;
        font-weight: bold;
        min-height: 48px;
        min-width: 140px;
        cursor: pointer;
        transition: transform 0.1s, background 0.2s;
        box-shadow: 0 4px 12px rgba(214, 40, 57, 0.4);
      }
      .g2-btn:hover, .g2-btn:active {
        background: #e63946;
        transform: scale(1.05);
      }
      .g2-title-text {
        font-size: 1.6rem;
        color: #f4c430;
        margin: 0;
        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
      }
      .g2-score-badge {
        color: #f4c430;
      }
      .g2-lives {
        color: #d62839;
        letter-spacing: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  Games[2] = {
    title: "Schneeflocken Fangen",
    hint: "Bewege den Korb mit Finger, Maus oder Pfeiltasten. Fange 15 Schneeflocken und weiche der Kohle aus!",

    init(root, win) {
      root.innerHTML = `
        <div class="g2-container">
          <div class="g2-header">
            <div class="g2-score-badge">❄️ <span id="g2-score">0</span> / 15</div>
            <div class="g2-lives" id="g2-lives">❤️ ❤️ ❤️</div>
          </div>
          <canvas class="g2-canvas" width="400" height="500"></canvas>
          <div class="g2-overlay g2-hidden" id="g2-overlay">
            <h2 class="g2-title-text" id="g2-overlay-title">Oje!</h2>
            <p id="g2-overlay-msg" style="margin: 0; color: #f5f9ff;"></p>
            <button class="g2-btn" id="g2-restart-btn">Nochmal</button>
          </div>
        </div>
      `;

      const canvas = root.querySelector('.g2-canvas');
      const ctx = canvas.getContext('2d');
      const scoreEl = root.querySelector('#g2-score');
      const livesEl = root.querySelector('#g2-lives');
      const overlay = root.querySelector('#g2-overlay');
      const overlayTitle = root.querySelector('#g2-overlay-title');
      const overlayMsg = root.querySelector('#g2-overlay-msg');
      const restartBtn = root.querySelector('#g2-restart-btn');

      const W = 400;
      const H = 500;

      let score = 0;
      let lives = 3;
      let gameState = 'PLAYING';
      let items = [];
      let lastSpawn = 0;
      let animId = null;
      let hasWonTriggered = false;

      const basket = {
        x: W / 2,
        y: H - 45,
        w: 70,
        h: 24
      };

      function resetGame() {
        score = 0;
        lives = 3;
        items = [];
        gameState = 'PLAYING';
        hasWonTriggered = false;
        basket.x = W / 2;
        updateUI();
        overlay.classList.add('g2-hidden');
      }

      function updateUI() {
        scoreEl.textContent = score;
        livesEl.textContent = lives > 0 ? '❤️'.repeat(lives) : '💔';
      }

      function showOverlay(title, msg, btnText) {
        overlayTitle.textContent = title;
        overlayMsg.textContent = msg;
        restartBtn.textContent = btnText;
        overlay.classList.remove('g2-hidden');
      }

      function moveBasketX(clientX) {
        if (gameState !== 'PLAYING') return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = W / rect.width;
        let newX = (clientX - rect.left) * scaleX;
        basket.x = Math.max(basket.w / 2, Math.min(W - basket.w / 2, newX));
      }

      function handleMouseMove(e) {
        moveBasketX(e.clientX);
      }

      function handleTouchMove(e) {
        if (e.touches.length > 0) {
          moveBasketX(e.touches[0].clientX);
        }
      }

      const keys = {};
      function handleKeyDown(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'a' || e.key === 'd') {
          keys[e.key] = true;
        }
      }
      function handleKeyUp(e) {
        if (keys[e.key]) {
          keys[e.key] = false;
        }
      }

      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
      canvas.addEventListener('touchstart', handleTouchMove, { passive: true });
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      restartBtn.addEventListener('click', () => {
        resetGame();
      });

      function spawnItem() {
        const isCoal = Math.random() < 0.25;
        items.push({
          x: Math.random() * (W - 50) + 25,
          y: -20,
          speed: 130 + Math.random() * 70,
          isCoal: isCoal,
          radius: 16,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 4
        });
      }

      let lastTime = performance.now();

      function gameLoop(now) {
        if (!root.isConnected) {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
          return;
        }

        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        const speedMult = root.__fast ? 5 : 1;
        const effectiveDt = dt * speedMult;

        if (gameState === 'PLAYING') {
          const kbSpeed = 380 * effectiveDt;
          if (keys['ArrowLeft'] || keys['a']) {
            basket.x = Math.max(basket.w / 2, basket.x - kbSpeed);
          }
          if (keys['ArrowRight'] || keys['d']) {
            basket.x = Math.min(W - basket.w / 2, basket.x + kbSpeed);
          }

          lastSpawn += effectiveDt;
          const spawnInterval = root.__fast ? 0.12 : 0.6;
          if (lastSpawn > spawnInterval) {
            spawnItem();
            lastSpawn = 0;
          }

          for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            item.y += item.speed * effectiveDt;
            item.rotation += item.rotSpeed * effectiveDt;

            const basketTop = basket.y - basket.h / 2;
            const basketBottom = basket.y + basket.h / 2;
            const basketLeft = basket.x - basket.w / 2;
            const basketRight = basket.x + basket.w / 2;

            if (
              item.y + item.radius >= basketTop &&
              item.y - item.radius <= basketBottom &&
              item.x >= basketLeft - 6 &&
              item.x <= basketRight + 6
            ) {
              if (item.isCoal) {
                lives--;
                updateUI();
                if (lives <= 0) {
                  gameState = 'LOST';
                  showOverlay('Oje, zu viel Kohle!', 'Versuche es noch einmal!', 'Nochmal');
                }
              } else {
                score++;
                updateUI();
                if (score >= 15) {
                  gameState = 'WON';
                  showOverlay('Gewonnen! 🎉', 'Du hast 15 Schneeflocken gefangen!', 'Nochmal');
                  if (!hasWonTriggered) {
                    hasWonTriggered = true;
                    win();
                  }
                }
              }
              items.splice(i, 1);
              continue;
            }

            if (item.y > H + 30) {
              items.splice(i, 1);
            }
          }
        }

        ctx.clearRect(0, 0, W, H);

        ctx.fillStyle = "rgba(245, 249, 255, 0.15)";
        for (let i = 0; i < 20; i++) {
          const sx = (Math.sin(now * 0.001 + i * 17) * 0.5 + 0.5) * W;
          const sy = ((now * 0.05 + i * 40) % H);
          ctx.beginPath();
          ctx.arc(sx, sy, (i % 3) + 1, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.save();
        ctx.translate(basket.x, basket.y);

        ctx.fillStyle = '#1f7a4d';
        ctx.strokeStyle = '#f4c430';
        ctx.lineWidth = 3;
        ctx.fillRect(-basket.w / 2, -basket.h / 2, basket.w, basket.h);
        ctx.strokeRect(-basket.w / 2, -basket.h / 2, basket.w, basket.h);

        ctx.fillStyle = '#d62839';
        ctx.fillRect(-basket.w / 2 - 4, -basket.h / 2 - 4, basket.w + 8, 8);

        ctx.fillStyle = '#f4c430';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🎁', 0, 2);

        ctx.restore();

        items.forEach(item => {
          ctx.save();
          ctx.translate(item.x, item.y);
          ctx.rotate(item.rotation);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          if (item.isCoal) {
            ctx.font = '24px sans-serif';
            ctx.fillText('💣', 0, 0);
          } else {
            ctx.font = '26px sans-serif';
            ctx.fillText('❄️', 0, 0);
          }
          ctx.restore();
        });

        root.__basketX = basket.x;
        root.__items = items;

        animId = requestAnimationFrame(gameLoop);
      }

      animId = requestAnimationFrame(gameLoop);
    },

    async bot(root) {
      root.__fast = true;

      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (!root.isConnected) {
            clearInterval(interval);
            resolve();
            return;
          }

          const overlay = root.querySelector('#g2-overlay');
          const isHidden = overlay && overlay.classList.contains('g2-hidden');

          if (!isHidden) {
            const titleText = overlay.querySelector('#g2-overlay-title').textContent;
            const restartBtn = root.querySelector('#g2-restart-btn');
            if (titleText.includes('Gewonnen')) {
              clearInterval(interval);
              resolve();
              return;
            } else if (restartBtn) {
              restartBtn.click();
              return;
            }
          }

          const items = root.__items || [];
          const canvas = root.querySelector('.g2-canvas');
          if (!canvas) return;

          const snowflakes = items
            .filter(i => !i.isCoal && i.y < 430)
            .sort((a, b) => b.y - a.y);

          const coalItems = items.filter(i => i.isCoal && i.y > 200 && i.y < 460);

          let targetX = root.__basketX || 200;

          if (snowflakes.length > 0) {
            targetX = snowflakes[0].x;
          }

          for (let coal of coalItems) {
            if (Math.abs(coal.x - targetX) < 48 && Math.abs(coal.y - 430) < 60) {
              if (coal.x < targetX) {
                targetX = Math.min(360, targetX + 55);
              } else {
                targetX = Math.max(40, targetX - 55);
              }
            }
          }

          const rect = canvas.getBoundingClientRect();
          const clientX = rect.left + (targetX / 400) * rect.width;
          const clientY = rect.top + rect.height / 2;

          const mouseEvent = new MouseEvent('mousemove', {
            clientX: clientX,
            clientY: clientY,
            bubbles: true
          });
          canvas.dispatchEvent(mouseEvent);

        }, 25);
      });
    }
  };
})();