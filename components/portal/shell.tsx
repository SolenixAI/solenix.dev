import { Mark, SignOutIcon } from "./icons";
import { NavList, ThemeToggle, type NavItem } from "./client-bits";
import type { Viewer } from "@/lib/portal";

const CLIENT_NAV: NavItem[] = [
  { href: "/app", label: "Overview", icon: "overview", match: ["/app"] },
  { href: "/app/billing", label: "Billing", icon: "billing", match: ["/app/billing*"] },
];
const ADMIN_NAV: NavItem[] = [
  { href: "/app/admin/clients", label: "Clients", icon: "clients", match: ["/app/admin*"] },
  { href: "/app", label: "Our site", icon: "overview", match: ["/app"] },
];

function SignOut({ compact }: { compact?: boolean }) {
  return (
    <form action="/app/auth/signout" method="post" className={compact ? "inline" : undefined}>
      {compact ? (
        <button className="iconbtn od-fixed" type="submit" aria-label="Sign out" title="Sign out"><SignOutIcon /></button>
      ) : (
        <button className="btn btn-quiet btn-sm" type="submit" style={{ justifyContent: "flex-start", paddingLeft: "var(--space-3)" }}>
          <SignOutIcon />
          Sign out
        </button>
      )}
    </form>
  );
}

export function Shell({ viewer, children }: { viewer: Viewer; children: React.ReactNode }) {
  const nav = viewer.isAdmin ? ADMIN_NAV : CLIENT_NAV;
  const who = viewer.isAdmin ? "Admin" : viewer.client?.business_name ?? "Your portal";

  return (
    <div className="app is-signedin">
      <aside className="sidebar">
        <a className="brand" href="/app" aria-label="Solenix portal home">
          <Mark id="sg-side" />
          <span className="od-stat" style={{ ["--od-gap" as string]: 0 }}>
            <span style={{ fontWeight: "var(--fw-brand)" }}>Solenix</span>
            <span className="sub">Portal</span>
          </span>
        </a>

        <nav aria-label="Portal" className="od-fill">
          <NavList items={nav} variant="side" />
        </nav>

        <div className="od-stack" style={{ ["--od-gap" as string]: "var(--space-3)" }}>
          <div className="od-row" style={{ ["--od-gap" as string]: "var(--space-3)" }}>
            <span className="od-fill od-stat" style={{ ["--od-gap" as string]: 0 }}>
              <span className="sm" style={{ fontWeight: "var(--fw-semibold)" }}>{who}</span>
              <span className="xs faint od-truncate">{viewer.profile.email}</span>
            </span>
            <ThemeToggle />
          </div>
          <SignOut />
        </div>
      </aside>

      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand od-fill" href="/app" aria-label="Solenix portal home">
            <Mark id="sg-top" />
            <span className="od-stat" style={{ ["--od-gap" as string]: 0 }}>
              <span>Solenix</span>
              <span className="sub">{who}</span>
            </span>
          </a>
          <ThemeToggle />
          <SignOut compact />
        </div>
      </header>

      <main className="main" id="main" tabIndex={-1}>
        <div className="page">{children}</div>
      </main>

      <nav className="bottomnav" aria-label="Portal, bottom">
        <NavList items={nav} variant="bottom" />
      </nav>
    </div>
  );
}
