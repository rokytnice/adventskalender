(function(){
  Games[15] = {
    title: "Geschenke stapeln",
    hint: "Tippe oder drücke Leertaste, um 8 Geschenke aufeinander zu stapeln!",
    init(root, win){
      if(!document.getElementById('g15-style')){
        const style = document.createElement('style');
        style.id = 'g15-style';
        style.textContent = `
          .g15-container {
            position: relative;
            width: 100%;
            height: 460px;
            background: #0b1d33;
            overflow: hidden;
            font-family: system-ui, -apple-system, sans-serif;
            user-select: none;
            touch-action: manipulation;
            box-sizing: border-box;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
            color: #f5f9ff;
            outline: none;
          }
          .g15-canvas {
            display: block;
            width: 100%;
            height: 100%;
          }
          .g15-ui {
            position: absolute;
            top: 12px;
            left: 12px;
            right: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            pointer-events: none;
            font-weight: bold;
            font-size: 15px;
            z-index: 5;
          }
          .g15-badge {
            background: rgba(11, 29, 51, 0.75);
            backdrop-filter: blur(4px);
            padding: 6px 14px;
            border-radius: 20px;
            border: 1px solid rgba(244, 196, 48, 0.4);
            color: #f5f9ff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          }
          .g15-overlay {
            position: absolute;
            inset: 0;
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
          .g15-btn {
            background: #d62839;
            color: #f5f9ff;
            border: 2px solid #f4c430;
            padding: 12px 28px;
            font-size: 18px;
            font-weight: bold;
            border-radius: 30px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(214, 40, 57, 0.4);
            transition: transform 0.1s, background 0.2s;
            min-width: 160px;
            min-height: 48px;
            display: inline-flex;
            justify-content: center;
            align-items: center;
          }
          .g15-btn:hover {
            transform: scale(1.04);
            background: #e63946;
          }
          .g15-btn:active {
            transform: scale(0.96);
          }
          .g15-title {
            font-size: 24px;
            color: #f4c430;
            margin: 0;
          }
        `;
        document.head.appendChild(style);
      }

      root.innerHTML = `
        <div class="g15-container" tabindex="0">
          <canvas class="g15-canvas"></canvas>
          <div class="g15-ui">
            <div class="g15-badge" id="g15-score">Geschenke: 0 / 8</div>
            <div class="g15-badge" id="g15-perfect">Perfekt: 0</div>
          </div>
          <div class="g15-overlay" id="g15-overlay" style="display:none;">
            <h2 class="g15-title" id="g15-msg">Daneben!</h2>
            <button class="g15-btn" id="g15-restart">Nochmal</button>
          </div>
        </div>
      `;

      const container = root.querySelector('.g15-container');
      const canvas = root.querySelector('.g15-canvas');
      const ctx = canvas.getContext('2d');
      const scoreEl = root.querySelector('#g15-score');
      const perfectEl = root.querySelector('#g15-perfect');
      const overlay = root.querySelector('#g15-overlay');
      const msgEl = root.querySelector('#g15-msg');
      const restartBtn = root.querySelector('#g15-restart');

      const TARGET_COUNT = 8;
      const GIFT_COLORS = ['#d62839', '#1f7a4d', '#f4c430', '#1e6091', '#8338ec', '#e63946'];

      let width = 0;
      let height = 0;
      let animId = null;
      let gameActive = false;

      let stack = [];
      let currentBox = null;
      let fallingPieces = [];
      let perfectCount = 0;
      let cameraY = 0;
      let targetCameraY = 0;
      let speed = 2;
      let direction = 1;

      function resize() {
        width = container.clientWidth || 360;
        height = container.clientHeight || 460;
        canvas.width = width;
        canvas.height = height;
      }

      function initGame() {
        resize();
        stack = [];
        fallingPieces = [];
        perfectCount = 0;
        cameraY = 0;
        targetCameraY = 0;
        gameActive = true;
        overlay.style.display = 'none';

        const baseWidth = Math.min(width * 0.55, 170);
        const baseHeight = 36;
        const baseX = (width - baseWidth) / 2;
        const baseY = height - 70;

        stack.push({
          x: baseX,
          y: baseY,
          w: baseWidth,
          h: baseHeight,
          color: '#1f7a4d',
          pattern: 'base'
        });

        spawnNextBox();
        updateUI();
      }

      function spawnNextBox() {
        const top = stack[stack.length - 1];
        const boxHeight = 32;
        const level = stack.length - 1;
        
        const mult = root.__fast ? 4 : 1;
        speed = (2.2 + level * 0.3) * mult;
        direction = level % 2 === 0 ? 1 : -1;

        const startX = direction === 1 ? 5 : width - top.w - 5;

        currentBox = {
          x: startX,
          y: top.y - boxHeight,
          w: top.w,
          h: boxHeight,
          color: GIFT_COLORS[level % GIFT_COLORS.length],
          ribbonColor: '#f4c430'
        };
      }

      function updateUI() {
        const count = Math.max(0, stack.length - 1);
        scoreEl.textContent = `Geschenke: ${count} / ${TARGET_COUNT}`;
        perfectEl.textContent = `Perfekt: ${perfectCount}`;
      }

      function drop() {
        if (!gameActive || !currentBox) return;

        const top = stack[stack.length - 1];
        const diff = currentBox.x - top.x;
        const tolerance = 4;

        let newW = top.w - Math.abs(diff);
        let newX = currentBox.x;

        if (Math.abs(diff) <= tolerance) {
          newW = top.w;
          newX = top.x;
          perfectCount++;
        }

        if (newW <= 0) {
          gameActive = false;
          fallingPieces.push({
            x: currentBox.x,
            y: currentBox.y,
            w: currentBox.w,
            h: currentBox.h,
            vx: direction * speed,
            vy: 2,
            color: currentBox.color
          });
          currentBox = null;
          showGameOver(false);
          return;
        }

        if (Math.abs(diff) > tolerance) {
          let sliceX = diff > 0 ? top.x + top.w : currentBox.x;
          let sliceW = Math.abs(diff);
          fallingPieces.push({
            x: sliceX,
            y: currentBox.y,
            w: sliceW,
            h: currentBox.h,
            vx: diff > 0 ? 3 : -3,
            vy: 1,
            color: currentBox.color
          });
          newX = diff > 0 ? currentBox.x : top.x;
        }

        const placedBox = {
          x: newX,
          y: currentBox.y,
          w: newW,
          h: currentBox.h,
          color: currentBox.color,
          ribbonColor: currentBox.ribbonColor
        };

        stack.push(placedBox);
        updateUI();

        const stackHeight = stack.length * 32;
        if (stackHeight > height * 0.45) {
          targetCameraY = stackHeight - height * 0.45;
        }

        if (stack.length - 1 >= TARGET_COUNT) {
          gameActive = false;
          currentBox = null;
          showGameOver(true);
          win();
          return;
        }

        spawnNextBox();
      }

      function showGameOver(isWin) {
        msgEl.textContent = isWin ? '✨ Perfekt gestapelt! ✨' : 'Oje! Geschenk verfehlt!';
        msgEl.style.color = isWin ? '#f4c430' : '#d62839';
        restartBtn.textContent = isWin ? 'Nochmal spielen' : 'Nochmal';
        overlay.style.display = 'flex';
      }

      function drawGift(b) {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x, b.y, b.w, b.h);

        if (b.ribbonColor) {
          ctx.fillStyle = b.ribbonColor;
          const rw = Math.min(8, b.w * 0.2);
          ctx.fillRect(b.x + (b.w - rw) / 2, b.y, rw, b.h);

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(b.x + b.w / 2, b.y + 4, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        if (b.pattern === 'base') {
          ctx.fillStyle = '#f5f9ff';
          ctx.fillRect(b.x - 4, b.y, b.w + 8, 8);
        }
      }

      const flakes = Array.from({length: 35}, () => ({
        x: Math.random() * (width || 360),
        y: Math.random() * (height || 460),
        r: Math.random() * 2 + 1,
        speed: Math.random() * 0.8 + 0.3
      }));

      function render() {
        if (!root.isConnected) {
          cancelAnimationFrame(animId);
          return;
        }

        cameraY += (targetCameraY - cameraY) * 0.12;

        ctx.save();
        ctx.clearRect(0, 0, width, height);

        const mult = root.__fast ? 4 : 1;

        ctx.fillStyle = '#f5f9ff';
        flakes.forEach(f => {
          f.y += f.speed * mult;
          if (f.y > height) f.y = 0;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.translate(0, cameraY);

        if (gameActive && currentBox) {
          currentBox.x += speed * direction;
          if (currentBox.x < 5) {
            currentBox.x = 5;
            direction = 1;
          } else if (currentBox.x + currentBox.w > width - 5) {
            currentBox.x = width - 5 - currentBox.w;
            direction = -1;
          }
        }

        for (let b of stack) {
          drawGift(b);
        }

        if (currentBox) {
          drawGift(currentBox);
        }

        for (let i = fallingPieces.length - 1; i >= 0; i--) {
          let p = fallingPieces[i];
          p.x += p.vx * mult;
          p.y += p.vy * mult;
          p.vy += 0.35 * mult;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.w, p.h);

          if (p.y > height + cameraY + 100) {
            fallingPieces.splice(i, 1);
          }
        }

        ctx.restore();
        animId = requestAnimationFrame(render);
      }

      function handleAction(e) {
        if (e.type === 'keydown' && e.code !== 'Space' && e.code !== 'ArrowUp' && e.code !== 'Enter') return;
        if (e.type === 'keydown') e.preventDefault();
        
        if (gameActive) {
          drop();
        }
      }

      container.addEventListener('pointerdown', (e) => {
        if (e.target === restartBtn) return;
        handleAction(e);
      });

      const onKeyDown = (e) => {
        if (!root.isConnected) {
          window.removeEventListener('keydown', onKeyDown);
          return;
        }
        if (container.contains(document.activeElement) || document.activeElement === root) {
          handleAction(e);
        }
      };

      window.addEventListener('keydown', onKeyDown);

      restartBtn.addEventListener('click', () => {
        initGame();
      });

      root.__g15_drop = drop;
      root.__g15_getState = () => ({ gameActive, currentBox, top: stack[stack.length - 1], speed });

      initGame();
      render();
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

          if (typeof root.__g15_getState !== 'function') return;

          const state = root.__g15_getState();
          if (!state.gameActive) {
            const scoreBadge = root.querySelector('#g15-score');
            if (scoreBadge && scoreBadge.textContent.includes('8 / 8')) {
              clearInterval(interval);
              resolve();
            } else {
              const btn = root.querySelector('#g15-restart');
              if (btn) btn.click();
            }
            return;
          }

          if (state.currentBox && state.top) {
            const diff = Math.abs(state.currentBox.x - state.top.x);
            const margin = Math.max(4, Math.abs(state.speed) * 0.85);
            if (diff <= margin) {
              root.__g15_drop();
            }
          }
        }, 16);
      });
    }
  };
})();