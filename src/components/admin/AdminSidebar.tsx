'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
  PlusIcon,
  ArchiveBoxIcon,
  EnvelopeIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Proprietăți', icon: BuildingOfficeIcon, children: [
    { name: 'Toate proprietățile', href: '/admin/properties' },
    { name: 'Adaugă proprietate', href: '/admin/properties/add' },
    { name: 'Apartamente de vânzare', href: '/admin/properties?type=APARTAMENT&operation=VANZARE' },
    { name: 'Apartamente de închiriere', href: '/admin/properties?type=APARTAMENT&operation=INCHIRIERE' },
    { name: 'Case de vânzare', href: '/admin/properties?type=CASA&operation=VANZARE' },
    { name: 'Case de închiriere', href: '/admin/properties?type=CASA&operation=INCHIRIERE' },
    { name: 'Terenuri de vânzare', href: '/admin/properties?type=TEREN&operation=VANZARE' },
    { name: 'Spații comerciale', href: '/admin/properties?type=SPATIU_COMERCIAL' },
    { name: 'Arhivate', href: '/admin/properties?status=ARCHIVED' },
  ]},
  { name: 'Solicitări clienți', href: '/admin/inquiries', icon: EnvelopeIcon },
  { name: 'Cereri de Listare', href: '/admin/submissions', icon: DocumentTextIcon },
  { name: 'Agenți', href: '/admin/agents', icon: UsersIcon },
  { name: 'Statistici', href: '/admin/statistics', icon: ChartBarIcon },
  { name: 'Setări', href: '/admin/settings', icon: CogIcon },
];

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    username?: string;
    role?: string;
  };
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Keep Proprietăți expanded by default
  const [expandedItems, setExpandedItems] = useState<string[]>(['Proprietăți']);
  const pathname = usePathname();

  // Debug: log expanded items
  useEffect(() => {
    console.log('Expanded items:', expandedItems);
  }, [expandedItems]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/admin/login' });
  };

  const isChildActive = (childHref: string) => {
    // Extract base path and check if on properties page
    const basePath = childHref.split('?')[0];
    if (pathname !== basePath) return false;

    // If no query params in href, just match the path
    if (!childHref.includes('?')) return pathname === childHref;

    // For query param links, check if we're on the same page
    return pathname === basePath;
  };

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-white shadow-xl">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-gray-900">BESTINVEST</span>
          <span className="text-sm text-primary-600">ADMIN</span>
        </div>
      </div>

      {/* User info */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.name || user?.username}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.children && item.children.some(child => isChildActive(child.href)));
          const isExpanded = expandedItems.includes(item.name);

          if (item.children) {
            return (
              <div key={item.name} className="relative mb-2">
                <button
                  onClick={() => toggleExpanded(item.name)}
                  type="button"
                  className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                  <ChevronRightIcon
                    className={`ml-auto h-4 w-4 transform transition-transform duration-200 ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                <div
                  className={`mt-1 space-y-0.5 bg-gray-50 rounded-md transition-all duration-300 overflow-hidden ${
                    isExpanded ? 'max-h-[500px] opacity-100 py-2' : 'max-h-0 opacity-0 py-0'
                  }`}
                >
                  {item.children.map((child) => {
                    const childActive = isChildActive(child.href);
                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={`group flex w-full items-center rounded-md py-2.5 pl-11 pr-3 text-sm font-medium transition-all duration-150 cursor-pointer ${
                          childActive
                            ? 'bg-primary-100 text-primary-700 font-semibold'
                            : 'text-gray-700 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                        }`}
                        onClick={(e) => {
                          console.log('Clicked:', child.name, child.href);
                          setSidebarOpen(false);
                        }}
                      >
                        <span className="truncate">{child.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleSignOut}
          className="group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        >
          <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
          Ieșire
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
          BESTINVEST ADMIN
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`relative z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-0 flex">
          <div className="relative mr-16 flex w-full max-w-xs flex-1">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button
                type="button"
                className="-m-2.5 p-2.5"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>
    </>
  );
}

// Helper component for chevron icon
function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}