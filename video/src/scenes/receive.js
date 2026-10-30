// Times: seconds of the raw take (raw/receive.json); positions: CSS px of the 1440x900 demo.
export default {
  video: 'receive.mp4',
  log: 'receive.json',
  first: 'receive-first.png',
  segments: [
    {from: 1.8, to: 9.95, rate: 1.35},  // Receive → find the product → Receive 2 boxes
    {from: 9.95, to: 13.0, rate: 2.2},  // toast and the robot tasks appear
    {from: 13.0, to: 15.6, rate: 1},    // the app's camera flies to the boxes at the dock
  ],
  camera: [
    {t: 1.8, s: 1, x: 720, y: 450},
    {t: 2.85, s: 1, x: 720, y: 450},
    {t: 3.5, s: 1.42, x: 720, y: 430},
    {t: 9.6, s: 1.42, x: 720, y: 430},
    {t: 10.25, s: 1, x: 720, y: 450},
    {t: 15.6, s: 1, x: 720, y: 450},
  ],
  cursorUntil: 13.7,
  loopFade: 0.4,
};
