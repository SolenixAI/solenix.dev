// One PostHog setup for the whole public site: the homepage (design/home.html, through
// app/(site)/page.tsx) and every React page. Only the live site sends
// events; previews, localhost and pages shown inside a frame (the live
// preview on an article card) would inflate the numbers.
// Events go to the PostHog project "Solenix", the one project for every Solenix product; each
// event carries an `app` property that names the product. The project token is public by
// design (it only allows sending events), so it lives here once and no env var overrides it.

import { SITE_HOST } from "./site-meta.ts"

export const POSTHOG_KEY = "phc_yiiguNiBP8LGF8vrcWnDVMs3CkaEBLPk3gwGNrpqLs5G"
export const POSTHOG_HOST = "https://us.i.posthog.com"
export const POSTHOG_PROPERTIES = { app: SITE_HOST } as const

// The four goal events. Each goal is one event, set as a conversion goal in PostHog web analytics. One helper
// sends them: captureGoal below for React pages, and window.captureGoal in the snippet further down, which the
// raw pages (articles) use. Both take their names from GOALS, so the two cannot drift apart.
export const GOALS = ["book_call_clicked", "copied_for_ai", "article_read", "article_shared"] as const
export type Goal = (typeof GOALS)[number]

declare global {
  interface Window {
    posthog?: { capture(event: string): void }
  }
}

// The one capture helper. The page passes PostHog's capture; a test passes its own. Where PostHog did not load
// (a preview, a frame), window.posthog is unset and nothing is sent.
export function captureGoal(goal: Goal, capture: (event: string) => void = (event) => window.posthog?.capture(event)): void {
  if (!(GOALS as readonly string[]).includes(goal)) throw new Error(`unknown goal: ${goal}`)
  capture(goal)
}

// Analytics travel through the site's own domain (PostHog's documented Next.js reverse proxy,
// https://posthog.com/docs/advanced/proxy/nextjs), so the page loads nothing from another host
// and ad blockers do not drop the data. next.config.ts builds its rewrites from these values.
export const POSTHOG_PROXY = "/lumen"
export const POSTHOG_ASSETS_HOST = POSTHOG_HOST.replace(".i.posthog.com", "-assets.i.posthog.com")
const POSTHOG_UI_HOST = POSTHOG_HOST.replace(".i.posthog.com", ".posthog.com")

// Clicks, scroll depth (page-leave), heatmaps and session replay measure each
// section. Replay masks every input and anything
// marked data-ph-mask, so nothing a visitor types is recorded.
export const POSTHOG_OPTIONS = {
  api_host: POSTHOG_PROXY,
  ui_host: POSTHOG_UI_HOST,
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
if (location.hostname === ${JSON.stringify(SITE_HOST)} && window.top === window.self) {
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset identify alias people.set people.set_once set_config".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  posthog.init(${JSON.stringify(POSTHOG_KEY)}, ${JSON.stringify(POSTHOG_OPTIONS)});
  posthog.register(${JSON.stringify(POSTHOG_PROPERTIES)});
  window.captureGoal = function (goal) { if (${JSON.stringify(GOALS)}.includes(goal)) posthog.capture(goal) };
  addEventListener("click", function (e) { if (e.target.closest && e.target.closest('a[href="/book"]')) window.captureGoal("book_call_clicked") });
}
</script>`

// Real-visitor loading scores (Core Web Vitals) from Vercel Speed Insights.
export const SPEED_INSIGHTS_SNIPPET = `<script>if(window.top===window.self){window.si=window.si||function(){(window.siq=window.siq||[]).push(arguments)};var s=document.createElement("script");s.defer=true;s.src="/_vercel/speed-insights/script.js";document.head.appendChild(s)}</script>`
