import { devReloadResponse } from "@/lib/dev-reload"

// The live-reload stream for raw HTML pages (lib/dev-reload.ts). Development only: production answers 404.
export const dynamic = "force-dynamic"

export function GET() {
  return devReloadResponse()
}
