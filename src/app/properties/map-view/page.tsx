'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  HeartIcon,
  EyeIcon,
  HomeIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import dynamic from 'next/dynamic';
import { parseSearchQuery } from '@/lib/searchParser';

const DynamicPropertyMap = dynamic(() => import('@/components/map/WorkingMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Se încarcă harta...</p>
      </div>
    </div>
  )
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

const propertyTypes = [
  { id: 'APARTAMENT', name: 'Apartamente' },
  { id: 'CASA', name: 'Case' },
  { id: 'TEREN', name: 'Terenuri' },
  { id: 'SPATIU_COMERCIAL', name: 'Spații comerciale' },
];

const operations = [
  { id: 'VANZARE', name: 'Vânzare' },
  { id: 'INCHIRIERE', name: 'Închiriere' },
];

const zones = [
  'Centru', 'Micro 3', 'Micro 4', 'Micro 5', 'Micro 6', 
  'Unirii', 'Dorobanti', 'Bdul Bucuresti', 'Victoriei', 
  'Nord', 'Sud', 'Est', 'Vest', 'Marginal', 'Zona Industriala'
];

function MapViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quickSearch, setQuickSearch] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [visibleProperties, setVisibleProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    searchParams.get('propertyId') ? parseInt(searchParams.get('propertyId')!) : null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    propertyType: searchParams.get('propertyType') || searchParams.get('type') || '',
    operationType: searchParams.get('operation') || searchParams.get('operationType') || '',
    zone: searchParams.get('zone') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRooms: searchParams.get('minRooms') || searchParams.get('rooms') || '',
    maxRooms: searchParams.get('maxRooms') || '',
    minSurface: searchParams.get('minSurface') || '',
    maxSurface: searchParams.get('maxSurface') || '',
  });

  // Scroll to selected property when page loads with propertyId
  useEffect(() => {
    if (selectedPropertyId && !loading) {
      // Wait a bit for the DOM to be ready
      setTimeout(() => {
        const element = document.getElementById(`property-${selectedPropertyId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [selectedPropertyId, loading]);

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        console.log('Fetching properties from API...');

        // Build query parameters
        const params = new URLSearchParams();
        params.set('limit', '100'); // Get more properties for map view
        params.set('status', 'ACTIVE');

        const response = await fetch(`/api/properties?${params.toString()}`);
        const data = await response.json();

        console.log('API Response:', data);
        console.log('Properties loaded:', data.properties?.length || 0);

        setProperties(data.properties || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Filter properties based on current filters
  useEffect(() => {
    let filtered = [...properties];

    console.log('Filtering properties, total:', properties.length);

    // Check for search from URL params
    const urlSearch = searchParams.get('search');
    const searchTerm = (filters.search || urlSearch || '').toLowerCase();

    if (searchTerm) {
      console.log('Searching for:', searchTerm);
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
                console.log('Found in features:', property.name, 'features:', features);
              }
            } else if (typeof features === 'object') {
              matchesFeatures = JSON.stringify(features).toLowerCase().includes(searchTerm);
            }
          } catch (e) {
            matchesFeatures = typeof property.features === 'string'
              ? property.features.toLowerCase().includes(searchTerm)
              : false;
          }
        }

        return matchesBasic || matchesFeatures;
      });
      console.log('After search filter:', filtered.length);
    }

    if (filters.propertyType) {
      filtered = filtered.filter(property => property.propertyType === filters.propertyType);
      console.log('After property type filter:', filtered.length);
    }
    if (filters.operationType) {
      filtered = filtered.filter(property => property.operationType === filters.operationType);
      console.log('After operation type filter:', filtered.length);
    }
    if (filters.zone) {
      filtered = filtered.filter(property => property.zone === filters.zone);
      console.log('After zone filter:', filtered.length);
    }
    if (filters.minPrice) {
      filtered = filtered.filter(property => property.price >= parseInt(filters.minPrice));
      console.log('After min price filter:', filtered.length);
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(property => property.price <= parseInt(filters.maxPrice));
      console.log('After max price filter:', filtered.length);
    }
    if (filters.minRooms) {
      filtered = filtered.filter(property => property.rooms >= parseInt(filters.minRooms));
      console.log('After min rooms filter:', filtered.length);
    }
    if (filters.maxRooms) {
      filtered = filtered.filter(property => property.rooms <= parseInt(filters.maxRooms));
      console.log('After max rooms filter:', filtered.length);
    }

    console.log('Final filtered count:', filtered.length);
    setFilteredProperties(filtered);
    setVisibleProperties(filtered); // Initially show all filtered properties
  }, [properties, filters, searchParams]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(price);
  };

  const getFeatures = (featuresJson?: string | string[]) => {
    if (!featuresJson) return [];
    if (Array.isArray(featuresJson)) return featuresJson;
    try {
      return JSON.parse(featuresJson);
    } catch {
      return [];
    }
  };

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

  const handlePropertyClick = (property: Property) => {
    setSelectedPropertyId(property.id);
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      const element = document.getElementById(`property-${property.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'auto', block: 'center' });
      }
    });
  };

  const handleMapBoundsChange = (bounds: any) => {
    // Use requestAnimationFrame to defer this expensive operation
    requestAnimationFrame(() => {
      // Filter properties that are within the current map bounds
      const propertiesInView = filteredProperties.filter(property => {
        if (property.latitude && property.longitude) {
          let isInBounds = false;
          try {
            if (bounds && typeof bounds.contains === 'function') {
              isInBounds = bounds.contains([property.latitude, property.longitude]);
            } else if (bounds && bounds._southWest && bounds._northEast) {
              // Manual bounds checking if contains method isn't available
              const lat = property.latitude;
              const lng = property.longitude;
              isInBounds = lat >= bounds._southWest.lat && lat <= bounds._northEast.lat &&
                          lng >= bounds._southWest.lng && lng <= bounds._northEast.lng;
            }
          } catch (e) {
            isInBounds = true; // Default to showing the property if bounds check fails
          }
          return isInBounds;
        }
        return false;
      });
      
      setVisibleProperties(propertiesInView);
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex">
        <div className="flex-1 bg-gray-200 animate-pulse"></div>
        <div className="w-96 bg-gray-100 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex" style={{ height: 'calc(100vh - 80px)' }}>
      
      {/* Map Section - Left Side */}
      <div className="flex-1 relative">
        
        {/* Search Bar Overlay */}
        <div className="absolute top-4 left-4 right-4 z-[1000]">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ex: 2 camere centru, garsoniera sub 30000 euro, casa Brosteni..."
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const parsed = parseSearchQuery(quickSearch);
                      setFilters(prev => ({
                        ...prev,
                        propertyType: parsed.propertyType || prev.propertyType,
                        operationType: parsed.operation || prev.operationType,
                        zone: parsed.zone || prev.zone,
                        minPrice: parsed.minPrice || prev.minPrice,
                        maxPrice: parsed.maxPrice || prev.maxPrice,
                        minRooms: parsed.rooms || prev.minRooms,
                        search: parsed.keywords.join(' ') || prev.search
                      }));
                    }
                  }}
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900"
                />
              </div>
              
              <select
                value={filters.operationType}
                onChange={(e) => handleFilterChange('operationType', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900"
              >
                <option value="">Toate</option>
                {operations.map(op => (
                  <option key={op.id} value={op.id}>{op.name}</option>
                ))}
              </select>

              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900"
              >
                <option value="">Tip proprietate</option>
                {propertyTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 bg-white text-gray-700"
              >
                <FunnelIcon className="h-4 w-4" />
                <span>Mai multe filtre</span>
              </button>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <div className="mt-4 grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <input
                  type="number"
                  placeholder="Preț min (€)"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="number"
                  placeholder="Preț max (€)"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="number"
                  placeholder="Camere min"
                  value={filters.minRooms}
                  onChange={(e) => handleFilterChange('minRooms', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <select
                  value={filters.zone}
                  onChange={(e) => handleFilterChange('zone', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Toate zonele</option>
                  {zones.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <DynamicPropertyMap 
          properties={filteredProperties}
          height="100%"
          onPropertyClick={handlePropertyClick}
          onBoundsChange={handleMapBoundsChange}
        />

      </div>

      {/* Property List Sidebar - Right Side */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Proprietăți disponibile</h2>
          <p className="text-sm text-gray-600">{visibleProperties.length} rezultate</p>
        </div>

        {/* Properties List */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="divide-y divide-gray-200 bg-white">
            {visibleProperties
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((property) => {
            const features = getFeatures(property.features);
            const isFavorite = favorites.includes(property.id);
            
            return (
              <div 
                key={property.id} 
                id={`property-${property.id}`}
                className={`p-4 cursor-pointer transition-colors bg-white ${
                  selectedPropertyId === property.id 
                    ? 'bg-primary-50 border-l-4 border-primary-600' 
                    : 'hover:bg-gray-50'
                }`} 
                onClick={() => handlePropertyClick(property)}
              >
                <div className="flex space-x-3">
                  <div className="relative">
                    <img
                      src={typeof property.images?.[0] === 'string' ? property.images[0] : property.images?.[0]?.url}
                      alt={property.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="absolute top-1 left-1">
                      <span className={`px-1 py-0.5 text-xs font-medium text-white rounded ${
                        property.operationType === 'VANZARE' ? 'bg-green-600' : 'bg-blue-600'
                      }`}>
                        {property.operationType === 'VANZARE' ? 'V' : 'Î'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {property.name}
                    </h3>
                    <p className="text-xs text-gray-500">{property.street}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-bold text-primary-600">
                        {formatPrice(property.price)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(property.id);
                        }}
                        className="p-1"
                      >
                        {isFavorite ? (
                          <HeartSolidIcon className="h-4 w-4 text-red-500" />
                        ) : (
                          <HeartIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                      <div>
                        {property.rooms > 0 && <span>{property.rooms} cam</span>}
                        {property.rooms > 0 && <span className="mx-1">•</span>}
                        <span>{property.surface} m²</span>
                      </div>
                      <Link
                        href={`/properties/${property.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Vezi
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>

          {visibleProperties.length === 0 && !loading && (
            <div className="p-8 text-center">
              <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nu există proprietăți în zona afișată</p>
              <p className="text-sm text-gray-500 mt-1">Modificați filtrele sau măriți harta</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {Math.ceil(visibleProperties.length / itemsPerPage) > 1 && (
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 bg-white text-gray-700"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Anterior
              </button>
              
              <span className="text-sm font-medium text-gray-800 px-2">
                Pagina {currentPage} din {Math.ceil(visibleProperties.length / itemsPerPage)}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(visibleProperties.length / itemsPerPage), prev + 1))}
                disabled={currentPage === Math.ceil(visibleProperties.length / itemsPerPage)}
                className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 bg-white text-gray-700"
              >
                Următor
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default function MapViewPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
      <MapViewContent />
    </Suspense>
  );
}