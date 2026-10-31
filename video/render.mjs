// Renders a composition to a high-quality master, then the small web files for the landing.
// usage: node render.mjs Receive receive 18.6
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

// The third argument picks the poster frame (seconds): a moment that tells the step, not the first frame.
const [id = 'Receive', name = 'receive', posterAt = '0'] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.jsx')});
const composition = await selectComposition({serveUrl, id});
const master = `out/${name}-master.mp4`;
await renderMedia({composition, serveUrl, codec: 'h264', crf: 14, outputLocation: master, concurrency: 6,
  onProgress: ({progress}) => process.stdout.write(`\r${id}: ${Math.round(progress * 100)}%`)});
console.log();
// Web: 1600 px wide is sharp in the ~830 px card on a retina screen; no audio track.
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', master, '-vf', 'scale=1600:-2:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow',
  '-crf', '25', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', `out/${name}.mp4`]);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', posterAt, '-i', master, '-frames:v', '1', '-vf', 'scale=1600:-2', '-q:v', '3', `out/${name}-poster.jpg`]);
console.log('done', name);
