'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
};

type CookieConsentContextType = {
  hasConsent: boolean;
  preferences: CookiePreferences;
  showBanner: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (preferences: CookiePreferences) => void;
  resetConsent: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const COOKIE_CONSENT_KEY = 'cookie_consent';
const COOKIE_PREFERENCES_KEY = 'cookie_preferences';

const defaultPreferences: CookiePreferences = {
  necessary: true, // Always true, can't be disabled
  analytics: false,
  functional: false,
  marketing: false,
};

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [hasConsent, setHasConsent] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

    if (consent === 'true' && savedPreferences) {
      setHasConsent(true);
      setPreferences(JSON.parse(savedPreferences));
      setShowBanner(false);

      // Apply analytics scripts if consented
      const prefs = JSON.parse(savedPreferences) as CookiePreferences;
      if (prefs.analytics) {
        loadAnalytics();
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const loadAnalytics = () => {
    // Load Google Analytics or other analytics scripts
    // This is where you would initialize GA4, Google Tag Manager, etc.
    if (typeof window !== 'undefined' && !(window as any).gtag) {
      // Example: Load Google Analytics
      // You can add your GA tracking ID here
      console.log('Analytics cookies accepted - would load analytics scripts here');

      // Uncomment and add your GA ID to enable Google Analytics:
      /*
      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
      script.async = true;
      document.head.appendChild(script);

      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      (window as any).gtag = gtag;
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID');
      */
    }
  };

  const acceptAll = () => {
    const allPreferences: CookiePreferences = {
      necessary: true,
      analytics: true,
      functional: true,
      marketing: true,
    };

    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(allPreferences));

    setHasConsent(true);
    setPreferences(allPreferences);
    setShowBanner(false);

    // Load analytics if accepted
    loadAnalytics();
  };

  const rejectAll = () => {
    const minimalPreferences: CookiePreferences = {
      necessary: true,
      analytics: false,
      functional: false,
      marketing: false,
    };

    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(minimalPreferences));

    setHasConsent(true);
    setPreferences(minimalPreferences);
    setShowBanner(false);
  };

  const savePreferences = (newPreferences: CookiePreferences) => {
    // Ensure necessary cookies are always enabled
    const finalPreferences = {
      ...newPreferences,
      necessary: true,
    };

    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(finalPreferences));

    setHasConsent(true);
    setPreferences(finalPreferences);
    setShowBanner(false);

    // Load analytics if accepted
    if (finalPreferences.analytics) {
      loadAnalytics();
    }
  };

  const resetConsent = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    localStorage.removeItem(COOKIE_PREFERENCES_KEY);
    setHasConsent(false);
    setPreferences(defaultPreferences);
    setShowBanner(true);
  };

  return (
    <CookieConsentContext.Provider
      value={{
        hasConsent,
        preferences,
        showBanner,
        acceptAll,
        rejectAll,
        savePreferences,
        resetConsent,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}
