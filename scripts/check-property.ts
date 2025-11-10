import { prisma } from '../src/lib/prisma'

async function checkProperty() {
  try {
    const property = await prisma.property.findFirst({
      where: {
        id: 25
      },
      include: {
        images: true
      }
    })

    if (property) {
      console.log('Found property:')
      console.log('  ID:', property.id)
      console.log('  Name:', property.name)
      console.log('  Price:', property.price)
      console.log('  Surface:', property.surface)
      console.log('  Rooms:', property.rooms)
      console.log('  Floor:', property.floor)
      console.log('  Zone:', property.zone)
      console.log('  Images:', property.images.length)
      console.log('  Description length:', property.description?.length || 0)
      console.log('  Heating:', property.heating || 'N/A')
      console.log('  Condition:', property.condition || 'N/A')
      console.log('  Available From:', property.availableFrom || 'N/A')
      console.log('  Deposit:', property.deposit || 'N/A')
      console.log('  Building Type:', property.buildingType || 'N/A')
      console.log('  Building Material:', property.buildingMaterial || 'N/A')
      console.log('  Year Built:', property.yearBuilt || 'N/A')
    } else {
      console.log('No property found')
    }

    await prisma.$disconnect()
  } catch (error) {
    console.error('Error:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

checkProperty()
