import type { Metadata } from "next";
import SeoLandingPage from "@/components/seo/SeoLandingPage";
import { buildSeoPageMetadata, getSeoPageBySlug } from "@/lib/seoPages";

const SLUG = "apartamente-2-camere-buzau";

export const revalidate = 3600;

export function generateMetadata(): Promise<Metadata> {
  return buildSeoPageMetadata(SLUG);
}

export default function Page() {
  const config = getSeoPageBySlug(SLUG)!;
  return <SeoLandingPage config={config} />;
}
