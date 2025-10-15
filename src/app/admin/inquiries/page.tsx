import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  HomeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

async function getInquiries() {
  return await prisma.clientInquiry.findMany({
    include: {
      property: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export default async function InquiriesPage() {
  const session = await getServerSession(authOptions);
  const inquiries = await getInquiries();

  const getStatusBadge = (status: string) => {
    const config = {
      NEW: { 
        label: 'Nouă', 
        class: 'bg-blue-100 text-blue-800',
        icon: ExclamationCircleIcon
      },
      CONTACTED: { 
        label: 'Contactat', 
        class: 'bg-yellow-100 text-yellow-800',
        icon: PhoneIcon
      },
      IN_PROGRESS: { 
        label: 'În progres', 
        class: 'bg-purple-100 text-purple-800',
        icon: ClockIcon
      },
      CLOSED: { 
        label: 'Închisă', 
        class: 'bg-green-100 text-green-800',
        icon: CheckCircleIcon
      },
      SPAM: { 
        label: 'Spam', 
        class: 'bg-red-100 text-red-800',
        icon: XCircleIcon
      }
    };

    const statusConfig = config[status as keyof typeof config] || config.NEW;
    const Icon = statusConfig.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.class}`}>
        <Icon className="h-3 w-3 mr-1" />
        {statusConfig.label}
      </span>
    );
  };

  const getTransactionType = (type: string) => {
    const types = {
      CUMPARARE: 'Dorește să cumpere',
      VANZARE: 'Dorește să vândă',
      INCHIRIERE: 'Dorește să închirieze'
    };
    return types[type as keyof typeof types] || type;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ro-RO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitări clienți</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestionează solicitările primite de la clienți ({inquiries.length} total)
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-blue-600 font-medium">Noi</p>
              <p className="text-2xl font-bold text-blue-900">
                {inquiries.filter(i => i.status === 'NEW').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center">
            <PhoneIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-yellow-600 font-medium">Contactate</p>
              <p className="text-2xl font-bold text-yellow-900">
                {inquiries.filter(i => i.status === 'CONTACTED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm text-purple-600 font-medium">În progres</p>
              <p className="text-2xl font-bold text-purple-900">
                {inquiries.filter(i => i.status === 'IN_PROGRESS').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-green-600 font-medium">Închise</p>
              <p className="text-2xl font-bold text-green-900">
                {inquiries.filter(i => i.status === 'CLOSED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center">
            <XCircleIcon className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm text-red-600 font-medium">Spam</p>
              <p className="text-2xl font-bold text-red-900">
                {inquiries.filter(i => i.status === 'SPAM').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tip solicitare
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proprietate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mesaj
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">{inquiry.name}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <EnvelopeIcon className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">{inquiry.email}</span>
                      </div>
                      {inquiry.phone && (
                        <div className="flex items-center mt-1">
                          <PhoneIcon className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">{inquiry.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getTransactionType(inquiry.transactionType)}
                    </div>
                    {inquiry.propertyType && (
                      <div className="text-xs text-gray-500 mt-1">
                        {inquiry.propertyType}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {inquiry.property ? (
                      <Link
                        href={`/properties/${inquiry.property.id}`}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        <div className="flex items-center">
                          <HomeIcon className="h-4 w-4 mr-1" />
                          {inquiry.property.name}
                        </div>
                      </Link>
                    ) : (
                      <div className="text-sm text-gray-500">
                        {inquiry.zone && <div>Zona: {inquiry.zone}</div>}
                        {inquiry.price && <div>Buget: €{inquiry.price.toLocaleString()}</div>}
                        {inquiry.rooms && <div>Camere: {inquiry.rooms}</div>}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-900 truncate" title={inquiry.message}>
                        {inquiry.message}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(inquiry.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(inquiry.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      defaultValue={inquiry.status}
                      onChange={async (e) => {
                        // TODO: Implement status update
                        console.log('Update status to:', e.target.value);
                      }}
                      className="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="NEW">Nouă</option>
                      <option value="CONTACTED">Contactat</option>
                      <option value="IN_PROGRESS">În progres</option>
                      <option value="CLOSED">Închisă</option>
                      <option value="SPAM">Spam</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {inquiries.length === 0 && (
          <div className="text-center py-12">
            <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nu există solicitări</h3>
            <p className="mt-1 text-sm text-gray-500">
              Solicitările de la clienți vor apărea aici.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}