import type { Metadata } from "next";
import { Mark } from "@/components/portal/icons";
import { configured } from "@/lib/env";
import { safeNext } from "@/lib/origin";
import { LoginForm } from "./form";

export const metadata: Metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = {
  link: "That sign-in link has expired or was already used. Ask for a new one below.",
  google: "Google sign-in did not finish. Try again, or use an email link instead.",
  profile: "We could not load your account. Sign in again, and if it keeps happening, email hello@solenix.dev.",
};

export default async function Login({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  const error = sp.error ? ERRORS[sp.error] ?? ERRORS.link : null;

  return (
    <div className="app is-signedout">
      <main className="signin" id="main">
        <div className="signin-card">
          <a className="brand" href="/" aria-label="Solenix home">
            <Mark id="sg-login" />
            <span>Solenix</span>
          </a>

          <h1>Sign in to your portal</h1>
          <p className="lede">Your website and your invoices, in one place. There is no password to remember.</p>

          {!configured.supabase() ? (
            <p className="notice" style={{ marginTop: "var(--space-6)", marginBottom: 0 }}>
              <span><strong>Sign-in is not switched on yet.</strong> We are still connecting the portal. Email hello@solenix.dev if you need anything today.</span>
            </p>
          ) : (
            <LoginForm next={next} error={error} />
          )}

          <p className="foot">New here? <a href="mailto:hello@solenix.dev?subject=Book%20a%20call">Book a call</a> and we will set you up.</p>
        </div>
      </main>
    </div>
  );
}
