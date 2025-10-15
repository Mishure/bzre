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

  // Mock data - same as before
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);

      const mockProperties: Property[] = [
        {
          id: 1,
          name: 'Apartament 3 camere, zona Centru',
          price: 75000,
          zone: 'Centru',
          street: 'Strada Unirii nr. 15',
          surface: 75,
          rooms: 3,
          floor: 2,
          totalFloors: 4,
          locality: 'Buzău',
          operationType: 'VANZARE',
          propertyType: 'APARTAMENT',
          description: 'Apartament modern, complet renovat, in zona centrala. Aproape de toate facilitatile.',
          features: JSON.stringify(['Balcon', 'Centrală termică', 'Parchet', 'AC']),
          createdAt: new Date().toISOString(),
          latitude: 45.1500,
          longitude: 26.8150,
          images: [{ url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop', isPrimary: true }],
        },
        {
          id: 2,
          name: 'Casa individuala, zona Micro 3',
          price: 120000,
          zone: 'Micro 3',
          street: 'Strada Primaverii nr. 25',
          surface: 120,
          rooms: 4,
          locality: 'Buzău',
          operationType: 'VANZARE',
          propertyType: 'CASA',
          description: 'Casa individuala cu curte mare si gradina. Constructie 2010.',
          features: JSON.stringify(['Gradina', 'Garaj', 'Terasa', 'Subsol']),
          createdAt: new Date().toISOString(),
          latitude: 45.1420,
          longitude: 26.8200,
          images: [{ url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop', isPrimary: true }],
        },
        {
          id: 3,
          name: 'Apartament 2 camere, închiriere',
          price: 400,
          zone: 'Micro 4',
          street: 'Bdul Bucuresti nr. 45',
          surface: 52,
          rooms: 2,
          floor: 1,
          totalFloors: 10,
          locality: 'Buzău',
          operationType: 'INCHIRIERE',
          propertyType: 'APARTAMENT',
          description: 'Apartament mobilat si utilat complet, gata de mutat.',
          features: JSON.stringify(['Mobilat', 'Utilat', 'AC', 'Internet']),
          createdAt: new Date().toISOString(),
          latitude: 45.1380,
          longitude: 26.8080,
          images: [{ url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop', isPrimary: true }],
        },
        {
          id: 4,
          name: 'Teren constructii, zona Sud',
          price: 45000,
          zone: 'Sud',
          street: 'Strada Constructorilor',
          surface: 800,
          rooms: 0,
          locality: 'Buzău',
          operationType: 'VANZARE',
          propertyType: 'TEREN',
          description: 'Teren pentru constructii rezidentiale, toate utilitatile.',
          features: JSON.stringify(['Utilitati', 'Front 20m', 'Certificat urbanism']),
          createdAt: new Date().toISOString(),
          latitude: 45.1300,
          longitude: 26.8100,
          images: [{ url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop', isPrimary: true }],
        },
        {
          id: 5,
          name: 'Spațiu comercial, zona Unirii',
          price: 1200,
          zone: 'Unirii',
          street: 'Piața Unirii nr. 8',
          surface: 80,
          rooms: 0,
          locality: 'Buzău',
          operationType: 'INCHIRIERE',
          propertyType: 'SPATIU_COMERCIAL',
          description: 'Spațiu comercial in zona cu trafic intens, ideal pentru magazin.',
          features: JSON.stringify(['Vitrina mare', 'Depozit', 'WC', 'Parcare']),
          createdAt: new Date().toISOString(),
          latitude: 45.1480,
          longitude: 26.8120,
          images: [{ url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop', isPrimary: true }],
        },
        {
          id: 6,
          name: 'Apartament 4 camere, zona Victoriei',
          price: 95000,
          zone: 'Victoriei',
          street: 'Strada Victoriei nr. 33',
          surface: 90,
          rooms: 4,
          floor: 3,
          totalFloors: 5,
          locality: 'Buzău',
          operationType: 'VANZARE',
          propertyType: 'APARTAMENT',
          description: 'Apartament spatios cu vedere la parc.',
          features: JSON.stringify(['Balcon mare', 'Parcare', 'Centrală', 'Lift']),
          createdAt: new Date().toISOString(),
          latitude: 45.1520,
          longitude: 26.8180,
          images: [{ url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop', isPrimary: true }],
        },
        {
          id: 7,
          name: 'Casa cu etaj, zona Nord',
          price: 150000,
          zone: 'Nord',
          street: 'Strada Nordului nr. 12',
          surface: 140,
          rooms: 5,
          locality: 'Buzău',
          operationType: 'VANZARE',
          propertyType: 'CASA',
          description: 'Casa moderna cu gradina mare si garaj dublu.',
          features: JSON.stringify(['Gradina 500mp', 'Garaj dublu', 'Terasa', 'Pivnita']),
          createdAt: new Date().toISOString(),
          latitude: 45.1550,
          longitude: 26.8130,
          images: [{ url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop', isPrimary: true }],
        },
        {
          id: 8,
          name: 'Studio, inchiriere zona Micro 5',
          price: 300,
          zone: 'Micro 5',
          street: 'Strada Micro 5 nr. 8',
          surface: 35,
          rooms: 1,
          floor: 2,
          totalFloors: 4,
          locality: 'Buzău',
          operationType: 'INCHIRIERE',
          propertyType: 'APARTAMENT',
          description: 'Studio modern, complet mobilat.',
          features: JSON.stringify(['Mobilat complet', 'AC', 'Internet', 'Parcare']),
          createdAt: new Date().toISOString(),
          latitude: 45.1350,
          longitude: 26.8220,
          images: [{ url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop', isPrimary: true }],
        },
        {
          id: 9,
          name: 'Teren agricol, zona Est',
          price: 25000,
          zone: 'Est',
          street: 'Drumul Estului km 2',
          surface: 5000,
          rooms: 0,
          locality: 'Buzău',
          operationType: 'VANZARE',
          propertyType: 'TEREN',
          description: 'Teren agricol cu acces la drum, ideal pentru agricultura.',
          features: JSON.stringify(['5000mp', 'Acces drum', 'Sol fertil', 'Investitie']),
          createdAt: new Date().toISOString(),
          latitude: 45.1400,
          longitude: 26.8300,
          images: [{ url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop', isPrimary: true }],
        },
        {
          id: 10,
          name: 'Apartament 3 camere, zona Dorobanti',
          price: 85000,
          zone: 'Dorobanti',
          street: 'Strada Dorobanti nr. 44',
          surface: 80,
          rooms: 3,
          floor: 1,
          totalFloors: 4,
          locality: 'Buzău',
          operationType: 'VANZARE',
          propertyType: 'APARTAMENT',
          description: 'Apartament la parter cu curte privata.',
          features: JSON.stringify(['Curte privata', 'Renovat recent', 'Centrală', 'Parcare']),
          createdAt: new Date().toISOString(),
          latitude: 45.1440,
          longitude: 26.8090,
          images: [{ url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop', isPrimary: true }],
        },
        {
          id: 11,
          name: 'Birou de inchiriat, zona Centru',
          price: 800,
          zone: 'Centru',
          street: 'Strada Independentei nr. 22',
          surface: 60,
          rooms: 0,
          locality: 'Buzău',
          operationType: 'INCHIRIERE',
          propertyType: 'SPATIU_COMERCIAL',
          description: 'Spatiu de birou modern in cladire noua.',
          features: JSON.stringify(['Cladire noua', 'AC', 'Internet', 'Parcare', 'Lift']),
          createdAt: new Date().toISOString(),
          latitude: 45.1490,
          longitude: 26.8140,
          images: [{ url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop', isPrimary: true }],
        },
        {
          id: 12,
          name: 'Casa de vacanta, zona Marginal',
          price: 75000,
          zone: 'Marginal',
          street: 'Aleea Marginal nr. 5',
          surface: 100,
          rooms: 3,
          locality: 'Buzău',
          operationType: 'VANZARE',
          propertyType: 'CASA',
          description: 'Casa de vacanta cu gradina si foisor.',
          features: JSON.stringify(['Gradina', 'Foisor', 'Liniste', 'Aer curat']),
          createdAt: new Date().toISOString(),
          latitude: 45.1320,
          longitude: 26.8050,
          images: [{ url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop', isPrimary: true }],
        },
      ];
      
      setProperties(mockProperties);
      setLoading(false);
    };

    fetchProperties();
  }, []);

  // Filter properties based on current filters
  useEffect(() => {
    let filtered = [...properties];

    // Check for search from URL params
    const urlSearch = searchParams.get('search');
    const searchTerm = (filters.search || urlSearch || '').toLowerCase();
    
    if (searchTerm) {
      filtered = filtered.filter(property => 
        property.name.toLowerCase().includes(searchTerm) ||
        property.street.toLowerCase().includes(searchTerm) ||
        property.zone.toLowerCase().includes(searchTerm) ||
        property.description?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.propertyType) {
      filtered = filtered.filter(property => property.propertyType === filters.propertyType);
    }
    if (filters.operationType) {
      filtered = filtered.filter(property => property.operationType === filters.operationType);
    }
    if (filters.zone) {
      filtered = filtered.filter(property => property.zone === filters.zone);
    }
    if (filters.minPrice) {
      filtered = filtered.filter(property => property.price >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(property => property.price <= parseInt(filters.maxPrice));
    }
    if (filters.minRooms) {
      filtered = filtered.filter(property => property.rooms >= parseInt(filters.minRooms));
    }
    if (filters.maxRooms) {
      filtered = filtered.filter(property => property.rooms <= parseInt(filters.maxRooms));
    }

    setFilteredProperties(filtered);
    setVisibleProperties(filtered); // Initially show all filtered properties
  }, [properties, filters]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'EUR'
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