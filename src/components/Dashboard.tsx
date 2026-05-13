import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { ANNOUNCEMENTS } from '../data/avisos';
import { Trophy, BookOpen, GraduationCap, Flame, ArrowRight, Bell, Layout, Users, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard({ user, onStartTrilha }: { user: UserProfile, onStartTrilha: () => void }) {
  const [stats, setStats] = useState({ students: 0, classes: 0 });

  useEffect(() => {
    fetch('/api/ranking')
      .then(res => res.json())
      .then(data => setStats(prev => ({ ...prev, students: data.length })))
      .catch(() => {});
    
    // In a real app, we'd fetch classes too
    setStats(prev => ({ ...prev, classes: 4 })); 
  }, []);

  const isTeacher = user.role === 'TEACHER';

  return (
    <div className="space-y-10 pb-10">
      {/* Welcome Card */}
      <section className="relative overflow-hidden bg-gradient-to-br from-accent-blue to-accent-purple rounded-[2rem] p-10 md:p-14 shadow-2xl shadow-accent-blue/10 text-bg">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter">
            {isTeacher ? 'Painel Gestor' : `Olá, ${user.name.split(' ')[0]}! 👋`}
          </h1>
          <p className="text-bg/80 text-xl mb-10 leading-relaxed font-medium">
            {isTeacher 
              ? 'Acompanhe o desempenho das suas turmas e gerencie o conteúdo pedagógico do portal.' 
              : 'Seu progresso está excelente! Hoje é um ótimo dia para aprender sobre **Laços de Repetição**.'}
          </p>
          <button 
            id="btn-dashboard-start"
            onClick={onStartTrilha}
            className="bg-bg text-text-main font-black px-10 py-4 rounded-xl hover:scale-105 transition-all flex items-center gap-3 group uppercase tracking-widest text-sm shadow-xl outline-none focus-visible:ring-4 focus-visible:ring-bg/50"
          >
            {isTeacher ? 'Gerenciar Turmas' : 'Continuar Estudos'}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-20 hidden lg:block">
          {isTeacher ? <Users size={300} className="text-bg" /> : <GraduationCap size={300} className="text-bg" />}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Progress Grid */}
        <div className="lg:col-span-2 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
             <div className="bg-card p-8 rounded-[2rem] border border-border shadow-soft transition-all hover:border-accent-blue/30 group">
                <div className="w-12 h-12 bg-accent-blue/10 rounded-xl flex items-center justify-center mb-6 border border-accent-blue/10 group-hover:scale-110 transition-transform">
                  {isTeacher ? <Users className="text-accent-blue" size={24} /> : <Trophy className="text-accent-blue" size={24} />}
                </div>
                <p className="text-text-dim text-xs font-black uppercase tracking-[0.2em] mb-2">{isTeacher ? 'Total Alunos' : 'XP Total'}</p>
                <h3 className="text-4xl font-black text-text-main tracking-tighter">{isTeacher ? stats.students : user.xp}</h3>
             </div>
             <div className="bg-card p-8 rounded-[2rem] border border-border shadow-soft transition-all hover:border-accent-purple/30 group">
                <div className="w-12 h-12 bg-accent-purple/10 rounded-xl flex items-center justify-center mb-6 border border-accent-purple/10 group-hover:scale-110 transition-transform">
                  {isTeacher ? <Layout className="text-accent-purple" size={24} /> : <Flame className="text-accent-purple" size={24} />}
                </div>
                <p className="text-text-dim text-xs font-black uppercase tracking-[0.2em] mb-2">{isTeacher ? 'Turmas Ativas' : 'Desafios'}</p>
                <h3 className="text-4xl font-black text-text-main tracking-tighter">{isTeacher ? stats.classes : user.completedChallenges.length}</h3>
             </div>
             <div className="bg-card p-8 rounded-[2rem] border border-border shadow-soft transition-all hover:border-accent-green/30 group">
                <div className="w-12 h-12 bg-accent-green/10 rounded-xl flex items-center justify-center mb-6 border border-accent-green/10 group-hover:scale-110 transition-transform">
                  {isTeacher ? <Zap className="text-accent-green" size={24} /> : <BookOpen className="text-accent-green" size={24} />}
                </div>
                <p className="text-text-dim text-xs font-black uppercase tracking-[0.2em] mb-2">{isTeacher ? 'Trilhas' : 'Módulos'}</p>
                <h3 className="text-4xl font-black text-text-main tracking-tighter">{isTeacher ? 2 : user.completedModules.length}</h3>
             </div>
          </div>

          <div>
             <h3 className="text-sm font-black uppercase tracking-[0.3em] text-text-dim mb-8 flex items-center gap-3">
                <div className="w-8 h-[1px] bg-accent-blue"></div>
                Mural de Avisos
             </h3>
             <div className="space-y-4">
               {ANNOUNCEMENTS.map((aviso) => (
                 <div 
                   key={aviso.id} 
                   tabIndex={0}
                   className="bg-card/50 p-6 rounded-2xl border border-border hover:border-accent-blue/20 transition-all flex gap-6 group outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/30"
                 >
                   <div className={`mt-1.5 h-3 w-3 rounded-full flex-shrink-0 animate-pulse ${aviso.type === 'urgente' ? 'bg-rose-500' : 'bg-accent-blue'}`} />
                   <div className="flex-1">
                     <h4 className="font-bold text-text-main text-lg group-hover:text-accent-blue transition-colors">{aviso.title}</h4>
                     <p className="text-text-dim mt-2 leading-relaxed">{aviso.message}</p>
                     <p className="text-[10px] text-text-dim font-black uppercase mt-4 tracking-[0.2em] opacity-50">{new Date(aviso.date).toLocaleDateString('pt-BR')}</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Sidebar Mini Components */}
        <div className="space-y-10">
           <div className="bg-card p-10 rounded-[2.5rem] border border-border relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 blur-3xl -mr-16 -mt-16"></div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-text-dim mb-8 relative z-1">Próxima Missão</h4>
              <div className="p-6 bg-accent-purple/5 rounded-2xl border border-accent-purple/20 relative z-1">
                <p className="font-bold text-accent-purple text-lg mb-2">Primeiro Passo</p>
                <p className="text-text-dim text-sm leading-relaxed">Conclua seu primeiro módulo de lógica para ganhar um bônus especial.</p>
                <div className="w-full bg-border h-1.5 rounded-full mt-6 overflow-hidden">
                  <div className="bg-accent-purple h-full w-[20%] rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                </div>
              </div>
           </div>

           <div className="bg-card/30 p-10 rounded-[2.5rem] border border-border group hover:bg-card transition-all">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-text-dim mb-6">Sabedoria Tech</h4>
              <p className="text-text-main/70 text-sm leading-relaxed italic border-l-2 border-accent-blue pl-6 py-2 group-hover:text-text-main transition-colors">
                "O primeiro programador do mundo foi uma mulher, Ada Lovelace, que escreveu algoritmos para a Máquina Analítica de Babbage em 1843."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
