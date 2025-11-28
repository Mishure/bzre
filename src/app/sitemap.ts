import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.camimob.ro';
  const languages = ['ro', 'en'];

  // Helper function to create multilingual page entries
  const createMultilingualEntry = (path: string, priority: number, changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never') => {
    return languages.map(lang => ({
      url: `${baseUrl}${path}${lang === 'ro' ? '' : `?lang=${lang}`}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    }));
  };

  // Static pages with multilingual support
  const staticPages: MetadataRoute.Sitemap = [
    ...createMultilingualEntry('', 1, 'daily'), // Home page
    ...createMultilingualEntry('/about', 0.8, 'monthly'),
    ...createMultilingualEntry('/contact', 0.8, 'monthly'),
    ...createMultilingualEntry('/properties', 0.9, 'daily'),
    ...createMultilingualEntry('/properties/map-view', 0.9, 'daily'),
    ...createMultilingualEntry('/listeaza-proprietate', 0.7, 'monthly'),
    ...createMultilingualEntry('/termeni-si-conditii', 0.3, 'yearly'),
    // Services pages
    ...createMultilingualEntry('/services/evaluation', 0.7, 'monthly'),
    ...createMultilingualEntry('/services/exclusivity', 0.7, 'monthly'),
    ...createMultilingualEntry('/services/consulting', 0.7, 'monthly'),
    ...createMultilingualEntry('/services/legal', 0.7, 'monthly'),
    ...createMultilingualEntry('/services/commissions', 0.7, 'monthly'),
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

    // Create multilingual entries for each property
    propertyPages = properties.flatMap((property) =>
      languages.map(lang => ({
        url: `${baseUrl}/properties/${property.id}${lang === 'ro' ? '' : `?lang=${lang}`}`,
        lastModified: property.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    );
  } catch (error) {
    console.error('Error fetching properties for sitemap:', error);
    // Return static pages even if database fetch fails
  }

  return [...staticPages, ...propertyPages];
}
