import type { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";
import { getSeoPageBySlug } from "@/lib/seoPages";

const SLUG = "apartamente-micro-14-buzau";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const config = getSeoPageBySlug(SLUG)!;
  return {
    title: config.title,
    description: config.description,
    alternates: { canonical: `/${config.slug}` },
    openGraph: {
      title: config.title,
      description: config.description,
      url: `https://www.camimob.ro/${config.slug}`,
      type: "website",
    },
  };
}

export default function Page() {
  const config = getSeoPageBySlug(SLUG)!;
  return <SeoLandingPage config={config} />;
}
