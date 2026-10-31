import {AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, Easing, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender} from 'remotion';
import {useEffect, useState} from 'react';

const ease = Easing.bezier(0.22, 1, 0.36, 1);
const K = 1920 / 1440; // CSS px of the demo → composition px

export function clipLength(scene, fps) {
  return Math.round(scene.segments.reduce((n, s) => n + (s.to - s.from) / s.rate, 0) * fps);
}

// output time → raw-take time
function sourceTime(scene, t) {
  let acc = 0;
  for (const s of scene.segments) {
    const len = (s.to - s.from) / s.rate;
    if (t <= acc + len) return s.from + (t - acc) * s.rate;
    acc += len;
  }
  const last = scene.segments[scene.segments.length - 1];
  return last.to;
}

// The fast-forward segment under output time t, with how far into it we are (for the badge fade).
function fastAt(scene, t) {
  // Neighbouring fast segments form one run, so the badge stays up across them instead of blinking.
  let acc = 0, runStart = null, hit = null;
  const segs = scene.segments.map(s => { const len = (s.to - s.from) / s.rate, out = {s, a: acc, b: acc + len}; acc += len; return out; });
  for (let i = 0; i < segs.length; i++) {
    const {s, a, b} = segs[i];
    if (s.rate < 3) { runStart = null; continue; }
    if (runStart === null) runStart = a;
    if (t >= a && t < b) {
      let end = b;
      for (let j = i + 1; j < segs.length && segs[j].s.rate >= 3; j++) end = segs[j].b;
      hit = {rate: s.rate, into: t - runStart, left: end - t};
      break;
    }
  }
  return hit;
}

const FastIcon = () => (
  <svg width="22" height="16" viewBox="0 0 22 16"><path d="M1 1.5 L10 8 L1 14.5 Z M11 1.5 L20 8 L11 14.5 Z" fill="#fff" /></svg>
);

function cameraAt(keys, t) {
  if (t <= keys[0].t) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t <= b.t) {
      const p = ease((t - a.t) / (b.t - a.t));
      return {s: a.s + (b.s - a.s) * p, x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p};
    }
  }
  return keys[keys.length - 1];
}

function cursorAt(moves, t) {
  let lo = 0, hi = moves.length - 1;
  if (t <= moves[0].t) return moves[0];
  if (t >= moves[hi].t) return moves[hi];
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (moves[m].t <= t) lo = m; else hi = m; }
  const a = moves[lo], b = moves[hi], p = (t - a.t) / Math.max(1e-6, b.t - a.t);
  return {x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p};
}

const Arrow = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" style={{overflow: 'visible', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.35))'}}>
    <path d="M3 2 L3 20 L8 15.5 L11.5 23 L14.5 21.6 L11.1 14.3 L17.5 14.3 Z" fill="#000" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

export const Clip = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames, width, height} = useVideoConfig();
  const [data, setData] = useState(null);
  const [handle] = useState(() => delayRender('log'));
  useEffect(() => {
    fetch(staticFile(scene.log)).then(r => r.json()).then(d => { setData(d); continueRender(handle); });
  }, []);

  const t = frame / fps;
  const src = sourceTime(scene, t);
  const cam = cameraAt(scene.camera, src);
  const fast = fastAt(scene, t);
  const tx = width / 2 - cam.x * K * cam.s, ty = height / 2 - cam.y * K * cam.s;
  // keep the frame filled: never pan past the edges
  const clampX = Math.min(0, Math.max(width - width * cam.s, tx));
  const clampY = Math.min(0, Math.max(height - height * cam.s, ty));

  let cursor = null, press = 0;
  if (data && src < scene.cursorUntil) {
    const f0 = data.info.firstFrame;
    const moves = data.log.filter(e => e.type === 'move' || e.type === 'down' || e.type === 'up').map(e => ({...e, t: e.t - f0}));
    const p = cursorAt(moves, src);
    for (const e of moves) if (e.type === 'down') { const dt = src - e.t; if (dt >= -0.05 && dt < 0.45) press = Math.max(press, 1 - Math.abs(dt) / 0.45); }
    const fadeOut = interpolate(src, [scene.cursorUntil - 0.3, scene.cursorUntil], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    cursor = {...p, press, opacity: fadeOut};
  }

  let acc = 0;
  const pieces = scene.segments.map((s, i) => {
    const len = Math.round((s.to - s.from) / s.rate * fps);
    const el = (
      <Sequence key={i} from={acc} durationInFrames={len}>
        <OffthreadVideo src={staticFile(scene.video)} trimBefore={Math.round(s.from * fps)} playbackRate={s.rate} muted
          style={{width, height}} />
      </Sequence>
    );
    acc += len;
    return el;
  });

  const loopOpacity = interpolate(frame, [durationInFrames - scene.loopFade * fps, durationInFrames - 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{backgroundColor: '#fff', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width, height, transformOrigin: '0 0',
        transform: `translate(${clampX}px, ${clampY}px) scale(${cam.s})`}}>
        {pieces}
        {cursor && (
          <div style={{position: 'absolute', left: cursor.x * K - 4, top: cursor.y * K - 3, opacity: cursor.opacity,
            transform: `scale(${(1 - cursor.press * 0.18) * 1.15})`, transformOrigin: '4px 3px'}}>
            {cursor.press > 0 && (
              <div style={{position: 'absolute', left: -14, top: -15, width: 36, height: 36, borderRadius: 18,
                background: 'rgba(76,168,248,.35)', transform: `scale(${0.6 + (1 - cursor.press) * 0.9})`, opacity: cursor.press}} />
            )}
            <Arrow />
          </div>
        )}
      </div>
      {fast && (
        <div style={{position: 'absolute', left: 36, bottom: 36, display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 20px 12px 18px', borderRadius: 999, background: 'rgba(17,17,17,.62)', color: '#fff',
          font: '600 26px/1 Inter, -apple-system, system-ui, sans-serif', letterSpacing: '-.01em',
          opacity: Math.min(1, fast.into / 0.15, fast.left / 0.15)}}>
          <FastIcon />{Math.round(fast.rate)}×
        </div>
      )}
      <Img src={staticFile(scene.first)} style={{position: 'absolute', inset: 0, width, height, opacity: loopOpacity}} />
    </AbsoluteFill>
  );
};
