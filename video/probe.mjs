// Measures how long a robot takes to reach and deliver a user box: node probe.mjs receive|ship
import {openDemo} from './lib/director.mjs';
const kind = process.argv[2];
const {browser, page} = await openDemo();
await page.click(kind === 'ship' ? '#ship' : '#receive');
await page.waitForSelector('#productInput');
await page.fill('#productInput', 'WAGO 221');
await page.waitForSelector('#productSuggest [data-p]');
await page.click('#productSuggest [data-p]');
await page.waitForTimeout(300);
if (kind === 'ship') await page.click('#dialog [data-step="1"]');
await page.click('#submitBtn');
const t0 = Date.now();
let last = '', lastToast = '';
for (let i = 0; i < 600; i++) {
  const [s, toast] = await page.evaluate(() => [[...document.querySelectorAll('#tasksPanel .lc-task')].map(c => c.querySelector('small').textContent + ' | ' + c.querySelector('p').textContent).join(' || '), document.querySelector('#toast')?.textContent || '']);
  const t = ((Date.now() - t0) / 1000).toFixed(1);
  if (s !== last) { console.log(kind, t, s); last = s; }
  if (toast !== lastToast) { console.log(kind, t, 'TOAST', toast); lastToast = toast; }
  if (!s && i > 5) break;
  await page.waitForTimeout(500);
}
await browser.close();
