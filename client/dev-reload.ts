// Development only: lib/site-page.ts adds this to every raw HTML page while `next dev` runs, so a saved
// change shows up in the open tab with no manual reload. It listens to one Server-Sent Events stream
// (app/dev/reload/route.ts): "change" on every save of a page source, and "hello" on connect with the
// dev server's start time. A new start time means the server restarted onto new code, so reload too.
// Only the top window listens, once: a page inside an iframe is reloaded by its parent, and the React homepage
// runs this same script (components/home/dev-reload.tsx), so the stream count stays at one per tab (browsers
// allow six connections per origin).

const tab = window as Window & { __devReload?: true }
if (window.self === window.top && !tab.__devReload) {
  tab.__devReload = true
  let start: string | null = null
  const source = new EventSource("/dev/reload")
  source.addEventListener("hello", (e: MessageEvent<string>) => {
    if (start !== null && start !== e.data) location.reload()
    start = e.data
  })
  source.addEventListener("change", () => location.reload())
}
