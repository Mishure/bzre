import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const type = searchParams.get('type');
    const operation = searchParams.get('operation');
    const zone = searchParams.get('zone');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const rooms = searchParams.get('rooms');
    const featured = searchParams.get('featured');
    const status = searchParams.get('status') || 'ACTIVE';
    
    const where: any = {
      status
    };

    // Convert type and operation to uppercase to match database values
    if (type) where.propertyType = type.toUpperCase();
    if (operation) where.operationType = operation.toUpperCase();
    if (zone) where.zone = zone;
    if (featured === 'true') where.featured = true;
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    
    if (rooms) {
      if (rooms === '4') {
        where.rooms = { gte: 4 };
      } else {
        where.rooms = parseInt(rooms);
      }
    }
    
    const [properties, totalCount] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          images: {
            where: { isPrimary: true },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.property.count({ where })
    ]);
    
    return NextResponse.json({
      properties,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    const property = await prisma.property.create({
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
        status: body.status || 'ACTIVE',
        featured: body.featured || false,
        adminId: (session.user as any).id
      }
    });
    
    if (body.images && Array.isArray(body.images)) {
      await prisma.propertyImage.createMany({
        data: body.images.map((img: any, index: number) => ({
          url: img.url,
          alt: img.alt,
          isPrimary: index === 0,
          order: index,
          propertyId: property.id
        }))
      });
    }
    
    await prisma.adminActivity.create({
      data: {
        adminId: (session.user as any).id,
        action: 'CREATE',
        resource: 'property',
        resourceId: property.id,
        description: `Created property: ${property.name}`
      }
    });
    
    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}