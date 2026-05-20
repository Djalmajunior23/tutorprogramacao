import React from 'react';
import { motion } from 'motion/react';
import { Target, Zap, Brain, Code2, Layers, Cpu } from 'lucide-react';

interface SkillMapProps {
  skills: {
    logic: number;
    variables: number;
    conditionals: number;
    loops: number;
    arrays: number;
    functions: number;
    classes?: number;
    encapsulation?: number;
    inheritance?: number;
    polymorphism?: number;
  };
}

export default function SkillMap({ skills }: SkillMapProps) {
  const skillItems = [
    { key: 'logic', label: 'Lógica Proposicional', icon: Brain, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
    { key: 'variables', label: 'Variáveis e Tipos', icon: Target, color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
    { key: 'conditionals', label: 'Estruturas de Decisão', icon: Zap, color: 'text-accent-green', bg: 'bg-accent-green/10' },
    { key: 'loops', label: 'Laços de Repetição', icon: Layers, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { key: 'arrays', label: 'Vetores e Matrizes', icon: Cpu, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { key: 'functions', label: 'Funções e Escopo', icon: Code2, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { key: 'classes', label: 'Orientação a Objetos', icon: Layers, color: 'text-indigo-500', bg: 'bg-indigo-500/10', section: 'POO' },
    { key: 'inheritance', label: 'Herança e Abstração', icon: Cpu, color: 'text-indigo-600', bg: 'bg-indigo-600/10', section: 'POO' },
  ];

  return (
    <div className="bg-card p-10 rounded-[2.5rem] border border-border shadow-soft">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-2xl font-black tracking-tighter text-text-main">Mapa de Competências</h3>
          <p className="text-text-dim text-xs font-medium mt-1">Seu domínio técnico em cada pilar da programação</p>
        </div>
        <div className="px-4 py-1.5 bg-accent-blue/10 rounded-full border border-accent-blue/20 text-accent-blue text-[10px] font-black uppercase tracking-widest">
           Análise em Tempo Real
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {skillItems.map((item, idx) => {
          const value = (skills as any)[item.key] || 0;
          return (
            <div key={item.key} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${item.bg} ${item.color} rounded-lg flex items-center justify-center border border-current opacity-30`}>
                    <item.icon size={16} />
                  </div>
                  <span className="text-sm font-bold text-text-main">{item.label}</span>
                </div>
                <span className={`text-xs font-black ${item.color}`}>{value}%</span>
              </div>
              <div className="h-3 bg-bg border border-border rounded-full overflow-hidden p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ delay: idx * 0.1, duration: 1 }}
                  className={`h-full rounded-full bg-gradient-to-r from-transparent to-current ${item.color}`}
                  style={{ color: 'inherit' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 p-6 bg-accent-blue/5 rounded-2xl border border-accent-blue/10 flex items-start gap-4">
        <div className="w-10 h-10 bg-accent-blue/20 rounded-xl flex items-center justify-center text-accent-blue flex-shrink-0">
          <Brain size={20} />
        </div>
        <div>
          <h4 className="font-bold text-text-main text-sm mb-1">Dica Adaptativa</h4>
          <p className="text-text-dim text-xs leading-relaxed">
            Com base no seu desempenho, sugerimos focar em **Estruturas de Decisão**. Você concluiu os desafios de variáveis, mas ainda tem dúvidas em fluxogramas complexos.
          </p>
        </div>
      </div>
    </div>
  );
}
