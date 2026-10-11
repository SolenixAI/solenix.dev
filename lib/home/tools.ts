// The homepage's tool picker (#tools in design/home.html): one tab per tool, each with its finished result already in
// the page. A pick shows its panel at once and sends the 3D world to that tool (window.solenix.pick, read by
// lib/home/ui.ts). Arrow keys, Home and End move between the tabs, as the ARIA tabs pattern expects. startTools()
// runs when the homepage mounts (lib/home/attach.ts); the function it returns removes every listener it added.
import { listener } from "./listen";

/** Sent on window when the picked tool changes; lib/home/ui.ts moves the camera on it. */
export const PICK_EVENT = "solenix:pick";

export function startTools(S: Solenix): () => void {
  const l = listener();
  const tabs = [...document.querySelectorAll<HTMLButtonElement>('#tools [role="tab"]')];
  const select = (tab: HTMLButtonElement, focus: boolean) => {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')!)!.toggleAttribute('data-off', !on);
    }
    S.pick = Number(tab.dataset.world);
    if (focus) tab.focus({ preventScroll: true });
    dispatchEvent(new Event(PICK_EVENT));
  };
  const KEYS: Record<string, (i: number) => number> = { ArrowRight: (i) => i + 1, ArrowLeft: (i) => i - 1, Home: () => 0, End: () => tabs.length - 1 };
  tabs.forEach((t, i) => {
    l.on(t, 'click', () => select(t, false));
    l.on(t, 'keydown', (e: KeyboardEvent) => {
      const move = KEYS[e.key];
      if (!move || e.altKey || e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      select(tabs[(move(i) + tabs.length) % tabs.length], true);
    });
  });
  const open = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
  if (open) S.pick = Number(open.dataset.world);
  return () => l.stop();
}
