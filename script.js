const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelector('.nav-toggle')?.addEventListener('click', (event) => {
  const nav = document.querySelector('.main-nav');
  const open = nav.classList.toggle('open');
  event.currentTarget.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.main-nav a').forEach((link) => link.addEventListener('click', () => {
  document.querySelector('.main-nav')?.classList.remove('open');
  document.querySelector('.nav-toggle')?.setAttribute('aria-expanded', 'false');
  document.querySelector('.nav-dropdown')?.classList.remove('open');
  document.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
}));

const navDropdown = document.querySelector('.nav-dropdown');
const dropdownToggle = document.querySelector('.dropdown-toggle');
dropdownToggle?.addEventListener('click', (event) => {
  event.stopPropagation();
  const open = navDropdown.classList.toggle('open');
  dropdownToggle.setAttribute('aria-expanded', String(open));
});

document.addEventListener('click', (event) => {
  if (!navDropdown?.contains(event.target)) {
    navDropdown?.classList.remove('open');
    dropdownToggle?.setAttribute('aria-expanded', 'false');
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    navDropdown?.classList.remove('open');
    dropdownToggle?.setAttribute('aria-expanded', 'false');
    dropdownToggle?.focus();
  }
});

const revealItems = document.querySelectorAll('[data-reveal]');
if (reduced) revealItems.forEach((item) => item.classList.add('revealed'));
else {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  }), { threshold: .12 });
  revealItems.forEach((item) => observer.observe(item));
}

document.querySelectorAll('[data-compare]').forEach((compare) => {
  const input = compare.querySelector('input[type="range"]');
  const update = () => compare.style.setProperty('--position', `${input.value}%`);
  input.addEventListener('input', update);
  update();
});

const projectTabs = [...document.querySelectorAll('.project-tabs button')];
const projectCompare = document.querySelector('[data-compare]');
let projectSwitch = 0;

const preload = (src) => new Promise((resolve) => {
  const image = new Image();
  image.onload = image.onerror = resolve;
  image.src = src;
});

projectTabs.forEach((tab) => tab.addEventListener('click', async () => {
  if (!projectCompare || tab.classList.contains('active')) return;

  const switchId = ++projectSwitch;
  projectCompare.classList.add('switching');
  await Promise.all([preload(tab.dataset.before), preload(tab.dataset.after)]);
  if (switchId !== projectSwitch) return;

  const before = projectCompare.querySelector('.compare-before');
  const after = projectCompare.querySelector('.compare-after img');
  const slider = projectCompare.querySelector('input[type="range"]');
  before.src = tab.dataset.before;
  before.alt = tab.dataset.beforeAlt;
  after.src = tab.dataset.after;
  after.alt = tab.dataset.afterAlt;
  slider.value = 52;
  projectCompare.style.setProperty('--position', '52%');

  document.querySelector('[data-project-title]').textContent = tab.dataset.title;
  document.querySelector('[data-project-scope]').textContent = tab.dataset.scope;
  document.querySelector('[data-project-time]').textContent = tab.dataset.time;
  projectTabs.forEach((button) => {
    const active = button === tab;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  projectCompare.classList.remove('switching');
}));

document.querySelectorAll('[data-multistep]').forEach((form) => {
  const steps = [...form.querySelectorAll('.form-step')];
  const progress = [...form.querySelectorAll('.form-progress button')];
  let current = 0;
  const show = (index) => {
    current = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, i) => step.classList.toggle('active', i === current));
    progress.forEach((button, i) => button.classList.toggle('active', i <= current));
  };
  form.querySelectorAll('.next-step').forEach((button) => button.addEventListener('click', () => show(current + 1)));
  form.querySelectorAll('.back-step').forEach((button) => button.addEventListener('click', () => show(current - 1)));
  progress.forEach((button) => button.addEventListener('click', () => show(Number(button.dataset.go))));
  form.querySelector('[data-upload]')?.addEventListener('change', (event) => {
    const preview = form.querySelector('.upload-preview');
    preview.replaceChildren();
    [...event.target.files].slice(0, 5).forEach((file) => {
      const image = document.createElement('img');
      image.src = URL.createObjectURL(file);
      image.alt = 'Selected site photo preview';
      image.onload = () => URL.revokeObjectURL(image.src);
      preview.append(image);
    });
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    steps.forEach((step) => { step.style.display = 'none'; });
    form.querySelector('.form-progress').style.display = 'none';
    form.querySelector('.form-success').hidden = false;
  });
  form.querySelector('.reset-form')?.addEventListener('click', () => {
    form.reset();
    form.querySelector('.upload-preview').replaceChildren();
    form.querySelector('.form-success').hidden = true;
    form.querySelector('.form-progress').style.display = '';
    steps.forEach((step) => { step.style.display = ''; });
    show(0);
  });
});

if (!reduced) {
  document.querySelectorAll('.service-card').forEach((card) => card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    card.style.transform = `perspective(900px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg) translateY(-8px)`;
  }));
  document.querySelectorAll('.service-card').forEach((card) => card.addEventListener('pointerleave', () => { card.style.transform = ''; }));
}
