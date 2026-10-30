// Opens the live demo the way the videos need it (2x sharp, GPU) and moves the
// mouse like a person: eased paths, short pauses. Every mouse event is logged with
// its wall-clock time so Remotion can draw the cursor and aim the camera.
import {chromium} from 'playwright';

export const DEMO = 'https://warehouse.kaifparty.workers.dev/';

export async function openDemo() {
  const browser = await chromium.launch({channel: 'chromium',
    args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal', '--force-device-scale-factor=2']});
  const context = await browser.newContext({viewport: {width: 1440, height: 900}});
  // The compositor renders at 2x; tell the page too, so the 3D canvas uses a 2x backing store.
  await context.addInitScript(() => Object.defineProperty(window, 'devicePixelRatio', {get: () => 2, configurable: true}));
  const page = await context.newPage();
  await page.goto(DEMO, {waitUntil: 'networkidle'});
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
