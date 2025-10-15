import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

// Map Storia types to database types
function mapPropertyType(type: string): string {
  const typeMap: Record<string, string> = {
    'apartment': 'APARTAMENT',
    'house': 'CASA',
    'commercial': 'SPATIU_COMERCIAL',
    'land': 'TEREN'
  };
  return typeMap[type] || 'APARTAMENT';
}

function mapListingType(listingType: string): string {
  return listingType === 'sale' ? 'VANZARE' : 'INCHIRIERE';
}

interface StoriaProperty {
  title: string;
  description: string;
  price: number;
  type: string;
  listingType: string;
  location: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  landArea: number | null;
  yearBuilt: number | null;
  imageUrl: string | null;
  featured: boolean;
  status: string;
}

async function main() {
  try {
    // Read the properties from JSON file
    const properties: StoriaProperty[] = JSON.parse(
      fs.readFileSync('/tmp/all_storia_properties.json', 'utf8')
    );

    // Deduplicate by title
    const uniqueProperties: StoriaProperty[] = [];
    const seenTitles = new Set<string>();

    properties.forEach(prop => {
      if (!seenTitles.has(prop.title)) {
        seenTitles.add(prop.title);
        uniqueProperties.push(prop);
      }
    });

    console.log(`Original: ${properties.length} properties`);
    console.log(`After deduplication: ${uniqueProperties.length} unique properties\n`);

    // Get or create an admin user for the imports
    let admin = await prisma.admin.findFirst({
      where: { username: 'admin' }
    });

    if (!admin) {
      console.log('No admin found, creating default admin...');
      admin = await prisma.admin.create({
        data: {
          username: 'admin',
          email: 'admin@buzau-realestate.ro',
          password: '$2a$10$X7vqxLxR0qN8pZ5kYJ5zLO3BqJ0YvY6J8K8lZ5Y6Y7Y8Y9Y0Y1Y2', // placeholder
          name: 'Admin',
          role: 'ADMIN'
        }
      });
      console.log(`Created admin with ID: ${admin.id}\n`);
    } else {
      console.log(`Using existing admin with ID: ${admin.id}\n`);
    }

    // Add properties
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < uniqueProperties.length; i++) {
      const prop = uniqueProperties[i];
      try {
        console.log(`${i + 1}/${uniqueProperties.length} Adding: ${prop.title.substring(0, 60)}...`);

        // Parse location into zone, street, and locality
        const locationParts = prop.location.split(',').map(s => s.trim());
        const locality = locationParts[locationParts.length - 1] || 'Buzau';
        const street = locationParts[0] || prop.location;
        const zone = locationParts.length > 1 ? locationParts[1] : locality;

        const property = await prisma.property.create({
          data: {
            name: prop.title,
            price: prop.price,
            zone: zone,
            comfort: null,
            street: street,
            latitude: null,
            longitude: null,
            surface: prop.area || 0,
            rooms: prop.bedrooms || 1,
            floor: null,
            totalFloors: null,
            position: null,
            locality: locality,
            operationType: mapListingType(prop.listingType),
            propertyType: mapPropertyType(prop.type),
            description: prop.description,
            features: prop.landArea ? JSON.stringify({ landArea: prop.landArea }) : null,
            status: 'ACTIVE',
            featured: false,
            adminId: admin.id
          }
        });

        // Add image if available
        if (prop.imageUrl) {
          await prisma.propertyImage.create({
            data: {
              url: prop.imageUrl,
              alt: prop.title,
              isPrimary: true,
              order: 0,
              propertyId: property.id
            }
          });
        }

        console.log(`   ✓ Success! ID: ${property.id}`);
        successful++;

      } catch (error: any) {
        console.log(`   ✗ Failed: ${error.message}`);
        failed++;
      }
      console.log('');
    }

    console.log('\n=== Summary ===');
    console.log(`Total processed: ${uniqueProperties.length}`);
    console.log(`Successful: ${successful}`);
    console.log(`Failed: ${failed}`);

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
