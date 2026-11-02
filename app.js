window.Games = window.Games || {};

(function () {
  const TOTAL_DAYS = 24;
  const STORAGE_KEY = 'adv2026-won';
  const _qp = new URLSearchParams(window.location.search);
  const _tv = _qp.get('test') ?? _qp.get('preview');
  const isPreview = _tv !== null && _tv !== '0' && _tv !== 'false';
  try { localStorage.removeItem('adv2026-test'); } catch (e) {}
  
  let wonSet = new Set();
  let lastFocusedElement = null;
  let toastTimeout = null;

  // Safe LocalStorage
  function loadProgress() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) wonSet = new Set(arr);
      }
    } catch (e) {
      console.warn('LocalStorage nicht verfügbar', e);
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(wonSet)));
    } catch (e) {
      console.warn('LocalStorage Speichern fehlgeschlagen', e);
    }
  }

  function isUnlocked(day) {
    if (isPreview) return true;
    const now = new Date();
    const unlockDate = new Date(2026, 11, day, 0, 0, 0); // Dec = 11
    return now >= unlockDate;
  }

  function updateProgressDisplay() {
    const el = document.getElementById('progress-display');
    if (el) {
      el.textContent = `${wonSet.size}/${TOTAL_DAYS} gelöst`;
    }
  }

  function checkCountdown() {
    const banner = document.getElementById('countdown-banner');
    if (!banner || isPreview) return;
    const now = new Date();
    const start = new Date(2026, 11, 1);
    if (now < start) {
      const diffTime = start - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      banner.textContent = `Der Adventskalender startet in ${diffDays} Tag${diffDays > 1 ? 'en' : ''}!`;
      banner.classList.remove('hidden');
    }
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }

  function renderGrid() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    grid.innerHTML = '';

    for (let day = 1; day <= TOTAL_DAYS; day++) {
      const unlocked = isUnlocked(day);
      const isWon = wonSet.has(day);

      const container = document.createElement('div');
      container.className = 'door-container';

      const btn = document.createElement('button');
      btn.className = 'door';
      btn.dataset.day = day;
      btn.setAttribute('aria-label', `Türchen ${day}`);

      if (!unlocked) {
        btn.classList.add('locked');
      } else {
        btn.classList.add('open');
      }
      if (isWon) {
        btn.classList.add('won');
      }

      const statusIcon = !unlocked ? '🔒' : (isWon ? '⭐' : '');

      btn.innerHTML = `
        <div class="door-inner">
          <div class="door-front">
            <span class="door-number">${day}</span>
            <span class="door-status-icon">${statusIcon}</span>
          </div>
          <div class="door-back">
            <span>⭐</span>
          </div>
        </div>
      `;

      btn.addEventListener('click', () => handleDoorClick(day, btn));
      container.appendChild(btn);
      grid.appendChild(container);
    }
  }

  function handleDoorClick(day, btnEl) {
    if (!isUnlocked(day)) {
      btnEl.classList.remove('shake');
      void btnEl.offsetWidth;
      btnEl.classList.add('shake');
      showToast(`Noch nicht! Öffnet am ${day}. Dezember`);
      return;
    }
    openModal(day);
  }

  function openModal(day) {
    lastFocusedElement = document.activeElement;
    const modal = document.getElementById('modal');
    const titleEl = document.getElementById('modal-title');
    const hintEl = document.getElementById('modal-hint');
    const rootEl = document.getElementById('game-root');
    
    rootEl.innerHTML = '';
    const dayKey = String(day).padStart(2, '0');
    const gameObj = window.Games[day] || window.Games[dayKey];

    const gameTitle = gameObj && gameObj.title ? gameObj.title : 'Überraschung';
    titleEl.textContent = `Türchen ${day} – ${gameTitle}`;

    if (gameObj && gameObj.hint) {
      hintEl.textContent = gameObj.hint;
      hintEl.classList.remove('hidden');
    } else {
      hintEl.classList.add('hidden');
    }

    modal.classList.remove('hidden');

    const winCallback = () => {
      wonSet.add(day);
      saveProgress();
      updateProgressDisplay();
      const doorBtn = document.querySelector(`.door[data-day="${day}"]`);
      if (doorBtn) {
        doorBtn.classList.add('won');
        const statusIcon = doorBtn.querySelector('.door-status-icon');
        if (statusIcon) statusIcon.textContent = '⭐';
      }
      triggerConfetti();
      showToast('Herzlichen Glückwunsch! Gelöst! ⭐');
    };

    if (gameObj && typeof gameObj.init === 'function') {
      gameObj.init(rootEl, winCallback);
    } else {
      rootEl.innerHTML = `<p style="text-align:center; padding: 2rem;">Hier wartet bald ein Minispiel auf dich!</p>`;
    }

    const closeBtn = document.getElementById('modal-close');
    closeBtn.focus();
  }

  function closeModal() {
    const modal = document.getElementById('modal');
    const rootEl = document.getElementById('game-root');
    modal.classList.add('hidden');
    rootEl.innerHTML = '';
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  // Confetti Animation
  function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#f4c430', '#d62839', '#1f7a4d', '#f5f9ff'];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.7) * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 4,
        life: 100
      });
    }

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;
      particles.forEach(p => {
        if (p.life > 0) {
          active = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.2;
          p.life--;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      });
      if (active) requestAnimationFrame(render);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    render();
  }

  // Snowfall Animation
  function initSnow() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = document.getElementById('snow-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const flakes = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 3 + 1,
      d: Math.random() + 0.5
    }));

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(245, 249, 255, 0.7)';
      ctx.beginPath();
      flakes.forEach(f => {
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      });
      ctx.fill();
      update();
      requestAnimationFrame(draw);
    }

    function update() {
      flakes.forEach(f => {
        f.y += f.d * 0.8;
        f.x += Math.sin(f.y * 0.02) * 0.5;
        if (f.y > height) {
          f.y = -10;
          f.x = Math.random() * width;
        }
      });
    }
    draw();
  }

  // Event Listeners & Setup
  document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    checkCountdown();
    renderGrid();
    updateProgressDisplay();
    initSnow();

    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    const modal = document.getElementById('modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });
  });
})();