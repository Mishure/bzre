import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// Client-side cache for translations
const clientCache = new Map<string, string>();

export function useTranslateContent(text: string | undefined | null): string {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string>(text || '');

  useEffect(() => {
    // If no text or language is Romanian, return original
    if (!text || language === 'ro') {
      setTranslatedText(text || '');
      return;
    }

    // Check client cache first
    const cacheKey = `${text}_${language}`;
    if (clientCache.has(cacheKey)) {
      setTranslatedText(clientCache.get(cacheKey)!);
      return;
    }

    // Translate via API
    const translateText = async () => {
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLang: language })
        });

        if (response.ok) {
          const data = await response.json();
          const translated = data.translatedText || text;

          // Cache the result
          clientCache.set(cacheKey, translated);
          setTranslatedText(translated);
        } else {
          // On error, use original text
          setTranslatedText(text);
        }
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText(text); // Fallback to original text
      }
    };

    translateText();
  }, [text, language]);

  return translatedText;
}

// Hook for translating arrays of strings
export function useTranslateArray(items: string[] | undefined | null): string[] {
  const { language } = useLanguage();
  const [translatedItems, setTranslatedItems] = useState<string[]>(items || []);

  useEffect(() => {
    if (!items || items.length === 0 || language === 'ro') {
      setTranslatedItems(items || []);
      return;
    }

    const translateItems = async () => {
      try {
        const translated = await Promise.all(
          items.map(async (item) => {
            const cacheKey = `${item}_${language}`;

            // Check cache
            if (clientCache.has(cacheKey)) {
              return clientCache.get(cacheKey)!;
            }

            // Translate
            const response = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: item, targetLang: language })
            });

            if (response.ok) {
              const data = await response.json();
              const translatedText = data.translatedText || item;
              clientCache.set(cacheKey, translatedText);
              return translatedText;
            }

            return item; // Fallback
          })
        );

        setTranslatedItems(translated);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedItems(items); // Fallback to original
      }
    };

    translateItems();
  }, [items, language]);

  return translatedItems;
}
