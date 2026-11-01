(function(){
  if (typeof Games === 'undefined') window.Games = {};

  const styleId = 'g12-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .g12-wrap {
        background-color: #0b1d33;
        color: #f5f9ff;
        font-family: system-ui, -apple-system, sans-serif;
        padding: 16px;
        border-radius: 12px;
        box-sizing: border-box;
        width: 100%;
        max-width: 560px;
        margin: 0 auto;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
        position: relative;
        overflow: hidden;
      }
      .g12-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-size: 1.1rem;
        font-weight: bold;
      }
      .g12-stat {
        background: #1f7a4d;
        padding: 6px 14px;
        border-radius: 20px;
        border: 2px solid #f4c430;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }
      .g12-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        width: 100%;
        max-width: 420px;
        margin: 0 auto;
      }
      .g12-hole {
        background: #061120;
        border: 4px solid #1f7a4d;
        border-radius: 50%;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 8px 12px rgba(0,0,0,0.8), 0 4px 6px rgba(0,0,0,0.3);
        aspect-ratio: 1;
        min-height: 64px;
        min-width: 64px;
      }
      .g12-hole:focus {
        outline: 3px solid #f4c430;
        outline-offset: 2px;
      }
      .g12-snow {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 25%;
        background: #f5f9ff;
        border-radius: 0 0 50% 50%;
        z-index: 2;
        pointer-events: none;
      }
      .g12-item {
        font-size: 2.4rem;
        position: absolute;
        bottom: -100%;
        transition: bottom 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        pointer-events: none;
        z-index: 1;
        line-height: 1;
      }
      .g12-item.g12-up {
        bottom: 20%;
        pointer-events: auto;
      }
      .g12-badge {
        position: absolute;
        top: 6px;
        left: 10px;
        font-size: 0.75rem;
        font-weight: bold;
        color: #f4c430;
        opacity: 0.6;
        z-index: 3;
        pointer-events: none;
      }
      .g12-overlay {
        position: absolute;
        inset: 0;
        background: rgba(11, 29, 51, 0.92);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        z-index: 10;
        padding: 20px;
        text-align: center;
      }
      .g12-btn {
        background: #d62839;
        color: #f5f9ff;
        border: 2px solid #f4c430;
        padding: 12px 28px;
        font-size: 1.1rem;
        font-weight: bold;
        border-radius: 8px;
        cursor: pointer;
        min-height: 48px;
        min-width: 140px;
        margin-top: 14px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.4);
      }
      .g12-btn:hover, .g12-btn:focus {
        background: #f4c430;
        color: #0b1d33;
      }
      .g12-hit-effect {
        animation: g12-pop 0.2s ease-out;
      }
      @keyframes g12-pop {
        0% { transform: scale(1); }
        50% { transform: scale(1.15); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }

  Games[12] = {
    title: "Wichtel hauen",
    hint: "Haue 12 freche Wichtel (🧝) in 30 Sekunden! Hüte dich vor Rentieren (🦌).",

    init(root, win) {
      if (root._g12_cleanup) root._g12_cleanup();

      let hits = 0;
      const targetHits = 12;
      let timeLeft = 30.0;
      let gameActive = false;
      let timerInterval = null;
      let spawnTimeout = null;
      let won = false;

      const holesState = Array.from({ length: 9 }, () => ({ type: null, active: false, timeout: null }));

      root.innerHTML = `
        <div class="g12-wrap">
          <div class="g12-header">
            <div class="g12-stat">Treffer: <span id="g12-score">0</span>/${targetHits}</div>
            <div class="g12-stat">Zeit: <span id="g12-time">30.0</span>s</div>
          </div>
          <div class="g12-grid" id="g12-grid">
            ${Array.from({ length: 9 }, (_, i) => `
              <div class="g12-hole" data-idx="${i}" tabindex="0" role="button" aria-label="Loch ${i + 1}">
                <span class="g12-badge">${i + 1}</span>
                <div class="g12-item" id="g12-item-${i}"></div>
                <div class="g12-snow"></div>
              </div>
            `).join('')}
          </div>
          <div class="g12-overlay" id="g12-overlay">
            <h2 style="color:#f4c430; margin:0 0 8px 0;">Wichtel hauen</h2>
            <p style="margin:0 0 16px 0;">Treffe 12 Wichtel in 30 Sekunden!</p>
            <button class="g12-btn" id="g12-start-btn">Start</button>
          </div>
        </div>
      `;

      const scoreEl = root.querySelector('#g12-score');
      const timeEl = root.querySelector('#g12-time');
      const overlayEl = root.querySelector('#g12-overlay');
      const startBtn = root.querySelector('#g12-start-btn');
      const gridEl = root.querySelector('#g12-grid');

      function cleanup() {
        if (timerInterval) clearInterval(timerInterval);
        if (spawnTimeout) clearTimeout(spawnTimeout);
        holesState.forEach(h => { if (h.timeout) clearTimeout(h.timeout); });
      }

      function getSpeedMultiplier() {
        return root.__fast ? 5 : 1;
      }

      function startGame() {
        cleanup();
        hits = 0;
        timeLeft = 30.0;
        won = false;
        gameActive = true;
        scoreEl.textContent = '0';
        timeEl.textContent = '30.0';
        overlayEl.style.display = 'none';

        for (let i = 0; i < 9; i++) {
          hideItem(i);
        }

        const tickRate = 100;
        timerInterval = setInterval(() => {
          if (!root.isConnected) {
            cleanup();
            return;
          }
          const speed = getSpeedMultiplier();
          timeLeft -= (tickRate / 1000) * speed;
          if (timeLeft <= 0) {
            timeLeft = 0;
            timeEl.textContent = '0.0';
            endGame(false);
          } else {
            timeEl.textContent = timeLeft.toFixed(1);
          }
        }, tickRate);

        scheduleNextSpawn();
      }

      function endGame(isWin) {
        gameActive = false;
        cleanup();
        if (isWin && !won) {
          won = true;
          win();
        } else if (!isWin) {
          overlayEl.innerHTML = `
            <h2 style="color:#d62839; margin:0 0 8px 0;">Zeit abgelaufen!</h2>
            <p style="margin:0 0 16px 0;">Du hast ${hits} von ${targetHits} Wichteln getroffen.</p>
            <button class="g12-btn" id="g12-restart-btn">Nochmal</button>
          `;
          overlayEl.style.display = 'flex';
          const restartBtn = root.querySelector('#g12-restart-btn');
          if (restartBtn) restartBtn.addEventListener('click', startGame);
        }
      }

      function scheduleNextSpawn() {
        if (!gameActive) return;
        const speed = getSpeedMultiplier();
        const delay = (Math.random() * 350 + 350) / speed;
        spawnTimeout = setTimeout(() => {
          if (!gameActive || !root.isConnected) return;
          spawnItem();
          scheduleNextSpawn();
        }, delay);
      }

      function spawnItem() {
        const emptyIndices = [];
        holesState.forEach((h, idx) => { if (!h.active) emptyIndices.push(idx); });
        if (emptyIndices.length === 0) return;

        const idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        const rand = Math.random();
        let type = 'elf';
        let emoji = '🧝';

        if (rand > 0.85) {
          type = 'gold';
          emoji = '🌟';
        } else if (rand > 0.70) {
          type = 'reindeer';
          emoji = '🦌';
        }

        const holeState = holesState[idx];
        holeState.active = true;
        holeState.type = type;

        const itemEl = root.querySelector(`#g12-item-${idx}`);
        itemEl.textContent = emoji;
        itemEl.dataset.type = type;
        itemEl.classList.add('g12-up');

        const speed = getSpeedMultiplier();
        const visibleDuration = (Math.random() * 400 + 900) / speed;

        holeState.timeout = setTimeout(() => {
          hideItem(idx);
        }, visibleDuration);
      }

      function hideItem(idx) {
        const holeState = holesState[idx];
        if (holeState.timeout) clearTimeout(holeState.timeout);
        holeState.active = false;
        holeState.type = null;
        const itemEl = root.querySelector(`#g12-item-${idx}`);
        if (itemEl) {
          itemEl.classList.remove('g12-up');
        }
      }

      function hitHole(idx) {
        if (!gameActive) return;
        const holeState = holesState[idx];
        if (!holeState.active) return;

        const type = holeState.type;
        hideItem(idx);

        if (type === 'elf') {
          hits += 1;
        } else if (type === 'gold') {
          hits += 2;
        } else if (type === 'reindeer') {
          hits = Math.max(0, hits - 1);
        }

        scoreEl.textContent = hits;

        const holeEl = root.querySelector(`.g12-hole[data-idx="${idx}"]`);
        if (holeEl) {
          holeEl.classList.add('g12-hit-effect');
          setTimeout(() => holeEl.classList.remove('g12-hit-effect'), 200);
        }

        if (hits >= targetHits) {
          endGame(true);
        }
      }

      gridEl.addEventListener('click', (e) => {
        const hole = e.target.closest('.g12-hole');
        if (hole) {
          hitHole(parseInt(hole.dataset.idx, 10));
        }
      });

      function handleKeyDown(e) {
        if (!gameActive || !root.isConnected) return;
        const key = e.key;
        if (key >= '1' && key <= '9') {
          hitHole(parseInt(key, 10) - 1);
        }
      }

      window.addEventListener('keydown', handleKeyDown);

      root._g12_cleanup = () => {
        cleanup();
        window.removeEventListener('keydown', handleKeyDown);
      };

      startBtn.addEventListener('click', startGame);
    },

    async bot(root) {
      root.__fast = true;

      const startBtn = root.querySelector('#g12-start-btn');
      if (startBtn && startBtn.offsetParent !== null) {
        startBtn.click();
      }

      while (root.isConnected) {
        const overlay = root.querySelector('#g12-overlay');
        const restartBtn = root.querySelector('#g12-restart-btn');
        if (overlay && overlay.style.display !== 'none' && restartBtn) {
          restartBtn.click();
        }

        const items = root.querySelectorAll('.g12-item.g12-up');
        items.forEach(item => {
          const type = item.dataset.type;
          if (type === 'elf' || type === 'gold') {
            const hole = item.closest('.g12-hole');
            if (hole) hole.click();
          }
        });

        const scoreEl = root.querySelector('#g12-score');
        if (scoreEl && parseInt(scoreEl.textContent, 10) >= 12) {
          break;
        }

        await new Promise(r => setTimeout(r, 40));
      }
    }
  };
})();