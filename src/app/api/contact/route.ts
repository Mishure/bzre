import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }
    
    // Create inquiry in database
    const inquiry = await prisma.clientInquiry.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        transactionType: body.subject === 'buy' ? 'CUMPARARE' : 
                        body.subject === 'sell' ? 'VANZARE' : 
                        body.subject === 'rent' ? 'INCHIRIERE' : 'CUMPARARE',
        message: body.message,
        status: 'NEW'
      }
    });
    
    // TODO: Send email notification to admin
    // This would be implemented with your email service
    
    return NextResponse.json({ 
      message: 'Contact form submitted successfully',
      id: inquiry.id 
    });
    
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    );
  }
}