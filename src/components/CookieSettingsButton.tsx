'use client';

import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function CookieSettingsButton() {
  const { resetConsent } = useCookieConsent();
  const { t } = useLanguage();

  return (
    <button
      onClick={resetConsent}
      className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"
      title={t('footer.cookieSettings')}
    >
      <Cog6ToothIcon className="h-4 w-4 mr-1" />
      {t('footer.cookieSettings')}
    </button>
  );
}
