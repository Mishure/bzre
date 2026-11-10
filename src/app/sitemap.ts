import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { SEO_PAGES, countSeoProperties } from '@/lib/seoPages';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.camimob.ro';

  // Landing pages with zero active offers are served as `noindex` (see
  // lib/seoPages.ts), so they must not be advertised in the sitemap either.
  // A `null` count means the database was unreachable — keep the URL in that
  // case rather than silently shrinking the sitemap.
  const seoCounts = await Promise.all(
    SEO_PAGES.map((p) => countSeoProperties(p.filter))
  );

  const seoLandingPages: MetadataRoute.Sitemap = SEO_PAGES.filter(
    (_, i) => seoCounts[i] !== 0
  ).map((p) => ({
    url: `${baseUrl}/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }));

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/properties/map-view`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/listeaza-proprietate`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/termeni-si-conditii`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // Services pages
    {
      url: `${baseUrl}/services/evaluation`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/exclusivity`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/consulting`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/legal`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/commissions`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Fetch all active properties from database
  let propertyPages: MetadataRoute.Sitemap = [];

  try {
    const properties = await prisma.property.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        updatedAt: true,
        propertyType: true,
        operationType: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    propertyPages = properties.map((property) => ({
      url: `${baseUrl}/properties/${property.id}`,
      lastModified: property.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error fetching properties for sitemap:', error);
    // Return static pages even if database fetch fails
  }

  return [...staticPages, ...seoLandingPages, ...propertyPages];
}
