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
