'use client';

import Link from 'next/link';
import { HeartIcon, EyeIcon, HomeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Property } from '@/types/property';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslateContent, useTranslateArray } from '@/hooks/useTranslateContent';

interface PropertyCardProps {
  property: Property;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

export default function PropertyCard({ property, isFavorite, onToggleFavorite }: PropertyCardProps) {
  const { t } = useLanguage();

  // Translate property content
  const translatedName = useTranslateContent(property.name);
  const translatedStreet = useTranslateContent(property.street);

  // Get and translate features
  const getFeatures = (featuresJson?: string | string[]) => {
    if (!featuresJson) return [];
    if (Array.isArray(featuresJson)) return featuresJson;
    try {
      return JSON.parse(featuresJson);
    } catch {
      return [];
    }
  };

  const features = getFeatures(property.features);
  const translatedFeatures = useTranslateArray(features);

  const formatPrice = (price: number, currency: string = 'RON') => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Property Image */}
      <div className="relative h-48">
        <img
          src={typeof property.images?.[0] === 'string'
            ? property.images[0]
            : property.images?.[0]?.url || '/api/placeholder/400/300'}
          alt={`${translatedName} - ${property.propertyType}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
            property.operationType === 'VANZARE' ? 'bg-green-600' : 'bg-blue-600'
          }`}>
            {property.operationType === 'VANZARE' ? t('properties.forSale') : t('properties.forRent')}
          </span>
        </div>
        <button
          onClick={() => onToggleFavorite(property.id)}
          className="absolute top-3 right-3 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
        >
          {isFavorite ? (
            <HeartSolidIcon className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Property Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {translatedName}
          </h3>
        </div>

        <p className="text-2xl font-bold text-primary-600 mb-3">
          {formatPrice(property.price, property.currency || 'RON')}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <HomeIcon className="h-4 w-4 mr-2" />
            <span>{translatedStreet}, {property.zone}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {property.propertyType === 'TEREN' || property.propertyType === 'SPATIU_COMERCIAL'
                ? (property.propertyType === 'TEREN' ? t('properties.land2') : t('properties.commercialSpace'))
                : (property.rooms && property.rooms > 0 ? `${property.rooms} ${t('properties.rooms')}` : t('properties.property'))
              }
            </span>
            <span>{property.surface} m²</span>
          </div>
        </div>

        {/* Features */}
        {translatedFeatures.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {translatedFeatures.slice(0, 3).map((feature: string, index: number) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                >
                  {feature}
                </span>
              ))}
              {translatedFeatures.length > 3 && (
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  +{translatedFeatures.length - 3} {t('properties.more')}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <Link
            href={`/properties/${property.id}`}
            className="flex-1 bg-primary-600 text-white text-center py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {t('properties.viewDetails')}
          </Link>
          <Link
            href={`/properties/map-view?propertyId=${property.id}`}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title={t('properties.viewOnMap')}
          >
            <EyeIcon className="h-5 w-5 text-gray-600" />
          </Link>
        </div>
      </div>
    </div>
  );
}
