import type { Metadata, Viewport } from "next";
import "@/design/tokens.css";
import "./portal.css";

// The portal's own root layout. It shares nothing with the public site's
// stylesheet: tokens.css first, then the portal styles from the design session.

export const metadata: Metadata = {
  title: { default: "Your Solenix portal", template: "%s · Solenix portal" },
  description: "Your website's health and your invoices, in one place.",
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: "/brand/out/logo-dark.svg", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
      { url: "/brand/out/logo-light.svg", type: "image/svg+xml" },
    ],
    apple: "/brand/out/apple-touch-icon.png",
  },
};

export const viewport: Viewport = { colorScheme: "light dark" };

// Applies a saved theme before first paint, so a dark-theme reader never sees a light flash.
const THEME_SCRIPT = `try{var t=localStorage.getItem("solenix-theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400..800&display=swap" />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <svg aria-hidden="true" focusable="false" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
          <defs>
            <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: "var(--spark-line)", stopOpacity: 0.2 }} />
              <stop offset="1" style={{ stopColor: "var(--spark-line)", stopOpacity: 0 }} />
            </linearGradient>
          </defs>
        </svg>
        {children}
      </body>
    </html>
  );
}
