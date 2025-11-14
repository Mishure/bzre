import { Property, PropertyImage } from '@prisma/client';

interface PropertyWithImages extends Property {
  images: PropertyImage[];
}

interface PropertyJsonLdProps {
  property: PropertyWithImages;
}

export default function PropertyJsonLd({ property }: PropertyJsonLdProps) {
  const baseUrl = 'https://www.camimob.ro';

  const propertyTypeMap: Record<string, string> = {
    'APARTAMENT': 'Apartment',
    'CASA': 'House',
    'TEREN': 'LandParcel',
    'SPATIU_COMERCIAL': 'Store',
  };

  const operationTypeMap: Record<string, string> = {
    'VANZARE': 'https://schema.org/SaleEvent',
    'INCHIRIERE': 'https://schema.org/RentAction',
  };

  // Get primary image or first image
  const primaryImage = property.images.find(img => img.isPrimary)?.url
    || property.images[0]?.url
    || `${baseUrl}/imagecam.png`;

  const allImages = property.images.length > 0
    ? property.images.map(img => img.url)
    : [primaryImage];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': propertyTypeMap[property.propertyType] || 'Product',
    '@id': `${baseUrl}/properties/${property.id}`,
    name: property.name,
    description: property.description || `${property.propertyType} în ${property.locality}, ${property.zone}`,
    url: `${baseUrl}/properties/${property.id}`,
    image: allImages,
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.street || '',
      addressLocality: property.locality,
      addressRegion: property.zone || '',
      addressCountry: 'RO',
    },
    ...(property.latitude && property.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: property.latitude,
        longitude: property.longitude,
      },
    }),
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.surface,
      unitCode: 'MTK', // Square meters
    },
    ...(property.rooms && {
      numberOfRooms: property.rooms,
    }),
    ...(property.floor && {
      floorLevel: property.floor,
    }),
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: property.currency || 'RON',
      availability: property.status === 'ACTIVE'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
      seller: {
        '@type': 'RealEstateAgent',
        name: 'BESTINVEST CAMIMOB',
        url: baseUrl,
        telephone: '+40-773-723-654',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Buzău',
          addressCountry: 'RO',
        },
      },
      url: `${baseUrl}/properties/${property.id}`,
    },
    ...(property.yearBuilt && {
      yearBuilt: property.yearBuilt,
    }),
    ...(property.condition && {
      itemCondition: property.condition === 'NOU'
        ? 'https://schema.org/NewCondition'
        : 'https://schema.org/UsedCondition',
    }),
    ...(property.heating && {
      heatingType: property.heating,
    }),
    datePosted: property.createdAt.toISOString(),
    dateModified: property.updatedAt.toISOString(),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
