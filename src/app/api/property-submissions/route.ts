import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadPropertySubmissionImage } from '@/lib/supabase'
import { sendPropertySubmissionNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract form fields
    const ownerName = formData.get('ownerName') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const propertyType = formData.get('propertyType') as string
    const operationType = formData.get('operationType') as string
    const locality = formData.get('locality') as string
    const zone = formData.get('zone') as string
    const address = formData.get('address') as string
    const surface = formData.get('surface') as string
    const rooms = formData.get('rooms') as string
    const floor = formData.get('floor') as string
    const totalFloors = formData.get('totalFloors') as string
    const estimatedPrice = formData.get('estimatedPrice') as string
    const description = formData.get('description') as string
    const features = formData.get('features') as string
    const imageCount = parseInt(formData.get('imageCount') as string || '0')

    // Create submission first to get ID
    const submission = await prisma.propertySubmission.create({
      data: {
        ownerName,
        phone,
        email,
        propertyType,
        operationType,
        locality,
        zone,
        address,
        surface: parseFloat(surface),
        rooms: rooms ? parseInt(rooms) : null,
        floor: floor ? parseInt(floor) : null,
        totalFloors: totalFloors ? parseInt(totalFloors) : null,
        estimatedPrice: parseFloat(estimatedPrice),
        description,
        features: features || null,
        status: 'NEW',
        images: null, // Will update after uploading images
      },
    })

    // Upload images if any
    const imageUrls: string[] = []
    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const imageFile = formData.get(`image_${i}`) as File
        if (imageFile) {
          const imageUrl = await uploadPropertySubmissionImage(imageFile, submission.id, i)
          if (imageUrl) {
            imageUrls.push(imageUrl)
          }
        }
      }

      // Update submission with image URLs
      if (imageUrls.length > 0) {
        await prisma.propertySubmission.update({
          where: { id: submission.id },
          data: {
            images: JSON.stringify(imageUrls),
          },
        })
      }
    }

    // Send email notification to admin
    await sendPropertySubmissionNotification({
      ownerName,
      phone,
      email,
      propertyType,
      operationType,
      locality,
      zone,
      address,
      surface: parseFloat(surface),
      rooms: rooms ? parseInt(rooms) : undefined,
      floor: floor ? parseInt(floor) : undefined,
      totalFloors: totalFloors ? parseInt(totalFloors) : undefined,
      estimatedPrice: parseFloat(estimatedPrice),
      description,
      features: features || undefined,
      submissionId: submission.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Property submission received successfully',
        submissionId: submission.id,
        imagesUploaded: imageUrls.length,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating property submission:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit property',
        error: error instanceof Error ? error.message : 'Unknown error',
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
