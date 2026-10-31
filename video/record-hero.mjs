// Hero: the home screen while the camera makes one slow full turn around the warehouse, so the video
// loops on the same view. The demo orbits about the floor point under the pointer, and a drag as long
// as the canvas is tall turns the camera 360° (OrbitControls: 2π · dx / clientHeight).
import {writeFileSync} from 'node:fs';
import {startCapture} from './lib/capture.mjs';
import {openDemo} from './lib/director.mjs';

const SECONDS = Number(process.argv[2] || 36); // one full turn
const {browser, page} = await openDemo();
const h = await page.evaluate(() => document.querySelector('canvas').clientHeight);
// Turn about the middle of the canvas: the home view puts the warehouse centre there. The pivot stays put
// on screen, so a full turn (h px) does not fit to the right of it: two half-turn drags, each pressed on
// the same point. Damping hands over the rest of each drag, so the turn does not hitch.
const box = await page.evaluate(() => { const r = document.querySelector('canvas').getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height}; });
const x0 = box.x + box.w / 2, y = box.y + box.h / 2;
await page.mouse.move(x0, y);
await page.waitForTimeout(1500);
const stop = await startCapture(page, 'raw/hero-frames');
await page.waitForTimeout(1000);
// A bit more than one turn at a steady speed, so the edit can take exactly one turn (SECONDS long) from
// the middle, where the camera neither speeds up nor slows down: the loop then has no seam.
const TURNS = 1.2, total = SECONDS * TURNS, stepPx = 380;
const t0 = Date.now();
let done = 0;
while (done < h * TURNS - 0.5) {
  await page.mouse.move(x0, y);
  await page.mouse.down();
  const from = done;
  for (;;) {
    const px = Math.min(h * TURNS, (Date.now() - t0) / (total * 1000) * h * TURNS);
    const step = Math.min(stepPx, px - from);
    await page.mouse.move(x0 + Math.max(0, step), y);
    if (step >= stepPx || px >= h * TURNS) { done = from + step; break; }
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
}
// Park the pointer on the empty top bar, so no hover card or tooltip shows up.
await page.mouse.move(260, 18);
const downAt = t0 / 1000;
await page.waitForTimeout(1500); // damping settles
await page.waitForTimeout(500);
const info = await stop('raw/hero.mp4');
writeFileSync('raw/hero.json', JSON.stringify({h, seconds: SECONDS, downAt, info}, null, 1));
console.log(JSON.stringify({h, info, startInTake: downAt - info.firstFrame}));
await browser.close();
