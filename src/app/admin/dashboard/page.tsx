import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  BuildingOfficeIcon,
  UsersIcon,
  EnvelopeIcon,
  EyeIcon,
  CurrencyEuroIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

async function getDashboardStats() {
  const [
    totalProperties,
    activeProperties,
    totalInquiries,
    newInquiries,
    totalAgents
  ] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { status: 'ACTIVE' } }),
    prisma.clientInquiry.count(),
    prisma.clientInquiry.count({ where: { status: 'NEW' } }),
    prisma.agent.count({ where: { active: true } })
  ]);

  return {
    totalProperties,
    activeProperties,
    totalInquiries,
    newInquiries,
    totalAgents
  };
}

async function getRecentActivities() {
  return await prisma.adminActivity.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      admin: { select: { name: true, username: true } }
    }
  });
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const stats = await getDashboardStats();
  const recentActivities = await getRecentActivities();

  const statCards = [
    {
      name: 'Proprietăți totale',
      value: stats.totalProperties,
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500',
      change: '+4%',
      changeType: 'positive'
    },
    {
      name: 'Proprietăți active',
      value: stats.activeProperties,
      icon: EyeIcon,
      color: 'bg-green-500',
      change: '+2%',
      changeType: 'positive'
    },
    {
      name: 'Solicitări clienți',
      value: stats.totalInquiries,
      icon: EnvelopeIcon,
      color: 'bg-yellow-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Solicitări noi',
      value: stats.newInquiries,
      icon: ArrowTrendingUpIcon,
      color: 'bg-red-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Agenți activi',
      value: stats.totalAgents,
      icon: UsersIcon,
      color: 'bg-purple-500',
      change: '0%',
      changeType: 'neutral'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Bun venit, {session?.user?.name || 'Admin'}!
            </h2>
            <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                Panou de administrare BESTINVEST CAMIMOB
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} p-3 rounded-md`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-green-600' :
                        stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Activitate recentă
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivities.map((activity, idx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {idx !== recentActivities.length - 1 && (
                        <span
                          className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex items-start space-x-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                            <span className="text-white text-sm font-medium">
                              {activity.admin?.name?.charAt(0) || 'A'}
                            </span>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">
                                {activity.admin?.name || activity.admin?.username}
                              </span>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500">
                              {new Date(activity.createdAt).toLocaleString('ro-RO')}
                            </p>
                          </div>
                          <div className="mt-2 text-sm text-gray-700">
                            <p>{activity.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Acțiuni rapide
            </h3>
            <div className="space-y-3">
              <a
                href="/admin/properties/add"
                className="block w-full bg-primary-600 text-white text-center px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                Adaugă proprietate nouă
              </a>
              <a
                href="/admin/properties"
                className="block w-full bg-gray-100 text-gray-900 text-center px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Vizualizează proprietăți
              </a>
              <a
                href="/admin/inquiries"
                className="block w-full bg-gray-100 text-gray-900 text-center px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Solicitări clienți ({stats.newInquiries} noi)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}