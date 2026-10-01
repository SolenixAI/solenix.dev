// One way to launch the checking browser: on the Mac's GPU (Metal), like a real visitor.
// Headless Chrome's default software renderer (SwiftShader) measured ~400% CPU at 11.5 fps on this
// page; Metal measured ~35% CPU at 56.5 fps (2026-10-01). Software rendering made the races look
// slow and choked the Mac.
import { chromium } from "playwright"

export const launch = () =>
  chromium.launch({ channel: "chromium", args: ["--use-angle=metal", "--ignore-gpu-blocklist", "--enable-gpu-rasterization"] })
