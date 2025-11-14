import Link from 'next/link';
import { HomeIcon, MagnifyingGlassIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pagina nu a fost găsită (404) | BESTINVEST CAMIMOB',
  description: 'Pagina pe care o cauți nu există sau a fost mutată. Descoperă ofertele noastre de proprietăți în Buzău.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-primary-100 rounded-full mb-6">
              <span className="text-6xl font-bold text-primary-600">404</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Ups! Pagina nu a fost găsită
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Pagina pe care o cauți nu există, a fost mutată sau este temporar indisponibilă.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Înapoi la pagina principală
            </Link>
            <Link
              href="/properties"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
            >
              <BuildingOfficeIcon className="h-5 w-5 mr-2" />
              Vezi proprietățile
            </Link>
          </div>

          {/* Search Suggestion */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Caută proprietatea dorită
            </h2>
            <p className="text-gray-600 mb-6">
              Poate te ajutăm să găsești ce cauți? Încearcă să cauți printre ofertele noastre:
            </p>
            <Link
              href="/properties"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              Începe căutarea
            </Link>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Link-uri utile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/about"
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Despre noi
              </Link>
              <Link
                href="/contact"
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/services/evaluation"
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Evaluare proprietate
              </Link>
              <Link
                href="/listeaza-proprietate"
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Listează proprietatea
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <p className="mt-8 text-gray-500 text-sm">
            Dacă crezi că aceasta este o eroare, te rugăm să ne contactezi la{' '}
            <a
              href="mailto:contact@camimob.ro"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              contact@camimob.ro
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
