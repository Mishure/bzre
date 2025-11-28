'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCookieConsent, CookiePreferences } from '@/contexts/CookieConsentContext';
import { XMarkIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function CookieConsentBanner() {
  const { showBanner, acceptAll, rejectAll, savePreferences } = useCookieConsent();
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    functional: false,
    marketing: false,
  });

  if (!showBanner) {
    return null;
  }

  const handleToggle = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Can't toggle necessary cookies
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowSettings(false);
  };

  return (
    <>
      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-primary-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {!showSettings ? (
            // Simple Banner View
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🍪 Respectăm confidențialitatea ta
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Folosim cookie-uri pentru a îmbunătăți experiența ta pe site-ul nostru, pentru a analiza traficul și pentru a personaliza conținutul.
                  Prin acceptarea cookie-urilor, ne ajuți să oferim servicii de calitate superioară.{' '}
                  <Link href="/cookies" className="text-primary-600 hover:text-primary-700 font-medium underline">
                    Află mai multe despre politica noastră de cookies
                  </Link>
                  .
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={() => setShowSettings(true)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  <Cog6ToothIcon className="h-5 w-5 mr-2" />
                  Personalizează
                </button>
                <button
                  onClick={rejectAll}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Respinge toate
                </button>
                <button
                  onClick={acceptAll}
                  className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors shadow-md"
                >
                  Acceptă toate
                </button>
              </div>
            </div>
          ) : (
            // Settings View
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Setări Cookie-uri
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Închide setări"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <p className="text-sm text-gray-700 mb-6">
                Alege ce tipuri de cookie-uri vrei să permiți. Cookie-urile esențiale sunt necesare pentru funcționarea site-ului și nu pot fi dezactivate.
              </p>

              <div className="space-y-4 mb-6">
                {/* Necessary Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <h4 className="text-sm font-semibold text-gray-900">Cookie-uri esențiale</h4>
                      <span className="ml-2 px-2 py-0.5 text-xs font-medium text-white bg-gray-800 rounded">Obligatorii</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Necesare pentru funcționarea corectă a site-ului. Includ securitate, navigare de bază și gestionarea sesiunii.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 opacity-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Cookie-uri de analiză și performanță</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Ne ajută să înțelegem cum folosești site-ul pentru a îmbunătăți experiența ta. Colectăm date anonime despre vizite și comportament.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => handleToggle('analytics')}
                      className="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Functional Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Cookie-uri funcționale</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Permit personalizarea experienței tale, cum ar fi memorarea preferințelor tale și a proprietăților favorite.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={() => handleToggle('functional')}
                      className="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Cookie-uri de marketing și publicitate</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Folosite pentru a-ți afișa anunțuri relevante pe alte site-uri. Ne ajută să măsurăm eficiența campaniilor noastre.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => handleToggle('marketing')}
                      className="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={rejectAll}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Respinge toate
                </button>
                <button
                  onClick={acceptAll}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Acceptă toate
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors shadow-md"
                >
                  Salvează preferințele
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                <Link href="/cookies" className="text-primary-600 hover:text-primary-700 underline">
                  Citește politica completă de cookies
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {showBanner && (
        <div className="fixed inset-0 bg-black bg-opacity-20 z-40 pointer-events-none" />
      )}
    </>
  );
}
