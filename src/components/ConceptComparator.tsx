import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Code2, ChevronRight, Terminal, Globe, ChevronDown } from 'lucide-react';

interface LanguageTemplate {
  name: string;
  code: string;
  note: string;
}

const CONCEPTS = [
  {
    id: 'converter',
    title: 'Transformador I.D.E.A (Conversor)',
    pseudocode: '// Escreva seu pseudocódigo aqui para converter\nalgoritmo "teste"\n  escreva("Conversão Inteligente")\nfimalgoritmo',
    implementations: [
      { name: 'Python', code: 'print("Conversão Inteligente")', note: 'Processado via Regras de Transpilação.' },
      { name: 'JavaScript', code: 'console.log("Conversão Inteligente");', note: 'Processado via Regras de Transpilação.' },
      { name: 'Java', code: 'System.out.println("Conversão Inteligente");', note: 'Processado via Regras de Transpilação.' }
    ]
  },
  {
    id: 'conditional',
    title: 'Estrutura Condicional (Se/Senão)',
    pseudocode: 'se (nota >= 6) entao\n  escreva("Aprovado")\nsenao\n  escreva("Reprovado")\nfimse',
    implementations: [
      { name: 'Python', code: 'if nota >= 6:\n    print("Aprovado")\nelse:\n    print("Reprovado")', note: 'Em Python, a indentação define o bloco.' },
      { name: 'JavaScript', code: 'if (nota >= 6) {\n  console.log("Aprovado");\n} else {\n  console.log("Reprovado");\n}', note: 'Usa chaves {} para delimitar blocos.' },
      { name: 'C#', code: 'if (nota >= 6) {\n    Console.WriteLine("Aprovado");\n}\nelse {\n    Console.WriteLine("Reprovado");\n}', note: 'Console.WriteLine é a saída padrão.' }
    ]
  },
  {
    id: 'loop',
    title: 'Laço de Repetição (Enquanto)',
    pseudocode: 'enquanto (contador < 5) faca\n  escreva(contador)\n  contador <- contador + 1\nfimenquanto',
    implementations: [
      { name: 'Python', code: 'while contador < 5:\n    print(contador)\n    contador += 1', note: '+= é o operador de incremento.' },
      { name: 'JavaScript', code: 'while (contador < 5) {\n  console.log(contador);\n  contador++;\n}', note: '++ incrementa em 1.' },
      { name: 'C#', code: 'while (contador < 5) {\n    Console.WriteLine(contador);\n    contador++;\n}', note: 'Sintaxe quase idêntica ao JS.' }
    ]
  },
  {
    id: 'array',
    title: 'Vetores (Listas)',
    pseudocode: 'lista[0] <- "Maçã"\nlista[1] <- "Uva"\nescreva(lista[0])',
    implementations: [
      { name: 'Python', code: 'lista = ["Maçã", "Uva"]\nprint(lista[0])', note: 'Listas em Python são dinâmicas.' },
      { name: 'JavaScript', code: 'const lista = ["Maçã", "Uva"];\nconsole.log(lista[0]);', note: 'Arrays são objetos em JS.' },
      { name: 'C#', code: 'string[] lista = { "Maçã", "Uva" };\nConsole.WriteLine(lista[0]);', note: 'Arrays em C# têm tamanho fixo por padrão.' }
    ]
  },
  {
    id: 'poo',
    title: 'Orientação a Objetos (Classes)',
    pseudocode: '// Classe Pessoa\n// Atributo nome\n// Método falar()\np <- NOVO Pessoa()\np.nome <- "Djalma"\np.falar()',
    implementations: [
      { name: 'Python', code: 'class Pessoa:\n    def __init__(self, nome):\n        self.nome = nome\n\n    def falar(self):\n        print(f"Oi, sou {self.nome}")', note: 'self refere-se à instância.' },
      { name: 'Java', code: 'public class Pessoa {\n    String nome;\n    void falar() {\n        System.out.println("Oi");\n    }\n}', note: 'Java é verboso e focado em POO.' },
      { name: 'C#', code: 'public class Pessoa {\n    public string Nome { get; set; }\n    public void Falar() => Console.WriteLine("Oi");\n}', note: 'Usa properties com get/set.' }
    ]
  }
];

export default function ConceptComparator() {
  const [activeConcept, setActiveConcept] = useState(CONCEPTS[0]);

  return (
    <div className="bg-card rounded-[2.5rem] border border-border shadow-soft overflow-hidden">
      <div className="p-10 border-b border-border bg-gradient-to-br from-bg to-card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-accent-green/10 rounded-xl flex items-center justify-center text-accent-green border border-accent-green/10">
            <Globe size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tighter text-text-main">Comparador Multilíngue</h3>
            <p className="text-text-dim text-xs font-medium">Veja como o mesmo conceito se traduz entre linguagens</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {CONCEPTS.map(concept => (
            <button
              key={concept.id}
              onClick={() => setActiveConcept(concept)}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeConcept.id === concept.id ? 'bg-accent-green text-bg shadow-lg shadow-accent-green/20' : 'bg-bg text-text-dim hover:text-text-main border border-border'}`}
            >
              {concept.title.split('(')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Pseudocode Source */}
        <div className="p-10 border-r border-border bg-bg/30">
          <div className="flex items-center gap-3 mb-6">
            <Terminal size={18} className="text-accent-blue" />
            <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">Fundamento (Pseudocódigo)</span>
          </div>
          <div className="bg-bg border border-border rounded-2xl p-8 font-mono text-sm leading-relaxed text-accent-blue shadow-inner min-h-[200px] flex items-center">
            <pre className="whitespace-pre-wrap">{activeConcept.pseudocode}</pre>
          </div>
          <div className="mt-8 p-6 bg-accent-blue/5 rounded-xl border border-accent-blue/10">
            <p className="text-xs text-text-dim leading-relaxed">
              <strong>Nota Pedagógica:</strong> O pseudocódigo foca na lógica pura, ignorando as nuances sintáticas de máquinas reais. É a base de todo algoritmo.
            </p>
          </div>
        </div>

        {/* Multi-language implementations */}
        <div className="p-10 space-y-6 max-h-[600px] overflow-y-auto">
          {activeConcept.implementations.map((impl, idx) => (
            <motion.div 
              key={impl.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-bg border border-border rounded-2xl p-6 hover:border-accent-green/30 transition-all shadow-sm group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-accent-green">{impl.name}</span>
                <span className="text-[9px] text-text-dim/50 group-hover:text-text-dim transition-colors text-right max-w-[150px]">{impl.note}</span>
              </div>
              <pre className="font-mono text-xs text-text-main/80 bg-card/50 p-4 rounded-lg overflow-x-auto border border-border/50">
                {impl.code}
              </pre>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
