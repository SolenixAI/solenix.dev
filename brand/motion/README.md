# Solenix · three-body motion piece

A 20-second vertical video (1080×1920, 30 fps, with sound) for Reels, TikTok and LinkedIn. It tells the homepage story as motion design:
1. Revenue, Costs and Time are pulled apart by six tools.
2. One AI sun ignites at the centre.
3. The three bodies lock into the real figure-eight three-body orbit.
4. The orbit becomes the Solenix mark, ending on solenix.dev and Book a call.

- `index.html`: the composition. One canvas, and every frame is a pure function of time (`window.renderFrame(t)`). The physics and camera are baked at load.
- `sound.py`: the soundtrack and sound effects, synthesized in D and synced to the timeline.
- `render.mjs`: draws each frame in the GPU browser (`scripts/browser.mjs`).
- `logos.json`: the six tool logos, taken from `design/home.html`.
- `make.sh`: builds `out/solenix-three-body.mp4` and its cover image. The `out/` folder is not committed. Requires node, python3 and ffmpeg.

The finished video, its cover and its caption are in the Solenix Google Drive: [Brand videos](https://drive.google.com/drive/folders/1Ry7xEpzQiIeqGpEijozHgWkBt8PzKu9g).
