import type { Metadata } from "next";
import { DevReload } from "@/components/home/dev-reload";
import { HomeBinding } from "@/components/home/binding";
import { homeSource } from "@/lib/home/source";
import { OG_IMAGE, SITE_URL } from "@/lib/site-meta";
import { homeSchema, ldJson } from "@/lib/site-schema";

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
    alternates: { canonical: `${SITE_URL}/` },
    openGraph: { type: "website", siteName: "Solenix", title, description, url: `${SITE_URL}/`, images: [OG_IMAGE] },
  };
}

export default async function Home() {
  const { css, body, description } = await homeSource();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(homeSchema(description)) }} />
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <HomeBinding />
      {process.env.NODE_ENV === "development" ? <DevReload /> : null}
    </>
  );
}
