import type { Metadata } from "next";
import { DevReload } from "@/components/home/dev-reload";
import { HomeBinding } from "@/components/home/binding";
import { homeSource } from "@/lib/home/source";
import { homeStructuredData, jsonLd } from "@/lib/structured-data";
import { HOME_URL, OG_IMAGE } from "@/lib/site-meta";

// The homepage. Its markup and CSS are design/home.html, the one source (lib/home/source.ts); the world's stage and
// its first-frame still are components/space/. It renders inside the site layout (app/(site)/layout.tsx), which keeps the 3D world; the homepage binds to that world while it is shown
// and unbinds when it leaves (components/home/binding.tsx).
export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await homeSource();
  return {
    title: { absolute: title },
    description,
    // Next merges metadata one key at a time: the page restates the root's Open Graph values, or they are lost.
    // Next writes a root URL without its slash, so the canonical and og:url are set in the page (below), in the one root form.
    openGraph: { type: "website", siteName: "Solenix", title, description, images: [OG_IMAGE] },
  };
}

export default async function Home() {
  const { css, body } = await homeSource();
  return (
    <>
      <link rel="canonical" href={HOME_URL} />
      <meta property="og:url" content={HOME_URL} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(homeStructuredData(description)) }} />
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <HomeBinding />
      {process.env.NODE_ENV === "development" ? <DevReload /> : null}
    </>
  );
}
