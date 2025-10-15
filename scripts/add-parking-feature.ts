import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Update property ID 1 to add parking to features
    const property = await prisma.property.findUnique({
      where: { id: 1 }
    });

    if (!property) {
      console.log('Property ID 1 not found');
      return;
    }

    console.log('Current property:');
    console.log('ID:', property.id);
    console.log('Name:', property.name);
    console.log('Features:', property.features);

    // Parse existing features
    let features: string[] = [];
    if (property.features) {
      try {
        features = JSON.parse(property.features);
      } catch (e) {
        console.log('Could not parse existing features');
      }
    }

    // Add Parcare if not already there
    if (!features.includes('Parcare')) {
      features.push('Parcare');
    }

    // Update the property
    const updated = await prisma.property.update({
      where: { id: 1 },
      data: {
        features: JSON.stringify(features)
      }
    });

    console.log('\nUpdated features:', updated.features);
    console.log('✓ Successfully added parking feature!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
