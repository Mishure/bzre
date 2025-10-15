import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Add coordinates for Property ID 1 - Apartament 3 camere Centru
    const prop1 = await prisma.property.update({
      where: { id: 1 },
      data: {
        latitude: 45.1500,  // Buzău, zona Centru
        longitude: 26.8150
      }
    });
    console.log(`✓ Updated Property ID 1: ${prop1.name}`);
    console.log(`  Coordinates: ${prop1.latitude}, ${prop1.longitude}\n`);

    // Add coordinates for Property ID 3 - Apartament 4 camere Micro 3
    const prop3 = await prisma.property.update({
      where: { id: 3 },
      data: {
        latitude: 45.1420,  // Buzău, zona Micro 3
        longitude: 26.8200
      }
    });
    console.log(`✓ Updated Property ID 3: ${prop3.name}`);
    console.log(`  Coordinates: ${prop3.latitude}, ${prop3.longitude}\n`);

    // Add coordinates for other properties too
    const prop5 = await prisma.property.update({
      where: { id: 5 },
      data: {
        latitude: 45.1490,  // Buzău, Centru
        longitude: 26.8140
      }
    });
    console.log(`✓ Updated Property ID 5: ${prop5.name}`);
    console.log(`  Coordinates: ${prop5.latitude}, ${prop5.longitude}\n`);

    const prop20 = await prisma.property.update({
      where: { id: 20 },
      data: {
        latitude: 45.1485,  // Buzău, Centru
        longitude: 26.8135
      }
    });
    console.log(`✓ Updated Property ID 20: ${prop20.name}`);
    console.log(`  Coordinates: ${prop20.latitude}, ${prop20.longitude}\n`);

    const prop26 = await prisma.property.update({
      where: { id: 26 },
      data: {
        latitude: 45.1440,  // Buzău, Dorobanti
        longitude: 26.8090
      }
    });
    console.log(`✓ Updated Property ID 26: ${prop26.name}`);
    console.log(`  Coordinates: ${prop26.latitude}, ${prop26.longitude}\n`);

    console.log('All coordinates added successfully!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
