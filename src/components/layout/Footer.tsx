'use client';

import Link from 'next/link';
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import CookieSettingsButton from '@/components/CookieSettingsButton';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
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
              {t('footer.companyInfo')}
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
            <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/properties" className="text-gray-300 hover:text-primary-400 transition-colors">
                  {t('footer.allProperties')}
                </Link>
              </li>
              <li>
                <Link href="/properties?operation=vanzare" className="text-gray-300 hover:text-primary-400 transition-colors">
                  {t('footer.forSale')}
                </Link>
              </li>
              <li>
                <Link href="/properties?operation=inchiriere" className="text-gray-300 hover:text-primary-400 transition-colors">
                  {t('footer.forRent')}
                </Link>
              </li>
              <li>
                <Link href="/services/evaluation" className="text-gray-300 hover:text-primary-400 transition-colors">
                  {t('footer.propertyEvaluation')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-primary-400 transition-colors">
                  {t('footer.about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.services')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services/consulting" className="text-gray-300 hover:text-primary-400 transition-colors">
                  {t('footer.realEstateConsulting')}
                </Link>
              </li>
              <li>
                <Link href="/services/legal" className="text-gray-300 hover:text-primary-400 transition-colors">
                  {t('footer.legalAdvice')}
                </Link>
              </li>
              <li>
                <Link href="/services/exclusivity" className="text-gray-300 hover:text-primary-400 transition-colors">
                  {t('footer.propertyManagement')}
                </Link>
              </li>
              <li>
                <Link href="/listeaza-proprietate" className="text-gray-300 hover:text-primary-400 transition-colors">
                  {t('footer.listProperty')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-primary-400 transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © {new Date().getFullYear()} BESTINVEST CAMIMOB. {t('footer.copyright')}
          </div>
          <div className="flex flex-wrap gap-4 mt-4 md:mt-0 items-center justify-center md:justify-end">
            <Link href="/privacy" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
              {t('footer.privacyPolicy')}
            </Link>
            <Link href="/termeni-si-conditii" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
              {t('footer.termsConditions')}
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
              {t('footer.cookies')}
            </Link>
            <CookieSettingsButton />
          </div>
        </div>
      </div>
    </footer>
  );
}