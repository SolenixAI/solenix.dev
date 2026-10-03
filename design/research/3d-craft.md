# What makes 3D sites feel exceptional

Method: I opened each site in my own tab, scrolled, and saved screenshots to `3d-refs/`. Igloo never finished loading in this browser, and Bruno Simon's screenshot failed. For those two I used published case studies. Technique claims marked "(source)" come from the linked write-up. Unmarked claims are what I saw on screen.

## The ten sites

1. **[Lusion](https://lusion.co)** (`lusion-hero.jpg`). Real-material objects (matte plastic, saturated blue) fill a rounded frame with large depth-of-field blur. Type sits above the scene, never on it.
2. **[Igloo Inc](https://www.igloo.inc)**, Awwwards Site of the Year 2025 ([case study](https://www.awwwards.com/igloo-inc-case-study.html)). Only three sections, but a camera journey ends in a particle footer. Scene changes use chromatic aberration, displacement and frost. Text glitches run in shaders, not CSS. Particles change colour with speed (source).
3. **[Active Theory](https://activetheory.net)** (`active-theory-ring.jpg`, `active-theory-particles.jpg`). One metallic object in near-black space. A light leak, film grain and vignette frame it. Scroll turns the object and releases embers.
4. **[Bruno Simon](https://bruno-simon.com)** ([case study](https://www.awwwards.com/brunos-portfolio-case-study.html)). You drive a car through the world. Navigation is the interaction. Camera-facing foliage planes shrink near the car (source).
5. **[Apple AirPods Pro 3](https://www.apple.com/airpods-pro/)** (`apple-airpods-pro.jpg`). One product at a time, centred, soft shadow, large copy beneath. Exploded and rotated states are tied to scroll.
6. **[Lando Norris](https://landonorris.com)** (`lando-norris-hero.jpg`). A scanned head with a wire dome around it. The page switches palette (white to dark olive) as you scroll.
7. **[Oryzo](https://oryzo.ai)** (`oryzo-hero.jpg`, `oryzo-scroll.jpg`). One cork coaster, huge type behind and in front of it. On scroll the object travels to the centre while the background dims, so the object becomes the only lit thing. Built by Lusion; [reference list](https://www.utsubo.com/blog/best-threejs-websites-2026).
8. **[Primland](https://explore.ownprimland.com)** (`primland-hero.jpg`). Top-down terrain with fog and drifting cloud. Spaced capital type over the landscape. Scroll flies the camera over it ([list](https://www.utsubo.com/blog/best-threejs-websites-2026)).
9. **[Shopify Editions Spring '26](https://www.shopify.com/editions/spring2026)** (`shopify-editions-hero.jpg`, `shopify-editions-tunnel.jpg`, `shopify-editions-product.jpg`). A particle forest becomes a motion-blurred tunnel as you scroll. The word "Everywhere" bends along the tunnel.
10. **[Sleep Well Creatives](https://sleep-well-creatives.com)**, SOTD Jan 2026 (`sleepwell-handoff.jpg`, `sleepwell-tunnel.jpg`). Flat blue section hands off to a 3D tunnel; a pill and a key object tumble inside it. Two colours only.

## What they share

- **The camera moves; the objects do not carry the story.** Tunnels (Shopify, Sleep Well), flights (Primland), journeys (Igloo). Solenix's camera looks at a box of tumbling bodies.
- **One hero object, lit, with empty space around it.** Lusion, Active Theory, Oryzo, Apple. Solenix shows three bodies at once, so none is the hero.
- **Depth cues are heavy:** fog, blur, parallax layers, scale contrast.
- **Scroll sets state, not just position.** Palette, light and camera change per section.
- **Type is part of the scene.** It is occluded, bent, or dimmed by it.
- **Restraint.** Two or three colours, one idea per section.

## Eight techniques for solenix.dev, ranked

1. **Scroll drives the camera along a spline.** Build a `CatmullRomCurve3` through 5 waypoints (one per plan stop). Use a ScrollTrigger with `scrub: true` on the whole page to set `t` (0 to 1). Smooth it with `gsap.quickTo(proxy, 't', {duration: 1, ease: 'power3.out'})`. Call `curve.getPointAt(t)` for position and `lookAt` a second, slower curve. This is the pattern in the [Codrops camera-path tutorial](https://tympanus.net/codrops/2026/07/07/building-a-scroll-driven-3d-gallery-using-a-blender-camera-path-with-three-js-and-gsap/). It turns the scene into the plan.
2. **Make the scene tell the plan: chaos to orbit.** Tween each body's motion from random tumble to a circular orbit as scroll passes stops 1 to 5. Use a uniform or parameter `stability` (0 to 1) that mixes velocity noise with orbit tangent. This is the story ("from one call to a stable orbit") and is currently not on screen.
3. **Depth stack: fog, parallax layers, scale.** Add `scene.fog = new THREE.FogExp2(bg, 0.02)`. Put a star or dust `Points` layer at 3 distances moving at different rates. Place one large body very near the camera, out of focus, and one far away.
4. **Depth of field and a slow vignette.** Use `BokehPass` or a custom pass with focus distance tied to the active body. Keep bloom low (strength 0.3 to 0.5, threshold high) so only the bodies glow.
5. **Section state changes.** On each ScrollTrigger enter/leave, tween a single `state` object: background colour, bloom strength, fog density, one body's emissive. Revenue, Costs and Time each get a stop where they are the lit hero and the other two dim (Oryzo's dim-and-isolate move).
6. **Type shares the frame.** Keep HTML text for access, but let bodies pass behind it. Use `mix-blend-mode: difference` on the headline or a CSS mask. Fade and translate each text block with the same scrub timeline as the camera.
7. **Pointer parallax and drag-rotate.** Offset the camera by up to 0.3 units from the pointer, damped with `gsap.quickTo`. Bodies shift away from the cursor with a spring.
8. **A shader transition into the close.** At the last stop, add a short displacement and chromatic-aberration pass (Igloo's scene-change idea), then resolve to a calm, centred orbit under "Book a call". Pass strength goes 0, up, 0 over about 0.4 of scroll.

## Build notes

- One scroll source: Lenis, with `lenis.on('scroll', ScrollTrigger.update)`. Render on `gsap.ticker`.
- Test at 60 fps on mid laptops. Cap `devicePixelRatio` at 2, and drop DoF on low tiers.
- `prefers-reduced-motion`: lock the camera to the final orbit and keep text.
