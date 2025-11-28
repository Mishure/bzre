'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  MagnifyingGlassIcon,
  MapIcon,
  ListBulletIcon,
  FunnelIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import PropertyCard from '@/components/PropertyCard';

const DynamicPropertyMap = dynamic(() => import('@/components/map/PropertyMap').then(mod => ({ default: mod.DynamicPropertyMap })), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
});

import { Property } from '@/types/property';

interface FilterState {
  search: string;
  propertyType: string;
  operationType: string;
  zone: string;
  minPrice: string;
  maxPrice: string;
  minRooms: string;
  maxRooms: string;
  minSurface: string;
  maxSurface: string;
}

const zones = [
  'Centru', 'Micro 3', 'Micro 4', 'Micro 5', 'Micro 6',
  'Unirii', 'Dorobanti', 'Bdul Bucuresti', 'Victoriei',
  'Nord', 'Sud', 'Est', 'Vest', 'Marginal', 'Zona Industriala'
];

function PropertiesContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();

  const propertyTypes = [
    { id: 'APARTAMENT', name: t('propertyTypes.APARTAMENT') },
    { id: 'CASA', name: t('propertyTypes.CASA') },
    { id: 'TEREN', name: t('propertyTypes.TEREN') },
    { id: 'SPATIU_COMERCIAL', name: t('propertyTypes.SPATIU_COMERCIAL') },
  ];

  const operations = [
    { id: 'VANZARE', name: t('operations.VANZARE') },
    { id: 'INCHIRIERE', name: t('operations.INCHIRIERE') },
  ];
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    propertyType: searchParams.get('type') || '',
    operationType: searchParams.get('operation') || '',
    zone: searchParams.get('zone') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRooms: searchParams.get('minRooms') || '',
    maxRooms: searchParams.get('maxRooms') || '',
    minSurface: searchParams.get('minSurface') || '',
    maxSurface: searchParams.get('maxSurface') || '',
  });

  // Sync filters with URL params when they change
  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      propertyType: searchParams.get('type') || '',
      operationType: searchParams.get('operation') || '',
      zone: searchParams.get('zone') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      minRooms: searchParams.get('minRooms') || '',
      maxRooms: searchParams.get('maxRooms') || '',
      minSurface: searchParams.get('minSurface') || '',
      maxSurface: searchParams.get('maxSurface') || '',
    });
  }, [searchParams]);

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);

      try {
        // Build query params from URL searchParams
        const params = new URLSearchParams();
        params.set('limit', '100'); // Get more properties for public view
        params.set('status', 'ACTIVE'); // Only show active properties
        params.set('lang', language); // Server-side translation for SEO

        const type = searchParams.get('type');
        const operation = searchParams.get('operation');
        const zone = searchParams.get('zone');

        if (type) params.set('type', type);
        if (operation) params.set('operation', operation);
        if (zone) params.set('zone', zone);

        const response = await fetch(`/api/properties?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }

        const data = await response.json();
        setProperties(data.properties || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams, language]);

  // Apply client-side filters (in addition to URL params already sent to API)
  useEffect(() => {
    let filtered = [...properties];

    // Only apply additional filters that are not in URL params
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      console.log('Searching for:', searchTerm, 'in', properties.length, 'properties');

      filtered = filtered.filter(property => {
        // Search in basic fields
        const matchesBasic =
          property.name.toLowerCase().includes(searchTerm) ||
          property.street.toLowerCase().includes(searchTerm) ||
          property.zone.toLowerCase().includes(searchTerm) ||
          property.description?.toLowerCase().includes(searchTerm);

        // Search in features
        let matchesFeatures = false;
        if (property.features) {
          try {
            const features = typeof property.features === 'string'
              ? JSON.parse(property.features)
              : property.features;

            if (Array.isArray(features)) {
              matchesFeatures = features.some(feature =>
                feature.toLowerCase().includes(searchTerm)
              );
              if (matchesFeatures) {
                console.log('✓ Found in features:', property.name, 'features:', features);
              }
            } else if (typeof features === 'object') {
              matchesFeatures = JSON.stringify(features).toLowerCase().includes(searchTerm);
            }
          } catch (e) {
            // If features can't be parsed, try string search
            matchesFeatures = typeof property.features === 'string'
              ? property.features.toLowerCase().includes(searchTerm)
              : false;
          }
        }

        const matches = matchesBasic || matchesFeatures;
        return matches;
      });

      console.log('Filter results:', filtered.length, 'properties match');
    }

    // Property type filter (only if different from URL param)
    if (filters.propertyType && filters.propertyType.toUpperCase() !== searchParams.get('type')?.toUpperCase()) {
      filtered = filtered.filter(property => property.propertyType === filters.propertyType.toUpperCase());
    }

    // Operation type filter (only if different from URL param)
    if (filters.operationType && filters.operationType.toUpperCase() !== searchParams.get('operation')?.toUpperCase()) {
      filtered = filtered.filter(property => property.operationType === filters.operationType.toUpperCase());
    }

    // Zone filter (only if different from URL param)
    if (filters.zone && filters.zone !== searchParams.get('zone')) {
      filtered = filtered.filter(property => property.zone === filters.zone);
    }

    // Price filters
    if (filters.minPrice) {
      filtered = filtered.filter(property => property.price >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(property => property.price <= parseInt(filters.maxPrice));
    }

    // Rooms filters
    if (filters.minRooms) {
      filtered = filtered.filter(property => property.rooms >= parseInt(filters.minRooms));
    }
    if (filters.maxRooms) {
      filtered = filtered.filter(property => property.rooms <= parseInt(filters.maxRooms));
    }

    // Surface filters
    if (filters.minSurface) {
      filtered = filtered.filter(property => property.surface >= parseInt(filters.minSurface));
    }
    if (filters.maxSurface) {
      filtered = filtered.filter(property => property.surface <= parseInt(filters.maxSurface));
    }

    setFilteredProperties(filtered);
  }, [properties, filters, searchParams]);

  const toggleFavorite = (propertyId: number) => {
    setFavorites(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      propertyType: '',
      operationType: '',
      zone: '',
      minPrice: '',
      maxPrice: '',
      minRooms: '',
      maxRooms: '',
      minSurface: '',
      maxSurface: '',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('properties.availableProperties')}</h1>
            <p className="mt-2 text-gray-600">{filteredProperties.length} {t('properties.propertiesFound')}</p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>{t('properties.filters')}</span>
            </button>
            
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'} rounded-l-lg`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-2 ${viewMode === 'map' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'} rounded-r-lg`}
              >
                <MapIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('properties.search')}</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('properties.searchPlaceholder')}
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('properties.propertyType')}</label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">{t('properties.allTypes')}</option>
                  {propertyTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('properties.operation')}</label>
                <select
                  value={filters.operationType}
                  onChange={(e) => handleFilterChange('operationType', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">{t('properties.all')}</option>
                  {operations.map(op => (
                    <option key={op.id} value={op.id}>{op.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('properties.zone')}</label>
                <select
                  value={filters.zone}
                  onChange={(e) => handleFilterChange('zone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">{t('properties.allZones')}</option>
                  {zones.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('properties.minPrice')}</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('properties.maxPrice')}</label>
                <input
                  type="number"
                  placeholder="1000000"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('properties.minRooms')}</label>
                <input
                  type="number"
                  placeholder="1"
                  value={filters.minRooms}
                  onChange={(e) => handleFilterChange('minRooms', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('properties.minSurface')}</label>
                <input
                  type="number"
                  placeholder="30"
                  value={filters.minSurface}
                  onChange={(e) => handleFilterChange('minSurface', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                {t('properties.clearAllFilters')}
              </button>
            </div>
          </div>
        )}

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="mb-8">
            <DynamicPropertyMap 
              properties={filteredProperties}
              height="600px"
              showDrawTools={true}
              onPropertyClick={(property) => {
                // Navigate to property detail
                window.open(`/properties/${property.id}`, '_blank');
              }}
              onAreaDrawn={(polygon) => {
                // Filter properties within drawn area
                console.log('Area drawn:', polygon);
                // TODO: Implement area-based filtering
              }}
            />
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 bg-white">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorite={favorites.includes(property.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('properties.noPropertiesFound')}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('properties.noPropertiesMessage')}
            </p>
            <div className="mt-6">
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                {t('properties.clearAllFilters')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
      <PropertiesContent />
    </Suspense>
  );
}