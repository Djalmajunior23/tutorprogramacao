import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { ANNOUNCEMENTS } from '../data/avisos';
import { Trophy, BookOpen, GraduationCap, Flame, ArrowRight, Bell, Layout, Users, Zap, Brain, CheckCircle, Clock, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import SkillMap from './SkillMap';
import { studentsService, educationService } from '../services/api';

export default function Dashboard({ user, onStartTrilha }: { user: UserProfile, onStartTrilha: () => void }) {
  const [stats, setStats] = useState<any>({ students: 0, classes: 0, active: 0, recent: [], studentsByClass: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (user.role === 'TEACHER' || user.role === 'ADMIN') {
          const s = await studentsService.getStats();
          setStats({
            students: s.total || 0,
            active: s.active || 0,
            recent: Array.isArray(s.recent) ? s.recent : [],
            studentsByClass: Array.isArray(s.studentsByClass) ? s.studentsByClass : [],
            classes: Array.isArray(s.studentsByClass) ? s.studentsByClass.length : 0
          });
        } else {
          // Student logic - use service instead of native fetch to ensure proper API_URL and headers
          const data = await educationService.getRanking();
          setStats((prev: any) => ({ ...prev, students: Array.isArray(data) ? data.length : 0, classes: 4 }));
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user.role]);

  const isTeacher = user.role === 'TEACHER' || user.role === 'ADMIN';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-20 animate-pulse">
        <div className="w-20 h-20 bg-accent-blue/10 rounded-3xl flex items-center justify-center text-accent-blue mb-6">
          <Brain size={48} className="animate-bounce" />
        </div>
        <h2 className="text-xl font-black text-text-dim uppercase tracking-[0.3em]">Sincronizando Dados...</h2>
        <p className="text-xs text-text-dim/40 mt-2 font-medium">O Tutor IDEA está otimizando sua trilha.</p>
      </div>
    );
  }

  if (isTeacher) {
    return (
      <div className="space-y-12 pb-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-bg-dark to-bg border border-border rounded-[3rem] p-10 md:p-16 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-blue/5 blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-blue/10 text-accent-blue text-[10px] font-black rounded-full border border-accent-blue/20 uppercase tracking-[0.2em] mb-6">
                Painel Administrativo
              </div>
              <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter leading-tight">
                Olá, {user.name?.split(' ')[0] || 'Gestor'}! <span className="opacity-40 font-medium">Gestor</span>
              </h1>
              <p className="text-text-dim text-xl mb-10 leading-relaxed font-medium">
                Sua plataforma está saudável. Hoje temos <strong>{stats.active}</strong> alunos ativos de um total de <strong>{stats.students}</strong>.
              </p>
            </div>
            <div className="flex gap-4">
               <div className="p-8 bg-card border border-border rounded-3xl shadow-xl hover:border-accent-blue/30 transition-all text-center min-w-[160px]">
                  <p className="text-[10px] font-black uppercase text-text-dim tracking-widest mb-2">Alunos Ativos</p>
                  <p className="text-4xl font-black text-accent-green">{stats.active}</p>
               </div>
               <div className="p-8 bg-card border border-border rounded-3xl shadow-xl hover:border-accent-blue/30 transition-all text-center min-w-[160px]">
                  <p className="text-[10px] font-black uppercase text-text-dim tracking-widest mb-2">Total</p>
                  <p className="text-4xl font-black text-accent-blue">{stats.students}</p>
               </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           <div className="bg-card p-8 rounded-[2rem] border border-border hover:border-accent-blue/30 transition-all group">
              <div className="w-12 h-12 bg-accent-blue/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="text-accent-blue" size={24} />
              </div>
              <p className="text-text-dim text-[10px] font-black uppercase tracking-widest mb-1">Total Estudantes</p>
              <h3 className="text-4xl font-black">{stats.students}</h3>
           </div>
           <div className="bg-card p-8 rounded-[2rem] border border-border hover:border-accent-green/30 transition-all group">
              <div className="w-12 h-12 bg-accent-green/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle className="text-accent-green" size={24} />
              </div>
              <p className="text-text-dim text-[10px] font-black uppercase tracking-widest mb-1">Alunos Ativos</p>
              <h3 className="text-4xl font-black">{stats.active}</h3>
           </div>
           <div className="bg-card p-8 rounded-[2rem] border border-border hover:border-accent-purple/30 transition-all group">
              <div className="w-12 h-12 bg-accent-purple/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layout className="text-accent-purple" size={24} />
              </div>
              <p className="text-text-dim text-[10px] font-black uppercase tracking-widest mb-1">Total de Turmas</p>
              <h3 className="text-4xl font-black">{stats.classes}</h3>
           </div>
           <div className="bg-card p-8 rounded-[2rem] border border-border hover:border-accent-blue/30 transition-all group">
              <div className="w-12 h-12 bg-accent-blue/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="text-accent-blue" size={24} />
              </div>
              <p className="text-text-dim text-[10px] font-black uppercase tracking-widest mb-1">Média Engajamento</p>
              <h3 className="text-4xl font-black">88%</h3>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Alunos por Turma */}
          <div className="lg:col-span-1 bg-card rounded-[2.5rem] border border-border p-10">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-text-dim mb-8 flex items-center gap-3">
              <div className="w-6 h-[1px] bg-accent-blue" />
              Alunos por Turma
            </h4>
            <div className="space-y-6">
              {stats.studentsByClass.length > 0 ? (
                stats.studentsByClass.map((c: any) => (
                  <div key={c.name} className="flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-bg border border-border rounded-xl flex items-center justify-center text-accent-blue group-hover:bg-accent-blue group-hover:text-bg transition-colors">
                        <GraduationCap size={18} />
                      </div>
                      <span className="font-bold text-text-main group-hover:text-accent-blue transition-colors">{c.name}</span>
                    </div>
                    <span className="px-3 py-1 bg-bg border border-border rounded-full text-xs font-black text-text-dim">{c.count} Alunos</span>
                  </div>
                ))
              ) : (
                <p className="text-text-dim text-sm italic">Nenhuma turma registrada.</p>
              )}
            </div>
          </div>

          {/* Últimos Alunos */}
          <div className="lg:col-span-2 bg-card rounded-[2.5rem] border border-border p-10">
             <h4 className="text-sm font-black uppercase tracking-[0.2em] text-text-dim mb-8 flex items-center gap-3">
              <div className="w-6 h-[1px] bg-accent-green" />
              Últimos Cadastros
            </h4>
            <div className="space-y-4">
              {stats.recent.length > 0 ? (
                stats.recent.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-4 bg-bg border border-border rounded-2xl hover:border-accent-blue/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent-blue/10 rounded-full flex items-center justify-center text-accent-blue font-black shadow-inner">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-text-main">{s.name}</p>
                        <p className="text-xs text-text-dim">{s.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black uppercase text-text-dim opacity-50 tracking-widest">{new Date(s.createdAt).toLocaleDateString()}</p>
                       <p className="text-xs font-bold text-accent-blue">{s.studentProfile?.class?.name || 'Sem turma'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-text-dim text-sm italic">Sem registros recentes.</p>
              )}
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div>
           <h3 className="text-sm font-black uppercase tracking-[0.3em] text-text-dim mb-8 flex items-center gap-3">
              <div className="w-8 h-[1px] bg-accent-blue"></div>
              Comunicados Internos
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {ANNOUNCEMENTS.slice(0, 2).map((aviso) => (
               <div 
                 key={aviso.id} 
                 className="bg-card/50 p-8 rounded-3xl border border-border hover:border-accent-blue/20 transition-all flex gap-6 group"
               >
                 <div className={`mt-1.5 h-3 w-3 rounded-full flex-shrink-0 ${aviso.type === 'urgente' ? 'bg-rose-500' : 'bg-accent-blue'}`} />
                 <div className="flex-1">
                   <h4 className="font-bold text-text-main text-lg group-hover:text-accent-blue transition-colors">{aviso.title}</h4>
                   <p className="text-text-dim mt-2 leading-relaxed text-sm">{aviso.message}</p>
                   <p className="text-[10px] text-text-dim font-black uppercase mt-4 tracking-[0.2em] opacity-30">{new Date(aviso.date).toLocaleDateString('pt-BR')}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    );
  }

  // Student Dashboard (Default)
  return (
    <div className="space-y-10 pb-10">
      {/* Welcome Card */}
      <section className="relative overflow-hidden bg-gradient-to-br from-accent-blue to-accent-purple rounded-[2rem] p-10 md:p-14 shadow-2xl shadow-accent-blue/10 text-bg">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter">
            {isTeacher ? 'Painel Gestor' : `Olá, ${user.name?.split(' ')[0] || 'Aluno'}! 👋`}
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
            <div className="lg:col-span-2 space-y-10">
              <SkillMap skills={user.skills || { logic: 40, variables: 65, conditionals: 20, loops: 10, arrays: 0, functions: 0 }} />
              
              {/* Recovery Recommendation */}
              {Object.values(user.skills || { logic: 40 }).some(v => v < 30) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-rose-500/5 border border-rose-500/20 rounded-[2.5rem] p-10"
                >
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
                         <Zap size={24} />
                      </div>
                      <div>
                         <h4 className="text-xl font-black tracking-tight text-rose-500">Recuperação Automática</h4>
                         <p className="text-xs text-text-dim font-black uppercase tracking-widest">Atenção Necessária</p>
                      </div>
                   </div>
                   <p className="text-text-dim mb-8 text-sm leading-relaxed">
                      Identificamos que você está com dificuldades em alguns conceitos fundamentais. Recomendamos revisar os seguintes tópicos antes de avançar:
                   </p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-bg border border-border p-5 rounded-2xl flex items-center gap-4 hover:border-rose-500/30 transition-all cursor-pointer">
                         <RotateCcw size={18} className="text-rose-400" />
                         <span className="text-sm font-bold">Revisar Laços de Repetição</span>
                      </div>
                      <div className="bg-bg border border-border p-5 rounded-2xl flex items-center gap-4 hover:border-rose-500/30 transition-all cursor-pointer">
                         <Brain size={18} className="text-rose-400" />
                         <span className="text-sm font-bold">Refazer Teste de Mesa</span>
                      </div>
                   </div>
                </motion.div>
              )}
            </div>
            
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-accent-purple/20 to-bg p-8 rounded-[2rem] border border-accent-purple/20 shadow-soft group hover:scale-[1.02] transition-all">
                <Brain className="text-accent-purple mb-6 group-hover:rotate-12 transition-transform" size={40} />
                <h4 className="text-xl font-black mb-3 text-text-main tracking-tight">Motor I.D.E.A</h4>
                <p className="text-text-dim text-xs leading-relaxed mb-6">
                  Seu motor adaptativo está analisando sua lógica. Finalize o módulo de condicionais para desbloquear a próxima trilha.
                </p>
                <button 
                  onClick={onStartTrilha}
                  className="w-full py-3 bg-accent-purple text-bg rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-accent-purple/80 transition-all font-black"
                >
                  Continuar Trilha
                </button>
              </div>

              <div className="bg-card p-8 rounded-[2rem] border border-border shadow-soft">
                <h4 className="text-xs font-black uppercase tracking-widest text-text-dim mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent-green rounded-full" />
                  Próximo Desafio
                </h4>
                <div className="space-y-4">
                  <div className="p-4 bg-bg rounded-xl border border-border group cursor-pointer hover:border-accent-blue/30 transition-all">
                    <h5 className="font-bold text-sm text-text-main">Média Aritmética</h5>
                    <p className="text-[10px] text-text-dim mt-1">Assunto: Variáveis e Operadores</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
              <div className="bg-card p-10 rounded-[3rem] border border-border relative overflow-hidden shadow-soft">
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent-blue/5 blur-[80px] -mr-24 -mt-24"></div>
                
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-dim mb-10 relative z-1 flex items-center gap-3">
                  <div className="w-6 h-[1px] bg-accent-blue opacity-50" />
                  Galeria de Conquistas
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-1">
                  {(user.unlockedAchievements?.length || 0) > 0 ? (
                    user.unlockedAchievements.slice(0, 4).map((id, idx) => {
                       const achievementNames: Record<string, string> = {
                         'primeiro-log': 'Primeiro Log',
                         'explorador': 'Explorador IDEA',
                         'algoritmo-raiz': 'Mestre da Lógica',
                         'persistente': 'Aluno Persistente'
                       };
                       return (
                        <motion.div 
                          key={id} 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }}
                          className="flex flex-col items-center text-center p-6 bg-bg/50 rounded-2xl border border-border group hover:border-accent-blue/30 hover:bg-accent-blue/5 transition-all cursor-default shadow-soft"
                        >
                           <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl flex items-center justify-center text-bg mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg shadow-accent-blue/20">
                              <Trophy size={28} />
                           </div>
                           <h5 className="font-black text-sm text-text-main group-hover:text-accent-blue transition-colors">
                             {achievementNames[id] || `Conquista #${id.slice(0, 4)}`}
                           </h5>
                           <p className="text-[10px] text-text-dim font-black uppercase tracking-widest mt-1 opacity-60">Raridade: Épica</p>
                        </motion.div>
                       );
                    })
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-10 opacity-40">
                       <Trophy className="text-text-dim mb-4" size={48} />
                       <p className="text-[10px] font-black uppercase tracking-widest text-text-dim">Nenhuma conquista desbloqueada</p>
                    </div>
                  )}
                </div>
                
                {(user.unlockedAchievements?.length || 0) > 0 && (
                  <button className="w-full mt-8 py-4 bg-bg border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-dim hover:text-accent-blue hover:border-accent-blue/30 transition-all">
                    Ver Galeria Completa
                  </button>
                )}
              </div>

              <div className="bg-card p-10 rounded-[3rem] border border-border relative overflow-hidden shadow-soft">
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
