import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', 12)
  
  const admin = await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'contact@camimob.ro' },
    update: {},
    create: {
      username: 'admin',
      email: process.env.ADMIN_EMAIL || 'contact@camimob.ro',
      password: hashedPassword,
      name: 'Administrator',
      role: 'ADMIN',
      active: true,
    },
  })

  console.log('✅ Admin user created:', admin.email)

  // Create sample agents
  const agents = await Promise.all([
    prisma.agent.upsert({
      where: { phone: '+40238123456' },
      update: {},
      create: {
        firstName: 'Maria',
        lastName: 'Popescu',
        phone: '+40238123456',
        email: 'contact@camimob.ro',
        zone: 'Centru',
        active: true,
      },
    }),
    prisma.agent.upsert({
      where: { phone: '+40238123457' },
      update: {},
      create: {
        firstName: 'Ion',
        lastName: 'Georgescu',
        phone: '+40238123457',
        email: 'contact@camimob.ro',
        zone: 'Micro 3',
        active: true,
      },
    }),
  ])

  console.log('✅ Sample agents created:', agents.length)

  // Create sample properties
  const sampleProperties = [
    // APARTAMENTE DE VANZARE
    {
      name: 'Apartament 3 camere, zona Centru',
      price: 75000,
      zone: 'Centru',
      comfort: 'Confort 1',
      street: 'Strada Unirii nr. 15',
      surface: 75,
      rooms: 3,
      floor: 2,
      totalFloors: 4,
      locality: 'Buzău',
      operationType: 'VANZARE',
      propertyType: 'APARTAMENT',
      description: 'Apartament modern, complet renovat, in zona centrala. Aproape de toate facilitatile.',
      features: JSON.stringify(['Balcon', 'Centrala termica', 'Parchet', 'AC']),
      adminId: admin.id,
    },
    {
      name: 'Apartament 2 camere, zona Micro 4',
      price: 52000,
      zone: 'Micro 4',
      comfort: 'Confort 1',
      street: 'Bdul Unirii nr. 120',
      surface: 55,
      rooms: 2,
      floor: 3,
      totalFloors: 10,
      locality: 'Buzău',
      operationType: 'VANZARE',
      propertyType: 'APARTAMENT',
      description: 'Apartament spatios cu 2 camere, recent renovat. Zona linistita cu acces la transport.',
      features: JSON.stringify(['Balcon', 'Centrala proprie', 'Parchet', 'Geamuri termopan']),
      adminId: admin.id,
    },
    {
      name: 'Apartament 4 camere, zona Micro 3',
      price: 85000,
      zone: 'Micro 3',
      comfort: 'Confort 1',
      street: 'Strada Libertatii nr. 55',
      surface: 95,
      rooms: 4,
      floor: 4,
      totalFloors: 8,
      locality: 'Buzău',
      operationType: 'VANZARE',
      propertyType: 'APARTAMENT',
      description: 'Apartament spatios cu 4 camere, 2 bai, ideal pentru familii mari.',
      features: JSON.stringify(['2 Balcoane', 'Centrala termica', 'Parchet', 'Lift', 'Parcare']),
      adminId: admin.id,
    },

    // APARTAMENTE DE INCHIRIERE
    {
      name: 'Apartament 2 camere, inchiriere Micro 4',
      price: 400,
      zone: 'Micro 4',
      comfort: 'Confort 2',
      street: 'Bdul Bucuresti nr. 45',
      surface: 52,
      rooms: 2,
      floor: 1,
      totalFloors: 10,
      locality: 'Buzău',
      operationType: 'INCHIRIERE',
      propertyType: 'APARTAMENT',
      description: 'Apartament mobilat si utilat complet, gata de mutat.',
      features: JSON.stringify(['Mobilat', 'Utilat', 'AC', 'Internet']),
      adminId: admin.id,
    },
    {
      name: 'Apartament 3 camere, inchiriere Centru',
      price: 500,
      zone: 'Centru',
      comfort: 'Confort 1',
      street: 'Strada Republicii nr. 88',
      surface: 70,
      rooms: 3,
      floor: 2,
      totalFloors: 4,
      locality: 'Buzău',
      operationType: 'INCHIRIERE',
      propertyType: 'APARTAMENT',
      description: 'Apartament modern in zona centrala, mobilat lux.',
      features: JSON.stringify(['Mobilat complet', 'Utilat', 'AC', 'Centrala', 'Balcon']),
      adminId: admin.id,
    },
    {
      name: 'Garsoniera inchiriere Micro 5',
      price: 280,
      zone: 'Micro 5',
      comfort: 'Confort 2',
      street: 'Bdul Transilvaniei nr. 22',
      surface: 35,
      rooms: 1,
      floor: 5,
      totalFloors: 10,
      locality: 'Buzău',
      operationType: 'INCHIRIERE',
      propertyType: 'APARTAMENT',
      description: 'Garsoniera moderna, ideala pentru studenti sau tineri.',
      features: JSON.stringify(['Mobilat', 'Utilat', 'AC', 'Internet', 'Lift']),
      adminId: admin.id,
    },

    // CASE DE VANZARE
    {
      name: 'Casa individuala, zona Micro 3',
      price: 120000,
      zone: 'Micro 3',
      street: 'Strada Primaverii nr. 25',
      surface: 120,
      rooms: 4,
      locality: 'Buzău',
      operationType: 'VANZARE',
      propertyType: 'CASA',
      description: 'Casa individuala cu curte mare si gradina. Constructie 2010.',
      features: JSON.stringify(['Gradina', 'Garaj', 'Terasa', 'Subsol']),
      adminId: admin.id,
    },
    {
      name: 'Casa cu etaj, zona Nord',
      price: 145000,
      zone: 'Nord',
      street: 'Strada Nordului nr. 44',
      surface: 150,
      rooms: 5,
      locality: 'Buzău',
      operationType: 'VANZARE',
      propertyType: 'CASA',
      description: 'Casa moderna cu etaj, zona linistita, curte amenajata.',
      features: JSON.stringify(['Gradina', 'Garaj dublu', '2 Terase', 'Pivnita', 'Centrala']),
      adminId: admin.id,
    },
    {
      name: 'Vila de lux, zona Sud',
      price: 220000,
      zone: 'Sud',
      street: 'Aleea Trandafirilor nr. 8',
      surface: 200,
      rooms: 6,
      locality: 'Buzău',
      operationType: 'VANZARE',
      propertyType: 'CASA',
      description: 'Vila moderna de lux, finisaje premium, piscina exterioara.',
      features: JSON.stringify(['Piscina', 'Gradina 800mp', 'Garaj 2 masini', 'Terasa', 'Sauna', 'Centrala']),
      adminId: admin.id,
    },

    // CASE DE INCHIRIERE
    {
      name: 'Casa de inchiriat, zona Micro 6',
      price: 800,
      zone: 'Micro 6',
      street: 'Strada Viitorului nr. 15',
      surface: 110,
      rooms: 4,
      locality: 'Buzău',
      operationType: 'INCHIRIERE',
      propertyType: 'CASA',
      description: 'Casa mobilata pentru inchiriere, curte privata.',
      features: JSON.stringify(['Mobilata', 'Gradina', 'Garaj', 'Centrala']),
      adminId: admin.id,
    },
    {
      name: 'Casa familiala inchiriere, Centru',
      price: 950,
      zone: 'Centru',
      street: 'Strada Tineretului nr. 33',
      surface: 130,
      rooms: 5,
      locality: 'Buzău',
      operationType: 'INCHIRIERE',
      propertyType: 'CASA',
      description: 'Casa spatioasa pentru familie, zona centrala, toate utilitatile.',
      features: JSON.stringify(['Mobilata complet', 'Gradina', 'Garaj', '2 Bai', 'Centrala']),
      adminId: admin.id,
    },

    // TERENURI
    {
      name: 'Teren constructii, zona Sud',
      price: 45000,
      zone: 'Sud',
      street: 'Strada Constructorilor',
      surface: 800,
      rooms: 0,
      locality: 'Buzău',
      operationType: 'VANZARE',
      propertyType: 'TEREN',
      description: 'Teren pentru constructii rezidentiale, toate utilitatile.',
      features: JSON.stringify(['Utilitati', 'Front 20m', 'Certificat urbanism']),
      adminId: admin.id,
    },
    {
      name: 'Teren intravilan, zona Est',
      price: 35000,
      zone: 'Est',
      street: 'Drumul Estului km 3',
      surface: 600,
      rooms: 0,
      locality: 'Buzău',
      operationType: 'VANZARE',
      propertyType: 'TEREN',
      description: 'Teren intravilan, perfect pentru casa individuala.',
      features: JSON.stringify(['Utilitati in zona', 'Front 15m', 'Zona linistita']),
      adminId: admin.id,
    },
    {
      name: 'Teren comercial, zona Industriala',
      price: 85000,
      zone: 'Zona Industriala',
      street: 'Strada Industriei nr. 120',
      surface: 1500,
      rooms: 0,
      locality: 'Buzău',
      operationType: 'VANZARE',
      propertyType: 'TEREN',
      description: 'Teren comercial, ideal pentru hala industriala sau depozit.',
      features: JSON.stringify(['Utilitati complete', 'Front 30m', 'Acces camioane', 'Certificat']),
      adminId: admin.id,
    },

    // SPATII COMERCIALE
    {
      name: 'Spatiu comercial, zona Unirii',
      price: 1200,
      zone: 'Unirii',
      street: 'Piata Unirii nr. 8',
      surface: 80,
      rooms: 0,
      locality: 'Buzău',
      operationType: 'INCHIRIERE',
      propertyType: 'SPATIU_COMERCIAL',
      description: 'Spatiu comercial in zona cu trafic intens, ideal pentru magazin.',
      features: JSON.stringify(['Vitrina mare', 'Depozit', 'WC', 'Parcare']),
      adminId: admin.id,
    },
    {
      name: 'Birou Centru, zona Republicii',
      price: 800,
      zone: 'Centru',
      street: 'Strada Republicii nr. 45',
      surface: 60,
      rooms: 0,
      locality: 'Buzău',
      operationType: 'INCHIRIERE',
      propertyType: 'SPATIU_COMERCIAL',
      description: 'Spatiu de birou modern, zona ultracentrala.',
      features: JSON.stringify(['Aer conditionat', 'Internet', 'Lift', 'Parcare', 'Alarma']),
      adminId: admin.id,
    },
    {
      name: 'Spatiu comercial vanzare, Micro 4',
      price: 95000,
      zone: 'Micro 4',
      street: 'Bdul Unirii nr. 200',
      surface: 120,
      rooms: 0,
      locality: 'Buzău',
      operationType: 'VANZARE',
      propertyType: 'SPATIU_COMERCIAL',
      description: 'Spatiu comercial de vanzare, parter bloc, vitrina.',
      features: JSON.stringify(['Vitrina strada', 'Depozit', '2 WC', 'Utilitati', 'Parcare']),
      adminId: admin.id,
    },
  ]

  // Sample images for properties
  const propertyImages = [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop',
  ];

  for (const propertyData of sampleProperties) {
    const property = await prisma.property.create({
      data: propertyData,
    });

    // Add images for each property
    await prisma.propertyImage.createMany({
      data: propertyImages.map((url, index) => ({
        url,
        alt: `${property.name} - Imagine ${index + 1}`,
        isPrimary: index === 0,
        order: index,
        propertyId: property.id,
      })),
    });
  }

  console.log('✅ Sample properties created:', sampleProperties.length)
  console.log(`   - ${sampleProperties.filter(p => p.propertyType === 'APARTAMENT' && p.operationType === 'VANZARE').length} apartamente de vanzare`)
  console.log(`   - ${sampleProperties.filter(p => p.propertyType === 'APARTAMENT' && p.operationType === 'INCHIRIERE').length} apartamente de inchiriere`)
  console.log(`   - ${sampleProperties.filter(p => p.propertyType === 'CASA' && p.operationType === 'VANZARE').length} case de vanzare`)
  console.log(`   - ${sampleProperties.filter(p => p.propertyType === 'CASA' && p.operationType === 'INCHIRIERE').length} case de inchiriere`)
  console.log(`   - ${sampleProperties.filter(p => p.propertyType === 'TEREN').length} terenuri`)
  console.log(`   - ${sampleProperties.filter(p => p.propertyType === 'SPATIU_COMERCIAL').length} spatii comerciale`)

  // Create sample client inquiries
  const sampleInquiries = [
    {
      name: 'Ana Mariuca',
      email: 'ana.mariuca@email.com',
      phone: '+40741234567',
      transactionType: 'CUMPARARE',
      propertyType: 'APARTAMENT',
      price: 80000,
      locality: 'Buzău',
      zone: 'Centru',
      rooms: 3,
      message: 'Caut apartament 3 camere in zona centrala, buget maxim 80.000 euro.',
    },
    {
      name: 'Gheorghe Ionescu',
      email: 'gheorghe.ionescu@email.com',
      phone: '+40742345678',
      transactionType: 'INCHIRIERE',
      propertyType: 'CASA',
      price: 600,
      locality: 'Buzău',
      zone: 'Micro 3',
      message: 'Doresc sa inchiriez o casa pentru familie, pe termen lung.',
    },
  ]

  for (const inquiryData of sampleInquiries) {
    await prisma.clientInquiry.create({
      data: inquiryData,
    })
  }

  console.log('✅ Sample inquiries created:', sampleInquiries.length)

  // Create sample exchange rates
  await prisma.exchangeRate.create({
    data: {
      date: new Date(),
      eurRate: 4.97,
      usdRate: 4.55,
    },
  })

  console.log('✅ Exchange rates created')
  console.log('🎉 Database seeding completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })