// Page scripts are TypeScript in client/*.ts, compiled by scripts/build-client.ts. A page that is
// served as raw HTML (design/home.html, an article) holds no script of its own: where one belongs
// it holds the marker <!--client:name--> (name = the file in client/, without .ts), at the exact
// spot in the markup where the script must run. The server swaps each marker for the inline tag:
// <script> for a classic script, <script type="module"> for a file that imports (CLIENT_MODULES).
// scripts/check.sh fails the commit if such a page gains a hand-written inline script.

import { CLIENT, CLIENT_MODULES } from "./client.generated.ts"

export function clientScript(name: string): string {
  if (!(name in CLIENT)) throw new Error(`<!--client:${name}--> names no script: there is no client/${name}.ts`)
  return `<script${CLIENT_MODULES.includes(name) ? ` type="module"` : ""}>${CLIENT[name as keyof typeof CLIENT]}</script>`
}

/** Replace each <!--client:name--> marker with its script tag. A function replacer: the code holds "$". */
export const withClientScripts = (html: string): string => html.replace(/<!--client:([a-z0-9-]+)-->/g, (_, name: string) => clientScript(name))
