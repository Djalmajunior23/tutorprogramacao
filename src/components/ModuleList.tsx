import React from 'react';
import { UserProfile } from '../types';
import { TRAILS, MODULES } from '../data/content';
import { CheckCircle2, ChevronRight, Lock, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

export default function ModuleList({ user, onSelectModule }: { user: UserProfile, onSelectModule: (id: string) => void }) {
  return (
    <div className="space-y-16 pb-10">
      {TRAILS.map((trail) => {
        const completedCount = trail.modules.filter(modId => user.completedModules.includes(modId)).length;
        const progress = Math.round((completedCount / trail.modules.length) * 100);

        return (
          <section key={trail.id} className="relative">
            <div className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-card/30 p-8 rounded-[2.5rem] border border-border backdrop-blur-sm">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                  <div className="w-2 h-2 bg-accent-blue rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-blue">Sua Jornada Atual</span>
                </div>
                <h2 className="text-5xl font-black tracking-tighter text-text-main">{trail.title}</h2>
                <p className="text-text-dim mt-3 text-lg max-w-xl leading-relaxed">{trail.description}</p>
              </div>
              
              <div className="w-full lg:w-96 bg-bg p-8 rounded-3xl border border-border mt-4 lg:mt-0 shadow-soft">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-dim">Módulos Concluídos</p>
                    <p className="text-3xl font-black text-text-main mt-1">
                      {completedCount} <span className="text-text-dim text-xl">/ {trail.modules.length}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-dim">Completude</p>
                    <p className="text-2xl font-black text-accent-blue mt-1">{progress}%</p>
                  </div>
                </div>
                <div className="h-4 bg-card border border-border rounded-full p-1 overflow-hidden shadow-inner group">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full shadow-[0_0_15px_rgba(59,130,246,0.4)] relative"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {trail.modules.map((modId) => {
              const mod = MODULES.find(m => m.id === modId);
              if (!mod) return null;
              
              const isCompleted = user.completedModules.includes(modId);
              
              return (
                <button
                  key={modId}
                  id={`module-${modId}`}
                  onClick={() => onSelectModule(modId)}
                  aria-label={`${isCompleted ? 'Módulo concluído: ' : 'Iniciar módulo: '} ${mod.title}`}
                  className={`group relative text-left bg-card p-10 rounded-[2rem] border transition-all duration-300 hover:shadow-2xl hover:shadow-accent-purple/5 hover:-translate-y-2 overflow-hidden outline-none focus-visible:ring-4 focus-visible:ring-accent-purple/30 ${
                    isCompleted ? 'border-accent-green/30 px-border' : 'border-border hover:border-accent-purple/40'
                  }`}
                >
                  {isCompleted && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent-green/5 blur-2xl -mr-12 -mt-12 group-hover:bg-accent-green/10 transition-all"></div>
                  )}
                  
                  <div className="flex justify-between items-start mb-8 relative z-1">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                      isCompleted 
                        ? 'bg-accent-green/10 text-accent-green border-accent-green/20' 
                        : 'bg-accent-purple/5 text-accent-purple border-accent-purple/10 group-hover:bg-accent-purple/20'
                    }`}>
                      {isCompleted ? <CheckCircle2 size={24} /> : <BookOpen size={24} />}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${
                      isCompleted ? 'text-accent-green border-accent-green/20' : 'text-text-dim border-border'
                    }`}>
                       +{mod.xpReward} XP
                    </span>
                  </div>

                  <h3 className="text-2xl font-black mb-3 tracking-tight group-hover:text-accent-purple transition-colors relative z-1">{mod.title}</h3>
                  <p className="text-text-dim text-sm leading-relaxed line-clamp-2 mb-8 relative z-1">{mod.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto relative z-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded border ${
                        mod.difficulty === 'Fácil' ? 'bg-accent-green/5 text-accent-green border-accent-green/10' :
                        mod.difficulty === 'Médio' ? 'bg-accent-blue/5 text-accent-blue border-accent-blue/10' :
                        'bg-rose-500/5 text-rose-400 border-rose-500/10'
                      }`}>
                        {mod.difficulty}
                      </span>
                    </div>
                    <ChevronRight size={20} className="text-text-dim group-hover:text-accent-purple transform group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      );
    })}
  </div>
);
}
