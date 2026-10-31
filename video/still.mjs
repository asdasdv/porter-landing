// Renders single frames to check a composition: node still.mjs Receive 11.25 13 ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [id, ...times] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.jsx')});
const composition = await selectComposition({serveUrl, id});
for (const t of times) {
  const output = `out/still-${id}-${t}.png`;
  await renderStill({composition, serveUrl, frame: Math.round(Number(t) * composition.fps), output, scale: 0.5});
  console.log(output);
}
