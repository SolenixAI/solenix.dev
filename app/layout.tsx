import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ICONS, OG_IMAGE, SITE_URL } from "@/lib/site-meta";
import { FONT_CSS, FONT_PRELOAD } from "@/lib/site-fonts";
import { sunGradient } from "@/lib/site-nav";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Solenix · One tech expert for small businesses", template: "%s · Solenix" },
  description:
    "One person who knows which of your tools already talk to each other, sets up AI on them, teaches your team, and keeps it all running. St. John's, Newfoundland.",
  icons: ICONS,
  openGraph: { type: "website", siteName: "Solenix", locale: "en_CA", images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", images: [OG_IMAGE.url] },
};

// The site is dark only. Declared here, at the root, so every page is dark before first paint.
export const viewport: Viewport = { colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Sora, per DESIGN.md §2: served from the site itself (lib/site-fonts.ts); never swaps. */}
        <link rel="preload" href={FONT_PRELOAD} as="font" type="font/woff2" crossOrigin="" />
        <link rel="stylesheet" href={FONT_CSS} />
        {/* Before first paint: mark the page as scripted, so reveals can hide safely. Where WebGL runs, mark it type3d
            too: the world sets every visible word as 3D type, so the page's own words never show and never hand off
            to it (DESIGN.md, Decisions). lib/space/world.ts takes the mark off if the world cannot start. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var d=document.documentElement;d.classList.add('js');try{var g=document.createElement('canvas').getContext('webgl2');if(g){d.classList.add('type3d');var x=g.getExtension('WEBGL_lose_context');if(x)x.loseContext()}}catch(e){}})()",
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

/** Gradients referenced by url(#…) across the site: the mark's sun. */
function SharedDefs() {
  return (
    <svg aria-hidden="true" focusable="false" className="absolute size-0 overflow-hidden">
      <defs dangerouslySetInnerHTML={{ __html: sunGradient("sun") }} />
    </svg>
  );
}
