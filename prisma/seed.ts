import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Users
  const password = await bcrypt.hash('Admin@123', 10);
  const teacherPassword = await bcrypt.hash('Professor@123', 10);
  const studentPassword = await bcrypt.hash('Aluno@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@portal.com' },
    update: {},
    create: {
      email: 'admin@portal.com',
      name: 'Admin Sistema',
      role: 'ADMIN',
      password: password,
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'professor@portal.com' },
    update: {},
    create: {
      email: 'professor@portal.com',
      name: 'Prof. Djalma',
      role: 'TEACHER',
      password: teacherPassword,
      teacherProfile: { create: { bio: 'Professor de Lógica e Fundamentos' } }
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'aluno@portal.com' },
    update: {},
    create: {
      email: 'aluno@portal.com',
      name: 'Estudante Exemplo',
      role: 'STUDENT',
      password: studentPassword,
      studentProfile: { create: { xp: 120, level: 2 } }
    },
  });

  // 2. Programming Languages
  const languages = ['Pseudolinguagem', 'Python', 'JavaScript', 'Java', 'C#', 'C++', 'PHP', 'SQL', 'TypeScript'];
  for (const name of languages) {
    await prisma.programmingLanguage.upsert({
      where: { name },
      update: {},
      create: { name, description: `Trilha profissional de ${name}` }
    });
  }

  // 3. Concepts
  const conceptsData = [
    { name: 'Algoritmo', description: 'Sequência lógica de passos para resolver um problema.' },
    { name: 'Variáveis', description: 'Espaço na memória para armazenar dados.' },
    { name: 'Tipos de dados', description: 'Definição do tipo de informação processada.' },
    { name: 'Entrada e saída', description: 'Comunicação entre o programa e o usuário.' },
    { name: 'Operadores', description: 'Símbolos para operações matemáticas e lógicas.' },
    { name: 'Condicionais', description: 'Estruturas de decisão (Se/Senão).' },
    { name: 'Laços', description: 'Estruturas de repetição (Enquanto/Para).' },
    { name: 'Vetores', description: 'Coleções de dados do mesmo tipo.' },
    { name: 'Funções', description: 'Blocos de código reutilizáveis.' },
    { name: 'Classes e objetos', description: 'Pilares da Orientação a Objetos.' }
  ];

  for (const concept of conceptsData) {
    await prisma.concept.upsert({
      where: { name: concept.name },
      update: {},
      create: concept
    });
  }

  // 4. Syntax Examples (Crucial for Comparator)
  const concepts = await prisma.concept.findMany();
  const langs = await prisma.programmingLanguage.findMany();

  const syntaxData = [
    {
      conceptName: 'Entrada e saída',
      examples: [
        { lang: 'Pseudolinguagem', code: 'ESCREVA("Olá, mundo!")' },
        { lang: 'Python', code: 'print("Olá, mundo!")' },
        { lang: 'JavaScript', code: 'console.log("Olá, mundo!")' },
        { lang: 'Java', code: 'System.out.println("Olá, mundo!");' },
        { lang: 'C#', code: 'Console.WriteLine("Olá, mundo!");' }
      ]
    },
    {
      conceptName: 'Variáveis',
      examples: [
        { lang: 'Pseudolinguagem', code: 'var nome : string <- "Djalma"' },
        { lang: 'Python', code: 'nome = "Djalma"' },
        { lang: 'JavaScript', code: 'let nome = "Djalma";' },
        { lang: 'Java', code: 'String nome = "Djalma";' },
        { lang: 'C#', code: 'string nome = "Djalma";' }
      ]
    },
    {
      conceptName: 'Condicionais',
      examples: [
        { lang: 'Pseudolinguagem', code: 'SE (x > 10) ENTÃO\n  ESCREVA("Maior")\nSENÃO\n  ESCREVA("Menor")\nFIM_SE' },
        { lang: 'Python', code: 'if x > 10:\n    print("Maior")\nelse:\n    print("Menor")' },
        { lang: 'JavaScript', code: 'if (x > 10) {\n  console.log("Maior");\n} else {\n  console.log("Menor");\n}' },
        { lang: 'Java', code: 'if (x > 10) {\n  System.out.println("Maior");\n} else {\n  System.out.println("Menor");\n}' },
        { lang: 'C#', code: 'if (x > 10) {\n  Console.WriteLine("Maior");\n} else {\n  Console.WriteLine("Menor");\n}' }
      ]
    }
  ];

  for (const item of syntaxData) {
    const concept = concepts.find(c => c.name === item.conceptName);
    if (!concept) continue;

    for (const ex of item.examples) {
      const language = langs.find(l => l.name === ex.lang);
      if (!language) continue;

      await prisma.syntaxExample.upsert({
        where: {
          conceptId_languageId: {
            conceptId: concept.id,
            languageId: language.id
          }
        },
        update: { code: ex.code },
        create: {
          conceptId: concept.id,
          languageId: language.id,
          code: ex.code
        }
      });
    }
  }

  // 5. Learning Paths
  const paths = [
    'Fundamentos universais da programação', 
    'Trilha Python', 
    'Trilha JavaScript', 
    'Trilha Java', 
    'Trilha C#', 
    'Trilha SQL', 
    'Trilha de recuperação', 
    'Trilha avançada', 
    'Preparação SAEP'
  ];

  for (const title of paths) {
    const id = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-');
    await prisma.learningPath.upsert({
      where: { id },
      update: {},
      create: {
        id,
        title,
        description: `Conteúdo completo para ${title}`,
        difficulty: 'Iniciante',
        xpReward: 500
      }
    });
  }

  // 6. Challenges
  const challengesData = [
    {
      title: "Olá, mundo",
      context: "Primeiro contato com saída de dados.",
      command: "Crie um algoritmo que escreva Olá, mundo na tela.",
      starterCode: "ALGORITMO \"OlaMundo\"\nINÍCIO\n   ESCREVA(\"Olá, mundo\")\nFIM",
      difficulty: "EASY",
      type: "PSEUDOCODE",
      xpReward: 30
    },
    {
      title: "Calcular média",
      context: "Um aluno precisa calcular sua média.",
      command: "Leia duas notas, calcule a média e exiba o resultado.",
      starterCode: "ALGORITMO \"Media\"\nVAR\n   nota1, nota2, media : REAL\nINÍCIO\n   LEIA(nota1 : 7)\n   LEIA(nota2 : 8)\n   media <- (nota1 + nota2) / 2\n   ESCREVA(media)\nFIM",
      difficulty: "EASY",
      type: "PSEUDOCODE",
      xpReward: 50
    }
  ];

  for (const challenge of challengesData) {
    await prisma.challenge.upsert({
      where: { id: challenge.title.toLowerCase().replace(/ /g, '-') }, // Minimal ID mapping for seed
      update: challenge,
      create: {
        ...challenge,
        id: challenge.title.toLowerCase().replace(/ /g, '-')
      }
    });
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
