import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const propertySubmissionSchema = z.object({
  ownerName: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  propertyType: z.enum(['APARTAMENT', 'CASA', 'TEREN', 'SPATIU_COMERCIAL']),
  operationType: z.enum(['VANZARE', 'INCHIRIERE']),
  locality: z.string().min(2),
  zone: z.string().min(2),
  address: z.string().min(5),
  surface: z.string(),
  rooms: z.string().optional(),
  floor: z.string().optional(),
  totalFloors: z.string().optional(),
  estimatedPrice: z.string(),
  description: z.string().min(20),
  features: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = propertySubmissionSchema.parse(body)

    // Convert string numbers to actual numbers
    const submission = await prisma.propertySubmission.create({
      data: {
        ownerName: validatedData.ownerName,
        phone: validatedData.phone,
        email: validatedData.email,
        propertyType: validatedData.propertyType,
        operationType: validatedData.operationType,
        locality: validatedData.locality,
        zone: validatedData.zone,
        address: validatedData.address,
        surface: parseFloat(validatedData.surface),
        rooms: validatedData.rooms ? parseInt(validatedData.rooms) : null,
        floor: validatedData.floor ? parseInt(validatedData.floor) : null,
        totalFloors: validatedData.totalFloors ? parseInt(validatedData.totalFloors) : null,
        estimatedPrice: parseFloat(validatedData.estimatedPrice),
        description: validatedData.description,
        features: validatedData.features || null,
        status: 'NEW',
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Property submission received successfully',
        submissionId: submission.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating property submission:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid form data',
          errors: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit property',
      },
      { status: 500 }
    )
  }
}

// GET endpoint for admin to fetch submissions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where = status ? { status } : {}

    const submissions = await prisma.propertySubmission.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      submissions,
    })
  } catch (error) {
    console.error('Error fetching property submissions:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch submissions',
      },
      { status: 500 }
    )
  }
}
