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

// Step videos: only the one you are looking at plays, and it starts from the beginning when it comes into
// view, so scrolling to the next block never lands in the middle of its video. «Looking at» = at least 60%
// of it on screen; of several, the one nearest the middle of the screen. Nothing plays under reduced motion.
const loops = [...document.querySelectorAll('video.loop')];
if (!reduceMotion && loops.length) {
  let active = null, queued = false;
  // Fetch a video a little before it is needed, so it starts at once.
  if ('IntersectionObserver' in window) {
    const near = new IntersectionObserver((entries) => {
      for (const {target, isIntersecting} of entries) if (isIntersecting) { target.preload = 'auto'; near.unobserve(target); }
    }, {rootMargin: '600px 0px'});
    loops.forEach((v) => near.observe(v));
  }
  const pickVideo = () => {
    queued = false;
    const h = window.innerHeight, mid = h / 2;
    let best = null, bestDist = Infinity;
    for (const v of loops) {
      const r = v.getBoundingClientRect();
      const seen = Math.max(0, Math.min(r.bottom, h) - Math.max(r.top, 0)) / Math.max(1, r.height);
      const dist = Math.abs((r.top + r.bottom) / 2 - mid);
      if (seen >= 0.6 && dist < bestDist) { best = v; bestDist = dist; }
    }
    if (best === active) return;
    if (active) active.pause();
    active = best;
    if (active) {
      active.preload = 'auto';
      try { active.currentTime = 0; } catch {}
      active.play().catch(() => {});
    }
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(pickVideo); } };
  // A thin progress line in each video's frame; only the playing one shows and moves.
  const bars = new Map(loops.filter((v) => !('ambient' in v.dataset)).map((v) => {
    const bar = document.createElement('i'); bar.className = 'vbar'; bar.innerHTML = '<b></b>';
    v.parentElement.append(bar);
    return [v, bar];
  }));
  const tick = () => {
    for (const [v, bar] of bars) {
      const on = v === active && v.duration > 0;
      bar.classList.toggle('on', on);
      if (on) bar.firstChild.style.transform = `scaleX(${(v.currentTime / v.duration).toFixed(4)})`;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  addEventListener('scroll', queue, {passive: true});
  addEventListener('resize', queue);
  // A tab in the background stops its video; coming back starts the one on screen afresh.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (active) active.pause(); active = null; } else queue();
  });
  queue();
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

// Smooth scrolling with Lenis 1.3.26 (vendor/), set up like the reference site:
// Framer's "Smooth Scroll" at intensity 20 = new Lenis({duration: 2}) with the
// default easeOutExpo curve. anchors: true makes the header links glide too and
// respects each section's scroll-margin-top.
if (!reduceMotion && window.Lenis) {
  new window.Lenis({duration: 2, autoRaf: true, anchors: true});
}
