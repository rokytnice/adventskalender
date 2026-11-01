(function(){
  if (typeof Games === 'undefined') window.Games = {};

  Games[1] = {
    title: "Weihnachts-Memory",
    hint: "Finde alle 8 Paare der Weihnachtssymbole!",
    init(root, win){
      if (!document.getElementById('g1-style')) {
        const style = document.createElement('style');
        style.id = 'g1-style';
        style.textContent = `
          .g1-wrap {
            background-color: #0b1d33;
            color: #f5f9ff;
            font-family: system-ui, -apple-system, sans-serif;
            border-radius: 12px;
            padding: 16px;
            box-sizing: border-box;
            width: 100%;
            max-width: 500px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            user-select: none;
            position: relative;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
          }
          .g1-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-bottom: 12px;
            font-size: 15px;
            font-weight: bold;
            color: #f4c430;
          }
          .g1-badge {
            background: #1f7a4d;
            padding: 6px 12px;
            border-radius: 20px;
            color: #f5f9ff;
            border: 1px solid #f4c430;
          }
          .g1-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            width: 100%;
            aspect-ratio: 1;
            max-width: 400px;
          }
          .g1-card {
            background: #1f7a4d;
            border: 2px solid #f4c430;
            border-radius: 10px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            min-width: 44px;
            min-height: 44px;
            color: #f5f9ff;
            transition: transform 0.2s, background-color 0.2s, opacity 0.3s;
            outline: none;
            touch-action: manipulation;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            padding: 0;
            margin: 0;
          }
          .g1-card:focus-visible {
            outline: 3px solid #f5f9ff;
          }
          .g1-card.g1-flipped {
            background: #d62839;
            transform: scale(1.02);
          }
          .g1-card.g1-matched {
            background: #0b1d33;
            border-color: #1f7a4d;
            opacity: 0.5;
            cursor: default;
          }
          .g1-overlay {
            position: absolute;
            inset: 0;
            background: rgba(11, 29, 51, 0.95);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            z-index: 10;
            padding: 20px;
            text-align: center;
          }
          .g1-title {
            font-size: 22px;
            color: #d62839;
            margin-bottom: 10px;
            font-weight: bold;
          }
          .g1-btn {
            background: #d62839;
            color: #f5f9ff;
            border: 2px solid #f4c430;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: bold;
            border-radius: 8px;
            cursor: pointer;
            min-height: 44px;
            min-width: 130px;
            margin-top: 15px;
            transition: background 0.2s;
          }
          .g1-btn:hover {
            background: #e63946;
          }
        `;
        document.head.appendChild(style);
      }

      root.innerHTML = '';

      const emojis = ['🎄', '🎅', '🎁', '☃️', '⭐', '🔔', '🦌', '🍪'];
      const deck = [...emojis, ...emojis];

      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }

      let moves = 0;
      let matchedCount = 0;
      let timeLeft = 60;
      let flippedCards = [];
      let isProcessing = false;
      let winCalled = false;
      let timerInterval = null;

      const wrap = document.createElement('div');
      wrap.className = 'g1-wrap';

      const header = document.createElement('div');
      header.className = 'g1-header';
      header.innerHTML = `
        <span class="g1-badge" id="g1-moves">Züge: 0</span>
        <span class="g1-badge" id="g1-timer">Zeit: 60s</span>
      `;
      wrap.appendChild(header);

      const grid = document.createElement('div');
      grid.className = 'g1-grid';

      deck.forEach((emoji, idx) => {
        const card = document.createElement('button');
        card.className = 'g1-card';
        card.dataset.emoji = emoji;
        card.dataset.index = idx;
        card.setAttribute('aria-label', `Karte ${idx + 1}`);
        card.textContent = '❄️';

        const flipCard = () => {
          if (isProcessing || card.classList.contains('g1-flipped') || card.classList.contains('g1-matched')) return;

          card.classList.add('g1-flipped');
          card.textContent = emoji;
          flippedCards.push(card);

          if (flippedCards.length === 2) {
            moves++;
            const movesElem = wrap.querySelector('#g1-moves');
            if (movesElem) movesElem.textContent = `Züge: ${moves}`;

            isProcessing = true;
            const speed = root.__fast ? 5 : 1;
            const [c1, c2] = flippedCards;

            if (c1.dataset.emoji === c2.dataset.emoji) {
              setTimeout(() => {
                if (!root.isConnected) return;
                c1.classList.add('g1-matched');
                c2.classList.add('g1-matched');
                matchedCount++;
                flippedCards = [];
                isProcessing = false;

                if (matchedCount === 8 && !winCalled) {
                  winCalled = true;
                  if (timerInterval) clearInterval(timerInterval);
                  win();
                }
              }, 300 / speed);
            } else {
              setTimeout(() => {
                if (!root.isConnected) return;
                c1.classList.remove('g1-flipped');
                c1.textContent = '❄️';
                c2.classList.remove('g1-flipped');
                c2.textContent = '❄️';
                flippedCards = [];
                isProcessing = false;
              }, 800 / speed);
            }
          }
        };

        card.addEventListener('click', flipCard);
        grid.appendChild(card);
      });

      wrap.appendChild(grid);
      root.appendChild(wrap);

      timerInterval = setInterval(() => {
        if (!root.isConnected) {
          clearInterval(timerInterval);
          return;
        }

        const speed = root.__fast ? 5 : 1;
        timeLeft -= (1 * (speed > 1 ? 0.2 : 1));
        const timerElem = wrap.querySelector('#g1-timer');
        if (timerElem) timerElem.textContent = `Zeit: ${Math.max(0, Math.ceil(timeLeft))}s`;

        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          showLossOverlay();
        }
      }, root.__fast ? 200 : 1000);

      const showLossOverlay = () => {
        if (winCalled || !root.isConnected) return;
        const overlay = document.createElement('div');
        overlay.className = 'g1-overlay';
        overlay.innerHTML = `
          <div class="g1-title">Zeit abgelaufen! 🎅</div>
          <p style="margin: 0 0 10px 0;">Leider nicht alle Paare rechtzeitig gefunden.</p>
          <button class="g1-btn" id="g1-restart">Nochmal</button>
        `;
        wrap.appendChild(overlay);
        overlay.querySelector('#g1-restart').addEventListener('click', () => {
          if (timerInterval) clearInterval(timerInterval);
          Games[1].init(root, win);
        });
      };
    },

    async bot(root){
      root.__fast = true;
      const sleep = ms => new Promise(r => setTimeout(r, ms));

      while (root.querySelectorAll('.g1-card').length === 0) {
        if (!root.isConnected) return;
        await sleep(50);
      }

      const cards = Array.from(root.querySelectorAll('.g1-card'));
      const pairMap = {};

      cards.forEach(card => {
        const emoji = card.dataset.emoji;
        if (!pairMap[emoji]) pairMap[emoji] = [];
        pairMap[emoji].push(card);
      });

      for (const emoji in pairMap) {
        if (!root.isConnected) return;
        const [card1, card2] = pairMap[emoji];

        if (!card1.classList.contains('g1-matched')) {
          card1.click();
          await sleep(50);
          if (!root.isConnected) return;
          card2.click();
          await sleep(100);
        }
      }
    }
  };
})();