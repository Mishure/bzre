import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { scrapeStoriaProperty, closeBrowser } from '@/lib/storia-scraper'
import { downloadAndUploadMultipleImages } from '@/lib/blob-storage'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { urls } = body

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'URLs array is required' },
        { status: 400 }
      )
    }

    // Get admin user
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email! }
    })

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      )
    }

    const results = []
    const errors = []

    for (const url of urls) {
      try {
        console.log(`[Import] Starting scrape for: ${url}`)
        console.log(`[Import] Environment: ${process.env.NODE_ENV}, Vercel: ${process.env.VERCEL}`)

        // Scrape the property data from Storia
        const storiaData = await scrapeStoriaProperty(url)
        console.log(`[Import] Scrape completed successfully`)

        console.log(`Scraped data:`, {
          title: storiaData.title,
          price: storiaData.price,
          imageCount: storiaData.imageUrls.length
        })

        // Check if property already exists (by Storia ID)
        const existingProperty = await prisma.property.findFirst({
          where: {
            name: storiaData.title,
            price: storiaData.price,
          }
        })

        if (existingProperty) {
          errors.push({
            url,
            error: 'Property already exists',
            propertyId: existingProperty.id
          })
          continue
        }

        // Create the property first
        const property = await prisma.property.create({
          data: {
            name: storiaData.title,
            price: storiaData.price,
            currency: storiaData.currency,
            zone: storiaData.zone,
            street: storiaData.street || '',
            latitude: storiaData.latitude,
            longitude: storiaData.longitude,
            locality: storiaData.locality,
            surface: storiaData.surface,
            rooms: storiaData.rooms || 1,
            floor: storiaData.floor,
            totalFloors: storiaData.totalFloors,
            operationType: storiaData.operationType,
            propertyType: storiaData.propertyType,
            description: storiaData.description,
            features: JSON.stringify(storiaData.features),
            heating: storiaData.heating,
            condition: storiaData.condition,
            availableFrom: storiaData.availableFrom,
            deposit: storiaData.deposit,
            buildingType: storiaData.buildingType,
            buildingMaterial: storiaData.buildingMaterial,
            yearBuilt: storiaData.yearBuilt,
            status: 'ACTIVE',
            adminId: admin.id,
          }
        })

        console.log(`Created property #${property.id}`)

        // Download and upload images to Supabase
        let uploadedImageUrls: string[] = []
        if (storiaData.imageUrls.length > 0) {
          console.log(`Downloading ${storiaData.imageUrls.length} images...`)
          uploadedImageUrls = await downloadAndUploadMultipleImages(
            storiaData.imageUrls,
            property.id,
            'properties'
          )
          console.log(`Uploaded ${uploadedImageUrls.length} images`)
        }

        // Create property images
        if (uploadedImageUrls.length > 0) {
          await Promise.all(
            uploadedImageUrls.map((url, index) =>
              prisma.propertyImage.create({
                data: {
                  url,
                  alt: `${property.name} - Image ${index + 1}`,
                  isPrimary: index === 0,
                  order: index,
                  propertyId: property.id,
                }
              })
            )
          )
        }

        results.push({
          url,
          success: true,
          propertyId: property.id,
          imagesUploaded: uploadedImageUrls.length,
        })

        // Add small delay between properties
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const errorStack = error instanceof Error ? error.stack : ''
        console.error(`[Import] Error importing ${url}:`, errorMessage)
        console.error(`[Import] Stack:`, errorStack)
        errors.push({
          url,
          error: errorMessage,
          stack: errorStack
        })
      }
    }

    // Close browser after all scraping is done
    await closeBrowser()

    return NextResponse.json({
      success: true,
      imported: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (error) {
    console.error('Error in import-storia API:', error)
    await closeBrowser()

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
