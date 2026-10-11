// The raw pages' goal helper. POSTHOG_SNIPPET in lib/analytics.ts defines window.captureGoal on the live site only,
// so a call is optional. Types only: scripts/build-client.ts does not compile .d.ts files.
interface Window {
  captureGoal?: (goal: string) => void
}
