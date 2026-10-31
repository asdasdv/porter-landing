// Times: seconds of the raw take (raw/find.json); positions: CSS px of the 1440x900 demo.
// zone 1.65 · rack 4.25 · shelf 6.91 · cell 9.43 · box 11.74 · search 15.14 · found 17.63
export default {
  video: 'find.mp4',
  log: 'find.json',
  first: 'find-first.png',
  segments: [
    {from: 1.0, to: 12.4, rate: 1.15, caption: 'Zone → rack → shelf → box'},  // zone → rack → shelf → cell → box, the camera follows each step
    {from: 12.4, to: 14.6, rate: 1.8, caption: 'Zone → rack → shelf → box'},  // box card, the cursor heads for search
    {from: 14.6, to: 19.0, rate: 1.15, caption: 'Or find it by its number'}, // type a box number, pick it, fly there
    {from: 19.0, to: 19.9, rate: 1, caption: 'Or find it by its number'},
  ],
  camera: [
    {t: 1.0, s: 1, x: 720, y: 450},
    {t: 15.2, s: 1, x: 720, y: 450},
    {t: 15.85, s: 1.5, x: 720, y: 240},
    {t: 17.6, s: 1.5, x: 720, y: 240},
    {t: 18.25, s: 1, x: 720, y: 450},
    {t: 19.9, s: 1, x: 720, y: 450},
  ],
  cursorUntil: 18.4,
  loopFade: 0.3,
};
