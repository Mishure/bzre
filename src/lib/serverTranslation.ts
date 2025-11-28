import translate from 'google-translate-api-x';

/**
 * Server-side translation with in-memory caching
 * This ensures translations are indexable by search engines
 * TODO: Add database caching after applying migration
 */

// In-memory cache for translations
const translationCache = new Map<string, string>();

export async function translateText(
  text: string,
  targetLang: 'en' | 'ro',
  sourceLang: 'ro' | 'en' = 'ro'
): Promise<string> {
  // Return original text if same language
  if (targetLang === sourceLang) {
    return text;
  }

  // Return empty string for empty input
  if (!text || text.trim() === '') {
    return text;
  }

  try {
    // Check in-memory cache first
    const cacheKey = `${text}_${sourceLang}_${targetLang}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    // Translate if not in cache
    const result = await translate(text, { from: sourceLang, to: targetLang });
    const translatedText = result.text;

    // Store in cache
    translationCache.set(cacheKey, translatedText);

    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text on error
  }
}

/**
 * Translate an array of strings
 */
export async function translateArray(
  texts: string[],
  targetLang: 'en' | 'ro',
  sourceLang: 'ro' | 'en' = 'ro'
): Promise<string[]> {
  const translations = await Promise.all(
    texts.map((text) => translateText(text, targetLang, sourceLang))
  );
  return translations;
}

/**
 * Translate property object fields
 */
export async function translateProperty(
  property: any,
  targetLang: 'en' | 'ro'
): Promise<any> {
  if (targetLang === 'ro') {
    return property; // Original is in Romanian
  }

  const translatedProperty = { ...property };

  // Translate main fields
  if (property.name) {
    translatedProperty.name = await translateText(property.name, targetLang);
  }

  if (property.description) {
    translatedProperty.description = await translateText(property.description, targetLang);
  }

  if (property.street) {
    translatedProperty.street = await translateText(property.street, targetLang);
  }

  if (property.zone) {
    translatedProperty.zone = await translateText(property.zone, targetLang);
  }

  if (property.locality) {
    translatedProperty.locality = await translateText(property.locality, targetLang);
  }

  // Translate features array
  if (property.features) {
    try {
      const features = typeof property.features === 'string'
        ? JSON.parse(property.features)
        : property.features;

      if (Array.isArray(features)) {
        translatedProperty.features = await translateArray(features, targetLang);
      }
    } catch (error) {
      console.error('Features translation error:', error);
    }
  }

  return translatedProperty;
}

/**
 * Translate multiple properties
 */
export async function translateProperties(
  properties: any[],
  targetLang: 'en' | 'ro'
): Promise<any[]> {
  if (targetLang === 'ro') {
    return properties; // Original is in Romanian
  }

  const translated = await Promise.all(
    properties.map((property) => translateProperty(property, targetLang))
  );

  return translated;
}
