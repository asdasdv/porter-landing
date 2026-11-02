// Times: seconds of the raw take (raw/ship.json); positions: CSS px of the 1440x900 demo.
// Edited into shots (`cut: true` dissolves to the next one): the robot arrives and takes the box off
// the rack, drives across the warehouse, hands the box to the dispatch belt.
export default {
  video: 'ship.mp4',
  log: 'ship.json',
  first: 'ship-first.png',
  segments: [
    {from: 1.85, to: 10.9, rate: 1.1, caption: 'Pick a product and how many'},             // Ship → product → 2 boxes → Ship 2 boxes
    {from: 10.9, to: 14.1, rate: 1.4, caption: 'Robots get a task per box'},             // the robot tasks appear
    {from: 14.1, to: 16.1, rate: 1, caption: 'Robots get a task per box'},               // the app's camera flies to the box on its rack
    {from: 46.9, to: 52.9, rate: 1, cut: true, caption: 'The nearest robot takes the box'},    // a robot arrives and takes the box off the rack
    {from: 64.5, to: 67.5, rate: 1, cut: true, caption: 'Drives it to dispatch'},    // across the warehouse
    {from: 82.4, to: 89.4, rate: 1, cut: true, caption: 'Hands it to the dispatch belt'},    // the box goes onto the dispatch belt, «shipped»
  ],
  camera: [
    {t: 1.85, s: 1, x: 720, y: 450},
    {t: 2.45, s: 1, x: 720, y: 450},
    {t: 3.1, s: 1.42, x: 720, y: 430},
    {t: 10.6, s: 1.42, x: 720, y: 430},
    {t: 11.3, s: 1, x: 720, y: 450},
    {t: 46.9, s: 1, x: 720, y: 450},
    {t: 48.1, s: 1.35, x: 720, y: 470},
    {t: 52.9, s: 1.35, x: 720, y: 470},
    {t: 64.5, s: 1.35, x: 720, y: 460},
    {t: 82.4, s: 1.35, x: 680, y: 460},
    {t: 85.5, s: 1.35, x: 680, y: 460},
    {t: 86.4, s: 1, x: 720, y: 450},
    {t: 89.4, s: 1, x: 720, y: 450},
  ],
  cursorUntil: 14.7,
  loopFade: 0.3,
};
