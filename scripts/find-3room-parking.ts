import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Find all apartments with 3 rooms
    const properties = await prisma.property.findMany({
      where: {
        propertyType: 'APARTAMENT',
        rooms: 3
      },
      include: { images: true }
    });

    console.log(`Found ${properties.length} apartments with 3 rooms:\n`);

    properties.forEach(prop => {
      console.log(`ID: ${prop.id} - ${prop.name}`);
      console.log(`  Rooms: ${prop.rooms}`);
      console.log(`  Description: ${prop.description?.substring(0, 100)}...`);
      console.log(`  Features: ${prop.features}`);

      // Check if description mentions parking
      const desc = prop.description?.toLowerCase() || '';
      const hasParking = desc.includes('parcare') || desc.includes('parking') || desc.includes('garaj');
      console.log(`  Mentions parking: ${hasParking ? 'YES' : 'NO'}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
