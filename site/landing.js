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

// Card clips in the last block: every clip on screen plays, the ones that have slid out of view pause.
const clips = [...document.querySelectorAll('.tile-clip')];
if (clips.length && 'IntersectionObserver' in window && !reduceMotion) {
  const seen = new IntersectionObserver((entries) => {
    for (const {target, isIntersecting} of entries) {
      if (isIntersecting) { target.preload = 'auto'; target.play().catch(() => {}); } else target.pause();
    }
  }, {threshold: 0.2});
  clips.forEach((v) => seen.observe(v));
}

// First screen: full screen at the top of the page. While it is pinned, scrolling scales it down as a whole,
// towards its centre, until it is as wide as the blocks below (the 1300 px column, or the side padding on
// small screens), its corners rounding to 12 px — the way swan.so tucks its last block in. A transform:
// the video never reflows.
const hero = document.querySelector('.hero');
const stage = document.querySelector('.hero-stage');
if (hero && stage && !reduceMotion) {
  let fitQueued = false;
  const fit = () => {
    fitQueued = false;
    const vw = document.documentElement.clientWidth, pad = vw <= 760 ? 16 : 24;
    const travel = Math.max(1, hero.offsetHeight - stage.offsetHeight);
    const p = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / travel));
    const end = Math.min(1300, vw - 2 * pad) / vw, s = 1 - (1 - end) * p;
    stage.style.setProperty('--s', s.toFixed(4));
    // Scaled down, the card leaves a strip of its full-size box empty below it; pull the next block up so the
    // gap is the same as between the blocks below (88 px; 32 px on phones), whatever the screen.
    const gap = vw <= 760 ? 32 : 88, below = parseFloat(getComputedStyle(hero.nextElementSibling).paddingTop) || 0;
    hero.style.marginBottom = `${(gap - below - (1 - end) * stage.offsetHeight / 2).toFixed(1)}px`;
    stage.style.setProperty('--r', `${(12 * p / s).toFixed(1)}px`); // 12 px once scaled
  };
  const queueFit = () => { if (!fitQueued) { fitQueued = true; requestAnimationFrame(fit); } };
  addEventListener('scroll', queueFit, {passive: true});
  addEventListener('resize', queueFit);
  fit();
}
