(function(){
  if (typeof Games === 'undefined') window.Games = {};

  if (!document.getElementById('g8-style')) {
    const style = document.createElement('style');
    style.id = 'g8-style';
    style.textContent = `
      .g8-wrap {
        background: #0b1d33;
        color: #f5f9ff;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        width: 100%;
        max-width: 480px;
        margin: 0 auto;
        padding: 12px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        border-radius: 16px;
        position: relative;
        user-select: none;
        touch-action: manipulation;
        box-shadow: 0 8px 24px rgba(0,0,0,0.6);
      }
      .g8-header {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }
      .g8-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: #f4c430;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .g8-timer {
        font-size: 0.95rem;
        font-weight: 700;
        color: #f5f9ff;
        background: rgba(255,255,255,0.1);
        padding: 4px 12px;
        border-radius: 20px;
        border: 1px solid rgba(244,196,48,0.3);
      }
      .g8-tree-box {
        width: 100%;
        max-width: 320px;
        position: relative;
        margin: 0 auto;
      }
      .g8-tree-svg {
        width: 100%;
        height: auto;
        display: block;
        filter: drop-shadow(0 8px 16px rgba(0,0,0,0.5));
      }
      .g8-tray-title {
        font-size: 0.85rem;
        color: #f4c430;
        margin-top: 8px;
        margin-bottom: 4px;
        text-align: center;
        font-weight: 600;
      }
      .g8-tray {
        width: 100%;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 8px;
        padding: 10px 6px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        border: 1px solid rgba(244, 196, 48, 0.2);
        box-sizing: border-box;
      }
      .g8-item {
        width: 46px;
        height: 46px;
        min-width: 44px;
        min-height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 2px solid transparent;
        box-sizing: border-box;
        transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        outline: none;
        padding: 0;
        margin: 0;
      }
      .g8-item:focus-visible {
        border-color: #f5f9ff;
      }
      .g8-item.g8-selected {
        border-color: #f4c430;
        transform: scale(1.18);
        box-shadow: 0 0 14px #f4c430;
      }
      .g8-item.g8-used {
        opacity: 0.2;
        cursor: default;
        pointer-events: none;
      }
      .g8-slot-group {
        cursor: pointer;
        outline: none;
      }
      .g8-slot-circle {
        transition: transform 0.2s, stroke 0.2s, fill 0.2s;
      }
      .g8-slot-group:hover .g8-slot-circle, 
      .g8-slot-group:focus .g8-slot-circle {
        stroke: #f4c430;
        stroke-width: 3;
        fill: rgba(244,196,48,0.3);
      }
      .g8-overlay {
        position: absolute;
        inset: 0;
        background: rgba(11, 29, 51, 0.94);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 16px;
        z-index: 10;
        padding: 20px;
        text-align: center;
        animation: g8-fade 0.2s ease-out;
      }
      @keyframes g8-fade {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      .g8-btn {
        background: #d62839;
        color: #f5f9ff;
        border: none;
        padding: 12px 28px;
        font-size: 1rem;
        font-weight: 700;
        border-radius: 24px;
        cursor: pointer;
        min-width: 130px;
        min-height: 44px;
        margin-top: 16px;
        box-shadow: 0 4px 12px rgba(214,40,57,0.4);
        transition: transform 0.15s, background-color 0.15s;
      }
      .g8-btn:hover {
        background: #e63946;
        transform: scale(1.05);
      }
    `;
    document.head.appendChild(style);
  }

  const ORNAMENTS = [
    { color: '#d62839', label: '🔴' },
    { color: '#f4c430', label: '🟡' },
    { color: '#1f7a4d', label: '🟢' },
    { color: '#4cc9f0', label: '🔵' },
    { color: '#7209b7', label: '🟣' },
    { color: '#f72585', label: '💗' },
    { color: '#e9c46a', label: '⭐' },
    { color: '#e0e1dd', label: '⚪' }
  ];

  const SLOTS = [
    { id: 0, x: 150, y: 100 },
    { id: 1, x: 110, y: 160 },
    { id: 2, x: 190, y: 160 },
    { id: 3, x: 80,  y: 230 },
    { id: 4, x: 150, y: 220 },
    { id: 5, x: 220, y: 230 },
    { id: 6, x: 105, y: 295 },
    { id: 7, x: 195, y: 295 }
  ];

  Games[8] = {
    title: "Tannenbaum schmücken",
    hint: "Tippe eine Kugel an und wähle dann einen Platz am Baum!",

    init(root, win) {
      let winCalled = false;
      let selectedIndex = null;
      let slotContents = new Array(SLOTS.length).fill(null);
      let timeLeft = 30;
      let gameActive = true;
      let timerInterval = null;

      function render() {
        root.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.className = 'g8-wrap';

        const header = document.createElement('div');
        header.className = 'g8-header';
        
        const title = document.createElement('div');
        title.className = 'g8-title';
        title.textContent = '🎄 Baum schmücken';
        
        const timer = document.createElement('div');
        timer.className = 'g8-timer';
        timer.textContent = `⏱️ ${timeLeft}s`;

        header.appendChild(title);
        header.appendChild(timer);
        wrap.appendChild(header);

        const treeBox = document.createElement('div');
        treeBox.className = 'g8-tree-box';

        let svgHtml = `
          <svg class="g8-tree-svg" viewBox="0 0 300 360" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g8-tree-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#2a9d8f"/>
                <stop offset="100%" stop-color="#1f7a4d"/>
              </linearGradient>
              <filter id="g8-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <!-- Trunk -->
            <rect x="135" y="320" width="30" height="35" rx="4" fill="#5c3d2e"/>
            <path d="M115 352 L185 352 L178 360 L122 360 Z" fill="#d62839"/>
            
            <!-- Tree Layers -->
            <polygon points="150,40 230,130 70,130" fill="url(#g8-tree-grad)"/>
            <polygon points="150,100 250,200 50,200" fill="url(#g8-tree-grad)"/>
            <polygon points="150,170 270,320 30,320" fill="url(#g8-tree-grad)"/>
            
            <!-- Snow Accents -->
            <path d="M150 40 L168 62 C156 59 144 59 132 62 Z" fill="#f5f9ff" opacity="0.8"/>
            <path d="M70 130 C110 120 190 120 230 130 L220 120 C180 112 120 112 80 120 Z" fill="#f5f9ff" opacity="0.75"/>
            <path d="M50 200 C110 190 190 190 250 200 L240 190 C180 182 120 182 60 190 Z" fill="#f5f9ff" opacity="0.75"/>

            <!-- Top Star -->
            <polygon points="150,15 154,28 168,28 157,36 161,49 150,41 139,49 143,36 132,28 146,28" fill="#f4c430" filter="url(#g8-glow)"/>
            
            <!-- Slots -->
        `;

        SLOTS.forEach((slot, i) => {
          const placedIdx = slotContents[i];
          if (placedIdx === null) {
            svgHtml += `
              <g class="g8-slot-group" data-slot="${i}" tabIndex="0" role="button" aria-label="Freier Platz ${i+1}">
                <circle cx="${slot.x}" cy="${slot.y}" r="22" fill="none" pointer-events="all"/>
                <circle cx="${slot.x}" cy="${slot.y}" r="17" fill="rgba(244,196,48,0.15)" stroke="#f4c430" stroke-width="2" stroke-dasharray="4 3" class="g8-slot-circle" pointer-events="none"/>
                <text x="${slot.x}" y="${slot.y + 5}" font-size="16" font-weight="bold" fill="#f4c430" text-anchor="middle" pointer-events="none">+</text>
              </g>
            `;
          } else {
            const orn = ORNAMENTS[placedIdx];
            svgHtml += `
              <g class="g8-slot-group" data-slot="${i}" tabIndex="0" role="button" aria-label="Kugel entfernen">
                <circle cx="${slot.x}" cy="${slot.y}" r="22" fill="none" pointer-events="all"/>
                <rect x="${slot.x - 3}" y="${slot.y - 21}" width="6" height="5" fill="#f4c430" rx="1" pointer-events="none"/>
                <circle cx="${slot.x}" cy="${slot.y}" r="16" fill="${orn.color}" stroke="#f5f9ff" stroke-width="1.5" filter="url(#g8-glow)" pointer-events="none"/>
                <text x="${slot.x}" y="${slot.y + 5}" font-size="13" text-anchor="middle" pointer-events="none">${orn.label}</text>
              </g>
            `;
          }
        });

        svgHtml += `</svg>`;
        treeBox.innerHTML = svgHtml;
        wrap.appendChild(treeBox);

        const trayTitle = document.createElement('div');
        trayTitle.className = 'g8-tray-title';
        trayTitle.textContent = selectedIndex !== null ? "Tippe jetzt auf einen freien Platz am Baum!" : "Wähle eine Kugel aus:";
        wrap.appendChild(trayTitle);

        const tray = document.createElement('div');
        tray.className = 'g8-tray';

        ORNAMENTS.forEach((orn, idx) => {
          const isUsed = slotContents.includes(idx);
          const isSelected = selectedIndex === idx;

          const item = document.createElement('button');
          item.type = 'button';
          item.className = `g8-item ${isSelected ? 'g8-selected' : ''} ${isUsed ? 'g8-used' : ''}`;
          item.style.backgroundColor = orn.color;
          item.innerHTML = `<span style="font-size: 1.3rem;">${orn.label}</span>`;
          item.setAttribute('aria-label', `Kugel ${idx + 1}`);

          if (!isUsed && gameActive) {
            item.onclick = () => {
              selectedIndex = (selectedIndex === idx) ? null : idx;
              render();
            };
          }

          tray.appendChild(item);
        });

        wrap.appendChild(tray);

        treeBox.querySelectorAll('.g8-slot-group').forEach(group => {
          const sIdx = parseInt(group.getAttribute('data-slot'), 10);
          group.onclick = () => {
            if (!gameActive) return;

            if (slotContents[sIdx] !== null) {
              slotContents[sIdx] = null;
              render();
            } else if (selectedIndex !== null) {
              slotContents[sIdx] = selectedIndex;
              selectedIndex = null;
              checkWinState();
              render();
            }
          };
          group.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              group.click();
            }
          };
        });

        root.appendChild(wrap);
      }

      function checkWinState() {
        const allFilled = slotContents.every(val => val !== null);
        if (allFilled && !winCalled) {
          gameActive = false;
          clearInterval(timerInterval);
          winCalled = true;

          setTimeout(() => {
            if (!root.isConnected) return;
            const wrap = root.querySelector('.g8-wrap');
            if (!wrap) return;

            const overlay = document.createElement('div');
            overlay.className = 'g8-overlay';
            overlay.innerHTML = `
              <div style="font-size: 3.5rem; margin-bottom: 8px;">🌟</div>
              <h2 style="color: #f4c430; margin: 0 0 8px 0; font-size: 1.5rem;">Wunderschön!</h2>
              <p style="margin: 0; color: #f5f9ff;">Der Tannenbaum erstrahlt in festlichem Glanz!</p>
            `;
            wrap.appendChild(overlay);

            if (typeof win === 'function') {
              win();
            }
          }, 250);
        }
      }

      function showGameOver() {
        gameActive = false;
        clearInterval(timerInterval);
        
        const wrap = root.querySelector('.g8-wrap');
        if (!wrap) return;

        const overlay = document.createElement('div');
        overlay.className = 'g8-overlay';
        overlay.innerHTML = `
          <div style="font-size: 3.5rem; margin-bottom: 8px;">❄️</div>
          <h2 style="color: #d62839; margin: 0 0 8px 0; font-size: 1.5rem;">Zeit abgelaufen!</h2>
          <p style="margin: 0; color: #f5f9ff;">Ein paar Kugeln fehlen noch!</p>
        `;

        const retryBtn = document.createElement('button');
        retryBtn.className = 'g8-btn';
        retryBtn.textContent = 'Nochmal';
        retryBtn.onclick = () => {
          Games[8].init(root, win);
        };

        overlay.appendChild(retryBtn);
        wrap.appendChild(overlay);
      }

      function startTimer() {
        const speed = root.__fast ? 5 : 1;
        const intervalTime = 1000 / speed;

        timerInterval = setInterval(() => {
          if (!root.isConnected) {
            clearInterval(timerInterval);
            return;
          }
          if (!gameActive) return;

          timeLeft--;
          const timerEl = root.querySelector('.g8-timer');
          if (timerEl) {
            timerEl.textContent = `⏱️ ${timeLeft}s`;
          }

          if (timeLeft <= 0) {
            showGameOver();
          }
        }, intervalTime);
      }

      render();
      startTimer();
    },

    async bot(root) {
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, root.__fast ? Math.max(10, ms / 5) : ms));

      for (let i = 0; i < SLOTS.length; i++) {
        if (!root.isConnected) return;

        const items = Array.from(root.querySelectorAll('.g8-item:not(.g8-used)'));
        if (items.length === 0) break;

        items[0].click();
        await delay(50);

        const slotGroups = Array.from(root.querySelectorAll('.g8-slot-group'));
        const emptySlot = slotGroups.find(g => g.querySelector('.g8-slot-circle'));

        if (emptySlot) {
          emptySlot.dispatchEvent(new MouseEvent("click",{bubbles:true}));
          await delay(50);
        }
      }
      await delay(100);
    }
  };
})();