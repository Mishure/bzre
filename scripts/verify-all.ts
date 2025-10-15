import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Fetching all imported Storia properties...\n');

    const properties = await prisma.property.findMany({
      where: {
        id: { gte: 18 }
      },
      include: {
        images: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log(`Found ${properties.length} total imported properties:\n`);

    properties.forEach((prop, index) => {
      console.log(`${index + 1}. [ID: ${prop.id}] ${prop.name}`);
      console.log(`   Type: ${prop.propertyType} | Operation: ${prop.operationType}`);
      console.log(`   Price: €${prop.price.toLocaleString()} | Surface: ${prop.surface}m²`);
      console.log(`   Rooms: ${prop.rooms} | Location: ${prop.locality}`);
      console.log(`   Images: ${prop.images.length}`);
      console.log('');
    });

    // Summary by type
    const summary = properties.reduce((acc, prop) => {
      acc[prop.propertyType] = (acc[prop.propertyType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('=== Summary by Type ===');
    Object.entries(summary).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    // Total value
    const totalValue = properties.reduce((sum, prop) => sum + prop.price, 0);
    console.log(`\n=== Financial Summary ===`);
    console.log(`  Total properties: ${properties.length}`);
    console.log(`  Total value: €${totalValue.toLocaleString()}`);
    console.log(`  Average price: €${Math.round(totalValue / properties.length).toLocaleString()}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
