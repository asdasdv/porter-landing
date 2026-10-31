// Times: seconds of the raw take (raw/ship.json); positions: CSS px of the 1440x900 demo.
// The robot's drive to the rack and on to dispatch is fast-forwarded; picking the box and handing
// it to the dispatch belt play at real speed.
export default {
  video: 'ship.mp4',
  log: 'ship.json',
  first: 'ship-first.png',
  segments: [
    {from: 2.15, to: 11.2, rate: 1.1},    // Ship → product → 2 boxes → Ship 2 boxes
    {from: 11.2, to: 14.4, rate: 1.4},    // the robot tasks appear
    {from: 14.4, to: 16.4, rate: 1},      // the app's camera flies to the box on its rack
    {from: 16.4, to: 42.5, rate: 16},     // a robot drives over
    {from: 42.5, to: 48.5, rate: 1},      // it takes the box off the rack
    {from: 48.5, to: 86.5, rate: 14},     // across the warehouse to dispatch
    {from: 86.5, to: 93.5, rate: 1},      // the box goes onto the dispatch belt, «shipped»
  ],
  camera: [
    {t: 2.15, s: 1, x: 720, y: 450},
    {t: 2.75, s: 1, x: 720, y: 450},
    {t: 3.4, s: 1.42, x: 720, y: 430},
    {t: 10.9, s: 1.42, x: 720, y: 430},
    {t: 11.6, s: 1, x: 720, y: 450},
    {t: 42.5, s: 1, x: 720, y: 450},
    {t: 43.7, s: 1.35, x: 760, y: 470},
    {t: 48.5, s: 1.35, x: 760, y: 470},
    {t: 86.5, s: 1.35, x: 680, y: 460},
    {t: 89.6, s: 1.35, x: 680, y: 460},
    {t: 90.5, s: 1, x: 720, y: 450},
    {t: 93.5, s: 1, x: 720, y: 450},
  ],
  cursorUntil: 15.0,
  loopFade: 0.3,
};
