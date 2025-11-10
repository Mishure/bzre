import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const propertyId = parseInt(id)

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: 'Invalid property ID' },
        { status: 400 }
      )
    }

    // Fetch property with images
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        images: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(property)

  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const propertyId = parseInt(id)

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: 'Invalid property ID' },
        { status: 400 }
      )
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Delete related images first
    await prisma.propertyImage.deleteMany({
      where: { propertyId }
    })

    // Delete the property
    await prisma.property.delete({
      where: { id: propertyId }
    })

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const propertyId = parseInt(id)

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: 'Invalid property ID' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Prepare update data
    const updateData: any = {
      name: body.name,
      price: parseFloat(body.price),
      zone: body.zone || null,
      street: body.street || null,
      locality: body.locality,
      surface: parseFloat(body.surface),
      operationType: body.operationType,
      propertyType: body.propertyType,
      description: body.description || null,
      heating: body.heating || null,
      condition: body.condition || null,
      availableFrom: body.availableFrom || null,
      deposit: body.deposit || null,
      buildingType: body.buildingType || null,
      buildingMaterial: body.buildingMaterial || null,
      status: body.status,
    }

    // Add optional numeric fields only if they have valid values
    if (body.latitude && !isNaN(parseFloat(body.latitude))) {
      updateData.latitude = parseFloat(body.latitude)
    }
    if (body.longitude && !isNaN(parseFloat(body.longitude))) {
      updateData.longitude = parseFloat(body.longitude)
    }
    if (body.rooms && !isNaN(parseInt(body.rooms))) {
      updateData.rooms = parseInt(body.rooms)
    }
    if (body.floor && !isNaN(parseInt(body.floor))) {
      updateData.floor = parseInt(body.floor)
    }
    if (body.totalFloors && !isNaN(parseInt(body.totalFloors))) {
      updateData.totalFloors = parseInt(body.totalFloors)
    }
    if (body.yearBuilt && !isNaN(parseInt(body.yearBuilt))) {
      updateData.yearBuilt = parseInt(body.yearBuilt)
    }

    // Update the property
    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      property: updatedProperty
    })

  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    )
  }
}
