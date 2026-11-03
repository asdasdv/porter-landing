// Hero, frame by frame: one slow full turn around the warehouse, supersampled.
// The demo draws the 3D at 3x in a 1920x1200 window (5760x3600); each frame the page clock moves by 1/30 s,
// the camera turns by exactly 1/N of a turn, and the frame is grabbed and scaled down to 2880x1800 (lanczos).
// So the turn is perfectly even whatever each frame costs, and frame N would be frame 0 again: a seamless loop.
// Needs the patched local demo copy (see README): no camera damping, fixed resolution, full detail at any distance.
// `UI=1`: the app as it is (top bar, today's panel, zone and dock names) in its own 1440x900 window at 3x,
// turning about the canvas middle from the demo's home distance; patch the bundle with --same-size for it.
// usage: [UI=1] DEMO=http://localhost:8767/ node record-hero-frames.mjs [seconds=36] [frames=all]
import {spawn} from 'node:child_process';
import {openDemo} from './lib/director.mjs';

const FPS = 30, SECONDS = Number(process.argv[2] || 36), N = FPS * SECONDS;
const LIMIT = Number(process.argv[3] || N);
const UI = !!process.env.UI;
const OUT = `raw/hero${UI ? '-ui' : ''}${LIMIT < N ? '-test' : ''}.mp4`;
const {browser, page} = await openDemo({width: UI ? 1440 : 1920, height: UI ? 900 : 1200, scale: 3, virtualClock: true});
await page.addStyleTag({content: UI ? '.lc-tip, #toast { display: none !important }'
  : `.ph-topbar, #overview, aside, .lc-tip, #toast { display: none !important }
  #scene { inset: 0 !important; width: 100% !important; height: 100% !important }`});
// Moves with no button down would hover a zone or rack when the pointer comes back for the next drag.
await page.evaluate(() => { for (const t of ['pointermove', 'mousemove']) addEventListener(t, (e) => { if (!e.buttons) e.stopImmediatePropagation(); }, true); });
await page.waitForTimeout(8000);

// Framing (approved still «A»): closer than the demo's home view, zooming towards the warehouse middle,
// which is also the point the camera turns about.
const box = await page.evaluate(() => { const r = document.querySelector('canvas').getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height}; });
const [x0, y] = UI ? [Math.round(box.x + box.w / 2), Math.round(box.y + box.h / 2)] : [960, 650];
await page.mouse.move(x0, y);
const WHEEL = Number(process.env.WHEEL ?? (UI ? 0 : 3)); // wheel steps of 120 (camera damping is off, so each step is a full one)
for (let i = 0; i < WHEEL; i++) { await page.mouse.wheel(0, -120); await page.waitForTimeout(400); }
await page.waitForTimeout(2000);
const h = await page.evaluate(() => document.querySelector('canvas').clientHeight);
const ratio = await page.evaluate(() => { const c = document.querySelector('canvas'); return c.width / c.clientWidth; });

const cdp = await page.context().newCDPSession(page);
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-vf', 'scale=2880:1800:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '10', OUT], {stdio: ['pipe', 'inherit', 'inherit']});
const frame = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

await page.evaluate(() => window.__clock.start());
// A full turn is a drag as long as the canvas is tall; it goes in drags of up to STEP px, each pressed on the
// same point (the pivot stays put on screen), so the pointer never leaves the window.
const STEP = 380, per = h / N;
let dragged = 0, from = 0;
await page.mouse.down();
const t0 = Date.now();
for (let i = 0; i < LIMIT; i++) {
  if (i > 0) {
    await page.evaluate((ms) => window.__clock.advance(ms), 1000 / FPS);
    dragged += per;
    if (dragged - from > STEP) { await page.mouse.up(); from = dragged - per; await page.mouse.move(x0, y); await page.mouse.down(); }
    await page.mouse.move(x0 + dragged - from, y);
  }
  await frame();
  const {data} = await cdp.send('Page.captureScreenshot', {format: 'jpeg', quality: 95});
  if (!ff.stdin.write(Buffer.from(data, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
  if (i % 30 === 0) console.log(`${i}/${LIMIT} ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
await page.mouse.up();
ff.stdin.end();
await new Promise(r => ff.on('close', r));
console.log(JSON.stringify({out: OUT, frames: LIMIT, h, ratio, seconds: (Date.now() - t0) / 1000}));
await browser.close();
