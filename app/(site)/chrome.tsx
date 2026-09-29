// Shared furniture of the public pages: the sky, the header and the footer.

export function Sky() {
  return (
    <svg className="sky" viewBox="0 0 700 700" aria-hidden="true">
      <defs>
        <radialGradient id="glow" cx=".5" cy=".5" r=".5">
          <stop offset=".55" style={{ stopColor: "var(--sun2)", stopOpacity: 0.22 }} />
          <stop offset="1" style={{ stopColor: "var(--sun2)", stopOpacity: 0 }} />
        </radialGradient>
        <radialGradient id="sun" cx=".42" cy=".38" r=".62">
          <stop offset="0" style={{ stopColor: "var(--sun1)" }} />
          <stop offset="1" style={{ stopColor: "var(--sun2)" }} />
        </radialGradient>
      </defs>
      <circle cx="350" cy="350" r="270" fill="url(#glow)" />
      <circle className="ring" cx="350" cy="350" r="215" />
      <circle className="ring" cx="350" cy="350" r="280" />
      <circle className="ring" cx="350" cy="350" r="345" />
      <g className="orbit o1"><circle className="dot" cx="350" cy="135" r="5" /></g>
      <g className="orbit o2"><circle className="dot" cx="70" cy="350" r="6" /></g>
      <g className="orbit o3"><circle className="dot" cx="595" cy="100" r="4" /></g>
      <circle cx="350" cy="350" r="150" fill="url(#sun)" />
    </svg>
  );
}

export function SiteHeader({ current }: { current?: "agents" }) {
  return (
    <header>
      <div className="wrap">
        <a className="brand" href="/" aria-label="SolenixAI home">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="16" cy="16" r="14" fill="none" stroke="var(--ring)" strokeOpacity=".45" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="8" fill="url(#sun)" />
            <circle cx="27" cy="9" r="2.2" fill="var(--ring)" />
          </svg>
          SolenixAI
        </a>
        <nav aria-label="Main">
          <a className="nav-link nav-hide" href="/#consulting">Consulting</a>
          <a className="nav-link nav-hide" href="/#websites">Websites</a>
          <a className="nav-link" href="/agents" aria-current={current === "agents" ? "page" : undefined}>Agents</a>
          <a className="nav-link" href="https://github.com/SolenixAI">GitHub</a>
          <a className="nav-cta" href="mailto:hello@solenix.dev">Contact</a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <span>© 2026 SolenixAI · St. John&apos;s, Newfoundland</span>
        <a href="mailto:hello@solenix.dev">hello@solenix.dev</a>
      </div>
    </footer>
  );
}

export const GITHUB_ICON =
  "M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z";
