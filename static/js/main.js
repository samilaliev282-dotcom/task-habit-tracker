// ===== ONBOARDING =====
const ONBOARD_KEY = 'flowtrack_onboarded_v1';

const ONBOARD_STEPS = [
  {
    icon: '⚡',
    iconClass: 'onboard-icon--indigo',
    label: 'Добро пожаловать',
    title: 'Привет! Это FlowTrack',
    desc: 'Твой личный инструмент для управления задачами и привычками. Давай быстро покажем что тут есть — займёт меньше минуты.',
    features: null,
  },
  {
    icon: '📊',
    iconClass: 'onboard-icon--cyan',
    label: 'Шаг 1 из 4',
    title: 'Дашборд — твой центр',
    desc: 'Главная страница показывает всё сразу: сколько задач активно, твой лучший streak и прогресс привычек за сегодня.',
    features: [
      { icon: 'layout-dashboard', color: 'var(--indigo)', bg: 'var(--indigo-dim)', title: 'Статистика', desc: 'Задачи, выполнение, просрочки' },
      { icon: 'flame', color: 'var(--cyan)', bg: 'var(--cyan-dim)', title: 'Прогресс-кольцо', desc: 'Сколько привычек выполнено сегодня' },
    ]
  },
  {
    icon: '✅',
    iconClass: 'onboard-icon--emerald',
    label: 'Шаг 2 из 4',
    title: 'Задачи с приоритетами',
    desc: 'Создавай задачи, ставь дедлайны и приоритеты. Высокий приоритет выделяется красным — не пропустишь.',
    features: [
      { icon: 'arrow-up', color: 'var(--rose)', bg: 'var(--rose-dim)', title: 'Высокий приоритет', desc: 'Срочные и важные дела' },
      { icon: 'calendar', color: 'var(--amber)', bg: 'var(--amber-dim)', title: 'Дедлайны', desc: 'Просроченные задачи подсвечиваются' },
    ]
  },
  {
    icon: '🔥',
    iconClass: 'onboard-icon--amber',
    label: 'Шаг 3 из 4',
    title: 'Привычки и streak',
    desc: 'Добавляй привычки и отмечай их каждый день. Система считает серию дней подряд — чем длиннее streak, тем лучше!',
    features: [
      { icon: 'flame', color: 'var(--cyan)', bg: 'var(--cyan-dim)', title: 'Streak — дни подряд', desc: 'Не прерывай серию' },
      { icon: 'calendar-check', color: 'var(--emerald)', bg: 'var(--emerald-dim)', title: 'Мини-календарь', desc: 'Видишь последние 7 дней' },
    ]
  },
  {
    icon: '🚀',
    iconClass: 'onboard-icon--rose',
    label: 'Готово!',
    title: 'Всё, можно начинать!',
    desc: 'Создай первую задачу или привычку прямо сейчас. Удачи — и не забывай отмечать привычки каждый день!',
    features: null,
  },
];

function initOnboarding() {
  const overlay = document.getElementById('onboarding');
  if (!overlay) return;
  if (localStorage.getItem(ONBOARD_KEY)) return;

  let step = 0;
  const total = ONBOARD_STEPS.length;
  const progressEl = document.getElementById('onboard-progress');
  const bodyEl = document.getElementById('onboard-body');
  const dotsEl = document.getElementById('onboard-dots');
  const nextBtn = document.getElementById('onboard-next');
  const skipBtn = document.getElementById('onboard-skip');

  function buildProgress() {
    progressEl.innerHTML = ONBOARD_STEPS.map((_, i) =>
      `<div class="onboard-pip ${i < step ? 'done' : i === step ? 'active' : ''}"></div>`
    ).join('');
  }

  function buildDots() {
    dotsEl.innerHTML = ONBOARD_STEPS.map((_, i) =>
      `<div class="onboard-dot ${i === step ? 'active' : ''}"></div>`
    ).join('');
  }

  function renderStep(animate) {
    const s = ONBOARD_STEPS[step];

    if (animate) {
      bodyEl.classList.add('slide-out');
      setTimeout(() => {
        bodyEl.classList.remove('slide-out');
        fillBody(s);
        bodyEl.classList.add('slide-in');
        lucide.createIcons();
      }, 200);
    } else {
      fillBody(s);
      lucide.createIcons();
    }

    buildProgress();
    buildDots();

    const isLast = step === total - 1;
    nextBtn.innerHTML = isLast
      ? '<i data-lucide="check"></i> Начать!'
      : 'Далее <i data-lucide="arrow-right"></i>';
    skipBtn.style.display = isLast ? 'none' : '';
    lucide.createIcons();
  }

  function fillBody(s) {
    bodyEl.innerHTML = `
      <div class="onboard-icon ${s.iconClass}">${s.icon}</div>
      <div class="onboard-step-label">${s.label}</div>
      <h2 class="onboard-title">${s.title}</h2>
      <p class="onboard-desc">${s.desc}</p>
      ${s.features ? `
        <div class="onboard-features">
          ${s.features.map(f => `
            <div class="onboard-feature">
              <div class="onboard-feature-icon" style="background:${f.bg};color:${f.icon ? f.color : 'inherit'}">
                <i data-lucide="${f.icon}"></i>
              </div>
              <div class="onboard-feature-text">
                <strong>${f.title}</strong>
                <span>${f.desc}</span>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  }

  function close() {
    localStorage.setItem(ONBOARD_KEY, '1');
    overlay.style.animation = 'fadeOut .25s ease forwards';
    setTimeout(() => overlay.classList.add('hidden'), 250);
  }

  nextBtn.addEventListener('click', () => {
    if (step < total - 1) {
      step++;
      renderStep(true);
    } else {
      close();
    }
  });

  skipBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  // Show after small delay
  setTimeout(() => {
    overlay.classList.remove('hidden');
    renderStep(false);
    lucide.createIcons();
  }, 600);
}

// fadeOut animation
const style = document.createElement('style');
style.textContent = '@keyframes fadeOut { to { opacity: 0; } }';
document.head.appendChild(style);

// Плавные переходы между страницами (JS fallback)
if (!document.startViewTransition) {
  document.body.classList.add('page-enter');
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript') || link.target === '_blank') return;
    if (href.startsWith('http') && !href.includes(location.hostname)) return;
    e.preventDefault();
    document.body.classList.add('page-exit');
    setTimeout(() => { location.href = href; }, 190);
  });
}

document.addEventListener('DOMContentLoaded', () => {

  // Burger menu
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => {
      if (!burger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Flash auto-dismiss
  document.querySelectorAll('.flash-close').forEach(btn =>
    btn.addEventListener('click', () => btn.closest('.flash').remove())
  );
  setTimeout(() => {
    document.querySelectorAll('.flash').forEach(f => {
      f.style.transition = 'opacity .4s ease';
      f.style.opacity = '0';
      setTimeout(() => f.remove(), 400);
    });
  }, 4000);

  // Password toggle
  document.querySelectorAll('.field-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const isPass = target.type === 'password';
      target.type = isPass ? 'text' : 'password';
      btn.querySelector('i').setAttribute('data-lucide', isPass ? 'eye-off' : 'eye');
      lucide.createIcons();
    });
  });

  // Priority buttons
  const prioGroup = document.getElementById('prio-group');
  const prioInput = document.getElementById('priority-input');
  if (prioGroup && prioInput) {
    prioGroup.querySelectorAll('.prio-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        prioGroup.querySelectorAll('.prio-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        prioInput.value = btn.dataset.value;
      });
    });
  }

  // Modal helpers
  function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.removeAttribute('hidden');
    setTimeout(() => {
      const first = m.querySelector('input:not([type=hidden]), textarea');
      if (first) first.focus();
    }, 60);
    document.body.style.overflow = 'hidden';
  }
  function closeModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  // Task modal
  ['open-task-modal','open-task-modal-empty'].forEach(id =>
    document.getElementById(id)?.addEventListener('click', () => openModal('task-modal'))
  );
  ['close-task-modal','close-task-modal-2'].forEach(id =>
    document.getElementById(id)?.addEventListener('click', () => closeModal('task-modal'))
  );
  document.getElementById('task-modal')?.addEventListener('click', e => {
    if (e.target.id === 'task-modal') closeModal('task-modal');
  });

  // Habit modal
  ['open-habit-modal','open-habit-modal-empty'].forEach(id =>
    document.getElementById(id)?.addEventListener('click', () => openModal('habit-modal'))
  );
  ['close-habit-modal','close-habit-modal-2'].forEach(id =>
    document.getElementById(id)?.addEventListener('click', () => closeModal('habit-modal'))
  );
  document.getElementById('habit-modal')?.addEventListener('click', e => {
    if (e.target.id === 'habit-modal') closeModal('habit-modal');
  });

  // Escape closes modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal('task-modal');
      closeModal('habit-modal');
    }
  });

  // Init onboarding
  initOnboarding();

  // Shuffle animation on button click
  document.querySelectorAll('.btn, .nav-link, .filter-tab').forEach(btn => {
    btn.addEventListener('click', function () {
      const container = this.closest('.bento, .card-grid, .filter-tabs, .auth-form, .modal-form');
      if (!container) return;
      const items = container.querySelectorAll(
        '.bento-stat, .bento-widget, .progress-widget, .task-card, .habit-card, .filter-tab, .field'
      );
      items.forEach((el, i) => {
        el.classList.remove('btn-shuffle');
        void el.offsetWidth;
        el.style.animationDelay = `${i * 30}ms`;
        el.classList.add('btn-shuffle');
        el.addEventListener('animationend', () => {
          el.classList.remove('btn-shuffle');
          el.style.animationDelay = '';
        }, { once: true });
      });
    });
  });

});
