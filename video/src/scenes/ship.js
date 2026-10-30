// Times: seconds of the raw take (raw/ship.json); positions: CSS px of the 1440x900 demo.
export default {
  video: 'ship.mp4',
  log: 'ship.json',
  first: 'ship-first.png',
  segments: [
    {from: 1.4, to: 11.2, rate: 1.55},  // Ship → product → 2 boxes → Ship 2 boxes
    {from: 11.2, to: 14.4, rate: 2.2},  // the robot tasks appear
    {from: 14.4, to: 16.7, rate: 1},    // the camera follows a box while robots drive up
  ],
  camera: [
    {t: 1.4, s: 1, x: 720, y: 450},
    {t: 2.75, s: 1, x: 720, y: 450},
    {t: 3.4, s: 1.42, x: 720, y: 430},
    {t: 10.9, s: 1.42, x: 720, y: 430},
    {t: 11.6, s: 1, x: 720, y: 450},
    {t: 16.7, s: 1, x: 720, y: 450},
  ],
  cursorUntil: 15.0,
  loopFade: 0.4,
};
