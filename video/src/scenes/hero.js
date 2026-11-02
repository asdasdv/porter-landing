// Hero: one full slow turn of the camera around the warehouse (raw/hero.mp4, record-hero.mjs).
// Clean take: no app panels, the map fills the frame (the landing lays the headline over it).
// Shot at 1.5x in a 1920x1200 window with every box drawn (see README), so it is rendered full size: 2880x1800.
// The drag is steady from ~2 s; 40.05 s shows the same view as 4.0 s (best SSIM), so the loop has no seam.
export default {
  video: 'hero.mp4',
  log: 'hero.json',
  first: 'hero-first.png',
  segments: [{from: 4.0, to: 40.05, rate: 1}],
  camera: [{t: 4.0, s: 1, x: 720, y: 450}],
  cursorUntil: 0,
  loopFade: 0.4,
};
