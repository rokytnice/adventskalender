(function(){
 Games[21] = {
  title: "Schmelzender Schneemann",
  hint: "Errate 3 Weihnachtswörter, bevor der Schneemann in der Sonne schmilzt!",
  init(root, win) {
    if (!document.getElementById("g21-style")) {
      const style = document.createElement("style");
      style.id = "g21-style";
      style.textContent = `
        .g21-container {
          width: 100%;
          max-width: 560px;
          margin: 0 auto;
          background: #0b1d33;
          color: #f5f9ff;
          font-family: system-ui, -apple-system, sans-serif;
          box-sizing: border-box;
          padding: 12px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          user-select: none;
          position: relative;
          overflow: hidden;
        }
        .g21-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
          font-size: 15px;
          margin-bottom: 8px;
          color: #f4c430;
        }
        .g21-canvas-wrap {
          width: 100%;
          max-width: 320px;
          height: 150px;
          background: #071322;
          border-radius: 8px;
          border: 2px solid #1f7a4d;
          margin-bottom: 10px;
          position: relative;
        }
        .g21-canvas {
          width: 100%;
          height: 100%;
          display: block;
        }
        .g21-word {
          font-size: 22px;
          letter-spacing: 4px;
          font-weight: bold;
          color: #f5f9ff;
          margin: 8px 0;
          text-align: center;
          min-height: 32px;
          word-break: break-all;
        }
        .g21-keyboard {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 6px;
          width: 100%;
          max-width: 480px;
          margin-top: 4px;
        }
        .g21-key {
          min-width: 36px;
          height: 44px;
          flex: 1 0 10%;
          max-width: 44px;
          background: #1f7a4d;
          color: #f5f9ff;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          touch-action: manipulation;
          transition: background 0.15s, transform 0.1s;
        }
        .g21-key:active {
          transform: scale(0.95);
        }
        .g21-key.g21-correct {
          background: #4caf50;
          cursor: default;
          opacity: 0.7;
        }
        .g21-key.g21-wrong {
          background: #d62839;
          cursor: default;
          opacity: 0.4;
        }
        .g21-overlay {
          position: absolute;
          inset: 0;
          background: rgba(11, 29, 51, 0.94);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          text-align: center;
          z-index: 10;
        }
        .g21-overlay h2 {
          margin: 0 0 10px 0;
          color: #d62839;
          font-size: 24px;
        }
        .g21-btn {
          background: #d62839;
          color: #f5f9ff;
          border: none;
          padding: 12px 24px;
          font-size: 18px;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          min-height: 44px;
          margin-top: 12px;
          touch-action: manipulation;
        }
        .g21-btn:hover {
          background: #ef384d;
        }
      `;
      document.head.appendChild(style);
    }

    const WORDS = [
      "WEIHNACHTSBAUM", "LEBKUCHEN", "ZIMTSTERN", "GESCHENK",
      "SCHNEEMANN", "LAMETTA", "RENTIER", "KERZENSCHEIN",
      "TANNENBAUM", "GLOECKCHEN", "ADVENT", "STERN"
    ];

    let targetWords = [];
    let currentWordIdx = 0;
    let currentWord = "";
    let guessedLetters = new Set();
    let wrongGuesses = 0;
    const MAX_WRONG = 6;
    let isGameOver = false;
    let hasWonGame = false;

    root.innerHTML = "";

    const container = document.createElement("div");
    container.className = "g21-container";

    const header = document.createElement("div");
    header.className = "g21-header";
    
    const wordProgressEl = document.createElement("span");
    const livesEl = document.createElement("span");
    header.appendChild(wordProgressEl);
    header.appendChild(livesEl);

    const canvasWrap = document.createElement("div");
    canvasWrap.className = "g21-canvas-wrap";
    const canvas = document.createElement("canvas");
    canvas.className = "g21-canvas";
    canvas.width = 320;
    canvas.height = 150;
    canvasWrap.appendChild(canvas);

    const wordEl = document.createElement("div");
    wordEl.className = "g21-word";

    const keyboardEl = document.createElement("div");
    keyboardEl.className = "g21-keyboard";

    const overlay = document.createElement("div");
    overlay.className = "g21-overlay";
    overlay.style.display = "none";

    container.appendChild(header);
    container.appendChild(canvasWrap);
    container.appendChild(wordEl);
    container.appendChild(keyboardEl);
    container.appendChild(overlay);
    root.appendChild(container);

    const ctx = canvas.getContext("2d");

    function drawSnowman() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 150);
      bgGrad.addColorStop(0, "#071322");
      bgGrad.addColorStop(1, "#122a46");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#f5f9ff";
      ctx.beginPath();
      ctx.ellipse(160, 142, 130, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      if (wrongGuesses > 0) {
        const sunRadius = 14 + wrongGuesses * 4;
        ctx.save();
        ctx.globalAlpha = Math.min(1, wrongGuesses / 4);
        ctx.fillStyle = "#f4c430";
        ctx.beginPath();
        ctx.arc(265, 32, sunRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#f4c430";
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          const x1 = 265 + Math.cos(angle) * (sunRadius + 3);
          const y1 = 32 + Math.sin(angle) * (sunRadius + 3);
          const x2 = 265 + Math.cos(angle) * (sunRadius + 10);
          const y2 = 32 + Math.sin(angle) * (sunRadius + 10);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.restore();
      }

      const cx = 130;
      
      if (wrongGuesses >= MAX_WRONG) {
        ctx.fillStyle = "#e0efff";
        ctx.beginPath();
        ctx.ellipse(cx, 138, 48, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#222";
        ctx.fillRect(cx - 28, 134, 22, 5);
        ctx.fillRect(cx - 22, 125, 12, 9);

        ctx.fillStyle = "#ff7700";
        ctx.beginPath();
        ctx.moveTo(cx + 8, 136);
        ctx.lineTo(cx + 22, 139);
        ctx.lineTo(cx + 8, 142);
        ctx.fill();
        return;
      }

      const meltFactor = wrongGuesses / MAX_WRONG;

      const rBottom = 33 * (1 - meltFactor * 0.3);
      const yBottom = 128 - rBottom * 0.3;
      ctx.fillStyle = "#f5f9ff";
      ctx.beginPath();
      ctx.arc(cx, yBottom, rBottom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#cce0ff";
      ctx.lineWidth = 2;
      ctx.stroke();

      if (wrongGuesses < 5) {
        const rMid = 23 * (1 - meltFactor * 0.4);
        const yMid = yBottom - rBottom * 0.7 - rMid * 0.6;
        ctx.fillStyle = "#f5f9ff";
        ctx.beginPath();
        ctx.arc(cx, yMid, rMid, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.arc(cx, yMid - 4, 2.5, 0, Math.PI * 2);
        ctx.arc(cx, yMid + 4, 2.5, 0, Math.PI * 2);
        ctx.fill();

        if (wrongGuesses < 2) {
          ctx.strokeStyle = "#5c3a21";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(cx - rMid + 2, yMid);
          ctx.lineTo(cx - rMid - 16, yMid - 8);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(cx + rMid - 2, yMid);
          ctx.lineTo(cx + rMid + 16, yMid - 8);
          ctx.stroke();
        }

        if (wrongGuesses < 4) {
          const rHead = 16 * (1 - meltFactor * 0.4);
          const yHead = yMid - rMid * 0.8 - rHead * 0.6;
          ctx.fillStyle = "#f5f9ff";
          ctx.beginPath();
          ctx.arc(cx, yHead, rHead, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#222";
          ctx.beginPath();
          ctx.arc(cx - 4, yHead - 3, 2, 0, Math.PI * 2);
          ctx.arc(cx + 4, yHead - 3, 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ff7700";
          ctx.beginPath();
          ctx.moveTo(cx, yHead);
          ctx.lineTo(cx + 12, yHead + 3);
          ctx.lineTo(cx, yHead + 5);
          ctx.fill();

          if (wrongGuesses < 3) {
            ctx.fillStyle = "#d62839";
            ctx.fillRect(cx - 12, yHead + rHead - 4, 24, 5);
            ctx.fillRect(cx + 3, yHead + rHead + 1, 5, 10);
          }

          ctx.fillStyle = "#222";
          ctx.fillRect(cx - 14, yHead - rHead - 2, 28, 4);
          ctx.fillRect(cx - 9, yHead - rHead - 13, 18, 12);
          ctx.fillStyle = "#d62839";
          ctx.fillRect(cx - 9, yHead - rHead - 4, 18, 3);
        }
      }
    }

    function initGame() {
      const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
      targetWords = shuffled.slice(0, 3);
      currentWordIdx = 0;
      isGameOver = false;
      hasWonGame = false;
      overlay.style.display = "none";
      setupWord();
    }

    function setupWord() {
      currentWord = targetWords[currentWordIdx];
      guessedLetters.clear();
      wrongGuesses = 0;
      updateUI();
    }

    function updateUI() {
      wordProgressEl.textContent = `Wort ${currentWordIdx + 1} / 3`;
      livesEl.textContent = `Fehler: ${wrongGuesses} / ${MAX_WRONG}`;

      let displayStr = "";
      for (let char of currentWord) {
        if (guessedLetters.has(char)) {
          displayStr += char + " ";
        } else {
          displayStr += "_ ";
        }
      }
      wordEl.textContent = displayStr.trim();

      renderKeyboard();
      drawSnowman();
    }

    function renderKeyboard() {
      keyboardEl.innerHTML = "";
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
      
      alphabet.forEach(letter => {
        const btn = document.createElement("button");
        btn.className = "g21-key";
        btn.textContent = letter;

        if (guessedLetters.has(letter)) {
          if (currentWord.includes(letter)) {
            btn.classList.add("g21-correct");
          } else {
            btn.classList.add("g21-wrong");
          }
          btn.disabled = true;
        } else {
          btn.onclick = () => handleGuess(letter);
        }

        keyboardEl.appendChild(btn);
      });
    }

    function handleGuess(letter) {
      if (isGameOver || hasWonGame || guessedLetters.has(letter)) return;

      guessedLetters.add(letter);

      if (!currentWord.includes(letter)) {
        wrongGuesses++;
      }

      const isWordGuessed = currentWord.split("").every(char => guessedLetters.has(char));

      if (isWordGuessed) {
        if (currentWordIdx + 1 >= 3) {
          hasWonGame = true;
          updateUI();
          showWinOverlay();
          win();
          return;
        } else {
          currentWordIdx++;
          setupWord();
          return;
        }
      }

      if (wrongGuesses >= MAX_WRONG) {
        isGameOver = true;
        updateUI();
        showLossOverlay();
        return;
      }

      updateUI();
    }

    function showLossOverlay() {
      overlay.innerHTML = "";
      const title = document.createElement("h2");
      title.textContent = "Schneemann geschmolzen! ☀️";
      
      const desc = document.createElement("p");
      desc.style.color = "#f5f9ff";
      desc.style.margin = "8px 0 16px";
      desc.textContent = `Das Wort war: ${currentWord}`;

      const btn = document.createElement("button");
      btn.className = "g21-btn";
      btn.textContent = "Nochmal versuchen";
      btn.onclick = () => initGame();

      overlay.appendChild(title);
      overlay.appendChild(desc);
      overlay.appendChild(btn);
      overlay.style.display = "flex";
    }

    function showWinOverlay() {
      overlay.innerHTML = "";
      const title = document.createElement("h2");
      title.style.color = "#f4c430";
      title.textContent = "Herzlichen Glückwunsch! 🎄";
      
      const desc = document.createElement("p");
      desc.style.color = "#f5f9ff";
      desc.style.margin = "8px 0 16px";
      desc.textContent = "Du hast alle 3 Wörter erraten!";

      overlay.appendChild(title);
      overlay.appendChild(desc);
      overlay.style.display = "flex";
    }

    function onKeyDown(e) {
      if (!root.isConnected) {
        window.removeEventListener("keydown", onKeyDown);
        return;
      }
      if (isGameOver || hasWonGame) return;

      const char = e.key.toUpperCase();
      if (/^[A-Z]$/.test(char)) {
        handleGuess(char);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    root.__g21_getCurrentWord = () => currentWord;

    initGame();
  },

  async bot(root) {
    const delay = (ms) => new Promise(res => setTimeout(res, root.__fast ? ms / 5 : ms));

    while (root.isConnected) {
      if (typeof root.__g21_getCurrentWord !== "function") {
        await delay(50);
        continue;
      }

      const currentWord = root.__g21_getCurrentWord();
      const keys = Array.from(root.querySelectorAll(".g21-key"));

      if (currentWord && keys.length > 0) {
        const missingLetter = currentWord.split("").find(char => {
          const btn = keys.find(b => b.textContent.trim() === char);
          return btn && !btn.disabled;
        });

        if (missingLetter) {
          const btn = keys.find(b => b.textContent.trim() === missingLetter);
          if (btn && !btn.disabled) {
            btn.click();
          }
        }
      }

      const overlay = root.querySelector(".g21-overlay");
      if (overlay && overlay.style.display !== "none") {
        const title = overlay.querySelector("h2");
        if (title && title.textContent.includes("Glückwunsch")) {
          return;
        } else {
          const restartBtn = overlay.querySelector(".g21-btn");
          if (restartBtn) restartBtn.click();
        }
      }

      await delay(80);
    }
  }
 };
})();