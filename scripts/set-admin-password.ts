import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setAdminPassword() {
  try {
    const adminEmail = 'admin@bestinvestcamimob.ro';

    // SCHIMBĂ PAROLA AICI (minim 8 caractere)
    const NEW_PASSWORD = 'YOUR_SECURE_PASSWORD_HERE';

    console.log('\n🔐 Schimbare Parolă Administrator\n');

    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: { email: adminEmail }
    });

    if (!admin) {
      console.error(`❌ Admin cu emailul "${adminEmail}" nu există!`);
      process.exit(1);
    }

    console.log(`✅ Admin găsit: ${admin.name} (${admin.username})`);
    console.log(`🔄 Setare parolă nouă...`);

    // Hash password
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 12);

    // Update admin
    await prisma.admin.update({
      where: { email: adminEmail },
      data: { password: hashedPassword }
    });

    console.log('\n✅ Parola a fost schimbată cu succes!\n');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Parolă nouă:', NEW_PASSWORD);
    console.log('\n⚠️  IMPORTANT: Salvează această parolă într-un loc sigur!\n');

    // Log activity
    await prisma.adminActivity.create({
      data: {
        adminId: admin.id,
        action: 'UPDATE',
        resource: 'admin',
        description: 'Password changed via set-admin-password script'
      }
    });

  } catch (error) {
    console.error('❌ Eroare:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setAdminPassword();
