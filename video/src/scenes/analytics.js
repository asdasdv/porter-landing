// Times: seconds of the raw take (raw/analytics.json); positions: CSS px of the 1440x900 demo.
export default {
  video: 'analytics.mp4',
  log: 'analytics.json',
  first: 'analytics-first.png',
  segments: [
    {from: 0.1, to: 6.0, rate: 1.8},   // Inventory: products, boxes, where they sit
    {from: 6.0, to: 12.3, rate: 2},    // Fleet: every robot and its task over the live map
    {from: 12.3, to: 16.0, rate: 1.4}, // History: every box received, moved and shipped
  ],
  camera: [{t: 0, s: 1, x: 720, y: 450}, {t: 30, s: 1, x: 720, y: 450}],
  cursorUntil: 99,
  loopFade: 0.3,
};
