"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { spaceWorld } from "@/lib/space/world";
import { STAGE_CSS } from "./stage-css";

// The pages that show the world. The homepage binds to it and plays its story.
const SHOWN = new Set(["/"]);

// The 3D world, mounted once by the site layout (app/(site)/layout.tsx), and kept in the page for as long as the layout
// is. The pages in SHOWN show it: the homepage binds to it and plays its story (components/home/binding.tsx). On every
// other page it is hidden, and its world paused, not torn down.
export function SpaceWorld() {
  // /app/ answers too (skipTrailingSlashRedirect), so the path is read without its trailing slash, as the nav reads it.
  const shown = SHOWN.has(usePathname().replace(/\/$/, "") || "/");
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    spaceWorld.mount(stage.current!, canvas.current!);
  }, []);
  return (
    <div ref={stage} className="world" aria-hidden="true" hidden={!shown}>
      <style href="space-stage" precedence="high">{STAGE_CSS}</style>
      <canvas id="gl" ref={canvas} />
      <div className="veil" />
    </div>
  );
}
