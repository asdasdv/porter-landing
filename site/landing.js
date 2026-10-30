const inventoryShot = './img/inventory.webp';
const fleetShot = './img/fleet.webp';
const historyShot = './img/history.webp';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Headings: wrap each word so it can fade in from blur, one after another.
for (const el of document.querySelectorAll('[data-words]')) {
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label', words.join(' '));
  el.textContent = '';
  words.forEach((word, i) => {
    const span = document.createElement('span');
    span.className = 'w';
    span.style.setProperty('--i', i);
    span.setAttribute('aria-hidden', 'true');
    span.textContent = word;
    el.append(span, i < words.length - 1 ? ' ' : '');
  });
  el.classList.add('split');
}

// Reveal each block once it scrolls into view.
const blocks = [...document.querySelectorAll('[data-rv]')];
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    // Show every block that is in view or already scrolled past, so a jump
    // (anchor link, restored scroll position) never leaves a hidden block above.
    const bottom = window.innerHeight * 0.88;
    for (const b of blocks) {
      if (b.classList.contains('in') || b.getBoundingClientRect().top > bottom) continue;
      b.classList.add('in');
      io.unobserve(b);
    }
  }, {rootMargin: '0px 0px -12% 0px'});
  blocks.forEach((b) => io.observe(b));
} else {
  blocks.forEach((b) => b.classList.add('in'));
}

// Step progress under the header: appears once the step strip scrolls away.
const strip = document.getElementById('steps');
const progress = document.querySelector('.progress');
const stepLinks = [...progress.querySelectorAll('a')];
const sections = ['store', 'find', 'ship', 'analytics'].map((id) => document.getElementById(id));
const navHeight = () => document.querySelector('.nav-row').offsetHeight;

function updateProgress() {
  progress.hidden = strip.getBoundingClientRect().bottom >= navHeight();
  const line = window.innerHeight * 0.4;
  const left = Math.max(0, document.documentElement.scrollHeight - window.innerHeight - window.scrollY);
  let active = -1;
  sections.forEach((sec, i) => {
    const r = sec.getBoundingClientRect();
    const done = line - r.top;
    const end = Math.max(1, Math.min(r.height, done + left));
    const pct = Math.max(0, Math.min(1, done / end));
    stepLinks[i].querySelector('b').style.width = `${pct * 100}%`;
    if (pct > 0) active = i;
  });
  stepLinks.forEach((a, i) => a.classList.toggle('active', i === active));
}
let queued = false;
const onScroll = () => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; updateProgress(); });
};
window.addEventListener('scroll', onScroll, {passive: true});
window.addEventListener('resize', onScroll);
updateProgress();

// Analytics tabs swap the big screenshot.
const shots = {
  inventory: {src: inventoryShot, alt: 'Inventory: products, boxes and where they sit', desc: 'What is in stock, how many boxes, and where they sit.'},
  fleet: {src: fleetShot, alt: 'Fleet: robots and their tasks', desc: 'Where each robot is and what it is doing right now.'},
  history: {src: historyShot, alt: 'History of warehouse events', desc: 'Every box received, put away and shipped.'},
};
const tabButtons = [...document.querySelectorAll('[data-tab]')];
const tabImg = document.querySelector('.tab-shot');
const tabDesc = document.querySelector('.tab-desc');
function pickTab(key) {
  const shot = shots[key];
  tabImg.src = shot.src;
  tabImg.alt = shot.alt;
  tabDesc.textContent = shot.desc;
  tabButtons.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === key)));
}
tabButtons.forEach((b) => b.addEventListener('click', () => pickTab(b.dataset.tab)));
// Warm the other screenshots so a tab switch does not flash.
Object.values(shots).forEach((s) => { const img = new Image(); img.src = s.src; });

// Smooth wheel scrolling, the same way the reference site does it (Lenis inside
// Framer's "Smooth Scroll", intensity 20): every wheel step starts a fresh glide
// from where the page is now to the new target, lasting SCROLL_DURATION seconds on
// Lenis's default easeOutExpo curve. Time-based, so it feels the same at 60 and 120 Hz.
const SCROLL_DURATION = 2;
const easeOutExpo = (t) => Math.min(1, 1.001 - 2 ** (-10 * t));
if (!reduceMotion) {
  let target = 0;
  let from = 0;
  let animated = 0;
  let startedAt = 0;
  let running = false;
  const tick = (now) => {
    const progress = Math.max(0, Math.min(1, (now - startedAt) / (SCROLL_DURATION * 1000)));
    animated = from + (target - from) * easeOutExpo(progress);
    window.scrollTo({top: animated, behavior: 'instant'});
    if (progress < 1) requestAnimationFrame(tick);
    else running = false;
  };
  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 1) return;
    e.preventDefault();
    if (!running) { animated = window.scrollY; target = window.scrollY; }
    const unit = e.deltaMode === 1 ? 100 / 6 : e.deltaMode === 2 ? window.innerHeight : 1;
    target = Math.max(0, Math.min(max, target + e.deltaY * unit));
    from = animated;
    startedAt = performance.now();
    if (!running) { running = true; requestAnimationFrame(tick); }
  }, {passive: false});
}
