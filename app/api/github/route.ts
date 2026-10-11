import { revalidateTag } from "next/cache"
import { bus } from "@/lib/bus"
import { failed } from "@/lib/failed"
import { makeWebhook } from "@/lib/github-webhook"
import { catalogKey, catalogVersion, FACTS_TAG } from "@/lib/marketplace"
import { MARKETPLACE_SLUG } from "@/lib/site-meta"

// Every event from the org's GitHub App arrives here, one address for every use. lib/github-webhook.ts checks the
// signature and the body and answers GitHub; each push is then routed by its repository here.
export const POST = makeWebhook(process.env.GITHUB_WEBHOOK_SECRET, async ({ repo, branch, after }) => {
  if (repo !== MARKETPLACE_SLUG || !branch) return
  // The Agents Marketplace changed. Its catalog on that branch is expired at once, so the next read (this
  // one included) is GitHub's answer, not the cache's. The facts are only marked stale: a page never waits
  // on them, it shows them as they were and they refresh behind it.
  revalidateTag(catalogKey(branch), { expire: 0 })
  revalidateTag(FACTS_TAG, "max")
  // Tell every open page on that branch which catalog it now holds. A push that leaves worlds.json alone
  // carries the same version, so no page reloads for nothing.
  const version = await catalogVersion(branch)
  // A bus that is down costs only the live update; GitHub still gets its answer, and pages read on load.
  if (version && bus) await bus.publish(catalogKey(branch), version).catch((e: unknown) => failed(`bus ${catalogKey(branch)}`, e))
  console.log(`marketplace: push to ${branch} (${after?.slice(0, 7)}), catalog ${version?.slice(0, 7)}`)
})
