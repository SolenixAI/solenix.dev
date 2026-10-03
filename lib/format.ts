const TZ = "America/St_Johns";

/** "2 days ago", "3 hours ago", "just now" — plain words, no timestamps to decode. */
export function ago(ms: number, now = Date.now()) {
  const s = Math.max(0, Math.round((now - ms) / 1000));
  if (s < 90) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} minutes ago`;
  const h = Math.round(m / 60);
  if (h < 24) return h === 1 ? "an hour ago" : `${h} hours ago`;
  const d = Math.round(h / 24);
  if (d < 30) return d === 1 ? "yesterday" : `${d} days ago`;
  return "on " + day(ms);
}

export const day = (ms: number) =>
  new Date(ms).toLocaleDateString("en-CA", { timeZone: TZ, day: "numeric", month: "long", year: "numeric" });

export const today = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });

export const count = (n: number) => n.toLocaleString("en-CA");

/** "https://www.Example.ca/about" → "example.ca" */
export const cleanDomain = (raw: string) =>
  raw.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
