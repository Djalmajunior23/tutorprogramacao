import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

async function seed() {
  // Normalize URL
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("https://")) {
    process.env.DATABASE_URL = process.env.DATABASE_URL.replace("https://", "postgresql://");
  }

  const prisma = new PrismaClient();
  
  try {
    const adminEmail = 'admin@admin.com';
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        name: 'Administrador',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    
    console.log("Admin user created/verified:", admin.email);
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
