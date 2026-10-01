import { readFile } from "node:fs/promises"
import path from "node:path"

// The homepage is the Open Design file design/home.html, served as-is.
// That file is the one source of truth; edit it in Open Design, never here.
// The only thing added at serve time is analytics, so the page can be measured.
export const dynamic = "force-static"

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "phc_pNXLaGwzrx5ghbpWQKT9SBmv4JNVZzDrdFjCBs2Zo9Ap"
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com"

// Only the live site counts; previews and localhost would inflate the numbers.
// Clicks and scroll depth (via page-leave) measure each section; see design/scorecard.md.
const ANALYTICS = `<script>
if (location.hostname === "solenix.dev") {
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset identify alias people.set people.set_once set_config".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  posthog.init(${JSON.stringify(POSTHOG_KEY)}, { api_host: ${JSON.stringify(POSTHOG_HOST)}, defaults: "2025-05-24", person_profiles: "identified_only", autocapture: true, capture_pageleave: true, disable_session_recording: true });
}
</script>`

export async function GET() {
  const html = await readFile(path.join(process.cwd(), "design/home.html"), "utf8")
  return new Response(html.replace("</head>", `${ANALYTICS}</head>`), {
    headers: { "content-type": "text/html; charset=utf-8" },
  })
}
