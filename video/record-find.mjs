// Find: zone → rack → shelf → cell → box through the right panel (the camera follows),
// then the other way: type a box number in search.
import {writeFileSync} from 'node:fs';
import {startCapture} from './lib/capture.mjs';
import {openDemo, director} from './lib/director.mjs';

const {browser, page} = await openDemo();
const d = director(page);
await d.place(980, 420);
const stop = await startCapture(page, 'raw/find-frames');
const row = (type, n = 0) => `.lc-row[data-pick="${type}"] >> nth=${n}`;
await d.wait(300);
for (const [type, n, name, hold] of [['zone', 0, 'zone', 1300], ['rack', 0, 'rack', 1300], ['shelf', 2, 'shelf', 1200], ['location', 0, 'cell', 1000], ['box', 0, 'box', 1700]]) {
  await d.moveToEl(row(type, n), {ms: 550, dx: 0.3});
  await d.wait(120); await d.click(); d.mark('scene', {name});
  await d.wait(hold);
}
await d.moveToEl('#phSearchButton', {ms: 700});
await d.wait(120); await d.click(); d.mark('scene', {name: 'search'});
await page.waitForSelector('#search:focus');
await d.wait(250);
await d.type('BX-1038', 80);
await page.waitForSelector('#results .ph-row[data-type="box"]');
await d.wait(450);
await d.moveToEl('#results .ph-row[data-type="box"]', {ms: 450, dx: 0.3});
await d.wait(150); await d.click(); d.mark('scene', {name: 'found'});
await d.wait(500);
await d.moveTo(1290, 760, 800);
await d.wait(2600);
const info = await stop('raw/find.mp4');
writeFileSync('raw/find.json', JSON.stringify({info, log: d.log}, null, 1));
await browser.close();
const f0 = info.firstFrame;
for (const e of d.log) if (e.type === 'scene') console.log((e.t - f0).toFixed(2), e.name, Math.round(e.x), Math.round(e.y));
console.log('dur', info.seconds.toFixed(2), 'frames', info.frames);
