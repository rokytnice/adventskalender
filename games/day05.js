(function(){
  if (typeof Games === 'undefined') window.Games = {};

  Games[5] = {
    title: "Schneemann-Baumeister",
    hint: "Tippe oder ziehe die Teile in der richtigen Reihenfolge (von unten nach oben) auf das Feld!",
    
    init(root, win) {
      const STEPS = [
        { id: 'bottom', name: 'Große Kugel', icon: '⚪' },
        { id: 'middle', name: 'Bauch-Kugel', icon: '⚪' },
        { id: 'head',   name: 'Kopf-Kugel',  icon: '⚪' },
        { id: 'scarf',  name: 'Schal',       icon: '🧣' },
        { id: 'arms',   name: 'Zweig-Arme',  icon: '🪵' },
        { id: 'nose',   name: 'Möhrennase',  icon: '🥕' },
        { id: 'hat',    name: 'Zylinder-Hut',icon: '🎩' }
      ];

      // Inject CSS
      let styleEl = root.querySelector('#g5-style');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'g5-style';
        styleEl.textContent = `
          .g5-container {
            width: 100%;
            max-width: 560px;
            margin: 0 auto;
            background: #0b1d33;
            color: #f5f9ff;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            box-sizing: border-box;
            padding: 12px;
            border-radius: 16px;
            position: relative;
            user-select: none;
            -webkit-user-select: none;
            overflow: hidden;
          }
          .g5-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding: 0 4px;
          }
          .g5-title {
            font-size: 16px;
            font-weight: bold;
            color: #f4c430;
          }
          .g5-timer {
            font-size: 16px;
            font-weight: bold;
            background: rgba(255, 255, 255, 0.1);
            padding: 4px 12px;
            border-radius: 12px;
            color: #f5f9ff;
            border: 1px solid rgba(244, 196, 48, 0.3);
          }
          .g5-timer.g5-low {
            color: #d62839;
            border-color: #d62839;
            animation: g5-pulse 0.5s infinite alternate;
          }
          @keyframes g5-pulse {
            from { opacity: 1; }
            to { opacity: 0.5; }
          }
          .g5-target-area {
            width: 100%;
            height: 260px;
            background: radial-gradient(circle at 50% 30%, #17385c 0%, #0b1d33 80%);
            border-radius: 12px;
            position: relative;
            border: 2px dashed rgba(244, 196, 48, 0.3);
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
          }
          .g5-target-area.g5-drag-over {
            border-color: #f4c430;
            background: radial-gradient(circle at 50% 30%, #1f7a4d 0%, #0b1d33 80%);
          }
          .g5-svg-canvas {
            width: 100%;
            height: 100%;
            max-height: 260px;
          }
          .g5-instruction {
            text-align: center;
            font-size: 13px;
            color: #a5f3fc;
            margin: 8px 0;
            min-height: 18px;
          }
          .g5-feedback {
            text-align: center;
            font-size: 13px;
            font-weight: bold;
            height: 18px;
            color: #d62839;
            margin-bottom: 4px;
          }
          .g5-tray {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-top: 4px;
          }
          @media (max-width: 400px) {
            .g5-tray {
              grid-template-columns: repeat(3, 1fr);
            }
          }
          .g5-part-card {
            min-height: 48px;
            background: rgba(31, 122, 77, 0.25);
            border: 2px solid #1f7a4d;
            border-radius: 10px;
            color: #f5f9ff;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 6px 2px;
            font-size: 11px;
            font-weight: 600;
            transition: transform 0.1s, background 0.15s, border-color 0.15s;
            touch-action: none;
          }
          .g5-part-card:hover, .g5-part-card:focus {
            background: rgba(31, 122, 77, 0.5);
            border-color: #f4c430;
            outline: none;
          }
          .g5-part-card:active {
            transform: scale(0.94);
          }
          .g5-part-card.g5-disabled {
            opacity: 0.2;
            pointer-events: none;
            border-color: transparent;
            background: rgba(255,255,255,0.05);
          }
          .g5-part-card.g5-shake {
            animation: g5-shake-anim 0.35s ease-in-out;
            border-color: #d62839;
            background: rgba(214, 40, 57, 0.3);
          }
          @keyframes g5-shake-anim {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-6px); }
            40%, 80% { transform: translateX(6px); }
          }
          .g5-overlay {
            position: absolute;
            inset: 0;
            background: rgba(11, 29, 51, 0.92);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            z-index: 20;
            padding: 20px;
            text-align: center;
          }
          .g5-overlay-title {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #f4c430;
          }
          .g5-overlay-desc {
            font-size: 14px;
            margin-bottom: 20px;
            color: #f5f9ff;
          }
          .g5-btn-restart {
            min-width: 140px;
            min-height: 44px;
            background: #d62839;
            color: #f5f9ff;
            font-size: 16px;
            font-weight: bold;
            border: none;
            border-radius: 22px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(214, 40, 57, 0.4);
            transition: transform 0.15s, background 0.15s;
          }
          .g5-btn-restart:hover {
            background: #e63946;
            transform: scale(1.05);
          }
          .g5-btn-restart:active {
            transform: scale(0.95);
          }
          .g5-drag-ghost {
            position: fixed;
            pointer-events: none;
            z-index: 999;
            opacity: 0.85;
            transform: translate(-50%, -50%) scale(1.1);
            background: #1f7a4d;
            border: 2px solid #f4c430;
            border-radius: 10px;
            padding: 8px 12px;
            color: #fff;
            font-size: 12px;
            font-weight: bold;
          }
        `;
        root.appendChild(styleEl);
      }

      // Render Base DOM
      root.innerHTML = '';
      const container = document.createElement('div');
      container.className = 'g5-container';
      container.innerHTML = `
        <div class="g5-header">
          <div class="g5-title">☃️ Schneemann bauen</div>
          <div class="g5-timer" id="g5-timer-display">30.0s</div>
        </div>
        <div class="g5-instruction" id="g5-instruct">Schritt 1: Platziere die Große Kugel!</div>
        <div class="g5-target-area" id="g5-drop-zone">
          <svg class="g5-svg-canvas" viewBox="0 0 300 320" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="g5-snow-ball" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="85%" stop-color="#e2e8f0"/>
                <stop offset="100%" stop-color="#cbd5e1"/>
              </radialGradient>
            </defs>
            <!-- Guide outlines -->
            <g opacity="0.12" stroke="#ffffff" stroke-width="2" stroke-dasharray="4" fill="none">
              <circle cx="150" cy="245" r="50"/>
              <circle cx="150" cy="160" r="38"/>
              <circle cx="150" cy="95" r="28"/>
            </g>
            <!-- Placed Parts Layers -->
            <g id="g5-layer-bottom" style="display:none;">
              <circle cx="150" cy="245" r="50" fill="url(#g5-snow-ball)" stroke="#cbd5e1" stroke-width="2"/>
            </g>
            <g id="g5-layer-middle" style="display:none;">
              <circle cx="150" cy="160" r="38" fill="url(#g5-snow-ball)" stroke="#cbd5e1" stroke-width="2"/>
              <circle cx="150" cy="150" r="3.5" fill="#1e293b"/>
              <circle cx="150" cy="172" r="3.5" fill="#1e293b"/>
            </g>
            <g id="g5-layer-head" style="display:none;">
              <circle cx="150" cy="95" r="28" fill="url(#g5-snow-ball)" stroke="#cbd5e1" stroke-width="2"/>
              <circle cx="140" cy="88" r="3" fill="#1e293b"/>
              <circle cx="160" cy="88" r="3" fill="#1e293b"/>
              <path d="M142 106 Q150 112 158 106" stroke="#1e293b" stroke-width="2" fill="none" stroke-linecap="round"/>
            </g>
            <g id="g5-layer-scarf" style="display:none;">
              <path d="M128 116 C138 124 162 124 172 116 C178 128 172 155 164 162 L150 162 C157 148 158 130 154 120 Z" fill="#d62839"/>
              <rect x="150" y="155" width="14" height="4" fill="#f4c430"/>
            </g>
            <g id="g5-layer-arms" style="display:none;">
              <path d="M114 155 L65 130 M65 130 L55 118 M65 130 L52 138" stroke="#78350f" stroke-width="4.5" stroke-linecap="round"/>
              <path d="M186 155 L235 130 M235 130 L245 118 M235 130 L248 138" stroke="#78350f" stroke-width="4.5" stroke-linecap="round"/>
            </g>
            <g id="g5-layer-nose" style="display:none;">
              <polygon points="148,93 182,97 148,101" fill="#ff7700" stroke="#d97706" stroke-width="1"/>
            </g>
            <g id="g5-layer-hat" style="display:none;">
              <ellipse cx="150" cy="70" rx="32" ry="6" fill="#1e293b"/>
              <rect x="128" y="36" width="44" height="33" rx="3" fill="#1e293b"/>
              <rect x="128" y="62" width="44" height="5" fill="#f4c430"/>
            </g>
          </svg>
        </div>
        <div class="g5-feedback" id="g5-feedback"></div>
        <div class="g5-tray" id="g5-tray"></div>
        <div class="g5-overlay" id="g5-overlay" style="display:none;">
          <div class="g5-overlay-title" id="g5-overlay-title">Verloren!</div>
          <div class="g5-overlay-desc" id="g5-overlay-desc">Die Zeit ist abgelaufen.</div>
          <button class="g5-btn-restart" id="g5-btn-restart">Nochmal</button>
        </div>
      `;
      root.appendChild(container);

      // State Variables
      let currentStep = 0;
      let timeLeft = 30.0;
      let gameActive = true;
      let timerInterval = null;
      let hasWon = false;

      const timerDisplay = root.querySelector('#g5-timer-display');
      const instructEl = root.querySelector('#g5-instruct');
      const feedbackEl = root.querySelector('#g5-feedback');
      const trayEl = root.querySelector('#g5-tray');
      const dropZone = root.querySelector('#g5-drop-zone');
      const overlay = root.querySelector('#g5-overlay');
      const restartBtn = root.querySelector('#g5-btn-restart');

      // Shuffle tray items for variety
      function getShuffledSteps() {
        const arr = [...STEPS];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      }

      const shuffledTrayItems = getShuffledSteps();

      function updateInstruction() {
        if (currentStep < STEPS.length) {
          instructEl.textContent = `Nächster Schritt: Platziere "${STEPS[currentStep].name}" (${currentStep + 1}/${STEPS.length})`;
        } else {
          instructEl.textContent = 'Perfekt! Schneemann ist fertig! 🎉';
        }
      }

      function renderTray() {
        trayEl.innerHTML = '';
        shuffledTrayItems.forEach(item => {
          const btn = document.createElement('button');
          btn.className = 'g5-part-card';
          btn.dataset.id = item.id;
          btn.innerHTML = `<span style="font-size:18px;">${item.icon}</span><span>${item.name}</span>`;

          // Handle Touch & Drag / Click
          let isDragging = false;
          let ghostEl = null;

          const handleStart = (e) => {
            if (!gameActive || btn.classList.contains('g5-disabled')) return;
            isDragging = false;
          };

          const handleMove = (e) => {
            if (!gameActive || btn.classList.contains('g5-disabled')) return;
            const pointer = e.touches ? e.touches[0] : e;
            if (!isDragging) {
              isDragging = true;
              ghostEl = document.createElement('div');
              ghostEl.className = 'g5-drag-ghost';
              ghostEl.innerHTML = `${item.icon} ${item.name}`;
              document.body.appendChild(ghostEl);
            }
            if (ghostEl) {
              ghostEl.style.left = pointer.clientX + 'px';
              ghostEl.style.top = pointer.clientY + 'px';
            }
          };

          const handleEnd = (e) => {
            if (ghostEl) {
              ghostEl.remove();
              ghostEl = null;
            }
            if (!gameActive || btn.classList.contains('g5-disabled')) return;

            if (isDragging) {
              const pointer = e.changedTouches ? e.changedTouches[0] : e;
              const rect = dropZone.getBoundingClientRect();
              if (
                pointer.clientX >= rect.left &&
                pointer.clientX <= rect.right &&
                pointer.clientY >= rect.top &&
                pointer.clientY <= rect.bottom
              ) {
                tryPlacePart(item.id, btn);
              }
            } else {
              // Direct click / tap
              tryPlacePart(item.id, btn);
            }
            isDragging = false;
          };

          btn.addEventListener('pointerdown', handleStart);
          btn.addEventListener('pointermove', handleMove);
          btn.addEventListener('pointerup', handleEnd);
          btn.addEventListener('click', (e) => {
            if (!isDragging && gameActive && !btn.classList.contains('g5-disabled')) {
              tryPlacePart(item.id, btn);
            }
          });

          trayEl.appendChild(btn);
        });
      }

      function tryPlacePart(partId, btnEl) {
        if (!gameActive) return;

        const expectedPart = STEPS[currentStep];
        if (partId === expectedPart.id) {
          // Correct placement!
          feedbackEl.textContent = '';
          btnEl.classList.add('g5-disabled');
          
          const layer = root.querySelector('#g5-layer-' + partId);
          if (layer) layer.style.display = 'block';

          currentStep++;
          updateInstruction();

          if (currentStep >= STEPS.length) {
            // Victory
            gameActive = false;
            clearInterval(timerInterval);
            if (!hasWon) {
              hasWon = true;
              setTimeout(() => {
                if (root.isConnected) win();
              }, 300);
            }
          }
        } else {
          // Wrong order!
          btnEl.classList.add('g5-shake');
          setTimeout(() => btnEl.classList.remove('g5-shake'), 400);

          // Time penalty
          const penalty = root.__fast ? 1.0 : 3.0;
          timeLeft = Math.max(0, timeLeft - penalty);
          feedbackEl.textContent = `Falsche Reihenfolge! (-${penalty}s)`;
          setTimeout(() => {
            if (root.isConnected && feedbackEl.textContent.includes('Falsche')) {
              feedbackEl.textContent = '';
            }
          }, 1500);
        }
      }

      function gameOver() {
        gameActive = false;
        clearInterval(timerInterval);
        overlay.style.display = 'flex';
        root.querySelector('#g5-overlay-title').textContent = 'Zeit abgelaufen!';
        root.querySelector('#g5-overlay-desc').textContent = 'Der Schneemann ist leider nicht fertig geworden.';
      }

      restartBtn.addEventListener('click', () => {
        // Reset state
        currentStep = 0;
        timeLeft = 30.0;
        gameActive = true;
        hasWon = false;
        overlay.style.display = 'none';
        feedbackEl.textContent = '';

        // Hide layers
        STEPS.forEach(s => {
          const l = root.querySelector('#g5-layer-' + s.id);
          if (l) l.style.display = 'none';
        });

        // Reset tray
        renderTray();
        updateInstruction();
        startTimer();
      });

      function startTimer() {
        clearInterval(timerInterval);
        const tickRate = 100;
        timerInterval = setInterval(() => {
          if (!root.isConnected) {
            clearInterval(timerInterval);
            return;
          }

          const speed = root.__fast ? 5 : 1;
          timeLeft -= (tickRate / 1000) * speed;

          if (timeLeft <= 0) {
            timeLeft = 0;
            timerDisplay.textContent = '0.0s';
            gameOver();
          } else {
            timerDisplay.textContent = timeLeft.toFixed(1) + 's';
            if (timeLeft <= 5.0) {
              timerDisplay.classList.add('g5-low');
            } else {
              timerDisplay.classList.remove('g5-low');
            }
          }
        }, tickRate);
      }

      // Initial Start
      renderTray();
      updateInstruction();
      startTimer();
    },

    async bot(root) {
      root.__fast = true;
      const STEPS_ORDER = ['bottom', 'middle', 'head', 'scarf', 'arms', 'nose', 'hat'];
      
      while (root.isConnected) {
        // Check if game over screen active -> click restart
        const overlay = root.querySelector('#g5-overlay');
        if (overlay && overlay.style.display !== 'none') {
          const restartBtn = root.querySelector('#g5-btn-restart');
          if (restartBtn) restartBtn.click();
          await new Promise(r => setTimeout(r, 50));
          continue;
        }

        // Find next required step
        let foundAction = false;
        for (let partId of STEPS_ORDER) {
          const btn = root.querySelector(`.g5-part-card[data-id="${partId}"]`);
          if (btn && !btn.classList.contains('g5-disabled')) {
            btn.click();
            foundAction = true;
            break;
          }
        }

        if (!foundAction) {
          // Completed or ended
          break;
        }

        await new Promise(r => setTimeout(r, 60));
      }
    }
  };
})();