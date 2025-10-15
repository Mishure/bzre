'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon, HomeIcon, PhoneIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Acasa', href: '/', icon: HomeIcon },
  { name: 'Proprietati', href: '/properties/map-view', submenu: [
    { name: 'Apartamente de vanzare', href: '/properties?type=APARTAMENT&operation=VANZARE' },
    { name: 'Apartamente de inchiriat', href: '/properties?type=APARTAMENT&operation=INCHIRIERE' },
    { name: 'Case de vanzare', href: '/properties?type=CASA&operation=VANZARE' },
    { name: 'Case de inchiriat', href: '/properties?type=CASA&operation=INCHIRIERE' },
    { name: 'Terenuri', href: '/properties?type=TEREN' },
    { name: 'Spatii comerciale', href: '/properties?type=SPATIU_COMERCIAL' },
  ]},
  { name: 'Servicii', href: '/services', submenu: [
    { name: 'Evaluare proprietate', href: '/services/evaluation' },
    { name: 'Consultanta', href: '/services/consulting' },
    { name: 'Consiliere juridica', href: '/services/legal' },
    { name: 'Exclusivitate', href: '/services/exclusivity' },
    { name: 'Comisioane', href: '/services/commissions' },
  ]},
  { name: 'Despre noi', href: '/about' },
  { name: 'Contact', href: '/contact', icon: PhoneIcon },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (itemName: string) => {
    setActiveDropdown(activeDropdown === itemName ? null : itemName);
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between border-b border-primary-500 py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <HomeIcon className="h-8 w-8 text-primary-600" />
              <div>
                <span className="text-xl font-bold text-gray-900">BESTINVEST</span>
                <span className="block text-sm text-primary-600">CAMIMOB BUZAU</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8" ref={dropdownRef}>
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.submenu ? (
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className="text-gray-900 hover:text-primary-600 font-medium transition-colors flex items-center space-x-1"
                    >
                      <span>{item.name}</span>
                      <svg className={`w-4 h-4 transition-transform ${activeDropdown === item.name ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {activeDropdown === item.name && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border z-50">
                        <div className="py-2">
                          {item.submenu.map((subitem) => (
                            <Link
                              key={subitem.name}
                              href={subitem.href}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                              onClick={() => setActiveDropdown(null)}
                            >
                              {subitem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-900 hover:text-primary-600 font-medium transition-colors flex items-center space-x-1"
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.name}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              href="/properties/add"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Adauga proprietate
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.submenu ? (
                  <div>
                    <div className="text-gray-900 font-medium py-2">{item.name}</div>
                    <div className="pl-4 space-y-1">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.name}
                          href={subitem.href}
                          className="block py-1 text-gray-600 hover:text-primary-600"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subitem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="block py-2 text-gray-900 hover:text-primary-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            <Link
              href="/properties/add"
              className="block w-full bg-primary-600 text-white text-center px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium mt-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              Adauga proprietate
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}