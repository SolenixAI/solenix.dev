"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { NavGlyph, NAV_ICONS, SunIcon } from "./icons";

export type NavItem = { href: string; label: string; icon: keyof typeof NAV_ICONS; match: string[] };

/** The nav, rendered once for the sidebar and once for the bottom bar. */
export function NavList({ items, variant }: { items: NavItem[]; variant: "side" | "bottom" }) {
  const path = usePathname();
  const current = items.find((n) => n.match.some((m) => (m.endsWith("*") ? path.startsWith(m.slice(0, -1)) : path === m)));
  return (
    <ul data-nav={variant} style={{ ["--nav-count" as string]: items.length }}>
      {items.map((n) => (
        <li key={n.href}>
          <a className="navlink" href={n.href} aria-current={current === n ? "page" : undefined}>
            <NavGlyph name={n.icon} />
            <span className="n">{n.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function ThemeToggle() {
  const [next, setNext] = useState<"dark" | "light">("dark");

  const current = () => {
    const set = document.documentElement.getAttribute("data-theme");
    if (set === "dark" || set === "light") return set;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };
  useEffect(() => setNext(current() === "dark" ? "light" : "dark"), []);

  const label = `Switch to the ${next} theme`;
  return (
    <button
      className="iconbtn od-fixed"
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        const to = current() === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", to);
        try { localStorage.setItem("solenix-theme", to); } catch { /* private mode */ }
        setNext(to === "dark" ? "light" : "dark");
      }}
    >
      <SunIcon />
    </button>
  );
}

/** A submit button with the design's busy state: spinner plus a busy label. */
export function SubmitButton({
  children,
  busy,
  className = "btn btn-primary",
  disabled,
}: {
  children: React.ReactNode;
  busy: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      className={className + (pending ? " is-busy" : "")}
      type="submit"
      aria-disabled={pending || disabled ? "true" : undefined}
      disabled={disabled}
    >
      <span className="spin" aria-hidden="true"></span>
      <span className="label-idle">{children}</span>
      <span className="label-busy">{busy}</span>
    </button>
  );
}
