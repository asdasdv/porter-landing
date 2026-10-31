// Times: seconds of the raw take (raw/receive.json); positions: CSS px of the 1440x900 demo.
// The robot takes ~100 s to reach a user's box (it queues behind background boxes on the belt), so the
// take is edited into shots (`cut: true` dissolves to the next one): the robot arrives and takes the box,
// drives it across the warehouse, puts it onto its shelf.
export default {
  video: 'receive.mp4',
  log: 'receive.json',
  first: 'receive-first.png',
  segments: [
    {from: 2.35, to: 9.95, rate: 1.1, caption: 'Pick the product and the cell'},             // Receive → find the product → Receive 2 boxes
    {from: 9.95, to: 13.0, rate: 1.3, caption: 'Each box becomes a robot task'},             // toast and the robot tasks appear
    {from: 13.0, to: 14.8, rate: 1, caption: 'Each box becomes a robot task'},               // the app's camera flies to the box on its way to the dock
    {from: 109.0, to: 113.5, rate: 1.5, cut: true, caption: 'A free robot picks it up at the dock'}, // a robot drives up to the belt
    {from: 113.5, to: 119.6, rate: 1, caption: 'A free robot picks it up at the dock'},             // it takes the box and drives off
    {from: 147.0, to: 150.0, rate: 1, cut: true, caption: 'Carries it across the warehouse'},  // across the warehouse
    {from: 168.6, to: 175.6, rate: 1, cut: true, caption: 'Puts it on its shelf'},  // the box goes onto its shelf, «put away»
  ],
  camera: [
    {t: 2.35, s: 1, x: 720, y: 450},
    {t: 2.85, s: 1, x: 720, y: 450},
    {t: 3.5, s: 1.42, x: 720, y: 430},
    {t: 9.6, s: 1.42, x: 720, y: 430},
    {t: 10.25, s: 1, x: 720, y: 450},
    {t: 109.0, s: 1, x: 720, y: 450},
    {t: 111.0, s: 1.35, x: 720, y: 450},
    {t: 170.9, s: 1.35, x: 720, y: 450},
    {t: 171.9, s: 1, x: 720, y: 450},
    {t: 175.6, s: 1, x: 720, y: 450},
  ],
  cursorUntil: 13.7,
  loopFade: 0.3,
};
