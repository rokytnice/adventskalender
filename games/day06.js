if (typeof Games === 'undefined') {
  window.Games = {};
}

(function(){
  Games[6] = {
    title: "Weihnachts-Anagramm",
    hint: "Setze 5 Weihnachtswörter aus den geschüttelten Buchstaben zusammen!",
    init(root, win) {
      if (!document.getElementById('g6-style')) {
        const style = document.createElement('style');
        style.id = 'g6-style';
        style.textContent = `
          .g6-game-root {
            background-color: #0b1d33;
            color: #f5f9ff;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            padding: 16px;
            box-sizing: border-box;
            border-radius: 12px;
            width: 100%;
            max-width: 560px;
            margin: 0 auto;
            user-select: none;
            position: relative;
            overflow: hidden;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          }
          .g6-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }
          .g6-title {
            font-size: 1.15rem;
            font-weight: bold;
            color: #f4c430;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .g6-progress {
            font-size: 0.9rem;
            font-weight: 600;
            background: rgba(245, 249, 255, 0.1);
            padding: 4px 10px;
            border-radius: 12px;
            color: #f5f9ff;
          }
          .g6-timer-outer {
            width: 100%;
            height: 8px;
            background: rgba(245, 249, 255, 0.15);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 24px;
          }
          .g6-timer-inner {
            height: 100%;
            background: linear-gradient(90deg, #1f7a4d, #f4c430, #d62839);
            width: 100%;
            transition: width 0.2s linear;
          }
          .g6-slots-container {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-bottom: 24px;
            min-height: 56px;
            flex-wrap: wrap;
          }
          .g6-slot {
            width: 46px;
            height: 52px;
            border: 2px solid #f4c430;
            border-radius: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1.5rem;
            font-weight: bold;
            color: #f5f9ff;
            background: rgba(244, 196, 48, 0.12);
            cursor: pointer;
            transition: all 0.2s ease;
            box-sizing: border-box;
          }
          .g6-slot.g6-empty {
            border-style: dashed;
            border-color: rgba(244, 196, 48, 0.4);
            background: rgba(0,0,0,0.2);
          }
          .g6-slot.g6-correct {
            background: #1f7a4d;
            border-color: #f4c430;
            animation: g6-pulse 0.35s ease;
          }
          .g6-slot.g6-wrong {
            background: #d62839;
            border-color: #d62839;
            animation: g6-shake 0.35s ease;
          }
          .g6-letters-grid {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
            margin-bottom: 20px;
            min-height: 58px;
          }
          .g6-letter-btn {
            min-width: 46px;
            min-height: 48px;
            padding: 6px 12px;
            font-size: 1.35rem;
            font-weight: bold;
            color: #0b1d33;
            background: #f4c430;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 4px 0 #b38f20;
            touch-action: manipulation;
            transition: transform 0.1s, opacity 0.2s, background 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .g6-letter-btn:active {
            transform: translateY(2px);
            box-shadow: 0 2px 0 #b38f20;
          }
          .g6-letter-btn.g6-used {
            opacity: 0.15;
            pointer-events: none;
            box-shadow: none;
            transform: translateY(2px);
          }
          .g6-controls {
            display: flex;
            justify-content: center;
            gap: 12px;
          }
          .g6-btn {
            min-height: 44px;
            padding: 8px 18px;
            font-size: 1rem;
            font-weight: bold;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            touch-action: manipulation;
          }
          .g6-btn-clear {
            background: #d62839;
            color: #f5f9ff;
            box-shadow: 0 3px 0 #901a26;
          }
          .g6-btn-clear:active {
            transform: translateY(2px);
            box-shadow: 0 1px 0 #901a26;
          }
          .g6-btn-restart {
            background: #1f7a4d;
            color: #f5f9ff;
            box-shadow: 0 3px 0 #12482d;
            font-size: 1.1rem;
            padding: 12px 24px;
          }
          .g6-btn-restart:active {
            transform: translateY(2px);
            box-shadow: 0 1px 0 #12482d;
          }
          .g6-overlay {
            position: absolute;
            inset: 0;
            background: rgba(11, 29, 51, 0.95);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            text-align: center;
            z-index: 10;
          }
          .g6-overlay h2 {
            color: #f4c430;
            font-size: 1.8rem;
            margin: 0 0 12px 0;
          }
          .g6-overlay p {
            color: #f5f9ff;
            font-size: 1.1rem;
            margin: 0 0 20px 0;
          }
          @keyframes g6-shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-6px); }
            75% { transform: translateX(6px); }
          }
          @keyframes g6-pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.08); }
            100% { transform: scale(1); }
          }
        `;
        document.head.appendChild(style);
      }

      if (root._g6State && root._g6State.timerInterval) {
        clearInterval(root._g6State.timerInterval);
      }

      const WORDS = ["KERZE", "STERN", "ENGEL", "KUGEL", "ADVENT"];

      const state = {
        words: WORDS,
        currentWordIdx: 0,
        availableLetters: [],
        pickedLetters: [],
        timeLeft: 60,
        timerInterval: null,
        gameWon: false,
        gameOver: false,
        isFast: !!root.__fast,
        winFn: win,
        statusType: ''
      };
      root._g6State = state;

      function setupWord(idx) {
        const word = WORDS[idx];
        const chars = word.split('');
        let scrambled = [...chars];
        let attempts = 0;
        do {
          for (let i = scrambled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
          }
          attempts++;
        } while (scrambled.join('') === word && word.length > 1 && attempts < 20);

        state.availableLetters = scrambled.map((char, i) => ({ id: i, char, used: false }));
        state.pickedLetters = [];
        state.statusType = '';
      }

      function startTimer() {
        if (state.timerInterval) clearInterval(state.timerInterval);
        state.timerInterval = setInterval(() => {
          if (!root.isConnected) {
            clearInterval(state.timerInterval);
            return;
          }
          state.isFast = !!root.__fast;
          
          state.timeLeft -= state.isFast ? 1 : 0.2;
          if (state.timeLeft <= 0) {
            state.timeLeft = 0;
            state.gameOver = true;
            clearInterval(state.timerInterval);
            render();
          } else {
            updateTimerBar();
          }
        }, 200);
      }

      function updateTimerBar() {
        const bar = root.querySelector('.g6-timer-inner');
        if (bar) {
          const pct = Math.max(0, (state.timeLeft / 60) * 100);
          bar.style.width = pct + '%';
        }
      }

      function render() {
        if (!root.isConnected) return;

        root.innerHTML = `
          <div class="g6-game-root">
            <div class="g6-header">
              <div class="g6-title">🎄 Anagramm</div>
              <div class="g6-progress">Wort ${state.currentWordIdx + 1} / ${state.words.length}</div>
            </div>
            <div class="g6-timer-outer">
              <div class="g6-timer-inner" style="width: ${(state.timeLeft / 60) * 100}%"></div>
            </div>
            
            <div class="g6-slots-container">
              ${renderSlots()}
            </div>

            <div class="g6-letters-grid">
              ${renderLetters()}
            </div>

            <div class="g6-controls">
              <button class="g6-btn g6-btn-clear" id="g6-btn-clear">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
                Löschen
              </button>
            </div>

            ${renderOverlay()}
          </div>
        `;

        attachEvents();
      }

      function renderSlots() {
        const _tw = state.words[state.currentWordIdx]; if (!_tw) return; const targetLen = _tw.length;
        let html = '';
        for (let i = 0; i < targetLen; i++) {
          const picked = state.pickedLetters[i];
          const char = picked ? picked.char : '';
          const statusClass = state.statusType ? `g6-${state.statusType}` : '';
          const emptyClass = !char ? 'g6-empty' : '';
          html += `<div class="g6-slot ${emptyClass} ${statusClass}" data-slot-idx="${i}">${char}</div>`;
        }
        return html;
      }

      function renderLetters() {
        return state.availableLetters.map(item => {
          const usedClass = item.used ? 'g6-used' : '';
          return `<button class="g6-letter-btn ${usedClass}" data-id="${item.id}" data-char="${item.char}">${item.char}</button>`;
        }).join('');
      }

      function renderOverlay() {
        if (state.gameWon) {
          return `
            <div class="g6-overlay" data-type="win">
              <h2>🎄 Hervorragend!</h2>
              <p>Du hast alle 5 Wörter richtig gelöst!</p>
            </div>
          `;
        }
        if (state.gameOver) {
          return `
            <div class="g6-overlay" data-type="loss">
              <h2>❄️ Zeit abgelaufen!</h2>
              <p>Schaffst du es beim nächsten Versuch?</p>
              <button class="g6-btn g6-btn-restart" id="g6-btn-restart">Nochmal</button>
            </div>
          `;
        }
        return '';
      }

      function pickLetter(item) {
        if (item.used || state.pickedLetters.length >= state.words[state.currentWordIdx].length || state.statusType) return;
        item.used = true;
        state.pickedLetters.push(item);
        
        checkAutoSubmit();
        render();
      }

      function unpickSlot(slotIdx) {
        if (slotIdx < 0 || slotIdx >= state.pickedLetters.length || state.statusType) return;
        const removed = state.pickedLetters.splice(slotIdx, 1)[0];
        if (removed) {
          removed.used = false;
        }
        render();
      }

      function clearPicked() {
        if (state.statusType) return;
        state.pickedLetters.forEach(item => { item.used = false; });
        state.pickedLetters = [];
        render();
      }

      function checkAutoSubmit() {
        const targetWord = state.words[state.currentWordIdx];
        if (state.pickedLetters.length === targetWord.length) {
          const formed = state.pickedLetters.map(l => l.char).join('');
          if (formed === targetWord) {
            state.statusType = 'correct';
            setTimeout(() => {
              state.currentWordIdx++;
              if (state.currentWordIdx >= state.words.length) {
                state.gameWon = true;
                clearInterval(state.timerInterval);
                render();
                if (typeof state.winFn === 'function') {
                  state.winFn();
                }
              } else {
                setupWord(state.currentWordIdx);
                render();
              }
            }, state.isFast || root.__fast ? 40 : 300);
          } else {
            state.statusType = 'wrong';
            setTimeout(() => {
              clearPicked();
            }, state.isFast || root.__fast ? 40 : 350);
          }
        }
      }

      function attachEvents() {
        const letterBtns = root.querySelectorAll('.g6-letter-btn');
        letterBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'), 10);
            const item = state.availableLetters.find(l => l.id === id);
            if (item) pickLetter(item);
          });
        });

        const slotEls = root.querySelectorAll('.g6-slot');
        slotEls.forEach(slot => {
          slot.addEventListener('click', () => {
            const idx = parseInt(slot.getAttribute('data-slot-idx'), 10);
            unpickSlot(idx);
          });
        });

        const clearBtn = root.querySelector('#g6-btn-clear');
        if (clearBtn) {
          clearBtn.addEventListener('click', clearPicked);
        }

        const restartBtn = root.querySelector('#g6-btn-restart');
        if (restartBtn) {
          restartBtn.addEventListener('click', () => {
            restartGame();
          });
        }
      }

      function restartGame() {
        state.currentWordIdx = 0;
        state.timeLeft = 60;
        state.gameOver = false;
        state.gameWon = false;
        state.statusType = '';
        setupWord(0);
        startTimer();
        render();
      }

      const keyHandler = (e) => {
        if (!root.isConnected) {
          document.removeEventListener('keydown', keyHandler);
          return;
        }
        if (state.gameOver || state.gameWon) return;

        const key = e.key ? e.key.toUpperCase() : '';
        if (key === 'BACKSPACE') {
          if (state.pickedLetters.length > 0) {
            unpickSlot(state.pickedLetters.length - 1);
          }
        } else if (/^[A-ZÄÖÜ]$/.test(key)) {
          const match = state.availableLetters.find(l => !l.used && l.char === key);
          if (match) {
            pickLetter(match);
          }
        }
      };

      document.addEventListener('keydown', keyHandler);

      setupWord(0);
      startTimer();
      render();
    },

    async bot(root) {
      const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      while (root.isConnected) {
        const state = root._g6State;
        if (!state) break;

        if (state.gameWon) break;

        if (state.gameOver) {
          const restartBtn = root.querySelector('#g6-btn-restart');
          if (restartBtn) restartBtn.click();
          await wait(50);
          continue;
        }

        const targetWord = state.words[state.currentWordIdx];
        if (!targetWord) break;

        const currentPicked = state.pickedLetters.map(l => l.char).join('');
        if (!targetWord.startsWith(currentPicked)) {
          const clearBtn = root.querySelector('#g6-btn-clear');
          if (clearBtn) clearBtn.click();
          await wait(root.__fast ? 10 : 30);
          continue;
        }

        if (state.pickedLetters.length < targetWord.length) {
          const nextChar = targetWord[state.pickedLetters.length];
          const unusedLetters = state.availableLetters.filter(l => !l.used);
          const nextItem = unusedLetters.find(l => l.char === nextChar);

          if (nextItem) {
            const btn = root.querySelector(`.g6-letter-btn[data-id="${nextItem.id}"]`);
            if (btn) btn.click();
          }
        }

        await wait(root.__fast ? 10 : 50);
      }
    }
  };
})();