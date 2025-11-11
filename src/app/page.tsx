'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, MapPinIcon, CurrencyEuroIcon, HomeIcon, BuildingOfficeIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { parseSearchQuery, buildSearchParams } from '@/lib/searchParser';

const propertyTypes = [
  { id: 'APARTAMENT', name: 'Apartamente', icon: BuildingOfficeIcon },
  { id: 'CASA', name: 'Case', icon: HomeIcon },
  { id: 'TEREN', name: 'Terenuri', icon: ChartBarIcon },
  { id: 'SPATIU_COMERCIAL', name: 'Spații comerciale', icon: BuildingOfficeIcon },
];

const operations = [
  { id: 'VANZARE', name: 'Vânzare' },
  { id: 'INCHIRIERE', name: 'Închiriere' },
];

const zones = [
  'Centru', 'Micro 3', 'Micro 4', 'Micro 5', 'Micro 6', 'Unirii', 'Dorobanti', 'Bdul Bucuresti',
  'Victoriei', 'Nord', 'Sud', 'Est', 'Vest', 'Marginal', 'Zona Industriala'
];

export default function HomePage() {
  const router = useRouter();
  const [quickSearch, setQuickSearch] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    propertyType: '',
    operation: '',
    zone: '',
    minPrice: '',
    maxPrice: '',
    rooms: ''
  });

  const handleQuickSearch = () => {
    if (quickSearch.trim()) {
      const parsed = parseSearchQuery(quickSearch);
      const params = buildSearchParams(parsed);
      router.push(`/properties/map-view?${params.toString()}`);
    }
  };

  const handleAdvancedSearch = () => {
    const params = new URLSearchParams();
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    router.push(`/properties/map-view?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 animate-fade-in">
              Găsește-ți <span className="text-yellow-300">casa visurilor</span> în Buzău
            </h1>
            <p className="text-xl lg:text-2xl mb-8 opacity-90 max-w-3xl mx-auto animate-slide-up">
              Agentia imobiliară BESTINVEST CAMIMOB îți oferă cele mai bune proprietăți din Buzău și împrejurimi. 
              Tranzacții sigure, consiliere profesională.
            </p>
          </div>

          {/* Quick Search Bar */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8 max-w-5xl mx-auto animate-slide-up">
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Exemplu: garsoniera micro 14, 2 camere Brosteni, casa sub 100000 euro..."
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQuickSearch()}
                  className="w-full pl-12 pr-32 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                />
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                <button
                  onClick={handleQuickSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                  Caută
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Încearcă: "garsoniera centru", "2 camere sub 50000", "casa cu 4 camere", "teren zona industriala"
              </p>
            </div>
            
            <details className="group">
              <summary className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium mb-4">
                Căutare avansată ▼
              </summary>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tip proprietate</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  value={searchFilters.propertyType}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, propertyType: e.target.value }))}
                >
                  <option value="">Toate tipurile</option>
                  {propertyTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operație</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  value={searchFilters.operation}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, operation: e.target.value }))}
                >
                  <option value="">Vânzare sau închiriere</option>
                  {operations.map((op) => (
                    <option key={op.id} value={op.id}>{op.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zona</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  value={searchFilters.zone}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, zone: e.target.value }))}
                >
                  <option value="">Toate zonele</option>
                  {zones.map((zone) => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preț minim (€)</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  value={searchFilters.minPrice}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preț maxim (€)</label>
                <input
                  type="number"
                  placeholder="1000000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  value={searchFilters.maxPrice}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Număr camere</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  value={searchFilters.rooms}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, rooms: e.target.value }))}
                >
                  <option value="">Orice</option>
                  <option value="1">1 cameră</option>
                  <option value="2">2 camere</option>
                  <option value="3">3 camere</option>
                  <option value="4">4+ camere</option>
                </select>
              </div>
              </div>

              <button
                onClick={handleAdvancedSearch}
                className="w-full bg-primary-600 text-white py-4 px-6 rounded-lg hover:bg-primary-700 transition-colors font-semibold text-lg flex items-center justify-center space-x-2"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                <span>Caută cu filtre avansate</span>
              </button>
            </details>
          </div>
        </div>
      </section>

      {/* Property Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Tipuri de proprietăți
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explorează gama noastră variată de proprietăți disponibile în Buzău
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {propertyTypes.map((type) => (
              <Link
                key={type.id}
                href={`/properties?type=${type.id}`}
                className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow group"
              >
                <type.icon className="h-16 w-16 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{type.name}</h3>
                <p className="text-gray-600">Vezi ofertele disponibile</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              De ce să alegi BESTINVEST CAMIMOB?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <MapPinIcon className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Expertiză locală</h3>
              <p className="text-gray-600">
                Cunoaștem piața imobiliară din Buzău în detaliu și te ghidăm către cele mai bune oferte.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <CurrencyEuroIcon className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Prețuri transparente</h3>
              <p className="text-gray-600">
                Nu avem costuri ascunse. Toate taxele și comisioanele sunt clare de la început.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <HomeIcon className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Servicii complete</h3>
              <p className="text-gray-600">
                De la evaluare și consultanță până la finalizarea tranzacției, te sprijinim pas cu pas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Vrei să-ți vinzi sau să-ți închiriezi proprietatea?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Beneficiază de expertiza noastră și obține cel mai bun preț pentru proprietatea ta.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/listeaza-proprietate"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              Listează proprietatea
            </Link>
            <Link
              href="/services/evaluation"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Evaluare gratuită
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              Contactează-ne
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}