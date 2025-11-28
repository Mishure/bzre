'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { usePathname } from 'next/navigation';
import Head from 'next/head';
import { useEffect } from 'react';

interface MetadataProps {
  titleKey?: string;
  descriptionKey?: string;
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

export default function LanguageMetadata({
  titleKey,
  descriptionKey,
  title,
  description,
  image = 'https://www.camimob.ro/images/og-image.jpg',
  type = 'website'
}: MetadataProps) {
  const { t, language } = useLanguage();
  const pathname = usePathname();

  const currentUrl = `https://www.camimob.ro${pathname}`;
  const baseUrl = 'https://www.camimob.ro';

  // Get translated metadata
  const metaTitle = title || (titleKey ? t(titleKey) : 'BESTINVEST CAMIMOB - Agenție Imobiliară Buzău');
  const metaDescription = description || (descriptionKey ? t(descriptionKey) : 'Agenție imobiliară de încredere în Buzău. Proprietăți de vânzare și închiriere.');

  useEffect(() => {
    // Update document title
    document.title = metaTitle;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', metaDescription);

    // Update HTML lang attribute
    document.documentElement.lang = language;

    // Update Open Graph tags
    const updateOrCreateMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateOrCreateMeta('og:title', metaTitle);
    updateOrCreateMeta('og:description', metaDescription);
    updateOrCreateMeta('og:url', currentUrl);
    updateOrCreateMeta('og:image', image);
    updateOrCreateMeta('og:type', type);
    updateOrCreateMeta('og:locale', language === 'ro' ? 'ro_RO' : 'en_US');

    // Twitter Card
    updateOrCreateMeta('twitter:card', 'summary_large_image');
    updateOrCreateMeta('twitter:title', metaTitle);
    updateOrCreateMeta('twitter:description', metaDescription);
    updateOrCreateMeta('twitter:image', image);

    // Update or create hreflang links
    const updateHreflang = () => {
      // Remove existing hreflang links
      document.querySelectorAll('link[rel="alternate"]').forEach(link => {
        if (link.getAttribute('hreflang')) {
          link.remove();
        }
      });

      // Add new hreflang links
      const languages = ['ro', 'en'];
      languages.forEach(lang => {
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = lang;
        link.href = `${baseUrl}${pathname}?lang=${lang}`;
        document.head.appendChild(link);
      });

      // Add x-default
      const defaultLink = document.createElement('link');
      defaultLink.rel = 'alternate';
      defaultLink.hreflang = 'x-default';
      defaultLink.href = `${baseUrl}${pathname}`;
      document.head.appendChild(defaultLink);
    };

    updateHreflang();
  }, [metaTitle, metaDescription, language, pathname, currentUrl, image, type, baseUrl]);

  return null; // This component only manages meta tags
}
