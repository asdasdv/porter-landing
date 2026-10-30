// Find: search for a box, the camera flies to it on its shelf and its card opens.
import {writeFileSync} from 'node:fs';
import {startCapture} from './lib/capture.mjs';
import {openDemo, director} from './lib/director.mjs';

const {browser, page} = await openDemo();
const d = director(page);
await d.place(1050, 560);
const stop = await startCapture(page, 'raw/find-frames');
const t0 = Date.now() / 1000;
await d.wait(900);
await d.moveToEl('#phSearchButton', {ms: 700});
await d.wait(150); await d.click(); d.mark('scene', {name: 'search'});
await page.waitForSelector('#search:focus');
await d.wait(300);
await d.type('BX-1038', 85);
await page.waitForSelector('#results .ph-row[data-type="box"]');
await d.wait(500);
const row = await d.moveToEl('#results .ph-row[data-type="box"]', {ms: 500, dx: 0.3});
await d.wait(200); await d.click(); d.mark('scene', {name: 'box'});
await d.wait(600);
await d.moveTo(1290, 760, 900);
await d.wait(6500);
const info = await stop('raw/find.mp4');
const results = row;
writeFileSync('raw/find.json', JSON.stringify({start: t0, info, results, log: d.log}, null, 1));
console.log(JSON.stringify({info, results, events: d.log.length}));
await browser.close();
