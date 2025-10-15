import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

// Map Storia types to database types
function mapPropertyType(type: string): string {
  const typeMap: Record<string, string> = {
    'FLAT': 'APARTAMENT',
    'HOUSE': 'CASA',
    'COMMERCIAL': 'SPATIU_COMERCIAL',
    'TERRAIN': 'TEREN',
    'LAND': 'TEREN'
  };
  return typeMap[type] || 'APARTAMENT';
}

function mapListingType(listingType: string): string {
  return listingType === 'SELL' ? 'VANZARE' : 'INCHIRIERE';
}

function mapRoomNumber(roomsNumber: string | null): number {
  if (!roomsNumber) return 1;

  const roomMap: Record<string, number> = {
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
  return roomMap[roomsNumber] || 1;
}

async function main() {
  try {
    // Read page 2 data
    const page2Data = JSON.parse(fs.readFileSync('/tmp/storia_page2_new.json', 'utf8'));
    const items = page2Data.props.pageProps.searchAds.items || [];

    console.log(`Found ${items.length} properties on page 2\n`);

    // Get admin user
    const admin = await prisma.admin.findFirst({
      where: { username: 'admin' }
    });

    if (!admin) {
      console.error('No admin found!');
      return;
    }

    console.log(`Using admin ID: ${admin.id}\n`);

    let successful = 0;
    let failed = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const isForSale = item.transaction === 'SELL';
        const price = isForSale ? item.totalPrice?.value : item.rentPrice?.value;
        const imageUrl = item.images && item.images.length > 0 ? item.images[0].large : null;

        // Build location
        const city = item.location?.address?.city?.name || '';
        const street = item.location?.address?.street?.name || '';
        const locationParts = street ? [street, city] : [city];
        const locality = city || 'Buzau';
        const zone = street ? city : locality;
        const streetName = street || city;

        console.log(`${i + 1}/${items.length} Adding: ${item.title.substring(0, 60)}...`);

        const property = await prisma.property.create({
          data: {
            name: item.title,
            price: price || 0,
            zone: zone,
            comfort: null,
            street: streetName,
            latitude: null,
            longitude: null,
            surface: item.areaInSquareMeters || 0,
            rooms: mapRoomNumber(item.roomsNumber),
            floor: null,
            totalFloors: null,
            position: null,
            locality: locality,
            operationType: mapListingType(item.transaction),
            propertyType: mapPropertyType(item.estate),
            description: item.shortDescription || '',
            features: item.terrainAreaInSquareMeters
              ? JSON.stringify({ landArea: item.terrainAreaInSquareMeters })
              : null,
            status: 'ACTIVE',
            featured: false,
            adminId: admin.id
          }
        });

        // Add image if available
        if (imageUrl) {
          await prisma.propertyImage.create({
            data: {
              url: imageUrl,
              alt: item.title,
              isPrimary: true,
              order: 0,
              propertyId: property.id
            }
          });
        }

        console.log(`   ✓ Success! ID: ${property.id} | Type: ${property.propertyType} | Price: €${property.price.toLocaleString()}`);
        successful++;

      } catch (error: any) {
        console.log(`   ✗ Failed: ${error.message}`);
        failed++;
      }
      console.log('');
    }

    console.log('\n=== Summary ===');
    console.log(`Total processed: ${items.length}`);
    console.log(`Successful: ${successful}`);
    console.log(`Failed: ${failed}`);

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
