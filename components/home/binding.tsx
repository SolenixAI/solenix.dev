"use client";

import { useEffect } from "react";
import { attachHome } from "@/lib/home/attach";

// The homepage's behaviour. It attaches when the homepage mounts and detaches when it leaves; the 3D world stays
// (components/space/world.tsx), so the homepage only takes it while it is shown.
export function HomeBinding() {
  useEffect(() => attachHome(), []);
  return null;
}
