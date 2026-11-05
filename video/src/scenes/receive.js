// Times: seconds of the raw take (raw/receive.json); positions: CSS px of the 1440x900 demo.
// The robot takes ~90 s to reach a user's box (it queues behind background boxes on the belt), so the
// take is edited into shots (`cut: true` dissolves to the next one): the robot arrives and takes the box,
// drives it across the warehouse, puts it onto its shelf.
export default {
  video: 'receive.mp4',
  log: 'receive.json',
  first: 'receive-first.png',
  segments: [
    {from: 2.05, to: 9.65, rate: 1.1},             // Receive → find the product → Receive 2 boxes
    {from: 9.65, to: 12.7, rate: 1.3},             // toast and the robot tasks appear
    {from: 12.7, to: 14.5, rate: 1},               // the app's camera flies to the box on its way to the dock
    {from: 135.62, to: 140.12, rate: 1.5, cut: true}, // a robot drives up to the belt
    {from: 140.12, to: 146.22, rate: 1},             // it takes the box and drives off
    {from: 173.62, to: 176.62, rate: 1, cut: true},  // across the warehouse
    {from: 195.22, to: 202.22, rate: 1, cut: true},  // the box goes onto its shelf, «put away»
  ],
  camera: [
    {t: 2.05, s: 1, x: 720, y: 450},
    {t: 2.55, s: 1, x: 720, y: 450},
    {t: 3.2, s: 1.42, x: 720, y: 430},
    {t: 9.3, s: 1.42, x: 720, y: 430},
    {t: 9.95, s: 1, x: 720, y: 450},
    {t: 135.62, s: 1, x: 720, y: 450},
    {t: 137.62, s: 1.35, x: 720, y: 450},
    {t: 197.52, s: 1.35, x: 720, y: 450},
    {t: 198.52, s: 1, x: 720, y: 450},
    {t: 202.22, s: 1, x: 720, y: 450},
  ],
  cursorUntil: 13.4,
  loopFade: 0.3,
};
