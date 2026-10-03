// One PostHog setup for the whole public site: the homepage (design/home.html,
// served by app/route.ts) and every React page. Only the live site sends
// events; previews and localhost would inflate the numbers.
// The project token is public by design (it only allows sending events).

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "phc_pNXLaGwzrx5ghbpWQKT9SBmv4JNVZzDrdFjCBs2Zo9Ap"
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com"
export const LIVE_HOST = "solenix.dev"

// Clicks, scroll depth (page-leave), heatmaps and session replay measure each
// section. Replay masks every input and anything
// marked data-ph-mask, so nothing a visitor types is recorded.
export const POSTHOG_OPTIONS = {
  api_host: POSTHOG_HOST,
  defaults: "2025-05-24",
  person_profiles: "identified_only",
  autocapture: true,
  capture_pageleave: true,
  enable_heatmaps: true,
  disable_session_recording: false,
  session_recording: { maskAllInputs: true, maskTextSelector: "[data-ph-mask]" },
} as const

// The same setup as an inline script, for pages served as plain HTML.
export const POSTHOG_SNIPPET = `<script>
if (location.hostname === ${JSON.stringify(LIVE_HOST)}) {
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset identify alias people.set people.set_once set_config".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  posthog.init(${JSON.stringify(POSTHOG_KEY)}, ${JSON.stringify(POSTHOG_OPTIONS)});
}
</script>`

// Real-visitor loading scores (Core Web Vitals) from Vercel Speed Insights.
export const SPEED_INSIGHTS_SNIPPET = `<script>window.si=window.si||function(){(window.siq=window.siq||[]).push(arguments)};</script><script defer src="/_vercel/speed-insights/script.js"></script>`
