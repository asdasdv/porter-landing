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

// Step videos play only while on screen (and not at all under reduced motion: the poster stays).
const loops = [...document.querySelectorAll('video.loop')];
if (!reduceMotion && 'IntersectionObserver' in window) {
  const watcher = new IntersectionObserver((entries) => {
    for (const {target, isIntersecting} of entries) {
      if (isIntersecting) { target.preload = 'auto'; target.play().catch(() => {}); }
      else target.pause();
    }
  }, {rootMargin: '200px 0px'});
  loops.forEach((v) => watcher.observe(v));
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
  drift();
}

// Final block: each screen drifts at its own speed while the section passes by.
// (Looked up inside drift(): updateProgress() runs once before this point.)
function drift() {
  if (reduceMotion || window.innerWidth <= 760) return;
  const cta = document.getElementById('cta');
  const collage = cta.querySelectorAll('.collage img');
  const r = cta.getBoundingClientRect();
  if (r.bottom < 0 || r.top > window.innerHeight) return;
  const offset = (r.top + r.height / 2) - window.innerHeight / 2;
  for (const img of collage) img.style.setProperty('--py', `${(offset * Number(img.dataset.depth)).toFixed(1)}px`);
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

// Smooth scrolling with Lenis 1.3.26 (vendor/), set up like the reference site:
// Framer's "Smooth Scroll" at intensity 20 = new Lenis({duration: 2}) with the
// default easeOutExpo curve. anchors: true makes the header links glide too and
// respects each section's scroll-margin-top.
if (!reduceMotion && window.Lenis) {
  new window.Lenis({duration: 2, autoRaf: true, anchors: true});
}
