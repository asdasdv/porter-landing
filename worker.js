// Serves the static site, adding byte-range support for the videos.
// Safari (macOS and iOS) asks for videos in pieces (Range: bytes=…) and won't play
// them unless it gets a 206 Partial Content answer; static assets alone answer 200.
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const range = request.headers.get('Range');
    const type = response.headers.get('Content-Type') || '';
    if (!range || response.status !== 200 || !type.startsWith('video/')) return response;

    const body = await response.arrayBuffer();
    const size = body.byteLength;
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (!match) return response;
    let start, end;
    if (match[1] === '') { start = Math.max(0, size - Number(match[2])); end = size - 1; } // bytes=-500: the last 500
    else { start = Number(match[1]); end = match[2] === '' ? size - 1 : Math.min(Number(match[2]), size - 1); }
    if (start > end || start >= size) {
      return new Response(null, {status: 416, headers: {'Content-Range': `bytes */${size}`}});
    }
    const headers = new Headers(response.headers);
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(end - start + 1));
    headers.set('Accept-Ranges', 'bytes');
    return new Response(body.slice(start, end + 1), {status: 206, headers});
  },
};
