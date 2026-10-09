"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { spaceWorld } from "@/lib/space/world";

// The 3D world, mounted once by the site layout (app/(site)/layout.tsx). It is the homepage's world (design/home.html
// styles it) and stays in the page for as long as the layout does. It is shown on the homepage; the other pages do
// not show it yet, and their world is paused, not torn down.
export function SpaceWorld() {
  const home = usePathname() === "/";
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    spaceWorld.mount(stage.current!, canvas.current!);
  }, []);
  return (
    <div ref={stage} className="world" aria-hidden="true" hidden={!home}>
      <div className="fallback" aria-hidden="true" />
      <canvas id="gl" ref={canvas} />
      <div className="veil" />
    </div>
  );
}
