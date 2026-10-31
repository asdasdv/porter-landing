import {openDemo} from './lib/director.mjs';
const {browser, page} = await openDemo();
await page.click('#receive');
await page.waitForSelector('#productInput');
await page.fill('#productInput', 'WAGO 221');
await page.waitForSelector('#productSuggest [data-p]');
await page.click('#productSuggest [data-p]');
await page.waitForTimeout(300);
const qty = await page.locator('#submitBtn').textContent();
await page.click('#submitBtn');
const t0 = Date.now();
let last = '';
for (let i = 0; i < 240; i++) {
  const s = await page.evaluate(() => [...document.querySelectorAll('#tasksPanel .lc-task')].map(c => c.querySelector('small').textContent + ' | ' + c.querySelector('p').textContent).join(' || '));
  if (s !== last) { console.log(((Date.now() - t0) / 1000).toFixed(1), s); last = s; }
  if (!s && i > 5) break;
  await page.waitForTimeout(500);
}
console.log('btn', qty);
await browser.close();
