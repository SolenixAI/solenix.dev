# Solenix brand images

The logos, the org avatar, the touch icon and the GitHub banners in `public/brand/out/` are drawn by `scripts/brand-images.ts` from the one source of each part:

- the mark and the sun's light: `lib/site-nav.ts`
- colours and type: `design/tokens.css` (the dark and light values of each token)

Never edit a file in `public/brand/out/` by hand. Change the source, then run `npm run brand`. `npm run check` fails if a file differs from what the sources draw.

After a change, copy the banners into the repos that use them:

- `banner-jager-*.svg` → `JagerCooper/JagerCooper` `assets/banner-{dark,light}.svg`
- `banner-org-*.svg` → `SolenixAI/.github` `profile/assets/`
- `avatar.png` → upload as the SolenixAI org picture (GitHub UI)

`motion/` holds the brand motion pieces.
