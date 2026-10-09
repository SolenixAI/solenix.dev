import { signedByGitHub } from "@/lib/github"

// Every event from SolenixAI (the org's GitHub App) arrives here, one address for every use. Only a
// body signed with the app's webhook secret is accepted; each event is then routed by its repository.
export async function POST(req: Request) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET
  const body = await req.text()
  if (!secret || !signedByGitHub(secret, body, req.headers.get("x-hub-signature-256"))) return new Response(null, { status: 401 })
  const event = req.headers.get("x-github-event")
  if (event === "ping") return new Response(null, { status: 204 })
  if (event !== "push") return new Response(null, { status: 202 })
  const { ref, after, repository } = JSON.parse(body) as { ref?: string; after?: string; repository?: { full_name?: string } }
  // The Agents Marketplace changed: every visit already reads it live; open pages will hear it here next.
  if (repository?.full_name === "SolenixAI/agents-marketplace") console.log(`marketplace: push to ${ref} (${after?.slice(0, 7)})`)
  return new Response(null, { status: 204 })
}
