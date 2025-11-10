import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import PropertiesFilter from '@/components/admin/PropertiesFilter';
import PropertyActions from '@/components/admin/PropertyActions';
import {
  PlusIcon,
  ArchiveBoxIcon,
  BuildingOfficeIcon,
  HomeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

type PropertyStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'SOLD' | 'RENTED';
type PropertyType = 'APARTAMENT' | 'CASA' | 'TEREN' | 'SPATIU_COMERCIAL';
type OperationType = 'VANZARE' | 'INCHIRIERE';

interface SearchParams {
  search?: string;
  status?: PropertyStatus;
  type?: PropertyType;
  operation?: OperationType;
  page?: string;
}

async function getProperties(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  
  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: 'insensitive' } },
      { street: { contains: searchParams.search, mode: 'insensitive' } },
      { zone: { contains: searchParams.search, mode: 'insensitive' } },
      { locality: { contains: searchParams.search, mode: 'insensitive' } }
    ];
  }

  if (searchParams.status) {
    where.status = searchParams.status;
  }

  if (searchParams.type) {
    where.propertyType = searchParams.type;
  }

  if (searchParams.operation) {
    where.operationType = searchParams.operation;
  }

  const [properties, totalCount] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        admin: { select: { name: true, username: true } },
        images: { where: { isPrimary: true }, take: 1 },
        _count: { select: { inquiries: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.property.count({ where })
  ]);

  return {
    properties,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit)
  };
}

export default async function AdminProperties({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const { properties, totalCount, currentPage, totalPages } = await getProperties(params);

  const getStatusBadge = (status: PropertyStatus) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      ARCHIVED: 'bg-yellow-100 text-yellow-800',
      SOLD: 'bg-blue-100 text-blue-800',
      RENTED: 'bg-purple-100 text-purple-800'
    };
    
    const labels = {
      ACTIVE: 'Activă',
      INACTIVE: 'Inactivă',
      ARCHIVED: 'Arhivată',
      SOLD: 'Vândută',
      RENTED: 'Închiriată'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(price);
  };

  const propertyTypes = [
    { id: 'APARTAMENT', name: 'Apartamente', icon: BuildingOfficeIcon, operation: 'VANZARE' },
    { id: 'APARTAMENT', name: 'Apartamente închiriere', icon: BuildingOfficeIcon, operation: 'INCHIRIERE' },
    { id: 'CASA', name: 'Case', icon: HomeIcon, operation: 'VANZARE' },
    { id: 'TEREN', name: 'Terenuri', icon: ChartBarIcon, operation: 'VANZARE' },
    { id: 'SPATIU_COMERCIAL', name: 'Spații comerciale', icon: BuildingOfficeIcon, operation: null },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proprietăți</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestionează toate proprietățile din platformă ({totalCount} total)
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/properties/add"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Adaugă proprietate
          </Link>
        </div>
      </div>

      {/* Property Types Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tipuri de proprietăți
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {propertyTypes.map((type, index) => {
              const href = type.operation
                ? `/admin/properties?type=${type.id}&operation=${type.operation}`
                : `/admin/properties?type=${type.id}`;
              const isActive = params.type === type.id &&
                (type.operation ? params.operation === type.operation : true);

              return (
                <Link
                  key={`${type.id}-${type.operation}-${index}`}
                  href={href}
                  className={`relative rounded-lg border-2 p-4 text-center hover:shadow-md transition-all ${
                    isActive
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 bg-white hover:border-primary-300'
                  }`}
                >
                  <type.icon className={`h-10 w-10 mx-auto mb-2 ${
                    isActive ? 'text-primary-600' : 'text-gray-600'
                  }`} />
                  <h3 className={`text-sm font-medium ${
                    isActive ? 'text-primary-700' : 'text-gray-900'
                  }`}>
                    {type.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Vezi oferte disponibile</p>
                </Link>
              );
            })}
            <Link
              href="/admin/properties"
              className={`relative rounded-lg border-2 p-4 text-center hover:shadow-md transition-all ${
                !params.type
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-primary-300'
              }`}
            >
              <ArchiveBoxIcon className={`h-10 w-10 mx-auto mb-2 ${
                !params.type ? 'text-primary-600' : 'text-gray-600'
              }`} />
              <h3 className={`text-sm font-medium ${
                !params.type ? 'text-primary-700' : 'text-gray-900'
              }`}>
                Toate
              </h3>
              <p className="text-xs text-gray-500 mt-1">Vezi toate proprietățile</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <PropertiesFilter
          defaultValues={{
            search: params.search,
            status: params.status,
            type: params.type,
            operation: params.operation
          }}
        />
      </div>

      {/* Properties Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proprietate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tip / Operație
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preț
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zonă
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solicitări
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {property.images[0] && (
                        <img
                          className="h-12 w-12 rounded-lg object-cover mr-4"
                          src={property.images[0].url}
                          alt={property.name}
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{property.name}</div>
                        <div className="text-sm text-gray-500">{property.street}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {property.propertyType.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {property.operationType}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(property.price)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {property.surface} m²
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="font-medium text-gray-900">{property.street || property.zone || '-'}</div>
                    {property.zone && property.street !== property.zone && (
                      <div className="text-xs text-gray-500">{property.zone}</div>
                    )}
                    <div className="text-xs text-gray-400">{property.locality}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(property.status as PropertyStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {property._count.inquiries} solicitări
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <PropertyActions propertyId={property.id} propertyName={property.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </a>
              <a
                href="#"
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </a>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * 20, totalCount)}
                  </span>{' '}
                  of <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {/* Pagination buttons would go here */}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}