import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PropertyJsonLd from "@/components/PropertyJsonLd";
import PropertyDetailView, {
  type PropertyViewModel,
} from "@/components/properties/PropertyDetailView";
import {
  generateSeoIntro,
  generateSeoMetaDescription,
} from "@/lib/seoDescription";

export const revalidate = 600;

async function getProperty(idStr: string) {
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) return null;
  return prisma.property.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });
}

function formatPriceForTitle(price: number, currency = "RON"): string {
  const cur = currency === "EUR" ? "EUR" : currency === "USD" ? "USD" : "RON";
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: cur,
    maximumFractionDigits: 0,
  }).format(price);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) {
    return {
      title: "Proprietatea nu a fost găsită | CAMIMOB",
      robots: { index: false, follow: true },
    };
  }

  const priceStr = formatPriceForTitle(property.price, property.currency || "RON");
  const seoInput = {
    propertyType: property.propertyType,
    operationType: property.operationType,
    rooms: property.rooms,
    zone: property.zone,
    locality: property.locality,
    surface: property.surface,
    price: property.price,
    currency: property.currency,
  };
  const description = generateSeoMetaDescription(seoInput);
  const title = `${property.name} – ${priceStr} | CAMIMOB`;
  const canonicalPath = `/properties/${property.id}`;
  const primaryImage =
    property.images.find((img) => img.isPrimary)?.url ||
    property.images[0]?.url ||
    "/imagecam.png";

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url: `https://www.camimob.ro${canonicalPath}`,
      type: "website",
      images: [
        {
          url: primaryImage.startsWith("http")
            ? primaryImage
            : `https://www.camimob.ro${primaryImage}`,
          alt: property.name,
        },
      ],
    },
  };
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

  return (
    <>
      <PropertyJsonLd property={property} />
      <PropertyDetailView property={viewModel} />
    </>
  );
}
