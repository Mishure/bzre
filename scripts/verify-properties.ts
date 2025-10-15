import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Fetching recently added properties...\n');

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

    console.log(`Found ${properties.length} properties:\n`);

    properties.forEach((prop, index) => {
      console.log(`${index + 1}. [ID: ${prop.id}] ${prop.name}`);
      console.log(`   Type: ${prop.propertyType} | Operation: ${prop.operationType}`);
      console.log(`   Price: €${prop.price.toLocaleString()} | Surface: ${prop.surface}m²`);
      console.log(`   Rooms: ${prop.rooms} | Location: ${prop.locality}, ${prop.zone}`);
      console.log(`   Status: ${prop.status} | Featured: ${prop.featured}`);
      console.log(`   Images: ${prop.images.length}`);
      console.log(`   Description: ${prop.description?.substring(0, 80)}...`);
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

    // Summary by operation
    const opSummary = properties.reduce((acc, prop) => {
      acc[prop.operationType] = (acc[prop.operationType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n=== Summary by Operation ===');
    Object.entries(opSummary).forEach(([op, count]) => {
      console.log(`  ${op}: ${count}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
