(function(){
  if (typeof window.Games === 'undefined') window.Games = {};

  const QUESTIONS = [
    {
      q: "Aus welchem Land stammt der Brauch des Weihnachtsbaums ursprünglich?",
      opts: ["Deutschland", "USA", "England", "Italien"],
      a: 0
    },
    {
      q: "Wie viele Kerzen brennen am 3. Advent auf dem Adventskranz?",
      opts: ["1", "2", "3", "4"],
      a: 2
    },
    {
      q: "Welches Gewürz ist ein Hauptbestandteil von Lebkuchen?",
      opts: ["Oregano", "Zimt", "Schnittlauch", "Paprika"],
      a: 1
    },
    {
      q: "Wie heißt das berühmte Rentier mit der roten Nase?",
      opts: ["Rudolph", "Comet", "Dasher", "Blitzen"],
      a: 0
    },
    {
      q: "Was schenkte Knecht Ruprecht traditionell bösen Kindern?",
      opts: ["Schokolade", "Eine Rute", "Nüsse", "Spielzeug"],
      a: 1
    },
    {
      q: "Wann wird in Deutschland traditionell der Weihnachtsbaum geschmückt?",
      opts: ["1. Dezember", "24. Dezember", "6. Dezember", "1. November"],
      a: 1
    },
    {
      q: "Welches berühmte Weihnachtslied stammt aus Österreich?",
      opts: ["Jingle Bells", "Stille Nacht, heilige Nacht", "Last Christmas", "White Christmas"],
      a: 1
    },
    {
      q: "Welche Nüsse werden oft in der Weihnachtszeit geknackt?",
      opts: ["Erdnüsse", "Walnüsse", "Cashewnüsse", "Pistazien"],
      a: 1
    }
  ];

  function injectCSS() {
    if (document.getElementById('g11-style')) return;
    const style = document.createElement('style');
    style.id = 'g11-style';
    style.textContent = `
      .g11-wrap {
        background: #0b1d33;
        color: #f5f9ff;
        font-family: system-ui, -apple-system, sans-serif;
        padding: 16px;
        border-radius: 16px;
        box-sizing: border-box;
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
        min-height: 380px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        overflow: hidden;
        border: 2px solid #f4c430;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      }
      .g11-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        margin-bottom: 10px;
        font-size: 0.95rem;
        color: #f4c430;
      }
      .g11-timer-bg {
        height: 6px;
        background: rgba(255,255,255,0.15);
        border-radius: 3px;
        margin-bottom: 14px;
        overflow: hidden;
      }
      .g11-timer-fill {
        height: 100%;
        background: #d62839;
        width: 100%;
        transition: width 0.1s linear;
      }
      .g11-qbox {
        font-size: 1.1rem;
        line-height: 1.4;
        font-weight: 600;
        margin-bottom: 16px;
        min-height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: #f5f9ff;
      }
      .g11-options {
        display: grid;
        grid-template-columns: 1fr;
        gap: 10px;
        margin-bottom: 12px;
      }
      @media (min-width: 420px) {
        .g11-options {
          grid-template-columns: 1fr 1fr;
        }
      }
      .g11-opt-btn {
        background: #1f7a4d;
        color: #f5f9ff;
        border: 1.5px solid #f4c430;
        border-radius: 10px;
        padding: 12px 8px;
        min-height: 48px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        transition: background 0.15s, transform 0.1s;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      .g11-opt-btn:active {
        transform: scale(0.97);
      }
      .g11-opt-btn.g11-correct {
        background: #28a745 !important;
        border-color: #ffffff !important;
        color: #ffffff !important;
      }
      .g11-opt-btn.g11-wrong {
        background: #d62839 !important;
        border-color: #ffffff !important;
        color: #ffffff !important;
      }
      .g11-opt-btn:disabled {
        cursor: default;
        opacity: 0.9;
      }
      .g11-result {
        text-align: center;
        padding: 24px 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        flex-grow: 1;
      }
      .g11-result-title {
        font-size: 1.5rem;
        font-weight: bold;
      }
      .g11-btn-restart {
        background: #d62839;
        color: #fff;
        border: 2px solid #f4c430;
        padding: 12px 28px;
        font-size: 1rem;
        font-weight: bold;
        border-radius: 25px;
        cursor: pointer;
        min-height: 48px;
        transition: transform 0.1s, background 0.2s;
        user-select: none;
      }
      .g11-btn-restart:active {
        transform: scale(0.95);
      }
      .g11-icon {
        font-size: 2.5rem;
        margin-bottom: 8px;
      }
    `;
    document.head.appendChild(style);
  }

  Games[11] = {
    title: "Weihnachts-Quiz",
    hint: "Beantworte mindestens 6 von 8 Fragen richtig!",

    init(root, win) {
      injectCSS();

      let currentIdx = 0;
      let score = 0;
      let timerId = null;
      let timeLeft = 100;
      let answered = false;
      let wonCalled = false;

      function stopTimer() {
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
        }
      }

      function startTimer() {
        stopTimer();
        timeLeft = 100;
        const fillEl = root.querySelector('.g11-timer-fill');
        if (fillEl) fillEl.style.width = '100%';

        const speed = root.__fast ? 20 : 100;
        const decrement = root.__fast ? 10 : 2;

        timerId = setInterval(() => {
          if (!root.isConnected) {
            stopTimer();
            return;
          }
          timeLeft -= decrement;
          if (fillEl) fillEl.style.width = Math.max(0, timeLeft) + '%';
          if (timeLeft <= 0) {
            stopTimer();
            handleAnswer(-1);
          }
        }, speed);
      }

      function renderQuestion() {
        if (!root.isConnected) return;
        answered = false;

        if (currentIdx >= QUESTIONS.length) {
          showResult();
          return;
        }

        const q = QUESTIONS[currentIdx];
        root.innerHTML = `
          <div class="g11-wrap">
            <div>
              <div class="g11-header">
                <span>Frage ${currentIdx + 1} / ${QUESTIONS.length}</span>
                <span>Punkte: ${score}</span>
              </div>
              <div class="g11-timer-bg">
                <div class="g11-timer-fill"></div>
              </div>
              <div class="g11-qbox">${q.q}</div>
            </div>
            <div class="g11-options">
              ${q.opts.map((opt, i) => `
                <button class="g11-opt-btn" data-idx="${i}" data-correct="${i === q.a ? '1' : '0'}">
                  ${opt}
                </button>
              `).join('')}
            </div>
          </div>
        `;

        const btns = root.querySelectorAll('.g11-opt-btn');
        btns.forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-idx'), 10);
            handleAnswer(idx);
          });
        });

        startTimer();
      }

      function handleAnswer(selectedIdx) {
        if (answered) return;
        answered = true;
        stopTimer();

        const q = QUESTIONS[currentIdx];
        const isCorrect = selectedIdx === q.a;
        if (isCorrect) score++;

        const btns = root.querySelectorAll('.g11-opt-btn');
        btns.forEach(btn => {
          btn.disabled = true;
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          if (idx === q.a) {
            btn.classList.add('g11-correct');
          } else if (idx === selectedIdx) {
            btn.classList.add('g11-wrong');
          }
        });

        const delay = root.__fast ? 50 : 800;
        setTimeout(() => {
          if (!root.isConnected) return;
          currentIdx++;
          renderQuestion();
        }, delay);
      }

      function showResult() {
        stopTimer();
        const passed = score >= 6;
        root.innerHTML = `
          <div class="g11-wrap">
            <div class="g11-result">
              <div class="g11-icon">${passed ? '🎄⭐' : '❄️'}</div>
              <div class="g11-result-title" style="color: ${passed ? '#f4c430' : '#d62839'}">
                ${passed ? 'Super gemacht!' : 'Leider nicht gereicht'}
              </div>
              <div>Du hast ${score} von ${QUESTIONS.length} Fragen richtig beantwortet.</div>
              <div style="font-size: 0.9rem; opacity: 0.8;">
                ${passed ? 'Du hast das Weihnachts-Quiz bestanden!' : 'Du benötigst mindestens 6 richtige Antworten.'}
              </div>
              ${!passed ? '<button class="g11-btn-restart" id="g11-restart-btn">Nochmal versuchen</button>' : ''}
            </div>
          </div>
        `;

        if (passed) {
          if (!wonCalled) {
            wonCalled = true;
            win();
          }
        } else {
          const btn = root.querySelector('#g11-restart-btn');
          if (btn) {
            btn.addEventListener('click', () => {
              currentIdx = 0;
              score = 0;
              wonCalled = false;
              renderQuestion();
            });
          }
        }
      }

      renderQuestion();
    },

    async bot(root) {
      root.__fast = true;
      const sleep = ms => new Promise(r => setTimeout(r, ms));

      while (root.isConnected) {
        const correctBtn = root.querySelector('.g11-opt-btn[data-correct="1"]');
        if (correctBtn && !correctBtn.disabled) {
          correctBtn.click();
          await sleep(60);
        } else {
          const restartBtn = root.querySelector('#g11-restart-btn');
          if (restartBtn) {
            restartBtn.click();
            await sleep(60);
          } else {
            // Check if won state achieved
            const icon = root.querySelector('.g11-icon');
            if (icon && icon.textContent.includes('⭐')) {
              break;
            }
            await sleep(50);
          }
        }
      }
    }
  };
})();