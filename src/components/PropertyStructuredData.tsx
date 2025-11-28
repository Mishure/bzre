'use client';

import { Property } from '@/types/property';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslateContent } from '@/hooks/useTranslateContent';
import { useEffect } from 'react';

interface PropertyStructuredDataProps {
  property: Property;
}

export default function PropertyStructuredData({ property }: PropertyStructuredDataProps) {
  const { language } = useLanguage();
  const translatedName = useTranslateContent(property.name);
  const translatedDescription = useTranslateContent(property.description);
  const translatedStreet = useTranslateContent(property.street);

  useEffect(() => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': property.operationType === 'VANZARE' ? 'RealEstateListing' : 'RentalListing',
      name: translatedName || property.name,
      description: translatedDescription || property.description || '',
      url: `https://www.camimob.ro/properties/${property.id}`,
      image: property.images?.[0] || '',
      address: {
        '@type': 'PostalAddress',
        streetAddress: translatedStreet || property.street,
        addressLocality: property.locality || 'Buzău',
        addressRegion: 'Buzău',
        postalCode: property.postalCode || '',
        addressCountry: 'RO'
      },
      geo: property.latitude && property.longitude ? {
        '@type': 'GeoCoordinates',
        latitude: property.latitude,
        longitude: property.longitude
      } : undefined,
      floorSize: property.surface ? {
        '@type': 'QuantitativeValue',
        value: property.surface,
        unitCode: 'MTK'
      } : undefined,
      numberOfRooms: property.rooms || undefined,
      price: property.price,
      priceCurrency: property.currency || 'RON',
      offers: {
        '@type': 'Offer',
        price: property.price,
        priceCurrency: property.currency || 'RON',
        availability: 'https://schema.org/InStock',
        url: `https://www.camimob.ro/properties/${property.id}`
      },
      ...(property.propertyType && {
        additionalType: property.propertyType === 'APARTAMENT' ? 'Apartment' :
                        property.propertyType === 'CASA' ? 'House' :
                        property.propertyType === 'TEREN' ? 'LandParcel' :
                        'CommercialRealEstate'
      })
    };

    // Remove undefined values
    const cleanedData = JSON.parse(JSON.stringify(structuredData));

    // Create or update script tag
    let script = document.getElementById('property-structured-data');
    if (!script) {
      script = document.createElement('script');
      script.id = 'property-structured-data';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(cleanedData);

    return () => {
      // Cleanup on unmount
      const scriptElement = document.getElementById('property-structured-data');
      if (scriptElement) {
        scriptElement.remove();
      }
    };
  }, [property, translatedName, translatedDescription, translatedStreet, language]);

  return null;
}
