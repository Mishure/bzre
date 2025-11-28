import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function exportData() {
  console.log('🚀 Starting data export from Supabase...\n')

  try {
    // Export all tables
    const data = {
      admins: await prisma.admin.findMany(),
      agents: await prisma.agent.findMany(),
      properties: await prisma.property.findMany(),
      propertyImages: await prisma.propertyImage.findMany(),
      clientInquiries: await prisma.clientInquiry.findMany(),
      propertySubmissions: await prisma.propertySubmission.findMany(),
      adminActivities: await prisma.adminActivity.findMany(),
      exchangeRates: await prisma.exchangeRate.findMany(),
    }

    console.log('📊 Data export summary:')
    console.log(`   - Admins: ${data.admins.length}`)
    console.log(`   - Agents: ${data.agents.length}`)
    console.log(`   - Properties: ${data.properties.length}`)
    console.log(`   - Property Images: ${data.propertyImages.length}`)
    console.log(`   - Client Inquiries: ${data.clientInquiries.length}`)
    console.log(`   - Property Submissions: ${data.propertySubmissions.length}`)
    console.log(`   - Admin Activities: ${data.adminActivities.length}`)
    console.log(`   - Exchange Rates: ${data.exchangeRates.length}`)
    console.log()

    // Create export directory if it doesn't exist
    const exportDir = path.join(process.cwd(), 'data-export')
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true })
    }

    // Save to JSON file with pretty formatting
    const exportPath = path.join(exportDir, 'supabase-export.json')
    fs.writeFileSync(exportPath, JSON.stringify(data, null, 2), 'utf-8')

    console.log(`✅ Data exported successfully to: ${exportPath}`)
    console.log(`📦 Total file size: ${(fs.statSync(exportPath).size / 1024).toFixed(2)} KB\n`)

    // Also create a SQL dump for reference
    const sqlPath = path.join(exportDir, 'data-counts.txt')
    const summary = `
Database Export Summary - ${new Date().toISOString()}
================================================

Total Records: ${
      data.admins.length +
      data.agents.length +
      data.properties.length +
      data.propertyImages.length +
      data.clientInquiries.length +
      data.propertySubmissions.length +
      data.adminActivities.length +
      data.exchangeRates.length
    }

Breakdown:
- Admins: ${data.admins.length}
- Agents: ${data.agents.length}
- Properties: ${data.properties.length}
- Property Images: ${data.propertyImages.length}
- Client Inquiries: ${data.clientInquiries.length}
- Property Submissions: ${data.propertySubmissions.length}
- Admin Activities: ${data.adminActivities.length}
- Exchange Rates: ${data.exchangeRates.length}
`

    fs.writeFileSync(sqlPath, summary, 'utf-8')
    console.log(`📄 Summary saved to: ${sqlPath}\n`)

  } catch (error) {
    console.error('❌ Error exporting data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

exportData()
