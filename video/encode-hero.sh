#!/bin/sh
# Web files for the hero (the app over the wallpaper) from raw/hero-ui.mp4, one encode at a time.
# The video sits in a ~1100 px box, so 2400 px wide is sharp on a retina screen; phones get 1280 px.
# Two passes each, to a size well under Cloudflare's 25 MB per file.
set -e
cd "$(dirname "$0")"
IN=raw/hero-ui.mp4 O=../site/video T=$(mktemp -d)
VF="fps=24,scale=2400:1500:flags=lanczos,format=yuv420p"
ffmpeg -v error -y -i $IN -vf "$VF" -c:v libx264 -preset slow -b:v 4000k -maxrate 8000k -bufsize 8000k -pass 1 -passlogfile $T/x264 -an -f mp4 /dev/null
ffmpeg -v error -y -i $IN -vf "$VF" -c:v libx264 -preset slow -b:v 4000k -maxrate 8000k -bufsize 8000k -profile:v high -pass 2 -passlogfile $T/x264 -movflags +faststart -an $O/hero.mp4
ffmpeg -v error -y -i $IN -vf "$VF" -c:v libx265 -preset slow -b:v 3200k -x265-params pass=1:stats=$T/x265.log:log-level=error -an -f mp4 /dev/null
ffmpeg -v error -y -i $IN -vf "$VF" -c:v libx265 -preset slow -b:v 3200k -x265-params pass=2:stats=$T/x265.log:log-level=error -tag:v hvc1 -movflags +faststart -an $O/hero-hevc.mp4
MV="fps=24,scale=1280:800:flags=lanczos,format=yuv420p"
ffmpeg -v error -y -i $IN -vf "$MV" -c:v libx264 -preset slow -b:v 1400k -maxrate 2800k -bufsize 2800k -pass 1 -passlogfile $T/m -an -f mp4 /dev/null
ffmpeg -v error -y -i $IN -vf "$MV" -c:v libx264 -preset slow -b:v 1400k -maxrate 2800k -bufsize 2800k -profile:v high -pass 2 -passlogfile $T/m -movflags +faststart -an $O/hero-mobile.mp4
ffmpeg -v error -y -i $IN -frames:v 1 -vf scale=1600:-2 -q:v 3 $O/hero-poster.jpg
rm -rf $T
ls -la $O/hero*
