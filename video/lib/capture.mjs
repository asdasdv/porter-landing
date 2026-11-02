// Records a Playwright page through Chrome's screencast: sharp device-pixel JPEG
// frames with their real timestamps, then FFmpeg turns them into a constant-rate
// master video (H.264, near-lossless). Playwright's own recordVideo is 1x / 25 fps.
import {mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

export async function startCapture(page, dir, {width = 2880, height = 1800, quality = 95} = {}) {
  rmSync(dir, {recursive: true, force: true});
  mkdirSync(dir, {recursive: true});
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', async ({data, metadata, sessionId}) => {
    const file = path.join(dir, `f${String(frames.length).padStart(5, '0')}.jpg`);
    writeFileSync(file, Buffer.from(data, 'base64'));
    frames.push({file, t: metadata.timestamp});
    try { await cdp.send('Page.screencastFrameAck', {sessionId}); } catch {}
  });
  await cdp.send('Page.startScreencast', {format: 'jpeg', quality, maxWidth: width, maxHeight: height, everyNthFrame: 1});
  return async function stop(outFile, fps = 60) {
    const stoppedAt = Date.now() / 1000;
    await cdp.send('Page.stopScreencast');
    await new Promise(r => setTimeout(r, 300));
    if (frames.length < 2) throw new Error('No frames captured');
    // concat list: each frame lasts until the next one arrives
    const lines = ['ffconcat version 1.0'];
    for (let i = 0; i < frames.length; i++) {
      // Chrome sends a frame only when something changes, so the last one is held until the capture stopped.
      const dur = i < frames.length - 1 ? Math.max(0.001, frames[i + 1].t - frames[i].t) : Math.max(1 / fps, stoppedAt - frames[i].t);
      lines.push(`file '${path.basename(frames[i].file)}'`, `duration ${dur.toFixed(4)}`);
    }
    lines.push(`file '${path.basename(frames[frames.length - 1].file)}'`);
    writeFileSync(path.join(dir, 'list.txt'), lines.join('\n'));
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'list.txt'),
      '-vf', `fps=${fps},format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', outFile]);
    return {frames: frames.length, seconds: Math.max(frames[frames.length - 1].t, stoppedAt) - frames[0].t, firstFrame: frames[0].t};
  };
}
