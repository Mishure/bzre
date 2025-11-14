import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendServiceRequestNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.message || !body.serviceName) {
      return NextResponse.json(
        { error: 'Name, email, message and serviceName are required' },
        { status: 400 }
      );
    }

    // Map service names to transaction types
    const serviceToTransactionType: Record<string, string> = {
      'evaluation': 'VANZARE',
      'consulting': 'CUMPARARE',
      'legal': 'CUMPARARE',
      'exclusivity': 'VANZARE',
      'commissions': 'VANZARE',
    };

    const transactionType = serviceToTransactionType[body.serviceName] || 'CUMPARARE';

    // Create inquiry in database
    const inquiry = await prisma.clientInquiry.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        transactionType,
        message: `[${body.serviceName.toUpperCase()}] ${body.message}`,
        status: 'NEW',
        // Store additional service-specific data in other fields if needed
        propertyType: body.propertyType || null,
        locality: body.locality || null,
        zone: body.zone || null,
        address: body.address || null,
        rooms: body.rooms ? parseInt(body.rooms) : null,
        surface: body.surface ? parseFloat(body.surface) : null,
        price: body.price ? parseFloat(body.price) : null,
      }
    });

    // Send email notification to admin
    await sendServiceRequestNotification({
      serviceName: body.serviceNameDisplay || body.serviceName,
      name: body.name,
      email: body.email,
      phone: body.phone,
      message: body.message,
      additionalInfo: body.additionalInfo,
    });

    return NextResponse.json({
      message: 'Service request submitted successfully',
      id: inquiry.id
    });

  } catch (error) {
    console.error('Error processing service request:', error);
    return NextResponse.json(
      { error: 'Failed to process service request' },
      { status: 500 }
    );
  }
}
