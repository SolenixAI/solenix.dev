import "server-only";

// Read-only calls to Vercel and PostHog for a client's site. Tokens live in
// Vercel env vars and never reach the browser. Nothing here is invented: when a
// source is not connected or has no data, the result says so and the page shows
// an empty state instead of a number.

const VERCEL_TEAM = process.env.VERCEL_TEAM_SLUG ?? "solenix";
const POSTHOG_HOST = process.env.POSTHOG_HOST ?? "https://us.posthog.com";

export type SiteState = "live" | "building" | "down" | "none";

export type Deploy = {
  state: "ready" | "building" | "error" | "canceled";
  createdAt: number;
  message: string | null;
  url: string | null;
};

export type SiteStatus = {
  /** live = the site answered just now; down = it did not; none = no site yet. */
  state: SiteState;
  checkedAt: number;
  deploy: Deploy | null;
  /** Set when a source could not be read, so the page can say so plainly. */
  problems: string[];
};

async function vercel<T>(path: string): Promise<T> {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) throw new Error("VERCEL_API_TOKEN is not set");
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`https://api.vercel.com${path}${sep}slug=${VERCEL_TEAM}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Vercel ${res.status}`);
  return res.json() as Promise<T>;
}

type VercelDeployment = {
  readyState?: string;
  state?: string;
  createdAt?: number;
  created?: number;
  url?: string;
  meta?: Record<string, string>;
};

async function latestProductionDeploy(project: string): Promise<Deploy | null> {
  const { id } = await vercel<{ id: string }>(`/v9/projects/${encodeURIComponent(project)}`);
  const { deployments } = await vercel<{ deployments: VercelDeployment[] }>(
    `/v6/deployments?projectId=${id}&target=production&limit=1`,
  );
  const d = deployments[0];
  if (!d) return null;
  const rs = (d.readyState ?? d.state ?? "").toUpperCase();
  return {
    state: rs === "READY" ? "ready" : rs === "ERROR" ? "error" : rs === "CANCELED" ? "canceled" : "building",
    createdAt: d.createdAt ?? d.created ?? 0,
    message: d.meta?.githubCommitMessage?.split("\n")[0] ?? null,
    url: d.url ? `https://${d.url}` : null,
  };
}

/** Does the site answer right now? Anything under 500 counts as up. */
async function answers(domain: string) {
  try {
    const res = await fetch(`https://${domain}/`, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
      headers: { "user-agent": "SolenixPortal/1 (+https://solenix.dev/app)" },
    });
    return res.status < 500;
  } catch {
    return false;
  }
}

export async function getSiteStatus(domain: string | null, vercelProject: string | null): Promise<SiteStatus> {
  const problems: string[] = [];
  if (!domain) return { state: "none", checkedAt: Date.now(), deploy: null, problems };

  const [up, deploy] = await Promise.all([
    answers(domain),
    vercelProject
      ? latestProductionDeploy(vercelProject).catch((e: Error) => {
          problems.push(e.message.includes("not set") ? "vercel-not-connected" : "vercel-unreachable");
          return null;
        })
      : Promise.resolve(null),
  ]);

  const state: SiteState = !up ? "down" : deploy?.state === "building" ? "building" : "live";
  return { state, checkedAt: Date.now(), deploy, problems };
}

// ── Visitors ─────────────────────────────────────────────────────────────────

export type Visitors = {
  /** Unique visitors in the last 30 days. */
  total: number;
  /** The 30 days before that, for the trend. */
  previous: number;
  /** Daily unique visitors, oldest first, 30 points. */
  series: number[];
};

export type VisitorsResult =
  | { kind: "ok"; visitors: Visitors }
  | { kind: "not-connected" }
  | { kind: "unavailable" };

/**
 * One PostHog project for every client site, separated by host ($host), so
 * there is no PostHog setup per client. Uses the Query API (HogQL).
 */
export async function getVisitors(domain: string | null): Promise<VisitorsResult> {
  const key = process.env.POSTHOG_PERSONAL_API_KEY;
  const project = process.env.POSTHOG_PROJECT_ID;
  if (!key || !project) return { kind: "not-connected" };
  if (!domain) return { kind: "ok", visitors: { total: 0, previous: 0, series: [] } };

  const hosts = [domain.toLowerCase(), `www.${domain.toLowerCase()}`];
  const where = `event = '$pageview' and properties.$host in {hosts}`;

  const run = async (query: string) => {
    const res = await fetch(`${POSTHOG_HOST}/api/projects/${project}/query/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: { kind: "HogQLQuery", query, values: { hosts } }, name: "solenix portal visitors" }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`PostHog ${res.status}`);
    return ((await res.json()) as { results?: unknown[][] }).results ?? [];
  };

  try {
    const [totals, days] = await Promise.all([
      run(`select uniqIf(distinct_id, timestamp >= now() - interval 30 day),
                  uniqIf(distinct_id, timestamp < now() - interval 30 day)
           from events where ${where} and timestamp >= now() - interval 60 day`),
      run(`select toString(toDate(timestamp)) as day, uniq(distinct_id)
           from events where ${where} and timestamp >= now() - interval 30 day
           group by day order by day`),
    ]);
    const byDay = new Map(days.map((r) => [String(r[0]), Number(r[1])]));
    const series = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(Date.now() - (29 - i) * 86_400_000).toISOString().slice(0, 10);
      return byDay.get(d) ?? 0;
    });
    return {
      kind: "ok",
      visitors: { total: Number(totals[0]?.[0] ?? 0), previous: Number(totals[0]?.[1] ?? 0), series },
    };
  } catch {
    return { kind: "unavailable" };
  }
}
