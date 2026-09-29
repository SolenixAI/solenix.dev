"use client";

import { useEffect, useState } from "react";

// Reads the marketplace file live from GitHub on every visit, as the static page did.
const CATALOG = "https://raw.githubusercontent.com/SolenixAI/agents-marketplace/main/.agents/plugins/marketplace.json";
const REPO = "https://github.com/SolenixAI/agents-marketplace";

type Plugin = {
  name?: unknown;
  description?: unknown;
  category?: unknown;
  source?: { url?: unknown; source?: unknown; path?: unknown };
};

const safeUrl = (u: unknown) => (typeof u === "string" && /^https:\/\//.test(u) ? u : REPO);

const sourceUrl = (src: Plugin["source"]) => {
  if (!src || typeof src.url !== "string") return REPO;
  const repo = src.url.replace(/\.git$/, "");
  return safeUrl(src.source === "git-subdir" && src.path ? repo + "/tree/HEAD/" + src.path : repo);
};

export function Cmd({ text }: { text: string }) {
  return (
    <div className="cmd">
      <code>{text}</code>
      <button className="copy" type="button">Copy</button>
    </div>
  );
}

type State = { kind: "loading" } | { kind: "error" } | { kind: "ok"; tools: Plugin[] };

export function Tools() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    fetch(CATALOG, { cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then((data) => setState({ kind: "ok", tools: Array.isArray(data.plugins) ? data.plugins : [] }))
      .catch(() => setState({ kind: "error" }));
  }, []);

  return (
    <div className="tools" id="tools" aria-live="polite">
      {state.kind === "loading" && (
        <article className="card empty" id="tools-status"><h3>Loading tools…</h3></article>
      )}
      {state.kind === "error" && (
        <article className="card empty">
          <h3>Couldn&apos;t load the list</h3>
          <p className="muted-note"><a href={REPO + "/blob/main/.agents/plugins/marketplace.json"}>See it on GitHub →</a></p>
        </article>
      )}
      {state.kind === "ok" && state.tools.length === 0 && (
        <article className="card empty">
          <h3>No tools listed yet</h3>
          <p className="muted-note"><a href={REPO + "/releases/latest"}>Latest release →</a></p>
        </article>
      )}
      {state.kind === "ok" && state.tools.map((p, i) => (
        <article className="card" key={String(p.name) + i}>
          <div className="badges"><span className="badge">{String(p.category || "Plugin")}</span></div>
          <h3>{String(p.name || "")}</h3>
          <p>{String(p.description || "")}</p>
          <p className="cmd-label">Claude Code</p>
          <Cmd text={"/plugin install " + p.name + "@solenix"} />
          <p className="cmd-label">Codex / ChatGPT</p>
          <Cmd text={"codex plugin add " + p.name + "@solenix"} />
          <a href={sourceUrl(p.source)}>Source →</a>
        </article>
      ))}
    </div>
  );
}

/** One document-level listener for every Copy button, as before. */
export function CopyButtons() {
  useEffect(() => {
    const status = document.getElementById("copy-status");
    const onClick = async (e: MouseEvent) => {
      const btn = (e.target as Element | null)?.closest<HTMLButtonElement>(".copy");
      if (!btn) return;
      const text = btn.previousElementSibling?.textContent ?? "";
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied";
        if (status) status.textContent = "Copied to clipboard";
      } catch {
        btn.textContent = "Select it";
      }
      setTimeout(() => { btn.textContent = "Copy"; }, 1600);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return <p className="sr-only" id="copy-status" aria-live="polite"></p>;
}
