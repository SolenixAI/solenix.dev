#!/usr/bin/env bash
# Builds solenix-three-body.mp4 (1080x1920, 30 fps, 20 s, with sound) from this folder.
#   bash brand/motion/make.sh [outDir]   (default: brand/motion/out, which git ignores)
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"; out="${1:-$here/out}"; mkdir -p "$out"
root="$(cd "$here/../.." && pwd)"; (cd "$root" && node scripts/vendor.ts >/dev/null)
# The piece is TypeScript (piece.ts); the page loads it as piece.js, compiled here by Node's own type stripper (git ignores it).
rm -f "$here/piece.js" # a failed compile must never leave the last build to render
node --disable-warning=ExperimentalWarning --input-type=module -e "import { stripTypeScriptTypes } from 'node:module'; import { readFileSync, writeFileSync } from 'node:fs'; writeFileSync(process.argv[2], stripTypeScriptTypes(readFileSync(process.argv[1], 'utf8')))" "$here/piece.ts" "$here/piece.js"
python3 -m http.server 8812 --bind 127.0.0.1 --directory "$root" >/dev/null 2>&1 & srv=$!
trap 'kill $srv 2>/dev/null' EXIT; sleep 1
rm -rf "$out/frames" && node "$here/render.ts" "$out/frames"
(cd "$out" && python3 "$here/sound.py")
ffmpeg -v error -y -framerate 30 -i "$out/frames/%05d.jpg" -i "$out/sound.wav" -af loudnorm=I=-14:TP=-1.2:LRA=9 \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -r 30 -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest \
  "$out/solenix-three-body.mp4"
cp "$out/frames/00066.jpg" "$out/solenix-three-body-cover.jpg"
echo "wrote $out/solenix-three-body.mp4"
