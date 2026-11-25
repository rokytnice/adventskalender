(function(){
  Games[4] = {
    title: "Glühwein-Gefäße (4 Liter)",
    hint: "Miss genau 4 Liter Glühwein im großen 5L-Kessel ab!",
    init(root, win){
      root.innerHTML = "";

      const style = document.createElement("style");
      style.textContent = `
        .g4-wrap {
          box-sizing: border-box;
          width: 100%;
          max-width: 540px;
          margin: 0 auto;
          background: #0b1d33;
          color: #f5f9ff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          padding: 16px 12px;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          user-select: none;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .g4-header {
          text-align: center;
          margin-bottom: 12px;
        }
        .g4-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #f4c430;
          margin: 0 0 4px 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.4);
        }
        .g4-subtitle {
          font-size: 0.9rem;
          color: #f5f9ff;
          opacity: 0.9;
          margin: 0;
        }
        .g4-status-bar {
          display: flex;
          justify-content: space-between;
          width: 100%;
          max-width: 440px;
          background: rgba(255,255,255,0.07);
          padding: 8px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 0.95rem;
          font-weight: 600;
        }
        .g4-stat-gold {
          color: #f4c430;
        }
        .g4-kettles {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 20px;
          width: 100%;
          margin-bottom: 20px;
        }
        .g4-kettle-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          max-width: 180px;
        }
        .g4-pot-card {
          width: 100%;
          background: rgba(11, 29, 51, 0.8);
          border: 2px solid #1f7a4d;
          border-radius: 10px;
          padding: 10px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          transition: border-color 0.2s;
        }
        .g4-pot-card.g4-target-reached {
          border-color: #f4c430;
          box-shadow: 0 0 16px rgba(244, 196, 48, 0.6);
        }
        .g4-pot-label {
          font-weight: 700;
          font-size: 1.05rem;
          margin-bottom: 6px;
          color: #f4c430;
        }
        .g4-pot-amount {
          font-size: 0.95rem;
          margin-bottom: 8px;
          color: #f5f9ff;
        }
        .g4-pot-svg {
          width: 100%;
          height: auto;
          max-height: 190px;
          display: block;
        }
        .g4-btn-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          margin-top: 10px;
        }
        .g4-btn {
          background: #d62839;
          color: #f5f9ff;
          border: none;
          border-radius: 8px;
          min-height: 44px;
          padding: 8px 12px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.1s, background 0.2s, opacity 0.2s;
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
          touch-action: manipulation;
        }
        .g4-btn:hover:not(:disabled) {
          background: #e63946;
          transform: translateY(-1px);
        }
        .g4-btn:active:not(:disabled) {
          transform: translateY(1px);
        }
        .g4-btn:disabled {
          background: #4a5568;
          cursor: not-allowed;
          opacity: 0.6;
        }
        .g4-btn-transfer {
          background: #1f7a4d;
        }
        .g4-btn-transfer:hover:not(:disabled) {
          background: #289e64;
        }
        .g4-btn-reset {
          background: transparent;
          color: #f5f9ff;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 6px;
          min-height: 44px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 0.9rem;
          margin-top: 6px;
          transition: background 0.2s;
        }
        .g4-btn-reset:hover {
          background: rgba(255,255,255,0.1);
        }
        .g4-msg {
          min-height: 24px;
          font-weight: 600;
          color: #f4c430;
          margin: 6px 0;
          text-align: center;
          font-size: 0.95rem;
        }
        .g4-snow {
          position: relative;
        }
      `;
      root.appendChild(style);

      const container = document.createElement("div");
      container.className = "g4-wrap g4-snow";
      root.appendChild(container);

      let jug5 = 0;
      let jug3 = 0;
      let steps = 0;
      let hasWon = false;

      function render() {
        const isTarget = (jug5 === 4);
        container.innerHTML = `
          <div class="g4-header">
            <h2 class="g4-title">🎄 Glühwein-Ausschank</h2>
            <p class="g4-subtitle">Mische die Kessel so, dass <strong>genau 4 Liter</strong> im 5L-Kessel sind.</p>
          </div>

          <div class="g4-status-bar">
            <span>Züge: <strong class="g4-stat-gold" id="g4-moves">${steps}</strong></span>
            <span>Ziel: <strong class="g4-stat-gold">4 L</strong> im 5L-Kessel</span>
          </div>

          <div class="g4-kettles">
            <!-- 5L Kettle -->
            <div class="g4-kettle-col">
              <div class="g4-pot-card ${isTarget ? 'g4-target-reached' : ''}" id="g4-card-5">
                <div class="g4-pot-label">5-Liter Kessel</div>
                <div class="g4-pot-amount"><span id="g4-val-5">${jug5}</span> / 5 Liter</div>
                <svg class="g4-pot-svg" viewBox="0 0 120 160">
                  <defs>
                    <linearGradient id="g4-wine-5" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#800c18" />
                      <stop offset="50%" stop-color="#b71526" />
                      <stop offset="100%" stop-color="#700612" />
                    </linearGradient>
                    <clipPath id="g4-clip-5">
                      <rect x="15" y="20" width="90" height="130" rx="8" />
                    </clipPath>
                  </defs>
                  <!-- Glass/Pot Outline -->
                  <rect x="15" y="20" width="90" height="130" rx="8" fill="rgba(255,255,255,0.08)" stroke="#f4c430" stroke-width="3" />
                  <!-- Scale marks -->
                  <line x1="15" y1="46" x2="28" y2="46" stroke="#f4c430" stroke-width="2" />
                  <text x="32" y="50" font-size="10" fill="#f5f9ff">4L</text>
                  <line x1="15" y1="72" x2="25" y2="72" stroke="#f5f9ff" stroke-width="1.5" opacity="0.6" />
                  <text x="29" y="76" font-size="9" fill="#f5f9ff" opacity="0.8">3L</text>
                  <line x1="15" y1="98" x2="25" y2="98" stroke="#f5f9ff" stroke-width="1.5" opacity="0.6" />
                  <text x="29" y="102" font-size="9" fill="#f5f9ff" opacity="0.8">2L</text>
                  <line x1="15" y1="124" x2="25" y2="124" stroke="#f5f9ff" stroke-width="1.5" opacity="0.6" />
                  <text x="29" y="128" font-size="9" fill="#f5f9ff" opacity="0.8">1L</text>
                  <!-- Liquid -->
                  <g clip-path="url(#g4-clip-5)">
                    <rect x="15" y="${150 - (jug5 / 5) * 130}" width="90" height="${(jug5 / 5) * 130}" fill="url(#g4-wine-5)" style="transition: all 0.25s ease;" />
                  </g>
                  <!-- Rim top -->
                  <ellipse cx="60" cy="20" rx="45" ry="5" fill="none" stroke="#f4c430" stroke-width="2" />
                </svg>

                <div class="g4-btn-group">
                  <button class="g4-btn" id="g4-fill-5" ${jug5 === 5 || hasWon ? 'disabled' : ''}>Füllen (5L)</button>
                  <button class="g4-btn" id="g4-empty-5" ${jug5 === 0 || hasWon ? 'disabled' : ''}>Leeren</button>
                  <button class="g4-btn g4-btn-transfer" id="g4-pour-5-3" ${jug5 === 0 || jug3 === 3 || hasWon ? 'disabled' : ''}>In 3L Kessel ➔</button>
                </div>
              </div>
            </div>

            <!-- 3L Kettle -->
            <div class="g4-kettle-col">
              <div class="g4-pot-card" id="g4-card-3">
                <div class="g4-pot-label">3-Liter Kessel</div>
                <div class="g4-pot-amount"><span id="g4-val-3">${jug3}</span> / 3 Liter</div>
                <svg class="g4-pot-svg" viewBox="0 0 120 160">
                  <defs>
                    <linearGradient id="g4-wine-3" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#800c18" />
                      <stop offset="50%" stop-color="#b71526" />
                      <stop offset="100%" stop-color="#700612" />
                    </linearGradient>
                    <clipPath id="g4-clip-3">
                      <rect x="22" y="44" width="76" height="106" rx="7" />
                    </clipPath>
                  </defs>
                  <rect x="22" y="44" width="76" height="106" rx="7" fill="rgba(255,255,255,0.08)" stroke="#1f7a4d" stroke-width="3" />
                  <!-- Scale marks -->
                  <line x1="22" y1="79" x2="32" y2="79" stroke="#f5f9ff" stroke-width="1.5" opacity="0.6" />
                  <text x="35" y="83" font-size="9" fill="#f5f9ff" opacity="0.8">2L</text>
                  <line x1="22" y1="114" x2="32" y2="114" stroke="#f5f9ff" stroke-width="1.5" opacity="0.6" />
                  <text x="35" y="118" font-size="9" fill="#f5f9ff" opacity="0.8">1L</text>
                  <!-- Liquid -->
                  <g clip-path="url(#g4-clip-3)">
                    <rect x="22" y="${150 - (jug3 / 3) * 106}" width="76" height="${(jug3 / 3) * 106}" fill="url(#g4-wine-3)" style="transition: all 0.25s ease;" />
                  </g>
                  <!-- Rim top -->
                  <ellipse cx="60" cy="44" rx="38" ry="4" fill="none" stroke="#1f7a4d" stroke-width="2" />
                </svg>

                <div class="g4-btn-group">
                  <button class="g4-btn" id="g4-fill-3" ${jug3 === 3 || hasWon ? 'disabled' : ''}>Füllen (3L)</button>
                  <button class="g4-btn" id="g4-empty-3" ${jug3 === 0 || hasWon ? 'disabled' : ''}>Leeren</button>
                  <button class="g4-btn g4-btn-transfer" id="g4-pour-3-5" ${jug3 === 0 || jug5 === 5 || hasWon ? 'disabled' : ''}>⬅ In 5L Kessel</button>
                </div>
              </div>
            </div>
          </div>

          <div class="g4-msg" id="g4-message">${isTarget ? '🎉 Perfekt gemessen! 4 Liter fertig!' : ''}</div>
          <button class="g4-btn-reset" id="g4-reset">Neu beginnen</button>
        `;

        bindEvents();
      }

      function applyAction(action) {
        if (hasWon) return;
        let changed = false;

        if (action === "fill-5" && jug5 < 5) {
          jug5 = 5;
          changed = true;
        } else if (action === "fill-3" && jug3 < 3) {
          jug3 = 3;
          changed = true;
        } else if (action === "empty-5" && jug5 > 0) {
          jug5 = 0;
          changed = true;
        } else if (action === "empty-3" && jug3 > 0) {
          jug3 = 0;
          changed = true;
        } else if (action === "pour-5-3" && jug5 > 0 && jug3 < 3) {
          const amount = Math.min(jug5, 3 - jug3);
          jug5 -= amount;
          jug3 += amount;
          changed = true;
        } else if (action === "pour-3-5" && jug3 > 0 && jug5 < 5) {
          const amount = Math.min(jug3, 5 - jug5);
          jug3 -= amount;
          jug5 += amount;
          changed = true;
        }

        if (changed) {
          steps++;
          render();
          checkWin();
        }
      }

      function checkWin() {
        if (!hasWon && jug5 === 4) {
          hasWon = true;
          render();
          win();
        }
      }

      function resetGame() {
        jug5 = 0;
        jug3 = 0;
        steps = 0;
        hasWon = false;
        render();
      }

      function bindEvents() {
        const f5 = container.querySelector("#g4-fill-5");
        const e5 = container.querySelector("#g4-empty-5");
        const p53 = container.querySelector("#g4-pour-5-3");
        const f3 = container.querySelector("#g4-fill-3");
        const e3 = container.querySelector("#g4-empty-3");
        const p35 = container.querySelector("#g4-pour-3-5");
        const rst = container.querySelector("#g4-reset");

        if (f5) f5.onclick = () => applyAction("fill-5");
        if (e5) e5.onclick = () => applyAction("empty-5");
        if (p53) p53.onclick = () => applyAction("pour-5-3");
        if (f3) f3.onclick = () => applyAction("fill-3");
        if (e3) e3.onclick = () => applyAction("empty-3");
        if (p35) p35.onclick = () => applyAction("pour-3-5");
        if (rst) rst.onclick = () => resetGame();
      }

      // Expose internal action execution for reliable bot driving
      root.__g4_action = applyAction;
      root.__g4_getState = () => ({ jug5, jug3, hasWon });

      render();
    },

    async bot(root) {
      // Breadth-First-Search (BFS) to find optimal sequence of actions to reach jug5 === 4
      function solveBFS(startJ5, startJ3) {
        const queue = [{ j5: startJ5, j3: startJ3, path: [] }];
        const visited = new Set();
        visited.add(`${startJ5},${startJ3}`);

        const actions = ["fill-5", "fill-3", "empty-5", "empty-3", "pour-5-3", "pour-3-5"];

        while (queue.length > 0) {
          const current = queue.shift();
          if (current.j5 === 4) {
            return current.path;
          }

          for (const act of actions) {
            let n5 = current.j5;
            let n3 = current.j3;

            if (act === "fill-5") n5 = 5;
            else if (act === "fill-3") n3 = 3;
            else if (act === "empty-5") n5 = 0;
            else if (act === "empty-3") n3 = 0;
            else if (act === "pour-5-3") {
              const diff = Math.min(n5, 3 - n3);
              n5 -= diff;
              n3 += diff;
            } else if (act === "pour-3-5") {
              const diff = Math.min(n3, 5 - n5);
              n3 -= diff;
              n5 += diff;
            }

            const key = `${n5},${n3}`;
            if (!visited.has(key)) {
              visited.add(key);
              queue.push({ j5: n5, j3: n3, path: [...current.path, act] });
            }
          }
        }
        return [];
      }

      const state = root.__g4_getState ? root.__g4_getState() : { jug5: 0, jug3: 0, hasWon: false };
      if (state.hasWon) return;

      const plan = solveBFS(state.jug5, state.jug3);

      for (const act of plan) {
        if (!root.isConnected) return;
        const delay = root.__fast ? 40 : 250;
        await new Promise(r => setTimeout(r, delay));
        if (!root.isConnected) return;

        // Try direct DOM click if available, else state hook
        const btnId = "#g4-" + act;
        const btn = root.querySelector(btnId);
        if (btn && !btn.disabled) {
          btn.click();
        } else if (root.__g4_action) {
          root.__g4_action(act);
        }
      }
    }
  };
})();