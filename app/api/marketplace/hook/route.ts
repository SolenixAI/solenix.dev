import { signedByGitHub } from "@/lib/github"

// GitHub tells the site the moment the marketplace changes: the Solenix Agents Marketplace app sends
// every push to SolenixAI/agents-marketplace here. Only a body signed with the app's webhook secret
// is accepted. Every visit already reads the catalog live; this is where an open page will hear it.
export async function POST(req: Request) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET
  const body = await req.text()
  if (!secret || !signedByGitHub(secret, body, req.headers.get("x-hub-signature-256"))) return new Response(null, { status: 401 })
  const event = req.headers.get("x-github-event")
  if (event === "ping") return new Response(null, { status: 204 })
  if (event !== "push") return new Response(null, { status: 202 })
  const { ref, after } = JSON.parse(body) as { ref?: string; after?: string }
  console.log(`marketplace: push to ${ref} (${after?.slice(0, 7)})`)
  return new Response(null, { status: 204 })
}
