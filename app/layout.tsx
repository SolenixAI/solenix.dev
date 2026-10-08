import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ICONS, OG_IMAGE } from "@/lib/site-meta";
import { sunGradient } from "@/lib/site-nav.mjs";

export const metadata: Metadata = {
  metadataBase: new URL("https://solenix.dev"),
  title: { default: "Solenix · the tech person your business does not have", template: "%s · Solenix" },
  description:
    "One person who knows which of your tools already talk to each other, sets up AI on them, teaches your team, and keeps it all running. St. John's, Newfoundland.",
  icons: ICONS,
  openGraph: { type: "website", siteName: "Solenix", images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", images: [OG_IMAGE.url] },
};

// Site and portal are dark only: the browser paints dark from the first frame.
export const viewport: Viewport = { colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" suppressHydrationWarning>
      <head>
        {/* Sora, per DESIGN.md §2: variable 400–800, system fallback renders first. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400..800&display=swap" />
        {/* Before first paint: mark the page as scripted (so reveals can hide safely)
            and apply a saved light/dark choice, so there is no flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body className="min-h-dvh">
        <SharedDefs />
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}

/** Gradients referenced by url(#…) across the site: the mark's sun and the sparkline fill. */
function SharedDefs() {
  return (
    <svg aria-hidden="true" focusable="false" className="absolute size-0 overflow-hidden">
      <defs dangerouslySetInnerHTML={{ __html: sunGradient("sun") }} />
      <defs>
        <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--spark-line)", stopOpacity: 0.22 }} />
          <stop offset="1" style={{ stopColor: "var(--spark-line)", stopOpacity: 0 }} />
        </linearGradient>
      </defs>
    </svg>
  );
}
