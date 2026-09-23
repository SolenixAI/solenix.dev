# SolenixAI brand

One source for every visual: the site (`index.html`), the GitHub org avatar and README banner, and Jager's profile banner.

- Colors match the `:root` tokens in `index.html` (dark: `#0b0d12` → `#11141b`, accent `#f59e0b`; light: `#fbfaf8` → `#f3f1ed`, accent `#c2410c`; sun `#fbbf24` → `#f97316` / `#ea580c`).
- Logo = sun + one orbit ring + one agent dot.
- Change a token or text in `build.py`, run `python3 brand/build.py`, then copy the banners into the repos that use them:
  - `banner-jager-*.svg` → `JagerCooper/JagerCooper` `assets/banner-{dark,light}.svg`
  - `banner-org-*.svg` → `SolenixAI/.github` `profile/assets/`
  - `avatar.png` → upload as the SolenixAI org picture (GitHub UI)
