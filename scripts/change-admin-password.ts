import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function changeAdminPassword() {
  try {
    console.log('\n🔐 Schimbare Parolă Administrator\n');

    // Get admin email
    const email = await question('Email admin (default: admin@bestinvestcamimob.ro): ');
    const adminEmail = email.trim() || 'admin@bestinvestcamimob.ro';

    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: { email: adminEmail }
    });

    if (!admin) {
      console.error(`❌ Admin cu emailul "${adminEmail}" nu există în baza de date!`);
      process.exit(1);
    }

    console.log(`✅ Admin găsit: ${admin.name} (${admin.username})\n`);

    // Get new password
    const newPassword = await question('Parolă nouă (minim 8 caractere): ');

    if (newPassword.length < 8) {
      console.error('❌ Parola trebuie să aibă minim 8 caractere!');
      process.exit(1);
    }

    // Confirm password
    const confirmPassword = await question('Confirmă parola: ');

    if (newPassword !== confirmPassword) {
      console.error('❌ Parolele nu coincid!');
      process.exit(1);
    }

    // Hash password
    console.log('\n🔄 Hash-ing parolă...');
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update admin
    await prisma.admin.update({
      where: { email: adminEmail },
      data: { password: hashedPassword }
    });

    console.log('✅ Parola a fost schimbată cu succes!\n');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Parolă nouă:', newPassword);
    console.log('\n⚠️  IMPORTANT: Salvează această parolă într-un loc sigur!\n');

    // Log activity
    await prisma.adminActivity.create({
      data: {
        adminId: admin.id,
        action: 'UPDATE',
        resource: 'admin',
        description: 'Password changed via script'
      }
    });

  } catch (error) {
    console.error('❌ Eroare:', error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

changeAdminPassword();
