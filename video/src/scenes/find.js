// Times: seconds of the raw take (raw/find.json); positions: CSS px of the 1440x900 demo.
export default {
  video: 'find.mp4',
  log: 'find.json',
  first: 'find-first.png',
  segments: [
    {from: 1.3, to: 5.6, rate: 1.15},  // open search, type the box number, pick the box
    {from: 5.6, to: 10.2, rate: 1},    // the camera flies to the box on its shelf, the card opens
  ],
  camera: [
    {t: 1.3, s: 1, x: 720, y: 450},
    {t: 2.65, s: 1, x: 720, y: 450},
    {t: 3.3, s: 1.5, x: 720, y: 240},
    {t: 5.5, s: 1.5, x: 720, y: 240},
    {t: 6.15, s: 1, x: 720, y: 450},
    {t: 10.2, s: 1, x: 720, y: 450},
  ],
  cursorUntil: 6.1,
  loopFade: 0.4,
};
