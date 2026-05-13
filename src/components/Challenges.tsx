import React, { useState } from 'react';
import { UserProfile, Challenge } from '../types';
import { CHALLENGES } from '../data/challenges';
import { Trophy, CheckCircle2, Play, Lightbulb, RotateCcw, AlertTriangle, ArrowRight, ChevronRight } from 'lucide-react';
import { interpret } from '../lib/interpreter';
import { motion, AnimatePresence } from 'motion/react';

export default function Challenges({ user, onComplete }: { user: UserProfile, onComplete: (id: string, xp: number) => void }) {
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  
  if (activeChallengeId) {
    const chall = CHALLENGES.find(c => c.id === activeChallengeId)!;
    return <ChallengeSolver challenge={chall} onBack={() => setActiveChallengeId(null)} onComplete={onComplete} isCompleted={user.completedChallenges.includes(chall.id)} />;
  }

  return (
    <div className="space-y-10">
      <div className="bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 p-10 rounded-[2.5rem] border border-border relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/5 blur-[100px] rounded-full -mr-32 -mt-32 transition-all group-hover:bg-accent-blue/10"></div>
        <h2 className="text-3xl font-black flex items-center gap-4 tracking-tight relative z-1">
          <div className="w-12 h-12 bg-accent-blue/10 rounded-xl flex items-center justify-center border border-accent-blue/10">
            <Trophy className="text-accent-blue" size={24} />
          </div>
          Desafios de Programação
        </h2>
        <p className="text-text-dim mt-4 text-lg max-w-2xl relative z-1 leading-relaxed">Desenvolva algoritmos para cenários do cotidiano e conquiste prestígio no ranking da turma.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {CHALLENGES.map((chall) => {
          const isCompleted = user.completedChallenges.includes(chall.id);
          return (
            <button
              key={chall.id}
              id={`challenge-${chall.id}`}
              onClick={() => setActiveChallengeId(chall.id)}
              aria-label={`${isCompleted ? 'Desafio concluído: ' : 'Iniciar desafio: '} ${chall.title}`}
              className={`text-left bg-card p-10 rounded-[2rem] border transition-all hover:-translate-y-2 group shadow-soft overflow-hidden relative outline-none focus-visible:ring-4 focus-visible:ring-accent-blue/30 ${
                isCompleted ? 'border-accent-green/30 px-border' : 'border-border hover:border-accent-blue/40'
              }`}
            >
               {isCompleted && (
                 <div className="absolute top-0 right-0 w-24 h-24 bg-accent-green/5 blur-2xl -mr-12 -mt-12 group-hover:bg-accent-green/10 transition-all"></div>
               )}
               <div className="flex justify-between items-start mb-8 relative z-1">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${
                    chall.difficulty === 'Fácil' 
                      ? 'bg-accent-green/5 text-accent-green border-accent-green/10' 
                      : 'bg-accent-purple/5 text-accent-purple border-accent-purple/10'
                  }`}>
                    {chall.difficulty}
                  </div>
                  <span className="text-accent-blue font-black text-xs uppercase tracking-widest group-hover:scale-110 transition-transform">+{chall.xpReward} XP</span>
               </div>
               <h3 className="text-2xl font-black mb-3 tracking-tight group-hover:text-accent-blue transition-colors relative z-1">{chall.title}</h3>
               <p className="text-text-dim text-sm line-clamp-2 leading-relaxed relative z-1">{chall.context}</p>
               
               <div className="mt-10 flex items-center justify-between relative z-1">
                  {isCompleted ? (
                    <span className="flex items-center gap-2 text-accent-green font-black text-[10px] uppercase tracking-widest bg-accent-green/5 px-4 py-2 rounded-lg border border-accent-green/10">
                      <CheckCircle2 size={14} /> Desafio Vencido
                    </span>
                  ) : (
                    <span className="text-accent-purple font-black text-[10px] uppercase tracking-widest flex items-center gap-3 group-hover:text-text-main transition-colors">
                      Aceitar Desafio
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
               </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChallengeSolver({ 
  challenge, 
  onBack, 
  onComplete,
  isCompleted
}: { 
  challenge: Challenge; 
  onBack: () => void; 
  onComplete: (id: string, xp: number) => void;
  isCompleted: boolean;
}) {
  const [code, setCode] = useState(challenge.initialCode);
  const [output, setOutput] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showHint, setShowHint] = useState(false);

  const checkSolution = () => {
    const result = interpret(code);
    setOutput(result.output);
    
    const lastOutput = result.output[result.output.length - 1];
    const success = challenge.testCases.some(tc => lastOutput === tc.expectedOutput);
    
    if (success) {
      setFeedback({ type: 'success', message: 'Incrível! Seu algoritmo funcionou perfeitamente.' });
      onComplete(challenge.id, challenge.xpReward);
    } else {
      setFeedback({ type: 'error', message: 'Ops! O resultado não foi o esperado. Verifique o enunciado.' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
       <button 
         onClick={onBack} 
         aria-label="Voltar para a lista de desafios"
         className="text-text-dim hover:text-text-main mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50 rounded px-2 py-1 transition-colors"
       >
         <ChevronRight size={16} className="rotate-180" />
         Voltar
       </button>
       
       <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-700 shadow-xl">
                <h2 className="text-2xl font-bold mb-4">{challenge.title}</h2>
                <div className="space-y-4">
                   <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Contexto</p>
                      <p className="text-slate-300 text-sm leading-relaxed">{challenge.context}</p>
                   </div>
                   <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/20">
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Instrução</p>
                      <p className="text-slate-200 font-medium">{challenge.instruction}</p>
                   </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-700">
                   <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Dica do Professor</h4>
                      <button 
                        onClick={() => setShowHint(!showHint)} 
                        className="text-accent-blue hover:text-accent-blue/80 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50 rounded-lg p-1"
                        aria-label={showHint ? "Ocultar dica pedagógica" : "Mostrar dica pedagógica"}
                      >
                         <Lightbulb size={20} />
                      </button>
                   </div>
                   <AnimatePresence>
                     {showHint && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                           <p className="p-4 bg-slate-900 rounded-xl text-slate-400 text-sm border-l-2 border-indigo-500">
                             {challenge.hint || "Foque no uso correto das aspas e parênteses no comando ESCREVA."}
                           </p>
                        </motion.div>
                     )}
                   </AnimatePresence>
                </div>
             </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
              <div className="bg-[#1e293b] rounded-3xl border border-slate-700 overflow-hidden flex flex-col h-[400px]">
                <div className="px-6 py-3 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Editor</span>
                  <button 
                    onClick={() => setCode(challenge.initialCode)} 
                    className="text-text-dim hover:text-accent-blue transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50 rounded p-1"
                    aria-label="Restaurar código inicial do desafio"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
                <textarea
                  aria-label="Área de edição de código do desafio"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 w-full bg-transparent p-8 font-mono text-[13px] resize-none outline-none focus:ring-1 focus:ring-accent-blue/20 text-accent-blue caret-white leading-relaxed"
                  spellCheck={false}
                />
                <div className="p-4 bg-card/80 border-t border-border flex justify-end">
                  <button 
                    onClick={checkSolution}
                    className="bg-accent-blue hover:bg-accent-blue/80 text-bg font-black px-10 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-accent-blue/10 active:scale-95 uppercase tracking-widest text-xs outline-none focus-visible:ring-4 focus-visible:ring-accent-blue/30"
                  >
                    <Play size={14} fill="currentColor" />
                    Validar Algoritmo
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl border border-slate-700 p-6 shadow-inner min-h-[150px]">
                <div className="font-mono text-sm space-y-1">
                  {output.map((line, idx) => (
                    <div key={idx} className="text-slate-300">
                      <span className="text-slate-600 mr-2">{'>'}</span>{line}
                    </div>
                  ))}
                </div>
              </div>

              {feedback && (
                <div className={`p-6 rounded-2xl border flex items-center gap-4 ${
                    feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}>
                  <p className="font-bold">{feedback.message}</p>
                </div>
              )}
          </div>
       </div>
    </div>
  );
}
