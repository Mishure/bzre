interface ParsedSearch {
  propertyType?: string;
  operation?: string;
  zone?: string;
  rooms?: string;
  minPrice?: string;
  maxPrice?: string;
  keywords: string[];
}

// Mapping dictionaries
const ROOM_MAPPINGS: Record<string, string> = {
  'garsoniera': '1',
  'garsoniere': '1',
  'o camera': '1',
  '1 camera': '1',
  'o cameră': '1',
  '1 cameră': '1',
  
  'doua camere': '2',
  'două camere': '2',
  '2 camere': '2',
  'doi camere': '2',
  
  'trei camere': '3',
  '3 camere': '3',
  
  'patru camere': '4',
  'patra camere': '4',
  '4 camere': '4',
  
  'cinci camere': '5',
  '5 camere': '5',
};

const PROPERTY_TYPE_MAPPINGS: Record<string, string> = {
  'apartament': 'APARTAMENT',
  'apartamente': 'APARTAMENT',
  'ap': 'APARTAMENT',
  'garsoniera': 'APARTAMENT',
  'garsoniere': 'APARTAMENT',
  
  'casa': 'CASA',
  'case': 'CASA',
  'casă': 'CASA',
  'vila': 'CASA',
  'vile': 'CASA',
  
  'teren': 'TEREN',
  'terenuri': 'TEREN',
  'lot': 'TEREN',
  'loturi': 'TEREN',
  'pamant': 'TEREN',
  'pământ': 'TEREN',
  
  'spatiu': 'SPATIU_COMERCIAL',
  'spațiu': 'SPATIU_COMERCIAL',
  'comercial': 'SPATIU_COMERCIAL',
  'birouri': 'SPATIU_COMERCIAL',
  'birou': 'SPATIU_COMERCIAL',
  'magazin': 'SPATIU_COMERCIAL',
};

const OPERATION_MAPPINGS: Record<string, string> = {
  'vanzare': 'VANZARE',
  'vânzare': 'VANZARE',
  'vand': 'VANZARE',
  'vând': 'VANZARE',
  'cumpar': 'VANZARE',
  'cumpăr': 'VANZARE',
  'cumpara': 'VANZARE',
  'cumpără': 'VANZARE',
  'de vanzare': 'VANZARE',
  'de vânzare': 'VANZARE',
  
  'inchiriere': 'INCHIRIERE',
  'închiriere': 'INCHIRIERE',
  'inchiriez': 'INCHIRIERE',
  'închiriez': 'INCHIRIERE',
  'chirie': 'INCHIRIERE',
  'de inchiriat': 'INCHIRIERE',
  'de închiriat': 'INCHIRIERE',
  'rent': 'INCHIRIERE',
};

const ZONE_MAPPINGS: Record<string, string> = {
  // Micro zones
  'micro 3': 'Micro 3',
  'micro3': 'Micro 3',
  'm3': 'Micro 3',
  
  'micro 4': 'Micro 4',
  'micro4': 'Micro 4',
  'm4': 'Micro 4',
  
  'micro 5': 'Micro 5',
  'micro5': 'Micro 5',
  'm5': 'Micro 5',
  
  'micro 6': 'Micro 6',
  'micro6': 'Micro 6',
  'm6': 'Micro 6',
  
  'micro 14': 'Micro 14',
  'micro14': 'Micro 14',
  'm14': 'Micro 14',
  
  'micro 21': 'Micro 21',
  'micro21': 'Micro 21',
  'm21': 'Micro 21',
  
  // Other zones
  'centru': 'Centru',
  'center': 'Centru',
  'unirii': 'Unirii',
  'dorobanti': 'Dorobanti',
  'dorobanți': 'Dorobanti',
  'dorobanți 1': 'Dorobanti 1',
  'dorobanti 1': 'Dorobanti 1',
  'dorobanți 2': 'Dorobanti 2',
  'dorobanti 2': 'Dorobanti 2',
  
  'bdul bucuresti': 'Bdul Bucuresti',
  'bdul bucurești': 'Bdul Bucuresti',
  'bd bucuresti': 'Bdul Bucuresti',
  'bd bucurești': 'Bdul Bucuresti',
  'bucuresti': 'Bdul Bucuresti',
  'bucurești': 'Bdul Bucuresti',
  
  'victoriei': 'Victoriei',
  'nord': 'Nord',
  'sud': 'Sud',
  'est': 'Est',
  'vest': 'Vest',
  
  'marginal': 'Marginal',
  'marginala': 'Marginal',
  'industrial': 'Zona Industriala',
  'industrială': 'Zona Industriala',
  'industriala': 'Zona Industriala',
  
  // Neighborhoods/Streets
  'brosteni': 'Brosteni',
  'broșteni': 'Brosteni',
  'drăgaica': 'Dragaica',
  'dragaica': 'Dragaica',
  'crang': 'Crang',
  'crâng': 'Crang',
  'poșta': 'Posta',
  'posta': 'Posta',
  'marghiloman': 'Marghiloman',
  'spiru haret': 'Spiru Haret',
  'balcescu': 'Balcescu',
  'bălcescu': 'Balcescu',
  'episcopiei': 'Episcopiei',
  'gara': 'Gara',
  'gară': 'Gara',
};

// Price patterns
const PRICE_PATTERNS = [
  /(\d+\.?\d*)\s*(?:euro|eur|€)/gi,
  /(\d+\.?\d*)\s*(?:mii|k)\s*(?:euro|eur|€)?/gi,
  /sub\s*(\d+\.?\d*)\s*(?:euro|eur|€)?/gi,
  /peste\s*(\d+\.?\d*)\s*(?:euro|eur|€)?/gi,
  /(\d+\.?\d*)\s*-\s*(\d+\.?\d*)\s*(?:euro|eur|€)?/gi,
];

export function parseSearchQuery(query: string): ParsedSearch {
  const result: ParsedSearch = {
    keywords: []
  };
  
  if (!query) return result;
  
  // Normalize query
  let normalizedQuery = query.toLowerCase().trim();
  
  // Extract price information
  for (const pattern of PRICE_PATTERNS) {
    const match = pattern.exec(normalizedQuery);
    if (match) {
      if (match[0].includes('-')) {
        // Price range
        result.minPrice = match[1];
        result.maxPrice = match[2];
      } else if (match[0].includes('sub')) {
        // Max price
        result.maxPrice = match[1];
      } else if (match[0].includes('peste')) {
        // Min price
        result.minPrice = match[1];
      } else {
        // Single price (treat as approximate)
        const price = parseFloat(match[1]);
        if (match[0].includes('mii') || match[0].includes('k')) {
          result.minPrice = String(price * 1000 * 0.9);
          result.maxPrice = String(price * 1000 * 1.1);
        } else {
          result.minPrice = String(price * 0.9);
          result.maxPrice = String(price * 1.1);
        }
      }
      
      // Remove price from query
      normalizedQuery = normalizedQuery.replace(pattern, ' ');
    }
  }
  
  // Extract rooms
  for (const [key, value] of Object.entries(ROOM_MAPPINGS)) {
    if (normalizedQuery.includes(key)) {
      result.rooms = value;
      // Special case: garsoniera also implies apartment type
      if (key.includes('garsonier')) {
        result.propertyType = 'APARTAMENT';
      }
      normalizedQuery = normalizedQuery.replace(new RegExp(key, 'gi'), ' ');
      break;
    }
  }
  
  // Extract property type
  for (const [key, value] of Object.entries(PROPERTY_TYPE_MAPPINGS)) {
    if (normalizedQuery.includes(key)) {
      result.propertyType = value;
      normalizedQuery = normalizedQuery.replace(new RegExp(key, 'gi'), ' ');
      break;
    }
  }
  
  // Extract operation type
  for (const [key, value] of Object.entries(OPERATION_MAPPINGS)) {
    if (normalizedQuery.includes(key)) {
      result.operation = value;
      normalizedQuery = normalizedQuery.replace(new RegExp(key, 'gi'), ' ');
      break;
    }
  }
  
  // Extract zone - check longer names first
  const sortedZones = Object.entries(ZONE_MAPPINGS)
    .sort(([a], [b]) => b.length - a.length);
  
  for (const [key, value] of sortedZones) {
    if (normalizedQuery.includes(key)) {
      result.zone = value;
      normalizedQuery = normalizedQuery.replace(new RegExp(key, 'gi'), ' ');
      break;
    }
  }
  
  // Clean up remaining words as keywords
  const remainingWords = normalizedQuery
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(word => word.length > 2);
  
  if (remainingWords.length > 0) {
    result.keywords = remainingWords;
  }
  
  return result;
}

export function buildSearchParams(parsed: ParsedSearch): URLSearchParams {
  const params = new URLSearchParams();
  
  if (parsed.propertyType) params.append('propertyType', parsed.propertyType);
  if (parsed.operation) params.append('operation', parsed.operation);
  if (parsed.zone) params.append('zone', parsed.zone);
  if (parsed.rooms) params.append('rooms', parsed.rooms);
  if (parsed.minPrice) params.append('minPrice', parsed.minPrice);
  if (parsed.maxPrice) params.append('maxPrice', parsed.maxPrice);
  
  // Add keywords as search param if any remain
  if (parsed.keywords.length > 0) {
    params.append('search', parsed.keywords.join(' '));
  }
  
  return params;
}