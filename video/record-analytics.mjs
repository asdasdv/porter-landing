// Analytics: one take through the app's three views: Inventory → Fleet → History.
import {writeFileSync} from 'node:fs';
import {startCapture} from './lib/capture.mjs';
import {openDemo, director} from './lib/director.mjs';

const {browser, page} = await openDemo();
const d = director(page);
// Inventory is already open when the take starts: its big table takes a moment to draw.
await page.click('#inventory');
await page.waitForTimeout(2500);
await d.place(560, 250);
const stop = await startCapture(page, 'raw/analytics-frames');
await d.wait(400); d.mark('scene', {name: 'inventory'});
await d.moveTo(700, 330, 700);
await d.moveTo(700, 470, 900);
await d.wait(500);
await d.moveToEl('[data-robot-view="Fleet"]', {ms: 750});
await d.wait(120); await d.click(); d.mark('scene', {name: 'fleet'});
await d.wait(500);
await d.moveTo(1240, 300, 800);
await d.moveTo(1240, 440, 700);
await d.wait(900);
await d.moveToEl('#historyAll', {ms: 750});
await d.wait(120); await d.click(); d.mark('scene', {name: 'history'});
await d.wait(500);
await d.moveTo(700, 360, 700);
await d.moveTo(700, 500, 900);
await d.wait(1500);
const info = await stop('raw/analytics.mp4');
writeFileSync('raw/analytics.json', JSON.stringify({info, log: d.log}, null, 1));
await browser.close();
const f0 = info.firstFrame;
for (const e of d.log) if (e.type === 'down' || e.type === 'scene') console.log((e.t - f0).toFixed(2), e.type, e.name || '', Math.round(e.x), Math.round(e.y));
console.log('dur', info.seconds.toFixed(2), 'frames', info.frames);
