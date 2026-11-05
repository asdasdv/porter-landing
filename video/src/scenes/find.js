// Times: seconds of the raw take (raw/find.json); positions: CSS px of the 1440x900 demo.
// zone 1.62 · rack 4.64 · shelf 7.66 · cell 10.48 · box 13.10 · search 16.65 · found 19.12
export default {
  video: 'find.mp4',
  log: 'find.json',
  first: 'find-first.png',
  segments: [
    {from: 1.0, to: 13.73, rate: 1.15},  // zone → rack → shelf → cell → box, the camera follows each step
    {from: 13.73, to: 16.14, rate: 1.8},  // box card, the cursor heads for search
    {from: 16.14, to: 20.6, rate: 1.15}, // type a box number, pick it, fly there
    {from: 20.6, to: 21.5, rate: 1},
  ],
  camera: [
    {t: 1.0, s: 1, x: 720, y: 450},
    {t: 16.74, s: 1, x: 720, y: 450},
    {t: 17.39, s: 1.5, x: 720, y: 240},
    {t: 19.2, s: 1.5, x: 720, y: 240},
    {t: 19.85, s: 1, x: 720, y: 450},
    {t: 21.5, s: 1, x: 720, y: 450},
  ],
  cursorUntil: 20.0,
  loopFade: 0.3,
};
