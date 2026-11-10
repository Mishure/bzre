import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PropertyDetailView, {
  type PropertyViewModel,
} from "@/components/properties/PropertyDetailView";
import { generateSeoIntro } from "@/lib/seoDescription";

export const revalidate = 600;

async function getProperty(idStr: string) {
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) return null;
  // Must match the `status: 'ACTIVE'` filter in layout.tsx — otherwise a sold
  // or inactive listing renders full content under the "Proprietate negăsită"
  // title and stays indexable.
  return prisma.property.findUnique({
    where: { id, status: "ACTIVE" },
    include: { images: { orderBy: { order: "asc" } } },
  });
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

  const seoIntro = generateSeoIntro({
    propertyType: property.propertyType,
    operationType: property.operationType,
    rooms: property.rooms,
    zone: property.zone,
    locality: property.locality,
    surface: property.surface,
    price: property.price,
    currency: property.currency,
  });

  const viewModel: PropertyViewModel = {
    id: property.id,
    name: property.name,
    price: property.price,
    currency: property.currency,
    zone: property.zone,
    street: property.street,
    locality: property.locality,
    surface: property.surface,
    rooms: property.rooms,
    floor: property.floor,
    totalFloors: property.totalFloors,
    operationType: property.operationType,
    propertyType: property.propertyType,
    description: property.description,
    features: property.features,
    images: property.images.map((img) => ({
      url: img.url,
      isPrimary: img.isPrimary,
    })),
    createdAt: property.createdAt.toISOString(),
    seoIntro,
  };

  return <PropertyDetailView property={viewModel} />;
}
