'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [showTooltip, setShowTooltip] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'ro' ? 'en' : 'ro');
  };

  const getLanguageInfo = () => {
    if (language === 'ro') {
      return {
        code: 'RO',
        fullName: 'Română (România) RO'
      };
    }
    return {
      code: 'ENG',
      fullName: 'English (United States) US'
    };
  };

  const langInfo = getLanguageInfo();

  return (
    <div className="relative">
      <button
        onClick={toggleLanguage}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="group relative flex items-center justify-center px-3 py-2 min-w-[60px] rounded-md bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-150"
        aria-label={`Switch language - Currently ${langInfo.fullName}`}
      >
        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
          {langInfo.code}
        </span>
      </button>

      {/* Tooltip - Windows 11 style */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-md shadow-lg whitespace-nowrap">
            {langInfo.fullName}
            {/* Arrow pointing up */}
            <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
}
