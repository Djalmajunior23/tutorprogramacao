import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create Admin/Teacher
  const djalma = await prisma.user.upsert({
    where: { email: 'djalma@ifsp.edu.br' },
    update: {},
    create: {
      name: 'Djalma Batista',
      email: 'djalma@ifsp.edu.br',
      password: hashedPassword,
      role: 'TEACHER',
    }
  });

  await prisma.teacherProfile.upsert({
    where: { userId: djalma.id },
    update: {},
    create: { userId: djalma.id, bio: 'Professor de Engenharia de Software' }
  });

  // Create a default track
  const logicPath = await prisma.learningPath.create({
    data: {
      title: 'Lógica Profissional',
      description: 'Fundamentos avançados com persistência real.',
      difficulty: 'Iniciante',
      xpReward: 500,
    },
  });

  // Create modules
  const mod1 = await prisma.module.create({
    data: {
      learningPathId: logicPath.id,
      title: 'Variáveis e Constantes',
      description: 'Como o computador armazena informações.',
      order: 1,
      content: 'Neste módulo você aprenderá sobre tipos de dados e armazenamento.',
      xpReward: 50,
    },
  });

  // Create a challenge
  await prisma.challenge.create({
    data: {
      moduleId: mod1.id,
      title: 'A Primeira Variável',
      context: 'Você precisa armazenar a idade de um usuário.',
      command: 'Crie uma variável chamada "idade" com o valor 25.',
      starterCode: '// Escreva seu código abaixo\n',
      expected: 'var idade = 25;',
      difficulty: 'Fácil',
      type: 'PSEUDOCODE',
      xpReward: 30,
    },
  });

  console.log('Seed finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
