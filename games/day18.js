(function(){
  if (typeof window.Games === 'undefined') window.Games = {};

  Games[18] = {
    title: "Wichtel-Zahlenraten",
    hint: "Errate die geheime Zahl (1-100) des Wichtels in maximal 7 Versuchen!",
    init(root, win) {
      root.innerHTML = '';

      const style = document.createElement('style');
      style.textContent = `
        .g18-wrap {
          box-sizing: border-box;
          width: 100%;
          max-width: 560px;
          margin: 0 auto;
          padding: 16px;
          background: #0b1d33;
          color: #f5f9ff;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
          user-select: none;
        }
        .g18-wrap * { box-sizing: border-box; }
        .g18-header {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #152a45;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(244, 196, 48, 0.25);
        }
        .g18-avatar {
          font-size: 2.2rem;
          line-height: 1;
        }
        .g18-speech {
          flex: 1;
          font-size: 0.95rem;
          line-height: 1.35;
          color: #f5f9ff;
        }
        .g18-speech strong {
          color: #f4c430;
        }
        .g18-attempts-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          padding: 8px 14px;
          border-radius: 8px;
        }
        .g18-attempts-label {
          font-size: 0.85rem;
          color: #a0b2c6;
          font-weight: 600;
        }
        .g18-attempts-icons {
          display: flex;
          gap: 6px;
        }
        .g18-gift {
          font-size: 1.25rem;
          transition: transform 0.2s, opacity 0.2s;
        }
        .g18-gift.used {
          opacity: 0.25;
          transform: scale(0.75);
          filter: grayscale(1);
        }
        .g18-range-card {
          text-align: center;
          background: rgba(31, 122, 77, 0.25);
          border: 1px solid #1f7a4d;
          padding: 10px;
          border-radius: 10px;
          font-size: 0.95rem;
        }
        .g18-range-val {
          color: #f4c430;
          font-weight: bold;
          font-size: 1.15rem;
        }
        .g18-controls {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .g18-input-group {
          display: flex;
          gap: 8px;
        }
        .g18-input {
          flex: 1;
          height: 48px;
          background: #152a45;
          border: 2px solid #24426b;
          border-radius: 8px;
          color: #ffffff;
          font-size: 1.25rem;
          font-weight: bold;
          text-align: center;
          outline: none;
          -moz-appearance: textfield;
        }
        .g18-input::-webkit-outer-spin-button,
        .g18-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .g18-input:focus {
          border-color: #f4c430;
        }
        .g18-btn {
          min-height: 44px;
          min-width: 44px;
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.15s, transform 0.1s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          touch-action: manipulation;
        }
        .g18-btn:active {
          transform: scale(0.96);
        }
        .g18-btn-primary {
          background: #d62839;
          font-size: 1.05rem;
        }
        .g18-btn-primary:hover {
          background: #e63946;
        }
        .g18-btn-sec {
          background: #152a45;
          border: 1px solid #24426b;
          color: #f5f9ff;
          flex: 1;
        }
        .g18-btn-sec:hover {
          background: #1e395d;
        }
        .g18-quick-row {
          display: flex;
          gap: 6px;
        }
        .g18-history {
          max-height: 140px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-right: 4px;
        }
        .g18-history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #152a45;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.9rem;
        }
        .g18-badge {
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: bold;
        }
        .g18-badge-high { background: rgba(214, 40, 57, 0.3); color: #ff6b6b; }
        .g18-badge-low { background: rgba(31, 122, 77, 0.4); color: #51cf66; }
        .g18-badge-win { background: #f4c430; color: #0b1d33; }
        .g18-overlay {
          position: absolute;
          inset: 0;
          background: rgba(11, 29, 51, 0.94);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          text-align: center;
          z-index: 10;
        }
        .g18-overlay.g18-hidden {
          display: none;
        }
        .g18-modal-title {
          font-size: 1.6rem;
          color: #f4c430;
          margin: 0 0 8px 0;
        }
        .g18-modal-desc {
          font-size: 1rem;
          color: #f5f9ff;
          margin: 0 0 20px 0;
        }
      `;
      root.appendChild(style);

      const wrap = document.createElement('div');
      wrap.className = 'g18-wrap';
      wrap.innerHTML = `
        <div class="g18-header">
          <div class="g18-avatar">🎅</div>
          <div class="g18-speech">Ich habe mir eine Zahl zwischen <strong>1</strong> und <strong>100</strong> ausgedacht.</div>
        </div>
        <div class="g18-attempts-row">
          <span class="g18-attempts-label">Versuche übrig:</span>
          <div class="g18-attempts-icons"></div>
        </div>
        <div class="g18-range-card">
          Möglicher Bereich: <span class="g18-range-val" id="g18-min">1</span> bis <span class="g18-range-val" id="g18-max">100</span>
        </div>
        <div class="g18-controls">
          <div class="g18-input-group">
            <input type="number" class="g18-input" min="1" max="100" placeholder="1-100" />
            <button class="g18-btn g18-btn-primary g18-submit-btn">Raten</button>
          </div>
          <div class="g18-quick-row">
            <button class="g18-btn g18-btn-sec" data-adj="-10">-10</button>
            <button class="g18-btn g18-btn-sec" data-adj="-1">-1</button>
            <button class="g18-btn g18-btn-sec" data-adj="+1">+1</button>
            <button class="g18-btn g18-btn-sec" data-adj="+10">+10</button>
          </div>
        </div>
        <div class="g18-history"></div>
        <div class="g18-overlay g18-hidden">
          <h2 class="g18-modal-title"></h2>
          <p class="g18-modal-desc"></p>
          <button class="g18-btn g18-btn-primary g18-restart-btn">Nochmal versuchen</button>
        </div>
      `;
      root.appendChild(wrap);

      const speechEl = wrap.querySelector('.g18-speech');
      const attemptsIconsEl = wrap.querySelector('.g18-attempts-icons');
      const minEl = wrap.querySelector('#g18-min');
      const maxEl = wrap.querySelector('#g18-max');
      const inputEl = wrap.querySelector('.g18-input');
      const submitBtn = wrap.querySelector('.g18-submit-btn');
      const historyEl = wrap.querySelector('.g18-history');
      const overlayEl = wrap.querySelector('.g18-overlay');
      const modalTitleEl = wrap.querySelector('.g18-modal-title');
      const modalDescEl = wrap.querySelector('.g18-modal-desc');
      const restartBtn = wrap.querySelector('.g18-restart-btn');
      const quickBtns = wrap.querySelectorAll('.g18-quick-row button');

      let secretNum = 0;
      let minRange = 1;
      let maxRange = 100;
      let attemptsLeft = 7;
      let winCalled = false;

      function renderAttempts() {
        attemptsIconsEl.innerHTML = '';
        for (let i = 0; i < 7; i++) {
          const gift = document.createElement('span');
          gift.className = 'g18-gift' + (i >= attemptsLeft ? ' used' : '');
          gift.textContent = '🎁';
          attemptsIconsEl.appendChild(gift);
        }
      }

      function updateRangeUI() {
        minEl.textContent = minRange;
        maxEl.textContent = maxRange;
      }

      function resetGame() {
        secretNum = Math.floor(Math.random() * 100) + 1;
        minRange = 1;
        maxRange = 100;
        attemptsLeft = 7;
        winCalled = false;
        historyEl.innerHTML = '';
        inputEl.value = '';
        speechEl.innerHTML = 'Ich habe mir eine Zahl zwischen <strong>1</strong> und <strong>100</strong> ausgedacht.';
        overlayEl.classList.add('g18-hidden');
        renderAttempts();
        updateRangeUI();

        root.__g18_state = {
          secretNum,
          minRange,
          maxRange,
          attemptsLeft,
          won: false,
          gameOver: false
        };
      }

      function handleGuess(val) {
        if (!root.isConnected || attemptsLeft <= 0 || winCalled) return;

        const guess = parseInt(val, 10);
        if (isNaN(guess) || guess < 1 || guess > 100) {
          speechEl.innerHTML = 'Bitte gib eine Zahl zwischen <strong>1 und 100</strong> ein!';
          return;
        }

        attemptsLeft--;
        renderAttempts();

        const item = document.createElement('div');
        item.className = 'g18-history-item';

        if (guess === secretNum) {
          speechEl.innerHTML = `🎉 Richtig! Die Geschenkezahl war <strong>${secretNum}</strong>!`;
          item.innerHTML = `<span>Versuch ${7 - attemptsLeft}: <strong>${guess}</strong></span><span class="g18-badge g18-badge-win">TREFFER!</span>`;
          historyEl.prepend(item);

          if (root.__g18_state) {
            root.__g18_state.won = true;
            root.__g18_state.gameOver = true;
          }

          if (!winCalled) {
            winCalled = true;
            win();
          }
        } else {
          let hintText = '';
          let badge = '';
          if (guess < secretNum) {
            hintText = `Die gesuchte Zahl ist <strong>HÖHER</strong> als ${guess}!`;
            badge = `<span class="g18-badge g18-badge-high">⬆ HÖHER</span>`;
            if (guess >= minRange) minRange = guess + 1;
          } else {
            hintText = `Die gesuchte Zahl ist <strong>TIEFER</strong> als ${guess}!`;
            badge = `<span class="g18-badge g18-badge-low">⬇ TIEFER</span>`;
            if (guess <= maxRange) maxRange = guess - 1;
          }

          speechEl.innerHTML = hintText;
          item.innerHTML = `<span>Versuch ${7 - attemptsLeft}: <strong>${guess}</strong></span>${badge}`;
          historyEl.prepend(item);
          updateRangeUI();

          if (root.__g18_state) {
            root.__g18_state.minRange = minRange;
            root.__g18_state.maxRange = maxRange;
            root.__g18_state.attemptsLeft = attemptsLeft;
          }

          if (attemptsLeft <= 0) {
            if (root.__g18_state) root.__g18_state.gameOver = true;
            modalTitleEl.textContent = 'Schade!';
            modalDescEl.textContent = `Die Versuche sind aufgebraucht. Die Zahl war ${secretNum}.`;
            overlayEl.classList.remove('g18-hidden');
          }
        }

        inputEl.value = '';
      }

      submitBtn.onclick = () => {
        handleGuess(inputEl.value);
      };

      inputEl.onkeydown = (e) => {
        if (e.key === 'Enter') {
          handleGuess(inputEl.value);
        }
      };

      quickBtns.forEach(btn => {
        btn.onclick = () => {
          const adj = parseInt(btn.dataset.adj, 10);
          let current = parseInt(inputEl.value, 10);
          if (isNaN(current)) {
            current = Math.floor((minRange + maxRange) / 2);
          } else {
            current += adj;
          }
          current = Math.max(1, Math.min(100, current));
          inputEl.value = current;
        };
      });

      restartBtn.onclick = () => {
        resetGame();
      };

      resetGame();
    },

    async bot(root) {
      let low = 1;
      let high = 100;

      while (root.isConnected) {
        const isFast = !!root.__fast;
        const delay = isFast ? 40 : 200;
        await new Promise(r => setTimeout(r, delay));

        if (!root.isConnected) break;

        const state = root.__g18_state;
        if (state) {
          if (state.won) break;
          if (state.gameOver && !state.won) {
            const restartBtn = root.querySelector('.g18-restart-btn');
            if (restartBtn) restartBtn.click();
            low = 1;
            high = 100;
            await new Promise(r => setTimeout(r, delay));
            continue;
          }
          low = state.minRange;
          high = state.maxRange;
        }

        const guess = Math.floor((low + high) / 2);
        const input = root.querySelector('.g18-input');
        const submitBtn = root.querySelector('.g18-submit-btn');

        if (input && submitBtn) {
          input.value = guess;
          submitBtn.click();
        }

        await new Promise(r => setTimeout(r, delay));

        if (root.__g18_state && root.__g18_state.won) {
          break;
        }
      }
    }
  };
})();