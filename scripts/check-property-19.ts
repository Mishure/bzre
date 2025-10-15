import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const property = await prisma.property.findUnique({
      where: { id: 19 },
      include: { images: true }
    });

    if (!property) {
      console.log('Property ID 19 not found');
      return;
    }

    console.log('Property ID 19 Details:\n');
    console.log('Name:', property.name);
    console.log('Type:', property.propertyType);
    console.log('Rooms:', property.rooms);
    console.log('Description:', property.description);
    console.log('\nFeatures:', property.features);

    if (property.features) {
      try {
        const parsed = JSON.parse(property.features);
        console.log('Parsed features:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Could not parse features as JSON');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
