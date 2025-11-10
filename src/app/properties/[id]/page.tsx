'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  HeartIcon,
  ShareIcon,
  MapPinIcon,
  HomeIcon,
  CurrencyEuroIcon,
  PhoneIcon,
  EnvelopeIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

import { Property } from '@/types/property';

interface Agent {
  name: string;
  phone: string;
  email: string;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [agent] = useState<Agent>({
    name: 'Maria Popescu',
    phone: '+40 773 723 654',
    email: 'maria.popescu@bestinvestcamimob.ro'
  });

  // Fetch property from API
  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        console.log('Fetching property ID:', propertyId);
        const response = await fetch(`/api/properties/${propertyId}`);

        if (!response.ok) {
          console.error('Failed to fetch property:', response.status);
          setProperty(null);
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log('Property data:', data);
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property:', error);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  const formatPrice = (price: number, currency: string = 'RON') => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: currency
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

  const nextImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => 
        prev === property.images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images!.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Proprietatea nu a fost găsită</h1>
            <Link href="/properties" className="text-primary-600 hover:text-primary-700">
              ← Înapoi la proprietăți
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const features = getFeatures(property.features);

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/properties" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Înapoi la proprietăți
          </Link>
        </div>

        {/* Image Gallery */}
        <div className="relative h-96 md:h-[500px] mb-8 rounded-xl overflow-hidden">
          {property.images && property.images.length > 0 && (
            <>
              <img
                src={typeof property.images[currentImageIndex] === 'string' 
                  ? property.images[currentImageIndex] 
                  : property.images[currentImageIndex]?.url}
                alt={property.name}
                className="w-full h-full object-cover"
              />
              
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    →
                  </button>
                  
                  {/* Thumbnail Navigation */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {property.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
            >
              {isFavorite ? (
                <HeartSolidIcon className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-gray-600" />
              )}
            </button>
            <button className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all">
              <ShareIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Property Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              
              {/* Header */}
              <div className="border-b pb-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPinIcon className="h-5 w-5 mr-2" />
                      <span>{property.street}, {property.zone}, {property.locality}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary-600 mb-1">
                      {formatPrice(property.price, property.currency || 'RON')}
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${
                      property.operationType === 'VANZARE' ? 'bg-green-600' : 'bg-blue-600'
                    }`}>
                      {property.operationType === 'VANZARE' ? 'De vânzare' : 'De închiriat'}
                    </span>
                  </div>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{property.rooms}</div>
                    <div className="text-sm text-gray-600">Camere</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{property.surface}</div>
                    <div className="text-sm text-gray-600">m²</div>
                  </div>
                  {property.floor && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{property.floor}</div>
                      <div className="text-sm text-gray-600">Etaj</div>
                    </div>
                  )}
                  {property.totalFloors && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{property.totalFloors}</div>
                      <div className="text-sm text-gray-600">Etaje total</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Descriere</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>

              {/* Features */}
              {features.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Caracteristici</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Property Type & ID */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Tip proprietate:</span> {property.propertyType.replace('_', ' ')}
                  </div>
                  <div>
                    <span className="font-medium">ID proprietate:</span> #{property.id}
                  </div>
                  <div>
                    <span className="font-medium">Publicat:</span> {new Date(property.createdAt).toLocaleDateString('ro-RO')}
                  </div>
                  <div>
                    <span className="font-medium">Vizualizări:</span> {Math.floor(Math.random() * 100) + 50}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Sidebar */}
          <div className="space-y-6">
            
            {/* Agent Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent imobiliar</h2>
              
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
                    {agent.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="ml-3">
                  <div className="font-medium text-gray-900">{agent.name}</div>
                  <div className="text-sm text-gray-500">Agent specializat zona {property.zone}</div>
                </div>
              </div>

              <div className="space-y-3">
                <a 
                  href={`tel:${agent.phone}`}
                  className="flex items-center justify-center w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  Sună acum
                </a>
                
                <a 
                  href={`mailto:${agent.email}?subject=Interesat de ${property.name}&body=Bună ziua,%0D%0A%0D%0ASunt interesat de proprietatea "${property.name}" (ID: ${property.id}).%0D%0A%0D%0AVă rog să mă contactați pentru mai multe detalii.%0D%0A%0D%0AMultumesc!`}
                  className="flex items-center justify-center w-full border border-primary-600 text-primary-600 py-3 px-4 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  Trimite email
                </a>
              </div>

              <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                <p>Agent autorizat ANI • Licența #12345</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistici rapide</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Preț/m²:</span>
                  <span className="font-medium">{formatPrice(Math.round(property.price / property.surface), property.currency || 'RON')}/m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zonă:</span>
                  <span className="font-medium">{property.zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tip:</span>
                  <span className="font-medium">{property.propertyType.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <button className="flex items-center justify-center w-full text-primary-600 hover:text-primary-700">
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Vezi proprietăți similare
                </button>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Locația</h2>
              <div className="bg-gray-100 h-40 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center text-gray-500">
                  <MapPinIcon className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Harta interactivă</p>
                  <p className="text-xs">Disponibilă după instalarea pachetelor</p>
                </div>
              </div>
              <Link
                href={`/properties/map-view?propertyId=${property.id}`}
                className="flex items-center justify-center w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <MapPinIcon className="h-5 w-5 mr-2" />
                Vezi locația pe hartă
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}