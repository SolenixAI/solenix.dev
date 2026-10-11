// The GitHub App's webhook, as a request in and a status out (app/api/github/route.ts wires it). Only a body
// signed with the app's webhook secret is trusted (401 otherwise, and with no secret set); a signed body that
// is not a JSON object gets 400 and one log line; ping gets 204; a push is handed to `onPush` (204, or 500 and
// one log line if handling it fails); any other event is acknowledged with 202. GitHub shows each status on the delivery, so a failure has a reason there.

import { failed } from "./failed.ts"
import { signedByGitHub } from "./github.ts"

export type Push = { repo: string | null; branch: string | null; after: string | null }

export function makeWebhook(secret: string | undefined, onPush: (push: Push) => Promise<void>) {
  return async (req: Request): Promise<Response> => {
    const body = await req.text()
    if (!secret || !signedByGitHub(secret, body, req.headers.get("x-hub-signature-256"))) return new Response(null, { status: 401 })
    const event = req.headers.get("x-github-event")
    if (event === "ping") return new Response(null, { status: 204 })
    if (event !== "push") return new Response(null, { status: 202 })
    let payload: { ref?: string; after?: string; repository?: { full_name?: string } }
    try {
      payload = JSON.parse(body)
      if (typeof payload !== "object" || payload === null || Array.isArray(payload)) throw new Error("not a JSON object")
    } catch (e) {
      failed("GitHub webhook push body", e, "receive")
      return new Response("The body is not a JSON object.", { status: 400 })
    }
    // Only a branch push names a branch; a tag (refs/tags/…) names none.
    const branch = payload.ref?.startsWith("refs/heads/") ? payload.ref.slice("refs/heads/".length) : null
    try {
      await onPush({ repo: payload.repository?.full_name ?? null, branch, after: payload.after ?? null })
    } catch (e) {
      failed("GitHub webhook push", e, "push")
      return new Response(null, { status: 500 })
    }
    return new Response(null, { status: 204 })
  }
}
