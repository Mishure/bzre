import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = parseInt(id);
    
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        images: {
          orderBy: { order: 'asc' }
        },
        admin: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }
    
    await prisma.property.update({
      where: { id: propertyId },
      data: { views: { increment: 1 } }
    });
    
    return NextResponse.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const propertyId = parseInt(id);
    const body = await request.json();
    
    const property = await prisma.property.update({
      where: { id: propertyId },
      data: {
        name: body.name,
        price: body.price,
        zone: body.zone,
        comfort: body.comfort,
        street: body.street,
        latitude: body.latitude,
        longitude: body.longitude,
        surface: body.surface,
        ownerCnp: body.ownerCnp,
        rooms: body.rooms,
        floor: body.floor,
        totalFloors: body.totalFloors,
        position: body.position,
        locality: body.locality,
        operationType: body.operationType,
        propertyType: body.propertyType,
        description: body.description,
        features: body.features ? JSON.stringify(body.features) : null,
        status: body.status,
        featured: body.featured
      }
    });
    
    await prisma.adminActivity.create({
      data: {
        adminId: (session.user as any).id,
        action: 'UPDATE',
        resource: 'property',
        resourceId: property.id,
        description: `Updated property: ${property.name}`
      }
    });
    
    return NextResponse.json(property);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const propertyId = parseInt(id);
    
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });
    
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }
    
    await prisma.property.delete({
      where: { id: propertyId }
    });
    
    await prisma.adminActivity.create({
      data: {
        adminId: (session.user as any).id,
        action: 'DELETE',
        resource: 'property',
        resourceId: propertyId,
        description: `Deleted property: ${property.name}`
      }
    });
    
    return NextResponse.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}