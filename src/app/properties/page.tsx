import { prisma } from '@/lib/prisma';
import { withRetry } from '@/lib/db-retry';
import PropertiesBrowser from '@/components/properties/PropertiesBrowser';
import type { Property } from '@/types/property';

// Listing changes whenever a property is added or edited in admin.
export const revalidate = 600;

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Fetches the listing server-side so the offers end up in the HTML Googlebot
 * receives. Mirrors the filters GET /api/properties applies, because the
 * client re-fetches through that route once the user changes the filters.
 */
async function getProperties(searchParams: SearchParams): Promise<Property[]> {
  const where: Record<string, unknown> = { status: 'ACTIVE' };

  const type = one(searchParams.type);
  const operation = one(searchParams.operation);
  const zone = one(searchParams.zone);

  if (type) where.propertyType = type.toUpperCase();
  if (operation) where.operationType = operation.toUpperCase();
  if (zone) where.zone = zone;

  try {
    const rows = await withRetry(async () =>
      prisma.property.findMany({
        where,
        include: { images: { where: { isPrimary: true }, take: 1 } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
    );

    return rows.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      currency: (p as { currency?: string }).currency,
      zone: p.zone || '',
      comfort: p.comfort || undefined,
      street: p.street ?? '',
      surface: p.surface,
      rooms: p.rooms ?? 0,
      floor: p.floor ?? undefined,
      totalFloors: p.totalFloors ?? undefined,
      position: p.position || undefined,
      locality: p.locality,
      operationType: p.operationType,
      propertyType: p.propertyType,
      latitude: p.latitude ?? undefined,
      longitude: p.longitude ?? undefined,
      images: p.images.map((img) => ({ url: img.url, isPrimary: img.isPrimary })),
      description: p.description || undefined,
      features: p.features || undefined,
      createdAt: p.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching properties for listing:', error);
    // Render the page shell; the client effect will retry via the API.
    return [];
  }
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const properties = await getProperties(params);

  return <PropertiesBrowser initialProperties={properties} />;
}
