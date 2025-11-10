import { prisma } from '../src/lib/prisma'

async function deleteProperty() {
  try {
    // First delete related images
    await prisma.propertyImage.deleteMany({
      where: { propertyId: 25 }
    })

    // Then delete the property
    await prisma.property.delete({
      where: { id: 25 }
    })

    console.log('✅ Property ID 25 deleted successfully')

    await prisma.$disconnect()
  } catch (error) {
    console.error('Error:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

deleteProperty()
