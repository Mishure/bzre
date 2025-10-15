const fs = require('fs');

// Function to map Storia property type to our database types
function mapPropertyType(estate) {
  const typeMap = {
    'FLAT': 'apartment',
    'HOUSE': 'house',
    'COMMERCIAL': 'commercial',
    'LAND': 'land',
    'ROOM': 'apartment',
    'GARAGE': 'commercial'
  };
  return typeMap[estate] || 'apartment';
}

// Function to map room numbers
function mapRoomNumber(roomsNumber) {
  const roomMap = {
    'ONE': 1,
    'TWO': 2,
    'THREE': 3,
    'FOUR': 4,
    'FIVE': 5,
    'SIX': 6,
    'SEVEN': 7,
    'EIGHT': 8,
    'NINE': 9,
    'TEN': 10
  };
  return roomMap[roomsNumber] || null;
}

// Function to transform Storia property to our database format
function transformProperty(item) {
  const isForSale = item.transaction === 'SELL';
  const price = isForSale ? item.totalPrice?.value : item.rentPrice?.value;

  // Get the first image URL (large version)
  const imageUrl = item.images && item.images.length > 0 ? item.images[0].large : null;

  // Build location string
  const city = item.location?.address?.city?.name || '';
  const street = item.location?.address?.street?.name || '';
  const location = street ? `${street}, ${city}` : city;

  return {
    title: item.title,
    description: item.shortDescription || '',
    price: price || 0,
    type: mapPropertyType(item.estate),
    listingType: isForSale ? 'sale' : 'rent',
    location: location,
    bedrooms: mapRoomNumber(item.roomsNumber),
    bathrooms: null,
    area: item.areaInSquareMeters || null,
    landArea: item.terrainAreaInSquareMeters || null,
    yearBuilt: null,
    imageUrl: imageUrl,
    featured: false,
    status: 'available'
  };
}

// Read the JSON data
const jsonData = JSON.parse(fs.readFileSync('/tmp/storia_data.json', 'utf8'));
const items = jsonData.props.pageProps.searchAds.items || [];
const totalPages = jsonData.props.pageProps.searchAds.pagination.totalPages;

console.log(`Found ${items.length} properties on page 1 of ${totalPages}`);
console.log('\nTransformed properties:\n');

// Transform and display properties
const transformedProperties = items.map(item => {
  const prop = transformProperty(item);
  console.log(`- ${prop.title}`);
  console.log(`  Type: ${prop.type} | Listing: ${prop.listingType} | Price: €${prop.price.toLocaleString()}`);
  console.log(`  Location: ${prop.location}`);
  console.log(`  Area: ${prop.area}m² ${prop.landArea ? `| Land: ${prop.landArea}m²` : ''}`);
  console.log(`  Bedrooms: ${prop.bedrooms || 'N/A'}\n`);
  return prop;
});

// Save to JSON file
fs.writeFileSync('/tmp/storia_properties.json', JSON.stringify(transformedProperties, null, 2));
console.log(`✓ Saved ${transformedProperties.length} properties to /tmp/storia_properties.json`);

if (totalPages > 1) {
  console.log(`\nNote: There are ${totalPages} pages total. You may want to fetch the remaining pages.`);
}
