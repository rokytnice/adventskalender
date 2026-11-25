(function(){
 Games[23] = {
  title: "Kran-Timing: Weihnachts-Express",
  hint: "Tippe im richtigen Moment, um das Geschenk zielsicher in den Schornstein zu werfen!",
  init(root, win){
    const style = document.createElement("style");
    style.textContent = `
      .g23-wrap {
        position: relative;
        width: 100%;
        max-width: 480px;
        margin: 0 auto;
        background: #0b1d33;
        color: #f5f9ff;
        font-family: system-ui, -apple-system, sans-serif;
        border-radius: 12px;
        overflow: hidden;
        user-select: none;
        touch-action: manipulation;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .g23-hud {
        width: 100%;
        box-sizing: border-box;
        padding: 10px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(11, 29, 51, 0.85);
        border-bottom: 2px solid #f4c430;
        z-index: 10;
      }
      .g23-stat {
        font-size: 15px;
        font-weight: bold;
      }
      .g23-canvas-wrap {
        position: relative;
        width: 100%;
        height: 380px;
      }
      .g23-canvas {
        display: block;
        width: 100%;
        height: 100%;
      }
      .g23-controls {
        width: 100%;
        box-sizing: border-box;
        padding: 12px 16px 16px;
        display: flex;
        gap: 12px;
        justify-content: center;
        background: #0b1d33;
      }
      .g23-btn {
        flex: 1;
        max-width: 320px;
        min-height: 48px;
        padding: 12px 20px;
        font-size: 18px;
        font-weight: bold;
        border: none;
        border-radius: 8px;
        background: #d62839;
        color: #f5f9ff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(214, 40, 57, 0.4);
        transition: transform 0.08s, background 0.15s;
      }
      .g23-btn:active {
        transform: scale(0.97);
        background: #b51e2d;
      }
      .g23-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
      .g23-overlay {
        position: absolute;
        inset: 0;
        background: rgba(11, 29, 51, 0.88);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 20;
        text-align: center;
        padding: 20px;
      }
      .g23-overlay h2 {
        font-size: 26px;
        margin: 0 0 10px;
        color: #f4c430;
      }
      .g23-overlay p {
        font-size: 16px;
        margin: 0 0 20px;
        color: #f5f9ff;
      }
      .g23-btn-retry {
        min-height: 48px;
        padding: 12px 28px;
        font-size: 16px;
        font-weight: bold;
        background: #1f7a4d;
        color: #f5f9ff;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(31, 122, 77, 0.4);
      }
      .g23-btn-retry:active {
        transform: scale(0.97);
      }
    `;

    root.innerHTML = `
      <div class="g23-wrap">
        <div class="g23-hud">
          <div class="g23-stat" id="g23-score">Treffer: 0 / 5</div>
          <div class="g23-stat" id="g23-lives">Leben: ❤️❤️❤️</div>
        </div>
        <div class="g23-canvas-wrap">
          <canvas class="g23-canvas"></canvas>
          <div class="g23-overlay" id="g23-overlay" style="display: none;">
            <h2 id="g23-ov-title">Vorbei!</h2>
            <p id="g23-ov-desc">Der Schornstein wurde verfehlt.</p>
            <button class="g23-btn-retry" id="g23-btn-retry">Nochmal versuchen 🔄</button>
          </div>
        </div>
        <div class="g23-controls">
          <button class="g23-btn" id="g23-btn-drop">🎁 ABWURF!</button>
        </div>
      </div>
    `;
    root.appendChild(style);

    const canvas = root.querySelector(".g23-canvas");
    const ctx = canvas.getContext("2d");
    const scoreEl = root.querySelector("#g23-score");
    const livesEl = root.querySelector("#g23-lives");
    const dropBtn = root.querySelector("#g23-btn-drop");
    const overlay = root.querySelector("#g23-overlay");
    const ovTitle = root.querySelector("#g23-ov-title");
    const ovDesc = root.querySelector("#g23-ov-desc");
    const retryBtn = root.querySelector("#g23-btn-retry");

    // Game state
    const TARGET_HITS = 5;
    const TARGET_WIDTHS = [90, 75, 62, 50, 40];
    let hits = 0;
    let lives = 3;
    let gameOver = false;
    let gameWon = false;

    let width = 360;
    let height = 380;

    // Crane
    const crane = {
      x: 180,
      y: 35,
      dir: 1,
      speed: 130 // px/sec
    };

    // Gift
    const gift = {
      active: false,
      x: 180,
      y: 35,
      vy: 0,
      size: 24,
      rotation: 0
    };

    // Target (Chimney)
    const chimney = {
      x: 180,
      width: TARGET_WIDTHS[0],
      height: 65,
      y: 0
    };

    // Particles / Snow
    const snow = [];
    for(let i = 0; i < 35; i++){
      snow.push({
        x: Math.random() * 400,
        y: Math.random() * 400,
        r: Math.random() * 2 + 1,
        vy: Math.random() * 40 + 20
      });
    }

    const floatingTexts = [];

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width || 360;
      height = rect.height || 380;
      canvas.width = width;
      canvas.height = height;
      chimney.y = height - chimney.height;
    }

    function initChimney() {
      const idx = Math.min(hits, TARGET_WIDTHS.length - 1);
      chimney.width = TARGET_WIDTHS[idx];
      const margin = chimney.width / 2 + 25;
      chimney.x = margin + Math.random() * (width - 2 * margin);
    }

    function resetGame() {
      hits = 0;
      lives = 3;
      gameOver = false;
      gameWon = false;
      gift.active = false;
      dropBtn.disabled = false;
      overlay.style.display = "none";
      crane.x = width / 2;
      crane.dir = 1;
      updateHud();
      initChimney();
    }

    function updateHud() {
      scoreEl.textContent = `Treffer: ${hits} / ${TARGET_HITS}`;
      livesEl.textContent = `Leben: ${"❤️".repeat(Math.max(0, lives))}${"🖤".repeat(Math.max(0, 3 - lives))}`;
    }

    function triggerDrop() {
      if (gift.active || gameOver || gameWon) return;
      gift.active = true;
      gift.x = crane.x;
      gift.y = crane.y + 16;
      gift.vy = 0;
      gift.rotation = 0;
      dropBtn.disabled = true;
    }

    // Audio SFX
    let audioCtx = null;
    function playBeep(freq, duration, type="sine") {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === "suspended") audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch(e) {}
    }

    function addFloatingText(text, x, y, color) {
      floatingTexts.push({ text, x, y, color, life: 1.0 });
    }

    function onHit() {
      hits++;
      playBeep(587, 0.15);
      setTimeout(() => playBeep(880, 0.25), 80);
      addFloatingText("Treffer! 🌟", chimney.x, chimney.y - 10, "#f4c430");

      if (hits >= TARGET_HITS) {
        gameWon = true;
        updateHud();
        setTimeout(() => {
          ovTitle.textContent = "🎄 Gewonnen! 🎄";
          ovDesc.textContent = "Alle 5 Geschenke meisterhaft verteilt!";
          retryBtn.textContent = "Noch einmal spielen 🌟";
          overlay.style.display = "flex";
          win();
        }, 300);
      } else {
        updateHud();
        setTimeout(() => {
          initChimney();
          gift.active = false;
          dropBtn.disabled = false;
        }, 400);
      }
    }

    function onMiss() {
      lives--;
      playBeep(220, 0.35, "sawtooth");
      addFloatingText("Daneben! ❄️", gift.x, height - 30, "#d62839");
      updateHud();

      if (lives <= 0) {
        gameOver = true;
        setTimeout(() => {
          ovTitle.textContent = "Schade!";
          ovDesc.textContent = "Du hast leider alle Leben verbraucht.";
          retryBtn.textContent = "Nochmal versuchen 🔄";
          overlay.style.display = "flex";
        }, 500);
      } else {
        setTimeout(() => {
          gift.active = false;
          dropBtn.disabled = false;
        }, 500);
      }
    }

    // Input handlers
    dropBtn.addEventListener("click", triggerDrop);
    retryBtn.addEventListener("click", resetGame);

    const onKeyDown = (e) => {
      if (e.code === "Space" || e.code === "ArrowDown") {
        e.preventDefault();
        triggerDrop();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    // Canvas click also drops
    canvas.addEventListener("pointerdown", () => triggerDrop());

    // Main Loop
    let lastTime = performance.now();
    let animId = null;

    function loop(now) {
      if (!root.isConnected) {
        window.removeEventListener("keydown", onKeyDown);
        if (animId) cancelAnimationFrame(animId);
        return;
      }

      let dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Speed hook for bot
      const timeScale = root.__fast ? 5.0 : 1.0;
      const simDt = dt * timeScale;

      // Update Crane
      if (!gameOver && !gameWon) {
        crane.x += crane.dir * crane.speed * simDt;
        const pad = 24;
        if (crane.x >= width - pad) {
          crane.x = width - pad;
          crane.dir = -1;
        } else if (crane.x <= pad) {
          crane.x = pad;
          crane.dir = 1;
        }
      }

      // Update Gift
      if (gift.active) {
        const gravity = 650;
        gift.vy += gravity * simDt;
        gift.y += gift.vy * simDt;
        gift.rotation += 2.0 * simDt;

        const landingY = chimney.y + 10;
        if (gift.y >= landingY) {
          gift.y = landingY;
          const leftBound = chimney.x - chimney.width / 2;
          const rightBound = chimney.x + chimney.width / 2;
          if (gift.x >= leftBound && gift.x <= rightBound) {
            onHit();
          } else {
            onMiss();
          }
          gift.vy = 0;
        }
      }

      // Update Snow
      for (let s of snow) {
        s.y += s.vy * simDt;
        if (s.y > height) {
          s.y = -5;
          s.x = Math.random() * width;
        }
      }

      // Update Floating Texts
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y -= 30 * simDt;
        ft.life -= simDt * 1.5;
        if (ft.life <= 0) floatingTexts.splice(i, 1);
      }

      // RENDER
      ctx.clearRect(0, 0, width, height);

      // Night sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, "#081324");
      skyGrad.addColorStop(1, "#102a45");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Snowflakes
      ctx.fillStyle = "rgba(245, 249, 255, 0.75)";
      for (let s of snow) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Roof Base at Bottom
      ctx.fillStyle = "#16283e";
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, height - 35);
      ctx.lineTo(width, height - 35);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Snow on roof
      ctx.fillStyle = "#f5f9ff";
      ctx.fillRect(0, height - 38, width, 6);

      // Chimney (Target)
      const chX = chimney.x - chimney.width / 2;
      const chW = chimney.width;
      const chH = chimney.height;
      const chY = chimney.y;

      // Brick pattern
      ctx.fillStyle = "#8f2229";
      ctx.fillRect(chX, chY, chW, chH);

      // Chimney rim
      ctx.fillStyle = "#b5353d";
      ctx.fillRect(chX - 4, chY, chW + 8, 12);
      ctx.fillStyle = "#f5f9ff";
      ctx.fillRect(chX - 4, chY - 3, chW + 8, 4); // snow layer

      // Golden target indicator inside chimney
      ctx.fillStyle = "#f4c430";
      ctx.fillRect(chX + 2, chY + 12, chW - 4, 3);

      // Crane Rail
      ctx.fillStyle = "#1e3d59";
      ctx.fillRect(0, 14, width, 8);
      ctx.fillStyle = "#f4c430";
      ctx.fillRect(0, 18, width, 2);

      // Crane Trolley
      ctx.fillStyle = "#d62839";
      ctx.fillRect(crane.x - 14, 10, 28, 14);
      ctx.fillStyle = "#f4c430";
      ctx.fillRect(crane.x - 4, 12, 8, 10);

      // Cable
      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(crane.x, 24);
      const hookY = gift.active ? crane.y + 12 : crane.y + 6;
      ctx.lineTo(crane.x, hookY);
      ctx.stroke();

      // Claw
      ctx.fillStyle = "#f4c430";
      ctx.beginPath();
      ctx.arc(crane.x, hookY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Draw gift in claw if not dropped
      if (!gift.active && !gameOver && !gameWon) {
        drawGift(crane.x, hookY + 14, 0);
      }

      // Draw dropping gift
      if (gift.active) {
        drawGift(gift.x, gift.y, gift.rotation);
      }

      // Floating Texts
      for (let ft of floatingTexts) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.life);
        ctx.fillStyle = ft.color;
        ctx.font = "bold 18px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    }

    function drawGift(x, y, rot) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);

      const s = gift.size;
      // Box
      ctx.fillStyle = "#d62839";
      ctx.fillRect(-s / 2, -s / 2, s, s);

      // Ribbon Gold
      ctx.fillStyle = "#f4c430";
      ctx.fillRect(-s / 2, -3, s, 6);
      ctx.fillRect(-3, -s / 2, 6, s);

      // Bow
      ctx.beginPath();
      ctx.arc(-4, -s / 2 - 2, 3, 0, Math.PI * 2);
      ctx.arc(4, -s / 2 - 2, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Initialize layout and state
    resize();
    resetGame();
    window.addEventListener("resize", resize);
    animId = requestAnimationFrame(loop);

    // Export state hooks for Bot
    root.__game = {
      getCraneX: () => crane.x,
      getChimneyX: () => chimney.x,
      getChimneyWidth: () => chimney.width,
      isGiftActive: () => gift.active,
      getHits: () => hits,
      drop: triggerDrop
    };
  },

  async bot(root) {
    // Enable fast animation
    root.__fast = true;

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    while (root.isConnected) {
      const g = root.__game;
      if (!g) {
        await sleep(50);
        continue;
      }

      if (g.getHits() >= 5) {
        break;
      }

      // Wait until gift is ready to drop
      if (g.isGiftActive()) {
        await sleep(20);
        continue;
      }

      const targetX = g.getChimneyX();
      const craneX = g.getCraneX();
      const tolerance = Math.max(6, g.getChimneyWidth() * 0.25);

      // If crane is over the target chimney, drop!
      if (Math.abs(craneX - targetX) <= tolerance) {
        g.drop();
        // Wait until it drops and registers
        await sleep(150);
      } else {
        await sleep(10);
      }
    }
  }
 };
})();