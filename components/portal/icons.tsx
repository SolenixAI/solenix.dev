// Icons from the design concept (design/app.html). Stroke icons on a 20-unit grid.

type P = { className?: string };
const stroke = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function Mark({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <radialGradient id={id} cx="42%" cy="38%">
          <stop offset="0" stopColor="var(--sun1)" />
          <stop offset="1" stopColor="var(--sun2)" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="7" fill={`url(#${id})`} />
      <ellipse cx="16" cy="16" rx="13.5" ry="13.5" fill="none" stroke="var(--ring)" strokeOpacity=".45" strokeWidth="1" />
      <circle cx="26.5" cy="9.5" r="2.4" fill="var(--ring)" />
    </svg>
  );
}

export const NAV_ICONS = {
  overview: <><path d="M3.5 10.5 10 4l6.5 6.5" /><path d="M5.5 9.5V16h9V9.5" /></>,
  billing: <><rect x="2.5" y="5" width="15" height="10" rx="2" /><path d="M2.5 9h15" /></>,
  clients: <><circle cx="7.5" cy="7" r="2.8" /><path d="M2.5 16c0-2.6 2.2-4.2 5-4.2s5 1.6 5 4.2" /><path d="M13.5 5.4a2.6 2.6 0 0 1 0 5M15 15.6c0-1.8-.7-3-2-3.7" /></>,
} as const;

export function NavGlyph({ name }: { name: keyof typeof NAV_ICONS }) {
  return <svg viewBox="0 0 20 20" strokeWidth="1.7" {...stroke} aria-hidden="true">{NAV_ICONS[name]}</svg>;
}

export const Chevron = ({ className = "row-chev" }: P) => (
  <svg className={className} viewBox="0 0 20 20" strokeWidth="2" {...stroke} aria-hidden="true"><path d="M8 5l5 5-5 5" /></svg>
);

export const BackArrow = () => (
  <svg viewBox="0 0 20 20" strokeWidth="2" {...stroke} aria-hidden="true"><path d="M12 5l-5 5 5 5" /></svg>
);

export const Plus = () => (
  <svg viewBox="0 0 20 20" strokeWidth="2" {...stroke} aria-hidden="true"><path d="M10 4.5v11M4.5 10h11" /></svg>
);

export const SignOutIcon = () => (
  <svg viewBox="0 0 20 20" strokeWidth="1.8" {...stroke} aria-hidden="true"><path d="M12.5 14.5V17H3V3h9.5v2.5M8 10h9m0 0-2.5-2.5M17 10l-2.5 2.5" /></svg>
);

export const SunIcon = () => (
  <svg viewBox="0 0 20 20" strokeWidth="1.8" {...stroke} aria-hidden="true"><circle cx="10" cy="10" r="3.6" /><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.6 4.6l1.4 1.4M14 14l1.4 1.4M15.4 4.6L14 6M6 14l-1.4 1.4" /></svg>
);

export const AlertIcon = () => (
  <svg viewBox="0 0 20 20" strokeWidth="2" {...stroke} aria-hidden="true"><circle cx="10" cy="10" r="7.5" /><path d="M10 6.5v4M10 13.6v.1" /></svg>
);

export const InfoIcon = () => (
  <svg viewBox="0 0 20 20" strokeWidth="1.8" {...stroke} aria-hidden="true"><circle cx="10" cy="10" r="7.5" /><path d="M10 9v4.5M10 6.4v.1" /></svg>
);

export const CheckIcon = () => (
  <svg viewBox="0 0 20 20" strokeWidth="2.2" {...stroke} aria-hidden="true"><path d="M5 10.5l3 3 7-7" /></svg>
);

export const OutIcon = () => (
  <svg viewBox="0 0 20 20" strokeWidth="2" {...stroke} aria-hidden="true"><path d="M11 4h5v5M16 4l-7 7M9 4H4v12h12v-5" /></svg>
);

export const MailIcon = () => (
  <svg viewBox="0 0 20 20" strokeWidth="1.8" {...stroke} aria-hidden="true"><path d="M3 5.5h14v9H3zM3 6l7 5 7-5" /></svg>
);

export const CardIcon = () => (
  <svg viewBox="0 0 20 20" strokeWidth="2" {...stroke} aria-hidden="true"><rect x="2.5" y="5" width="15" height="10" rx="2" /><path d="M2.5 9h15" /></svg>
);

export const VercelIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 3l7.5 13H2.5z" /></svg>
);

export const ChartIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M3 16V9M8.3 16V4M13.6 16v-5M19 16v-9" /></svg>
);

export const GoogleIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path fill="#4285F4" d="M19.6 10.23c0-.7-.06-1.37-.18-2.02H10v3.82h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.32 2.98-7.32z" />
    <path fill="#34A853" d="M10 20c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.76-5.59-4.12H1.07v2.58A10 10 0 0 0 10 20z" />
    <path fill="#FBBC05" d="M4.41 11.9a6 6 0 0 1 0-3.8V5.52H1.07a10 10 0 0 0 0 8.96l3.34-2.58z" />
    <path fill="#EA4335" d="M10 3.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 10 0 10 10 0 0 0 1.07 5.52l3.34 2.58C5.2 5.74 7.4 3.98 10 3.98z" />
  </svg>
);
