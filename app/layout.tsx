import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://solenix.dev"),
  title: { default: "Solenix · the tech person your business does not have", template: "%s · Solenix" },
  description:
    "One person who knows which of your tools already talk to each other, sets up AI on them, teaches your team, and keeps it all running. St. John's, Newfoundland.",
  icons: {
    icon: [
      { url: "/brand/out/logo-dark.svg", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
      { url: "/brand/out/logo-light.svg", type: "image/svg+xml" },
    ],
    apple: "/brand/out/apple-touch-icon.png",
  },
};

export const viewport: Viewport = { colorScheme: "light dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" suppressHydrationWarning>
      <head>
        {/* Sora, per DESIGN.md §2: variable 400–800, system fallback renders first. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400..800&display=swap" />
        {/* Marks the page as scripted before paint, so reveals can hide safely. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-dvh">
        {/* tokens.css reads [data-theme]; next-themes owns it and the saved choice. */}
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SharedDefs />
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

/** Gradients referenced by url(#…) across the site: the mark's sun and the sparkline fill. */
function SharedDefs() {
  return (
    <svg aria-hidden="true" focusable="false" className="absolute size-0 overflow-hidden">
      <defs>
        <radialGradient id="sun" cx=".42" cy=".38" r=".62">
          <stop offset="0" style={{ stopColor: "var(--sun1)" }} />
          <stop offset="1" style={{ stopColor: "var(--sun2)" }} />
        </radialGradient>
        <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--spark-line)", stopOpacity: 0.22 }} />
          <stop offset="1" style={{ stopColor: "var(--spark-line)", stopOpacity: 0 }} />
        </linearGradient>
      </defs>
    </svg>
  );
}
