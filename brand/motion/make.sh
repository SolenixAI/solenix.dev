#!/usr/bin/env bash
# Builds solenix-three-body.mp4 (1080x1920, 30 fps, 20 s, with sound) from this folder.
#   bash brand/motion/make.sh [outDir]   (default: brand/motion/out, which git ignores)
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"; out="${1:-$here/out}"; mkdir -p "$out"
python3 -m http.server 8812 --bind 127.0.0.1 --directory "$here" >/dev/null 2>&1 & srv=$!
trap 'kill $srv 2>/dev/null' EXIT; sleep 1
rm -rf "$out/frames" && node "$here/render.mjs" "$out/frames"
(cd "$out" && python3 "$here/sound.py")
ffmpeg -v error -y -framerate 30 -i "$out/frames/%05d.jpg" -i "$out/sound.wav" -af loudnorm=I=-14:TP=-1.2:LRA=9 \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -r 30 -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest \
  "$out/solenix-three-body.mp4"
cp "$out/frames/00066.jpg" "$out/solenix-three-body-cover.jpg"
echo "wrote $out/solenix-three-body.mp4"
