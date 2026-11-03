const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Headings: wrap each word, then number the words by the line they sit on, so each line rises as one.
for (const el of document.querySelectorAll('[data-words]')) {
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label', words.join(' '));
  el.textContent = '';
  words.forEach((word, i) => {
    const span = document.createElement('span');
    span.className = 'w';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = word;
    el.append(span, i < words.length - 1 ? ' ' : '');
  });
  el.classList.add('split');
}
const numberLines = () => {
  for (const el of document.querySelectorAll('[data-words]')) {
    let top = null, line = -1;
    for (const w of el.querySelectorAll('.w')) {
      if (top === null || Math.abs(w.offsetTop - top) > 4) { top = w.offsetTop; line++; }
      w.style.setProperty('--i', line);
    }
  }
};
numberLines();
document.fonts?.ready.then(numberLines);
addEventListener('resize', numberLines);

// Header: spans the content at the top of the page, narrows into the floating pill once you scroll.
const nav = document.querySelector('.nav');
if (nav) {
  // The pill is as wide as its content: measure a hidden copy, so the header itself never animates for it.
  const measure = () => {
    const copy = nav.querySelector('.nav-row').cloneNode(true);
    copy.classList.add('measure');
    copy.setAttribute('aria-hidden', 'true');
    nav.append(copy);
    nav.style.setProperty('--pill', `${Math.ceil(copy.getBoundingClientRect().width)}px`);
    copy.remove();
  };
  const update = () => nav.classList.toggle('compact', window.scrollY > 40);
  measure();
  document.fonts?.ready.then(measure);
  update();
  addEventListener('scroll', update, {passive: true});
  addEventListener('resize', measure);
}

// Reveal each block once it scrolls into view; a block with a [data-rv-anchor] inside (the text of a feature
// card, centred in a tall card) waits until that part is in view.
const blocks = [...document.querySelectorAll('[data-rv]')];
const anchor = (b) => b.querySelector('[data-rv-anchor]') || b;
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    // Show every block that is in view or already scrolled past, so a jump
    // (anchor link, restored scroll position) never leaves a hidden block above.
    const bottom = window.innerHeight * 0.88;
    for (const b of blocks) {
      if (b.classList.contains('in') || anchor(b).getBoundingClientRect().top > bottom) continue;
      b.classList.add('in');
      io.unobserve(anchor(b));
    }
  }, {rootMargin: '0px 0px -12% 0px'});
  blocks.forEach((b) => io.observe(anchor(b)));
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
