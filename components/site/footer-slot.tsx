"use client";

import { usePathname } from "next/navigation";

// The site footer, on every page but the homepage: the homepage keeps the footer of its own markup (design/home.html).
export function FooterSlot({ children }: { children: React.ReactNode }) {
  return usePathname() === "/" ? null : children;
}
