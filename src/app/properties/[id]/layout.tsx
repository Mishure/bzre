import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import PropertyJsonLd from '@/components/PropertyJsonLd';

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const property = await prisma.property.findUnique({
      where: {
        id: parseInt(id),
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        currency: true,
        propertyType: true,
        operationType: true,
        zone: true,
        locality: true,
        rooms: true,
        surface: true,
        images: {
          where: { isPrimary: true },
          select: { url: true },
          take: 1,
        },
      },
    });

    if (!property) {
      return {
        title: 'Proprietate negăsită | BESTINVEST CAMIMOB',
        description: 'Această proprietate nu este disponibilă momentan.',
      };
    }

    const priceFormatted = new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: property.currency || 'RON',
    }).format(property.price);

    const propertyTypeMap: Record<string, string> = {
      'APARTAMENT': 'Apartament',
      'CASA': 'Casă',
      'TEREN': 'Teren',
      'SPATIU_COMERCIAL': 'Spațiu comercial',
    };

    const operationTypeMap: Record<string, string> = {
      'VANZARE': 'de vânzare',
      'INCHIRIERE': 'de închiriat',
    };

    const propertyTypeName = propertyTypeMap[property.propertyType] || property.propertyType;
    const operationName = operationTypeMap[property.operationType] || property.operationType;

    const title = `${property.name} - ${priceFormatted} | BESTINVEST CAMIMOB`;
    const description = property.description
      ? property.description.substring(0, 155) + (property.description.length > 155 ? '...' : '')
      : `${propertyTypeName} ${operationName} în ${property.locality}, ${property.zone}. Suprafață ${property.surface} mp${property.rooms ? `, ${property.rooms} camere` : ''}. Preț: ${priceFormatted}.`;

    const imageUrl = property.images[0]?.url || 'https://www.camimob.ro/imagecam.png';

    return {
      title,
      description,
      keywords: `${propertyTypeName} ${property.locality}, ${propertyTypeName} ${property.zone}, ${property.operationType.toLowerCase()} ${propertyTypeName.toLowerCase()} Buzau, imobiliare ${property.locality}`,
      openGraph: {
        title,
        description,
        url: `https://www.camimob.ro/properties/${property.id}`,
        siteName: 'BESTINVEST CAMIMOB',
        locale: 'ro_RO',
        type: 'website',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: property.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: `https://www.camimob.ro/properties/${property.id}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata for property:', error);
    return {
      title: 'Proprietate | BESTINVEST CAMIMOB',
      description: 'Descoperă această proprietate pe site-ul BESTINVEST CAMIMOB.',
    };
  }
}

export default async function PropertyLayout({ children, params }: Props) {
  const { id } = await params;

  // Fetch property data for JSON-LD
  let property = null;
  try {
    property = await prisma.property.findUnique({
      where: {
        id: parseInt(id),
        status: 'ACTIVE',
      },
      include: {
        images: {
          orderBy: [
            { isPrimary: 'desc' },
            { order: 'asc' },
          ],
        },
      },
    });
  } catch (error) {
    console.error('Error fetching property for JSON-LD:', error);
  }

  return (
    <>
      {property && <PropertyJsonLd property={property} />}
      {children}
    </>
  );
}
