import type { Metadata } from "next";
import { Finish } from "./finish";

export const metadata: Metadata = { title: "Signing you in" };

export default function FinishPage() {
  return (
    <div className="app is-signedout">
      <main className="signin" id="main">
        <div className="signin-card">
          <Finish />
        </div>
      </main>
    </div>
  );
}
