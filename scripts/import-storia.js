const https = require('https');

// Function to fetch page data
function fetchStoriaPage(pageNum) {
  return new Promise((resolve, reject) => {
    const url = `https://www.storia.ro/ro/companii/agentii/bestinvest-camimob-srl-ID3757205?page=${pageNum}`;

    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          // Extract __NEXT_DATA__ from the HTML
          const match = data.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
          if (match && match[1]) {
            const jsonData = JSON.parse(match[1]);
            resolve(jsonData);
          } else {
            reject(new Error('Could not find __NEXT_DATA__'));
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Function to map Storia property type to our database types
function mapPropertyType(estate) {
  const typeMap = {
    'FLAT': 'apartment',
    'HOUSE': 'house',
    'COMMERCIAL': 'commercial',
    'LAND': 'land',
    'ROOM': 'apartment', // Map rooms to apartment
    'GARAGE': 'commercial' // Map garage to commercial
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
    bathrooms: null, // Not provided by Storia
    area: item.areaInSquareMeters || null,
    landArea: item.terrainAreaInSquareMeters || null,
    yearBuilt: null, // Not provided by Storia
    imageUrl: imageUrl,
    featured: false,
    status: 'available'
  };
}

// Main function
async function main() {
  try {
    console.log('Fetching properties from Storia...');

    // Fetch first page
    const page1Data = await fetchStoriaPage(1);
    const totalPages = page1Data.props.pageProps.searchAds.pagination.totalPages;
    const totalItems = page1Data.props.pageProps.searchAds.pagination.totalItems;

    console.log(`Found ${totalItems} properties across ${totalPages} pages`);

    let allProperties = [];

    // Extract properties from all pages
    for (let page = 1; page <= totalPages; page++) {
      console.log(`Fetching page ${page}/${totalPages}...`);
      const pageData = page === 1 ? page1Data : await fetchStoriaPage(page);
      const items = pageData.props.pageProps.searchAds.items || [];
      allProperties = allProperties.concat(items);

      // Be nice to the server
      if (page < totalPages) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`\nExtracted ${allProperties.length} properties total`);
    console.log('\nTransformed properties:');

    // Transform and display properties
    const transformedProperties = allProperties.map(item => {
      const prop = transformProperty(item);
      console.log(`\n- ${prop.title}`);
      console.log(`  Type: ${prop.type} | Listing: ${prop.listingType} | Price: €${prop.price.toLocaleString()}`);
      console.log(`  Location: ${prop.location}`);
      console.log(`  Area: ${prop.area}m² ${prop.landArea ? `| Land: ${prop.landArea}m²` : ''}`);
      console.log(`  Bedrooms: ${prop.bedrooms || 'N/A'}`);
      return prop;
    });

    // Save to JSON file for review
    const fs = require('fs');
    fs.writeFileSync('/tmp/storia_properties.json', JSON.stringify(transformedProperties, null, 2));
    console.log(`\n✓ Saved to /tmp/storia_properties.json`);

    return transformedProperties;

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, transformProperty };
