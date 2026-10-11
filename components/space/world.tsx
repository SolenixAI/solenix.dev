"use client";

import { usePathname } from "next/navigation";
import { preload } from "react-dom";
import { useEffect, useRef } from "react";
import { spaceWorld } from "@/lib/space/world";
import { NAV } from "@/lib/site-nav";
import { STAGE_CSS } from "./stage-css";

// The pages that show the world. The homepage binds to it and plays its story; the others show its first-frame still.
const SHOWN = new Set(["/", NAV.platform.href]);

// The 3D world, mounted once by the site layout (app/(site)/layout.tsx), and kept in the page for as long as the layout
// is. The pages in SHOWN show it: the homepage binds to it and plays its story (components/home/binding.tsx); the
// others show the still of its first frame. On every other page it is hidden, and its world paused, not torn down.
export function SpaceWorld() {
  // /app/ answers too (skipTrailingSlashRedirect), so the path is read without its trailing slash, as the nav reads it.
  const shown = SHOWN.has(usePathname().replace(/\/$/, "") || "/");
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    spaceWorld.mount(stage.current!, canvas.current!);
  }, []);
  if (shown) {
    // The still is fetched with the page, so it is on screen in frame one.
    preload("/space/poster.webp", { as: "image", fetchPriority: "high", media: "(min-aspect-ratio: 3/4)" });
    preload("/space/poster-phone.webp", { as: "image", fetchPriority: "high", media: "(max-aspect-ratio: 3/4)" });
  }
  return (
    <div ref={stage} className="world" aria-hidden="true" hidden={!shown}>
      <style href="space-stage" precedence="high">{STAGE_CSS}</style>
      <div className="fallback" aria-hidden="true" />
      <canvas id="gl" ref={canvas} />
      <div className="veil" />
    </div>
  );
}
