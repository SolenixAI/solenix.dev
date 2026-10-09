import { bus } from "@/lib/bus"
import { signedByGitHub } from "@/lib/github"
import { catalogVersion } from "@/lib/marketplace"

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
  // The Agents Marketplace changed: tell every open page on that branch which catalog it now holds.
  // A push that leaves worlds.json alone carries the same version, so no page reloads for nothing.
  const branch = ref?.replace("refs/heads/", "")
  if (repository?.full_name === "SolenixAI/agents-marketplace" && branch) {
    const version = await catalogVersion(branch)
    // A bus that is down costs only the live update; GitHub still gets its answer, and pages read on load.
    if (version && bus) await bus.publish(`marketplace:${branch}`, version).catch((e: Error) => console.error(`bus: ${e.message}`))
    console.log(`marketplace: push to ${branch} (${after?.slice(0, 7)}), catalog ${version?.slice(0, 7)}`)
  }
  return new Response(null, { status: 204 })
}
