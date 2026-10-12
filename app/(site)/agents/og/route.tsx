import { ImageResponse } from "next/og"
import { getCatalog } from "@/lib/marketplace"

// The link-preview picture of one world: its name and its one line, on the site's night ground. A shared world link
// (/agents?world=<id>) points here, so a link shared on a feed names what it sets up. Without a known world, the
// picture names the marketplace.
export async function GET(request: Request) {
  const world = new URL(request.url).searchParams.get("world")
  const entry = world ? (await getCatalog())?.find((e) => e.id === world) : undefined
  const name = entry?.name ?? "Agents Marketplace"
  const line = entry?.for ?? "Set up your AI the makers' way."
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#0b0d12", color: "#f4f2ee" }}>
        <div style={{ fontSize: 28, color: "#a39e97" }}>Solenix · Agents Marketplace</div>
        <div style={{ fontSize: 88, fontWeight: 700, marginTop: 24, lineHeight: 1.05 }}>{name}</div>
        <div style={{ fontSize: 34, marginTop: 28, color: "#a39e97", maxWidth: 980 }}>{line}</div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
