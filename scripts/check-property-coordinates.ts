import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Check all properties with parking feature
    const properties = await prisma.property.findMany({
      where: {
        propertyType: 'APARTAMENT',
        rooms: { gte: 3 }
      },
      select: {
        id: true,
        name: true,
        rooms: true,
        features: true,
        latitude: true,
        longitude: true
      }
    });

    console.log(`Found ${properties.length} apartments with 3+ rooms:\n`);

    properties.forEach(prop => {
      const features = prop.features ? JSON.parse(prop.features) : [];
      const hasParking = features.some((f: string) => f.toLowerCase().includes('parcare'));

      console.log(`ID ${prop.id}: ${prop.name}`);
      console.log(`  Rooms: ${prop.rooms}`);
      console.log(`  Has Parking: ${hasParking ? 'YES' : 'NO'}`);
      console.log(`  Coordinates: ${prop.latitude ? `${prop.latitude}, ${prop.longitude}` : 'MISSING'}`);
      if (hasParking) {
        console.log(`  Features: ${JSON.stringify(features)}`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
