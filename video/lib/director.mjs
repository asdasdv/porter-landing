// Opens the live demo the way the videos need it (2x sharp, GPU) and moves the
// mouse like a person: eased paths, short pauses. Every mouse event is logged with
// its wall-clock time so Remotion can draw the cursor and aim the camera.
import {chromium} from 'playwright';

// DEMO=http://localhost:8765/ records a local build (e.g. a branch) instead of the live demo.
export const DEMO = process.env.DEMO || 'https://warehouse.kaifparty.workers.dev/';

// `width`/`height`/`scale`: CSS viewport and device pixel ratio (frames come out width·scale px wide).
// `steadyClock`: hand the page's requestAnimationFrame an even 60 fps clock. The demo lowers its 3D resolution
// (1.5x → 1x) when frames run slow, and the screencast makes them slow, so without it the map comes out soft.
// `virtualClock`: the page's time (performance.now and requestAnimationFrame) stands still until
// `window.__clock.advance(ms)` moves it — for frame-by-frame takes, where each frame may take long to draw.
// `canvasScale` (default: the page scale) lets the 3D draw finer than the screen and be scaled down, which smooths thin
// steel at a distance. The demo's bundle must allow it (patch-demo-bundle.py lifts its 1.5× cap to 3×).
export async function openDemo({width = 1440, height = 900, scale = 2, canvasScale = Number(process.env.CANVAS_SCALE) || scale, steadyClock = false, virtualClock = false} = {}) {
  const browser = await chromium.launch({channel: 'chromium',
    args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal', `--force-device-scale-factor=${scale}`]});
  const context = await browser.newContext({viewport: {width, height}});
  // The compositor renders at `scale`; tell the page too, so the 3D canvas gets a matching backing store.
  await context.addInitScript((scale) => Object.defineProperty(window, 'devicePixelRatio', {get: () => scale, configurable: true}), canvasScale);
  if (steadyClock) await context.addInitScript(() => {
    const raf = window.requestAnimationFrame.bind(window);
    let real = -1, t = 0;
    window.requestAnimationFrame = (cb) => raf((now) => { if (now !== real) { real = now; t += 1000 / 60; } cb(t); });
  });
  if (virtualClock) await context.addInitScript(() => {
    const realNow = performance.now.bind(performance), raf = window.requestAnimationFrame.bind(window);
    // Each read creeps forward a hair, so loops that spend a time budget still end.
    let virt = null, drift = 0;
    window.__clock = {start() { virt = realNow(); drift = 0; }, advance(ms) { virt += ms; drift = 0; }};
    performance.now = () => virt === null ? realNow() : virt + (drift += 1e-3);
    window.requestAnimationFrame = (cb) => raf((now) => cb(virt === null ? now : virt + drift));
  });
  const page = await context.newPage();
  await page.goto(DEMO, {waitUntil: 'networkidle'});
  // The demo shows a loading screen until its 3D models are in and the shaders compiled.
  await page.waitForFunction(() => !document.getElementById('boot'), null, {timeout: 20000}).catch(() => {});
  await page.waitForTimeout(4000);
  return {browser, page};
}

const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

export function director(page) {
  const log = [];
  let x = 1100, y = 600;
  const now = () => Date.now() / 1000;
  const mark = (type, extra = {}) => log.push({t: now(), type, x, y, ...extra});
  const wait = ms => page.waitForTimeout(ms);
  return {
    log, wait, mark,
    async place(px, py) { x = px; y = py; await page.mouse.move(x, y); mark('move'); },
    async moveTo(tx, ty, ms = 650) {
      const sx = x, sy = y, steps = Math.max(8, Math.round(ms / 16));
      // a slight arc reads more like a hand than a ruler
      const bend = Math.min(60, Math.hypot(tx - sx, ty - sy) * 0.08);
      for (let i = 1; i <= steps; i++) {
        const p = easeInOut(i / steps);
        x = sx + (tx - sx) * p; y = sy + (ty - sy) * p - Math.sin(Math.PI * p) * bend;
        await page.mouse.move(x, y);
        mark('move');
        await wait(16);
      }
    },
    async moveToEl(selector, {ms, dx = 0.5, dy = 0.5} = {}) {
      const box = await page.locator(selector).first().boundingBox();
      if (!box) throw new Error(`No element for ${selector}`);
      await this.moveTo(box.x + box.width * dx, box.y + box.height * dy, ms);
      return box;
    },
    async click() {
      mark('down'); await page.mouse.down(); await wait(90);
      await page.mouse.up(); mark('up');
    },
    async type(text, delay = 70) {
      for (const ch of text) { await page.keyboard.type(ch); mark('key', {ch}); await wait(delay); }
    },
  };
}

// Waits until the followed box's task card is gone (the box is on its shelf or at dispatch), logging each
// status change with its wall-clock time so the edit can slow down where the robot does something.
export async function watchBox(page, d, id, {limit = 240000, tail = 3500} = {}) {
  const t0 = Date.now();
  let last = null;
  while (Date.now() - t0 < limit) {
    const s = await page.evaluate(id => {
      const c = document.querySelector(`#tasksPanel [data-box="${id}"]`);
      return c ? c.querySelector('small').textContent + ' | ' + c.querySelector('p').textContent : null;
    }, id);
    if (s !== last) { d.mark('status', {s}); console.log(((Date.now() - t0) / 1000).toFixed(1), s); last = s; }
    if (s === null) break;
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(tail);
}
