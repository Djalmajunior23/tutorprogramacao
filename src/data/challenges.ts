import { Challenge } from '../types';

export const CHALLENGES: Challenge[] = [
  {
    id: 'desafio-ola',
    title: 'Minha Primeira Mensagem',
    context: 'Você precisa criar um algoritmo que mostre uma saudação personalizada.',
    instruction: 'Use o comando ESCREVA para mostrar "Olá Mundo" na tela.',
    initialCode: 'ALGORITMO "Primeiro"\nINÍCIO\n   // Seu código aqui\nFIM',
    difficulty: 'Fácil',
    xpReward: 30,
    testCases: [
      {
        input: [],
        expectedOutput: 'Olá Mundo'
      }
    ]
  },
  {
    id: 'desafio-soma',
    title: 'Calculadora Simples',
    context: 'O professor pediu para somar dois números fixos.',
    instruction: 'Crie duas variáveis inteiras A e B, atribua 10 e 20 a elas, e mostre o resultado da soma.',
    initialCode: 'ALGORITMO "Soma"\nVAR\n   A, B, SOMA : INTEIRO\nINÍCIO\n   \nFIM',
    difficulty: 'Fácil',
    xpReward: 30,
    testCases: [
      {
        input: [],
        expectedOutput: '30'
      }
    ]
  }
];
