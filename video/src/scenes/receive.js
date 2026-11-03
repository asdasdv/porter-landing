// Times: seconds of the raw take (raw/receive.json); positions: CSS px of the 1440x900 demo.
// The robot takes ~90 s to reach a user's box (it queues behind background boxes on the belt), so the
// take is edited into shots (`cut: true` dissolves to the next one): the robot arrives and takes the box,
// drives it across the warehouse, puts it onto its shelf.
export default {
  video: 'receive.mp4',
  log: 'receive.json',
  first: 'receive-first.png',
  segments: [
    {from: 2.25, to: 9.85, rate: 1.1, caption: 'Pick the product and the cell'},             // Receive → find the product → Receive 2 boxes
    {from: 9.85, to: 12.9, rate: 1.3, caption: 'The app sends a robot for the boxes'},             // toast and the robot tasks appear
    {from: 12.9, to: 14.7, rate: 1, caption: 'The app sends a robot for the boxes'},               // the app's camera flies to the box on its way to the dock
    {from: 107.97, to: 112.47, rate: 1.5, cut: true, caption: 'A free robot picks it up at the dock'}, // a robot drives up to the belt
    {from: 112.47, to: 118.57, rate: 1, caption: 'A free robot picks it up at the dock'},             // it takes the box and drives off
    {from: 145.97, to: 148.97, rate: 1, cut: true, caption: 'Carries it across the warehouse'},  // across the warehouse
    {from: 167.57, to: 174.57, rate: 1, cut: true, caption: 'Puts it on its shelf'},  // the box goes onto its shelf, «put away»
  ],
  camera: [
    {t: 2.25, s: 1, x: 720, y: 450},
    {t: 2.75, s: 1, x: 720, y: 450},
    {t: 3.4, s: 1.42, x: 720, y: 430},
    {t: 9.5, s: 1.42, x: 720, y: 430},
    {t: 10.15, s: 1, x: 720, y: 450},
    {t: 107.97, s: 1, x: 720, y: 450},
    {t: 109.97, s: 1.35, x: 720, y: 450},
    {t: 169.87, s: 1.35, x: 720, y: 450},
    {t: 170.87, s: 1, x: 720, y: 450},
    {t: 174.57, s: 1, x: 720, y: 450},
  ],
  cursorUntil: 13.6,
  loopFade: 0.3,
};
