import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ICONS, OG_IMAGE } from "@/lib/site-meta";
import { FONT_CSS, FONT_PRELOAD } from "@/lib/site-fonts";
import { sunGradient } from "@/lib/site-nav";

export const metadata: Metadata = {
  metadataBase: new URL("https://solenix.dev"),
  title: { default: "Solenix · the tech person your business does not have", template: "%s · Solenix" },
  description:
    "One person who knows which of your tools already talk to each other, sets up AI on them, teaches your team, and keeps it all running. St. John's, Newfoundland.",
  icons: ICONS,
  openGraph: { type: "website", siteName: "Solenix", images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", images: [OG_IMAGE.url] },
};

// The portal follows the device; the public site declares dark in its own layout.
export const viewport: Viewport = { colorScheme: "light dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Sora, per DESIGN.md §2: served from the site itself (lib/site-fonts.ts); never swaps. */}
        <link rel="preload" href={FONT_PRELOAD} as="font" type="font/woff2" crossOrigin="" />
        <link rel="stylesheet" href={FONT_CSS} />
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
