import { Shell } from "@/components/portal/shell"
import { requireAdmin } from "@/lib/portal"

// Admin only. Anyone else gets a 404, not a hint that the page exists.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireAdmin()
  return <Shell viewer={viewer}>{children}</Shell>
}
