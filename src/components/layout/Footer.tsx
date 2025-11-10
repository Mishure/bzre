import Link from 'next/link';
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-bold">BESTINVEST</span>
              <span className="block text-lg text-primary-400">CAMIMOB BUZAU</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Agentia imobiliară de încredere din Buzău. Oferim servicii complete pentru tranzacții imobiliare sigure și transparente.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <PhoneIcon className="h-5 w-5 text-primary-400" />
                <span>+40 773 723 654</span>
              </div>
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="h-5 w-5 text-primary-400" />
                <span>contact@bestinvestcamimob.ro</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-5 w-5 text-primary-400" />
                <span>Blv. Maresal Alexandru Averescu, nr.28, Buzău, Romania</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Linkuri rapide</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/properties" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Toate proprietățile
                </Link>
              </li>
              <li>
                <Link href="/properties?operation=vanzare" className="text-gray-300 hover:text-primary-400 transition-colors">
                  De vânzare
                </Link>
              </li>
              <li>
                <Link href="/properties?operation=inchiriere" className="text-gray-300 hover:text-primary-400 transition-colors">
                  De închiriat
                </Link>
              </li>
              <li>
                <Link href="/services/evaluation" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Evaluare proprietate
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Despre noi
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Servicii</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services/consulting" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Consultanță imobiliară
                </Link>
              </li>
              <li>
                <Link href="/services/legal" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Consiliere juridică
                </Link>
              </li>
              <li>
                <Link href="/services/management" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Administrare proprietăți
                </Link>
              </li>
              <li>
                <Link href="/listeaza-proprietate" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Listează-ți proprietatea
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © {new Date().getFullYear()} BESTINVEST CAMIMOB. Toate drepturile rezervate.
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
              Politica de confidențialitate
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
              Termeni și condiții
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}