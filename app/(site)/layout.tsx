import type { Metadata, Viewport } from "next";
import { Analytics } from "./analytics";

// The public site: the same markup and the same /assets/site.css as the static
// pages it replaced. The portal under /app has its own root layout and styles.

export const metadata: Metadata = {
  metadataBase: new URL("https://solenix.dev"),
  icons: {
    icon: [
      { url: "/brand/out/logo-dark.svg", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
      { url: "/brand/out/logo-light.svg", type: "image/svg+xml" },
    ],
    apple: "/brand/out/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/assets/site.css" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
