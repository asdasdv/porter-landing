// Short clips for the cards in the landing's last block: one screen of the demo each, 4–7 s, with the cursor.
// Every take marks `a` (the clip starts) and `b` (it ends); scenes/tiles.js crops and zooms each one.
// usage: DEMO=http://localhost:8765/ node record-tiles.mjs today occupancy …   (no names: all of them)
import {writeFileSync, mkdirSync} from 'node:fs';
import {startCapture} from './lib/capture.mjs';
import {openDemo, director} from './lib/director.mjs';

// Map-only shots: no app panels, no hover outlines.
const MAP_ONLY = `.ph-topbar, #overview, aside, .lc-tip, #toast { display: none !important }
  #scene { inset: 0 !important; width: 100% !important; height: 100% !important }`;

const center = async (page, sel) => {
  const b = await page.locator(sel).first().boundingBox();
  if (!b) throw new Error(`No element for ${sel}`);
  return [b.x + b.width / 2, b.y + b.height / 2];
};

const TILES = {
  // Today: the home panel; the cursor runs down the fullest zones, each lights up on the map.
  async today(page, d) {
    await d.place(1100, 600);
    d.mark('a');
    await d.wait(600);
    for (const z of ['M', 'L', 'H', 'N']) {
      await d.moveToEl(`.lc-row[data-pick="zone"][data-id="${z}"]`, {ms: 500, dx: 0.3});
      await d.wait(700);
    }
    await d.moveTo(1240, 140, 700);
    await d.wait(900);
    d.mark('b');
  },
  // Occupancy: switch it on in the view menu; racks shade by how full they are.
  async occupancy(page, d) {
    await d.place(300, 300);
    d.mark('a');
    await d.moveToEl('[aria-label="View menu"]', {ms: 600});
    await d.wait(150); await d.click();
    await d.wait(500);
    await d.moveToEl('#viewMenu .vm-row >> nth=0', {ms: 450});
    await d.wait(200); await d.click();
    await d.wait(500);
    await d.moveToEl('#viewMenu .vm-row >> nth=1', {ms: 300});
    await d.wait(150); await d.click(); // zones off, so the shading reads
    await d.wait(400);
    await d.moveTo(700, 560, 700);
    await d.wait(2600);
    d.mark('b');
  },
  // Inventory: the page, sort by product, then search for one.
  async inventory(page, d) {
    await d.place(700, 300);
    d.mark('a');
    await d.moveToEl('#inventory', {ms: 600});
    await d.wait(150); await d.click();
    await d.wait(900);
    await d.moveToEl('#inventoryPage th[data-sort="product"]', {ms: 600, dx: 0.2});
    await d.wait(150); await d.click();
    await d.wait(1000);
    await d.moveToEl('#invSearch', {ms: 500, dx: 0.3});
    await d.wait(120); await d.click();
    await d.type('relay', 90);
    await d.wait(1600);
    d.mark('b');
  },
  // Fleet: the robots and their tasks; pick one and the camera follows it.
  async fleet(page, d) {
    await d.place(700, 300);
    d.mark('a');
    await d.moveToEl('[aria-label="Fleet"]', {ms: 600});
    await d.wait(150); await d.click();
    await d.wait(1100);
    await d.moveToEl('#robotPanel .lc-robot >> nth=2', {ms: 600, dx: 0.4});
    await d.wait(150); await d.click();
    await d.wait(500);
    await d.moveTo(600, 600, 700);
    await d.wait(2600);
    d.mark('b');
  },
  // History: every event; filter to shipped, then to moved.
  async history(page, d) {
    await d.place(700, 300);
    d.mark('a');
    await d.moveToEl('#historyAll', {ms: 600});
    await d.wait(150); await d.click();
    await d.wait(1000);
    await d.moveToEl('#historyPage button[data-filter="Shipped"]', {ms: 600});
    await d.wait(150); await d.click();
    await d.wait(1200);
    await d.moveToEl('#historyPage button[data-filter="Moved"]', {ms: 450});
    await d.wait(150); await d.click();
    await d.wait(1500);
    d.mark('b');
  },
  // Move: from a box card pick Move and take the recommended cell; a robot gets the task.
  async move(page, d) {
    await page.click('#phSearchButton'); await page.keyboard.type('BX-1038');
    await page.waitForSelector('#results .ph-row[data-type="box"]');
    await page.click('#results .ph-row[data-type="box"]');
    await page.waitForTimeout(2500);
    await d.place(900, 500);
    d.mark('a');
    await d.wait(400);
    await d.moveToEl('#moveBox', {ms: 700});
    await d.wait(150); await d.click();
    await d.wait(900);
    await d.moveToEl('#dialog button.lc-option', {ms: 600, dx: 0.4});
    await d.wait(250); await d.click();
    await d.wait(800);
    await d.moveTo(700, 500, 600);
    await d.wait(2200);
    d.mark('b');
  },
  // Layout editor: open it, draw a zone, line it with a row of racks.
  async editor(page, d) {
    await d.place(300, 300);
    await d.moveToEl('[aria-label="View menu"]', {ms: 300});
    await d.click(); await d.wait(400);
    await d.moveToEl('text=Edit warehouse layout', {ms: 300});
    await d.click();
    await page.waitForSelector('.ed-ib[data-tool="zone"]');
    await d.wait(1500);
    d.mark('a');
    await d.wait(400);
    await d.moveToEl('.ed-ib[data-tool="zone"]', {ms: 600});
    await d.wait(150); await d.click();
    await d.wait(300);
    await d.moveTo(1170, 420, 700);
    await d.wait(150);
    d.mark('down'); await page.mouse.down();
    await d.moveTo(1390, 820, 1100);
    await page.mouse.up(); d.mark('up');
    await d.wait(700);
    await d.moveToEl('.ed-ib[data-tool="row"]', {ms: 700});
    await d.wait(150); await d.click();
    await d.wait(300);
    await d.moveTo(1200, 470, 700);
    await d.wait(150);
    d.mark('down'); await page.mouse.down();
    await d.moveTo(1360, 470, 800);
    await page.mouse.up(); d.mark('up');
    await d.wait(1600);
    d.mark('b');
  },
  // Map layers: in the view menu turn robots, lanes and dock names off, then zones off and back on.
  async layers(page, d) {
    await d.place(300, 300);
    d.mark('a');
    await d.moveToEl('[aria-label="View menu"]', {ms: 600});
    await d.wait(150); await d.click();
    await d.wait(500);
    for (const n of [2, 3, 4, 1, 1]) {
      await d.moveToEl(`#viewMenu .vm-row >> nth=${n}`, {ms: 400});
      await d.wait(150); await d.click();
      await d.wait(700);
    }
    await d.wait(800);
    d.mark('b');
  },
  // Docks: search for a dispatch dock and pick it; the camera flies there.
  async docks(page, d) {
    await d.place(700, 400);
    d.mark('a');
    await d.moveToEl('#phSearchButton', {ms: 600});
    await d.wait(150); await d.click();
    await d.wait(400);
    await d.type('Dispatch 3', 90);
    await page.waitForSelector('#results .ph-row[data-type="dock"]');
    await d.wait(500);
    await d.moveToEl('#results .ph-row[data-type="dock"]', {ms: 500, dx: 0.3});
    await d.wait(150); await d.click();
    await d.wait(3000);
    d.mark('b');
  },
  // Big deliveries: 48 boxes don't fit one cell; the form spreads them from a starting cell.
  async big(page, d) {
    await page.click('#receive'); await page.waitForSelector('#productInput');
    await page.fill('#productInput', 'WAGO 2002'); await page.waitForSelector('#productSuggest [data-p]');
    await page.click('#productSuggest [data-p]'); await page.waitForTimeout(900);
    await d.place(700, 450);
    d.mark('a');
    await d.wait(300);
    await d.moveToEl('#dialog input >> nth=1', {ms: 600});
    await d.wait(120); await d.click(); await d.click();
    await page.keyboard.press('Meta+A');
    await d.type('48', 160);
    await page.keyboard.press('Tab');
    await d.wait(1200);
    await d.moveToEl('#submitBtn', {ms: 600});
    await d.wait(250); await d.click();
    await d.wait(1800);
    d.mark('b');
  },
  // New product: nothing matches, so add it right from the Receive form.
  async product(page, d) {
    await page.click('#receive'); await page.waitForSelector('#productInput');
    await d.place(700, 450);
    d.mark('a');
    await d.moveToEl('#productInput', {ms: 600, dx: 0.3});
    await d.wait(120); await d.click();
    await d.type('Omron H3Y timer', 70);
    await page.waitForSelector('#createNew');
    await d.wait(500);
    await d.moveToEl('#createNew', {ms: 500});
    await d.wait(200); await d.click();
    await d.wait(2200);
    d.mark('b');
  },
  // Parking, map only: the app's own camera flies to a dock found in search, then the panels are hidden.
  async parking(page, d) { await dockShot(page, d, 'Dispatch 5'); },
};

// Map-only shots: hide the panels (the canvas takes the whole window) and stop hover outlines.
async function mapOnly(page, settle) {
  await page.addStyleTag({content: MAP_ONLY});
  await page.evaluate(() => { for (const t of ['pointermove', 'mousemove']) addEventListener(t, (e) => { if (!e.buttons) e.stopImmediatePropagation(); }, true); });
  await page.mouse.move(5, 5);
  await page.waitForTimeout(settle);
}
async function dockShot(page, d, dock) {
  await page.click('#phSearchButton'); await page.fill('#search', dock);
  await page.waitForSelector('#results .ph-row[data-type="dock"]');
  await page.click('#results .ph-row[data-type="dock"]');
  await page.waitForTimeout(2500);
  await mapOnly(page, 1500);
  d.mark('a'); await d.wait(7000); d.mark('b');
}

const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(TILES);
mkdirSync('raw/tiles', {recursive: true});
for (const name of names) {
  if (!TILES[name]) throw new Error(`No tile ${name}`);
  const {browser, page} = await openDemo();
  const d = director(page);
  const stop = await startCapture(page, `raw/tiles/${name}-frames`);
  await d.wait(500);
  try { await TILES[name](page, d); }
  catch (e) { console.log(name, 'FAILED', e.message.split('\n')[0]); }
  const info = await stop(`raw/tiles/${name}.mp4`);
  const marks = Object.fromEntries(d.log.filter(e => e.type === 'a' || e.type === 'b').map(e => [e.type, +(e.t - info.firstFrame).toFixed(2)]));
  writeFileSync(`raw/tiles/${name}.json`, JSON.stringify({info, marks, log: d.log}, null, 1));
  console.log(name, JSON.stringify(marks), info.seconds.toFixed(1) + ' s');
  await browser.close();
}
