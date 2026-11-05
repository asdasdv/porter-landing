const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Headings: wrap each word, then number the words by the line they sit on, so each line rises as one.
for (const el of document.querySelectorAll('[data-words]')) {
  // Split at ordinary spaces only: a no-break space keeps a short word with the next one, on one line.
  const words = el.textContent.trim().split(/[ \t\r\n]+/);
  el.setAttribute('aria-label', words.join(' ').replace(/\u00a0/g, ' '));
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
    nav.style.setProperty('--pill', `${Math.ceil(copy.getBoundingClientRect().width) + 2}px`);
    copy.remove();
  };
  const update = () => nav.classList.toggle('compact', window.scrollY > 40);
  measure();
  document.fonts?.ready.then(measure);
  addEventListener('load', measure);
  document.fonts?.addEventListener('loadingdone', measure); // Inter can arrive after fonts.ready
  update();
  addEventListener('scroll', update, {passive: true});
  addEventListener('resize', measure);
}

// Feature cards stack as you scroll (position: sticky). Each sticks a step below the one before, so the edges
// of the cards underneath peek out; a card too tall for the screen sticks higher, with its bottom in view.
const feats = [...document.querySelectorAll('.feat')];
const featList = feats[0]?.parentElement;
const stickTop = (card) => parseFloat(card.style.getPropertyValue('--stick')) || 88;
// Where a card would be if it did not stick: the list's top plus the cards and gaps above it.
const flowTop = (card) => {
  let top = featList.getBoundingClientRect().top;
  const gap = parseFloat(getComputedStyle(featList).rowGap) || 0;
  for (const c of feats) { if (c === card) break; top += c.offsetHeight + gap; }
  return top;
};
if (feats.length) {
  const setStick = () => {
    feats.forEach((card, i) => {
      const base = parseFloat(getComputedStyle(card).scrollMarginTop) || 88;
      const top = Math.min(base + i * 16, window.innerHeight - card.offsetHeight - 16);
      card.style.setProperty('--stick', `${Math.round(top)}px`);
    });
  };
  // Depth: --t is how far the next card has slid over this one (0–1); a card also sinks with the ones above it.
  let queued = false;
  const depth = () => {
    queued = false;
    let below = 0;
    for (let i = feats.length - 2; i >= 0; i--) {
      const card = feats[i], next = feats[i + 1];
      const bottom = card.getBoundingClientRect().top + card.offsetHeight;
      const t = Math.min(1, Math.max(0, (bottom - next.getBoundingClientRect().top) / Math.max(1, bottom - stickTop(next))));
      below = t + below;
      card.style.setProperty('--t', below.toFixed(3));
      next.style.setProperty('--s', t.toFixed(3));
    }
  };
  const queueDepth = () => { if (!queued) { queued = true; requestAnimationFrame(depth); } };
  addEventListener('scroll', queueDepth, {passive: true});
  addEventListener('resize', queueDepth);
  setStick();
  depth();
  addEventListener('load', setStick);
  addEventListener('resize', setStick);
  document.fonts?.ready.then(setStick);
  // A stuck card already looks in view to the browser, so header links scroll to where the card sits in the flow.
  for (const a of document.querySelectorAll('a[href^="#"]')) {
    const card = feats.find((c) => `#${c.id}` === a.getAttribute('href'));
    if (!card) continue;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({top: window.scrollY + flowTop(card) - stickTop(card), behavior: reduceMotion ? 'auto' : 'smooth'});
      history.replaceState(null, '', `#${card.id}`);
    });
  }
}

// Reveal each block once its top is in view. Checked on scroll, like the header links, so a block never
// waits on an observer; blocks already scrolled past show too, so a jump never leaves one hidden above.
const blocks = [...document.querySelectorAll('[data-rv]')];
if (blocks.length) {
  let queued = false;
  const reveal = () => {
    queued = false;
    const line = window.innerHeight * 0.88;
    for (const b of blocks) if (!b.classList.contains('in') && b.getBoundingClientRect().top < line) b.classList.add('in');
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(reveal); } };
  addEventListener('scroll', queue, {passive: true});
  addEventListener('resize', queue);
  reveal();
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
      // The next card slides over this one, so only the part above it counts as on screen.
      const card = v.closest('.feat'), next = card && feats[feats.indexOf(card) + 1];
      const top = Math.max(r.top, 0), bottom = Math.min(r.bottom, h, next ? next.getBoundingClientRect().top : Infinity);
      const seen = Math.max(0, bottom - top) / Math.max(1, r.height);
      const dist = Math.abs((top + bottom) / 2 - mid);
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
  addEventListener('scroll', queue, {passive: true});
  addEventListener('resize', queue);
  // A tab in the background stops its video; coming back starts the one on screen afresh.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (active) active.pause(); active = null; } else queue();
  });
  queue();
}

// The row of tiles in the last card drifts right to left on its own; drag it with the mouse, or swipe or scroll it
// sideways on a trackpad or phone, and it waits a moment after you let go before drifting on. The track holds
// the set three times: it starts on the middle copy and jumps by one set when it nears either end, so it never runs out.
const marquee = document.querySelector('.marquee');
if (marquee) {
  const track = marquee.querySelector('.marquee-track');
  const tiles = track.children, perSet = tiles.length / 3;
  const setWidth = () => tiles[perSet].offsetLeft - tiles[0].offsetLeft;
  let pos = 0, last = 0, holdUntil = 0, hovered = false, drag = null;
  const place = (x) => { pos = x; marquee.scrollLeft = x; };
  const wrap = () => {
    const w = setWidth();
    if (pos < w * 0.5) place(pos + w); else if (pos > w * 1.5) place(pos - w);
  };
  place(setWidth());
  addEventListener('load', () => place(setWidth()));
  const hold = (ms) => { holdUntil = performance.now() + ms; };
  const tick = (now) => {
    const dt = Math.min(64, now - (last || now));
    last = now;
    if (!drag && !hovered && now > holdUntil && !reduceMotion) { place(pos + dt * 0.03); wrap(); } // 30 px a second
    else if (!drag && now > holdUntil) wrap();
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  // A scroll we did not cause is the visitor's: follow it and pause the drift.
  marquee.addEventListener('scroll', () => {
    if (Math.abs(marquee.scrollLeft - pos) > 2) { pos = marquee.scrollLeft; hold(1500); }
  }, {passive: true});
  marquee.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovered = true; });
  marquee.addEventListener('pointerleave', () => { hovered = false; });
  marquee.addEventListener('touchstart', () => hold(1500), {passive: true});
  // Mouse drag (touch scrolls the row natively).
  marquee.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag = {x: e.clientX, from: pos, moved: false};
    marquee.setPointerCapture(e.pointerId);
    marquee.classList.add('dragging');
  });
  marquee.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 3) drag.moved = true;
    place(drag.from - dx);
  });
  const endDrag = () => { if (!drag) return; drag = null; marquee.classList.remove('dragging'); hold(1500); wrap(); };
  marquee.addEventListener('pointerup', endDrag);
  marquee.addEventListener('pointercancel', endDrag);
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
