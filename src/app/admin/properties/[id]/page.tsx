import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  HomeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

async function getProperty(id: string) {
  const property = await prisma.property.findUnique({
    where: { id: parseInt(id) },
    include: {
      images: { orderBy: { order: 'asc' } },
      admin: { select: { name: true, username: true, email: true } },
      _count: { select: { inquiries: true } }
    }
  });

  return property;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    minimumFractionDigits: 0
  }).format(price);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export default async function PropertyDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  const propertyTypeLabels: Record<string, string> = {
    'APARTAMENT': 'Apartament',
    'CASA': 'Casă',
    'TEREN': 'Teren',
    'SPATIU_COMERCIAL': 'Spațiu Comercial'
  };

  const operationTypeLabels: Record<string, string> = {
    'VANZARE': 'Vânzare',
    'INCHIRIERE': 'Închiriere'
  };

  const statusLabels: Record<string, string> = {
    'ACTIVE': 'Activă',
    'INACTIVE': 'Inactivă',
    'ARCHIVED': 'Arhivată',
    'SOLD': 'Vândută',
    'RENTED': 'Închiriată'
  };

  let features: string[] = [];
  try {
    features = property.features ? JSON.parse(property.features as string) : [];
  } catch (e) {
    features = [];
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/properties"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Înapoi la listă
            </Link>
          </div>
          <div className="flex space-x-2">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <PencilIcon className="h-4 w-4 mr-2" />
              Editează
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50">
              <TrashIcon className="h-4 w-4 mr-2" />
              Șterge
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.name}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {propertyTypeLabels[property.propertyType]}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {operationTypeLabels[property.operationType]}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              property.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
              property.status === 'SOLD' || property.status === 'RENTED' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {statusLabels[property.status]}
            </span>
          </div>
        </div>
      </div>

      {/* Images Gallery */}
      {property.images.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PhotoIcon className="h-5 w-5 mr-2" />
            Imagini ({property.images.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {property.images.map((image, index) => (
              <div
                key={image.id}
                className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100"
              >
                <img
                  src={image.url}
                  alt={image.alt || `Imagine ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                    Principală
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price and Basic Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informații principale</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Preț</dt>
                <dd className="text-2xl font-bold text-primary-600">{formatPrice(property.price)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Suprafață</dt>
                <dd className="text-xl font-semibold text-gray-900">{property.surface} m²</dd>
              </div>
              {property.rooms && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-1">Camere</dt>
                  <dd className="text-xl font-semibold text-gray-900">{property.rooms}</dd>
                </div>
              )}
              {property.floor !== null && property.floor !== undefined && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-1">Etaj</dt>
                  <dd className="text-xl font-semibold text-gray-900">
                    {property.floor}{property.totalFloors ? ` / ${property.totalFloors}` : ''}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Location */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2" />
              Locație
            </h2>
            <dl className="space-y-3">
              {property.street && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Stradă</dt>
                  <dd className="text-sm text-gray-900 mt-1">{property.street}</dd>
                </div>
              )}
              {property.zone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Zonă</dt>
                  <dd className="text-sm text-gray-900 mt-1">{property.zone}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Localitate</dt>
                <dd className="text-sm text-gray-900 mt-1">{property.locality}</dd>
              </div>
              {property.comfort && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Comfort</dt>
                  <dd className="text-sm text-gray-900 mt-1">{property.comfort}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Description */}
          {property.description && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Descriere</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{property.description}</p>
            </div>
          )}

          {/* Features */}
          {features.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Caracteristici</h2>
              <div className="flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional Details */}
          {(property.heating || property.condition || property.availableFrom || property.deposit || property.buildingType || property.buildingMaterial || property.yearBuilt) && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalii suplimentare</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {property.heating && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Încălzire</dt>
                    <dd className="text-sm text-gray-900 mt-1">{property.heating}</dd>
                  </div>
                )}
                {property.condition && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Stare</dt>
                    <dd className="text-sm text-gray-900 mt-1">{property.condition}</dd>
                  </div>
                )}
                {property.availableFrom && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Liber de la</dt>
                    <dd className="text-sm text-gray-900 mt-1">{property.availableFrom}</dd>
                  </div>
                )}
                {property.deposit && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Garanție</dt>
                    <dd className="text-sm text-gray-900 mt-1">{property.deposit}</dd>
                  </div>
                )}
                {property.buildingType && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Tip clădire</dt>
                    <dd className="text-sm text-gray-900 mt-1">{property.buildingType}</dd>
                  </div>
                )}
                {property.buildingMaterial && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Material construcție</dt>
                    <dd className="text-sm text-gray-900 mt-1">{property.buildingMaterial}</dd>
                  </div>
                )}
                {property.yearBuilt && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">An construcție</dt>
                    <dd className="text-sm text-gray-900 mt-1">{property.yearBuilt}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistici</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Vizualizări</dt>
                <dd className="text-sm font-semibold text-gray-900">{property.views}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Solicitări</dt>
                <dd className="text-sm font-semibold text-gray-900">{property._count.inquiries}</dd>
              </div>
              {property.featured && (
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Promovat</dt>
                  <dd className="text-sm font-semibold text-primary-600">Da</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Admin Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Adăugat de
            </h2>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">{property.admin.name}</p>
              <p className="text-xs text-gray-500">{property.admin.email}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Date importante
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Creat la</dt>
                <dd className="text-xs text-gray-900 mt-1">{formatDate(property.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Actualizat la</dt>
                <dd className="text-xs text-gray-900 mt-1">{formatDate(property.updatedAt)}</dd>
              </div>
              {property.registrationDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Dată înregistrare</dt>
                  <dd className="text-xs text-gray-900 mt-1">{formatDate(property.registrationDate)}</dd>
                </div>
              )}
              {property.archivedAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Arhivat la</dt>
                  <dd className="text-xs text-gray-900 mt-1">{formatDate(property.archivedAt)}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Additional Info */}
          {(property.position || property.ownerCnp) && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informații suplimentare</h2>
              <dl className="space-y-3">
                {property.position && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Poziție</dt>
                    <dd className="text-sm text-gray-900 mt-1">{property.position}</dd>
                  </div>
                )}
                {property.ownerCnp && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">CNP Proprietar</dt>
                    <dd className="text-sm text-gray-900 mt-1">{property.ownerCnp}</dd>
                  </div>
                )}
                {property.latitude && property.longitude && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Coordonate</dt>
                    <dd className="text-sm text-gray-900 mt-1">
                      {property.latitude}, {property.longitude}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
