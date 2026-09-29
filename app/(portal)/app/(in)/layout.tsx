import { redirect } from "next/navigation";
import { Shell } from "@/components/portal/shell";
import { getViewer } from "@/lib/portal";

// Everything behind sign-in. proxy.ts has already sent signed-out visitors to
// /app/login; this decides what a signed-in person may see.
export default async function SignedIn({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();

  // An invited client finishes the short setup form before anything else.
  if (!viewer.isAdmin && viewer.client && !viewer.client.onboarded_at) redirect("/app/welcome");

  if (!viewer.isAdmin && !viewer.client) {
    return (
      <Shell viewer={viewer}>
        <div className="page-head">
          <p className="eyebrow">Your portal</p>
          <h1>We could not find your project</h1>
          <p className="muted">
            You are signed in as {viewer.profile.email}, but no project is linked to that address yet.
            If we set you up under a different email, sign out and use that one. Otherwise, email us and we will sort it out today.
          </p>
        </div>
        <a className="btn btn-primary" href="mailto:hello@solenix.dev?subject=Portal%20access">Email hello@solenix.dev</a>
      </Shell>
    );
  }

  return <Shell viewer={viewer}>{children}</Shell>;
}
