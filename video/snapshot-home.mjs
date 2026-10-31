// Hero image: the demo's home screen (the whole big warehouse) at 2x, taken from the screencast.
import {copyFileSync, readdirSync} from 'node:fs';
import {startCapture} from './lib/capture.mjs';
import {openDemo} from './lib/director.mjs';
const {browser, page} = await openDemo();
await page.mouse.move(1439, 899);
await page.waitForTimeout(1500);
const stop = await startCapture(page, 'raw/home-frames', {quality: 100});
await page.waitForTimeout(600);
await stop('raw/home-frames.mp4');
const last = readdirSync('raw/home-frames').filter(f => f.endsWith('.jpg')).sort().pop();
copyFileSync(`raw/home-frames/${last}`, 'raw/home.jpg');
await browser.close();
