import { NextRequest, NextResponse } from 'next/server';
import translate from 'google-translate-api-x';

// Simple in-memory cache
const translationCache = new Map<string, string>();

export async function POST(request: NextRequest) {
  let text = '';
  let targetLang = '';

  try {
    const body = await request.json();
    text = body.text;
    targetLang = body.targetLang;

    if (!text || !targetLang) {
      return NextResponse.json(
        { error: 'Missing text or targetLang' },
        { status: 400 }
      );
    }

    // If target language is Romanian, return original text
    if (targetLang === 'ro') {
      return NextResponse.json({ translatedText: text });
    }

    // Check cache first
    const cacheKey = `${text}_${targetLang}`;
    if (translationCache.has(cacheKey)) {
      return NextResponse.json({
        translatedText: translationCache.get(cacheKey),
        cached: true
      });
    }

    // Translate using Google Translate
    const result = await translate(text, { to: targetLang });
    const translatedText = result.text;

    // Cache the result
    translationCache.set(cacheKey, translatedText);

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text on error
    return NextResponse.json(
      { translatedText: text || '', error: 'Translation failed' },
      { status: 200 } // Return 200 to allow fallback to original text
    );
  }
}
