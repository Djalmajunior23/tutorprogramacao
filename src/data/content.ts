import { Trail, Module } from '../types';

export const MODULES: Module[] = [
  {
    id: 'intro-logica',
    title: 'Lógica e Algoritmos',
    description: 'A base de tudo: o que é um algoritmo e como pensar logicamente.',
    difficulty: 'Fácil',
    xpReward: 50,
    content: `
# Lógica e Algoritmos
A lógica de programação é a base fundamental para qualquer desenvolvedor. Um **algoritmo** é simplesmente uma sequência de passos finitos para resolver um problema.

Imagine uma receita de bolo: você tem ingredientes (entrada), passos a seguir (processamento) e o bolo pronto (saída).
    `,
    examples: [
      {
        pseudo: 'ALGORITMO "Olá mundo"\nINÍCIO\n   ESCREVA("Olá, mundo!")\nFIM',
        csharp: 'using System;\nclass Program {\n  static void Main() {\n    Console.WriteLine("Olá, mundo!");\n  }\n}',
        java: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Olá, mundo!");\n  }\n}'
      }
    ]
  },
  {
    id: 'variaveis',
    title: 'Variáveis e Tipos',
    description: 'Aprenda a armazenar informações na memória do computador.',
    difficulty: 'Fácil',
    xpReward: 50,
    content: `
# Variáveis
Variáveis são espaços na memória para guardar dados. No Pseudocódigo do VisuAlg, declaramos na seção VAR.

Tipos comuns:
- **INTEIRO**: Números sem casas decimais (1, 2, -5).
- **REAL**: Números com casas decimais (3.14, -0.5).
- **CARACTERE**: Textos e letras ("Olá").
- **LOGICO**: Verdadeiro ou Falso.
    `,
    examples: [
      {
        pseudo: 'VAR\n  nome: CARACTERE\n  idade: INTEIRO\nINÍCIO\n  nome <- "Djalma"\n  idade <- 25\nFIM',
        csharp: 'string nome = "Djalma";\nint idade = 25;',
        java: 'String nome = "Djalma";\nint idade = 25;'
      }
    ]
  },
  {
    id: 'entrada-saida',
    title: 'Entrada e Saída',
    description: 'Interagindo com o usuário: comandos LEIA e ESCREVA.',
    difficulty: 'Fácil',
    xpReward: 50,
    content: `
# Entrada e Saída
Para o programa ser útil, ele precisa interagir.
- **ESCREVA**: Mostra algo na tela.
- **LEIA**: Pede para o usuário digitar algo.
    `,
    examples: [
      {
        pseudo: 'VAR\n  nome: CARACTERE\nINÍCIO\n  ESCREVA("Digite seu nome:")\n  LEIA(nome)\n  ESCREVA("Olá ", nome)\nFIM',
        csharp: 'Console.WriteLine("Digite seu nome:");\nstring nome = Console.ReadLine();\nConsole.WriteLine($"Olá {nome}");',
        java: 'Scanner sc = new Scanner(System.in);\nSystem.out.println("Digite seu nome:");\nString nome = sc.nextLine();\nSystem.out.println("Olá " + nome);'
      }
    ]
  }
];

export const TRAILS: Trail[] = [
  {
    id: 'primeiros-passos',
    title: 'Fundamentos da Lógica',
    description: 'Da introdução até as variáveis e interações básicas.',
    modules: ['intro-logica', 'variaveis', 'entrada-saida'],
    xpReward: 150
  }
];
