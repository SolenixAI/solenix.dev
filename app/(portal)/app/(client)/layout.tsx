import { redirect } from "next/navigation"
import { Shell } from "@/components/portal/shell"
import { Button } from "@/components/ui/button"
import { PageHead } from "@/components/portal/ui"
import { getViewer } from "@/lib/portal"

// A client's own portal. proxy.ts has already sent signed-out visitors to
// /app/login; this decides what a signed-in person may see.
export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer()
  if (viewer.isAdmin) redirect("/app/admin/clients")
  if (viewer.client && !viewer.client.onboarded_at) redirect("/app/welcome")

  if (!viewer.client) {
    return (
      <Shell viewer={viewer}>
        <PageHead
          eyebrow="Your portal"
          title="We could not find your project"
          id="h-none"
          lede={`You are signed in as ${viewer.profile.email}, but no project is linked to that address yet. If we set you up under a different email, sign out and use that one. Otherwise, email us and we will sort it out today.`}
        />
        <Button asChild><a href="mailto:hello@solenix.dev?subject=Portal%20access">Email hello@solenix.dev</a></Button>
      </Shell>
    )
  }
  return <Shell viewer={viewer}>{children}</Shell>
}
