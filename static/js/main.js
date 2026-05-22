document.addEventListener('DOMContentLoaded', () => {
  // Burger menu
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', (e) => {
      if (!burger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Flash close
  document.querySelectorAll('.flash-close').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.flash').remove());
  });
  setTimeout(() => {
    document.querySelectorAll('.flash').forEach(f => f.remove());
  }, 5000);

  // Password toggle
  document.querySelectorAll('.field-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const isPassword = target.type === 'password';
      target.type = isPassword ? 'text' : 'password';
      const icon = btn.querySelector('svg use, svg');
      btn.querySelector('i').setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
      lucide.createIcons();
    });
  });

  // Modal helpers
  function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.removeAttribute('hidden');
    const first = m.querySelector('input, textarea, button');
    if (first) first.focus();
    document.body.style.overflow = 'hidden';
  }
  function closeModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  // Task modal
  ['open-task-modal', 'open-task-modal-empty'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => openModal('task-modal'));
  });
  ['close-task-modal', 'close-task-modal-2'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => closeModal('task-modal'));
  });
  document.getElementById('task-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'task-modal') closeModal('task-modal');
  });

  // Habit modal
  ['open-habit-modal', 'open-habit-modal-empty'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => openModal('habit-modal'));
  });
  ['close-habit-modal', 'close-habit-modal-2'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => closeModal('habit-modal'));
  });
  document.getElementById('habit-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'habit-modal') closeModal('habit-modal');
  });

  // Close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('task-modal');
      closeModal('habit-modal');
    }
  });
});
