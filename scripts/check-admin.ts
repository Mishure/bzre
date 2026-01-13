import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking admin users in database...\n')

  // Check all admins
  const admins = await prisma.admin.findMany()

  if (admins.length === 0) {
    console.log('❌ No admin users found!')
    console.log('\nCreating default admin user...')

    const hashedPassword = await bcrypt.hash('Admin123!', 10)

    const admin = await prisma.admin.create({
      data: {
        email: 'contact@camimob.ro',
        username: 'admin',
        name: 'Administrator',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        active: true
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('\nLogin credentials:')
    console.log('Email:', admin.email)
    console.log('Password: Admin123!')
  } else {
    console.log(`✅ Found ${admins.length} admin user(s):\n`)

    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email})`)
      console.log(`   Username: ${admin.username}`)
      console.log(`   Role: ${admin.role}`)
      console.log(`   Active: ${admin.active ? '✅' : '❌'}`)
      console.log('')
    })
  }
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
