import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function importData() {
  console.log('🚀 Starting data import to Neon...\n')

  try {
    // Read exported data
    const exportPath = path.join(process.cwd(), 'data-export', 'supabase-export.json')

    if (!fs.existsSync(exportPath)) {
      console.error('❌ Export file not found! Please run export-data.ts first.')
      process.exit(1)
    }

    const data = JSON.parse(fs.readFileSync(exportPath, 'utf-8'))

    console.log('📊 Data to import:')
    console.log(`   - Admins: ${data.admins.length}`)
    console.log(`   - Agents: ${data.agents.length}`)
    console.log(`   - Properties: ${data.properties.length}`)
    console.log(`   - Property Images: ${data.propertyImages.length}`)
    console.log(`   - Client Inquiries: ${data.clientInquiries.length}`)
    console.log(`   - Property Submissions: ${data.propertySubmissions.length}`)
    console.log(`   - Admin Activities: ${data.adminActivities.length}`)
    console.log(`   - Exchange Rates: ${data.exchangeRates.length}`)
    console.log()

    // Check if database is empty
    const existingProperties = await prisma.property.count()
    if (existingProperties > 0) {
      console.log('⚠️  WARNING: Database already contains data!')
      console.log(`   Found ${existingProperties} existing properties.`)
      console.log('   This script will skip existing records to avoid duplicates.\n')
    }

    // Import data in correct order (respecting foreign keys)
    console.log('📥 Importing data...\n')

    // 1. Import Admins
    console.log('1/8 Importing admins...')
    for (const admin of data.admins) {
      await prisma.admin.upsert({
        where: { id: admin.id },
        update: {},
        create: admin
      })
    }
    console.log(`   ✓ ${data.admins.length} admins imported`)

    // 2. Import Agents
    console.log('2/8 Importing agents...')
    for (const agent of data.agents) {
      await prisma.agent.upsert({
        where: { id: agent.id },
        update: {},
        create: agent
      })
    }
    console.log(`   ✓ ${data.agents.length} agents imported`)

    // 3. Import Properties
    console.log('3/8 Importing properties...')
    for (const property of data.properties) {
      await prisma.property.upsert({
        where: { id: property.id },
        update: {},
        create: property
      })
    }
    console.log(`   ✓ ${data.properties.length} properties imported`)

    // 4. Import Property Images
    console.log('4/8 Importing property images...')
    for (const image of data.propertyImages) {
      await prisma.propertyImage.upsert({
        where: { id: image.id },
        update: {},
        create: image
      })
    }
    console.log(`   ✓ ${data.propertyImages.length} images imported`)

    // 5. Import Client Inquiries
    console.log('5/8 Importing client inquiries...')
    for (const inquiry of data.clientInquiries) {
      await prisma.clientInquiry.upsert({
        where: { id: inquiry.id },
        update: {},
        create: inquiry
      })
    }
    console.log(`   ✓ ${data.clientInquiries.length} inquiries imported`)

    // 6. Import Property Submissions
    console.log('6/8 Importing property submissions...')
    for (const submission of data.propertySubmissions) {
      await prisma.propertySubmission.upsert({
        where: { id: submission.id },
        update: {},
        create: submission
      })
    }
    console.log(`   ✓ ${data.propertySubmissions.length} submissions imported`)

    // 7. Import Admin Activities
    console.log('7/8 Importing admin activities...')
    for (const activity of data.adminActivities) {
      await prisma.adminActivity.upsert({
        where: { id: activity.id },
        update: {},
        create: activity
      })
    }
    console.log(`   ✓ ${data.adminActivities.length} activities imported`)

    // 8. Import Exchange Rates
    console.log('8/8 Importing exchange rates...')
    for (const rate of data.exchangeRates) {
      await prisma.exchangeRate.upsert({
        where: { id: rate.id },
        update: {},
        create: rate
      })
    }
    console.log(`   ✓ ${data.exchangeRates.length} exchange rates imported`)

    console.log()
    console.log('✅ Data import completed successfully!\n')

    // Verify import
    const counts = {
      admins: await prisma.admin.count(),
      agents: await prisma.agent.count(),
      properties: await prisma.property.count(),
      images: await prisma.propertyImage.count(),
      inquiries: await prisma.clientInquiry.count(),
      submissions: await prisma.propertySubmission.count(),
      activities: await prisma.adminActivity.count(),
      rates: await prisma.exchangeRate.count(),
    }

    console.log('📊 Final database counts:')
    console.log(`   - Admins: ${counts.admins}`)
    console.log(`   - Agents: ${counts.agents}`)
    console.log(`   - Properties: ${counts.properties}`)
    console.log(`   - Property Images: ${counts.images}`)
    console.log(`   - Client Inquiries: ${counts.inquiries}`)
    console.log(`   - Property Submissions: ${counts.submissions}`)
    console.log(`   - Admin Activities: ${counts.activities}`)
    console.log(`   - Exchange Rates: ${counts.rates}`)
    console.log()

  } catch (error) {
    console.error('❌ Error importing data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

importData()
