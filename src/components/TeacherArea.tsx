import React, { useState, useEffect } from 'react';
import { ScrollText, Trash2, Download, Plus, Users, Layout, Brain, Zap, Target, CheckCircle, BarChart2, UserCheck, Settings } from 'lucide-react';
import api from '../services/api';
import StudentManager from './StudentManager';
import Ranking from './Ranking';

import { UserProfile } from '../types';

type TeacherTab = 'dashboard' | 'students' | 'classes' | 'ranking';

export default function TeacherArea({ user, resetData }: { user: UserProfile, resetData: () => void }) {
  const [activeTab, setActiveTab] = useState<TeacherTab>('dashboard');
  const [classes, setClasses] = useState<any[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);

  useEffect(() => {
    fetchClasses();
    fetchAtRisk();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchAtRisk = async () => {
    try {
      const response = await api.get('/ranking');
      const lowXp = response.data.filter((s: any) => s.xp < 50).slice(0, 5);
      setAtRiskStudents(lowXp);
    } catch (error) {}
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/classes', { name: newClassName, course: newCourse });
      setNewClassName('');
      setNewCourse('');
      fetchClasses();
      alert('Turma criada com sucesso!');
    } catch (error) {
      alert('Erro ao criar turma. Verifique suas permissões.');
    } finally {
      setLoading(false);
    }
  };

  const exportProgress = () => {
    const data = localStorage.getItem('portal_prof_djalma_user');
    if (!data) return;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progresso_aluno_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const navItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: Layout },
    { id: 'students', label: 'Gestão de Alunos', icon: UserCheck },
    { id: 'classes', label: 'Turmas', icon: Users },
    { id: 'ranking', label: 'Ranking Global', icon: BarChart2 },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'students':
        return <StudentManager />;
      case 'ranking':
        return <Ranking user={user} />;
      case 'classes':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-card p-10 rounded-[2rem] border border-border flex flex-col shadow-soft">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 bg-accent-blue/10 rounded-xl flex items-center justify-center text-accent-blue border border-accent-blue/10">
                     <Plus size={24} />
                   </div>
                   <h3 className="text-2xl font-black tracking-tight">Nova Turma</h3>
                </div>
                <form onSubmit={handleCreateClass} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1">Nome da Turma</label>
                    <input 
                      required
                      value={newClassName}
                      onChange={e => setNewClassName(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-5 py-4 outline-none focus:border-accent-blue transition-all font-bold"
                      placeholder="Ex: 3º INF B"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1">Curso / Matéria</label>
                    <input 
                      required
                      value={newCourse}
                      onChange={e => setNewCourse(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-5 py-4 outline-none focus:border-accent-blue transition-all font-bold"
                      placeholder="Ex: Engenharia de Software"
                    />
                  </div>
                  <button 
                    disabled={loading}
                    className="md:col-span-2 py-4 bg-accent-blue text-bg rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-accent-blue/80 transition-all shadow-xl shadow-accent-blue/10"
                  >
                    {loading ? 'Criando...' : 'Registrar Turma'}
                  </button>
                </form>
              </div>

              <div className="bg-card p-10 rounded-[2rem] border border-border shadow-soft">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-text-dim mb-8 flex items-center gap-4">
                   <div className="w-8 h-[1px] bg-accent-purple"></div>
                   Turmas Ativas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {classes.length > 0 ? (
                     classes.map(c => (
                       <div key={c.id} className="p-6 bg-bg/50 rounded-2xl border border-border flex items-center justify-between group hover:border-accent-purple/30 transition-all cursor-pointer">
                          <div>
                            <h4 className="font-bold text-text-main">{c.name}</h4>
                            <p className="text-xs text-text-dim mt-1 uppercase tracking-widest">{c.course || 'Curso Padrão'}</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-accent-purple/10 flex items-center justify-center text-accent-purple group-hover:bg-accent-purple group-hover:text-bg transition-all">
                            <Users size={18} />
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="p-12 border-2 border-dashed border-border rounded-2xl flex items-center justify-center text-text-dim text-xs font-black uppercase tracking-widest opacity-40 col-span-full">
                        Nenhuma turma cadastrada.
                     </div>
                   )}
                </div>
              </div>
          </div>
        );
      case 'dashboard':
      default:
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Pedagogical Intelligence Alerts */}
            <div className="bg-bg border border-border rounded-[2.5rem] p-10 shadow-soft relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-accent-purple group-hover:scale-110 transition-transform">
                <Brain size={120} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-text-dim mb-8 flex items-center gap-4 relative z-1">
                 <div className="w-8 h-[1px] bg-accent-purple"></div>
                 Inteligência Pedagógica
              </h3>
              <div className="space-y-6 relative z-1">
                {atRiskStudents.length > 0 ? (
                  atRiskStudents.map((s: any) => (
                    <div key={s.id} className="flex items-start gap-4 p-5 bg-rose-500/10 rounded-2xl border border-rose-500/20 group hover:bg-rose-500/15 transition-all">
                      <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-500 flex-shrink-0">
                        <Zap size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-rose-500 text-sm">Atenção: {s.user?.name || s.id.slice(0, 8)}</h4>
                        <p className="text-text-dim text-xs mt-1">Baixo engajamento (XP: {s.xp}). Recomendamos intervenção pedagógica.</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-4 p-5 bg-accent-green/10 rounded-2xl border border-accent-green/20">
                    <div className="w-10 h-10 bg-accent-green/20 rounded-xl flex items-center justify-center text-accent-green flex-shrink-0">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-accent-green text-sm">Tudo em Ordem</h4>
                      <p className="text-text-dim text-xs mt-1">Nenhum aluno identificado com risco iminente de evasão ou dificuldade crítica.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-card p-10 rounded-[2rem] border border-border flex flex-col group hover:border-accent-green/20 transition-all">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-accent-green/10 rounded-xl flex items-center justify-center text-accent-green border border-accent-green/10">
                      <Target size={24} />
                    </div>
                    <h3 className="text-xl font-black tracking-tight">Taxonomia de Bloom</h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-text-dim text-xs leading-relaxed">
                      Distribuição cognitiva das turmas ativas baseada em desafios completados.
                    </p>
                    <div className="flex gap-2">
                       {[1,2,3,4,5].map(i => <div key={i} className="h-2 flex-1 bg-accent-green/20 rounded-full" style={{ opacity: i * 0.2 }} />)}
                    </div>
                    <div className="flex justify-between text-[8px] font-black text-text-dim uppercase tracking-widest mt-2">
                      <span>Lembrar</span>
                      <span>Criar</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card p-10 rounded-[2.5rem] border border-border flex flex-col group hover:border-accent-blue/20 transition-all">
                  <div className="flex items-center gap-4 mb-6">
                    <Download className="text-accent-blue" size={24} />
                    <h3 className="text-xl font-black tracking-tight">Dados e Relatórios</h3>
                  </div>
                  <p className="text-text-dim text-xs mb-8 leading-relaxed">
                    Exporte o progresso consolidado de todos os alunos para análise externa ou backup institucional.
                  </p>
                  <button 
                    onClick={exportProgress}
                    className="mt-auto py-3 bg-accent-blue text-bg rounded-xl hover:bg-accent-blue/80 transition-all font-black text-[9px] uppercase tracking-widest"
                  >
                    Baixar Diagnóstico Complementar
                  </button>
                </div>
            </div>

            <div className="bg-card p-10 rounded-[2.5rem] border border-border flex flex-col group hover:border-rose-500/20 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <Settings className="text-rose-500" size={24} />
                <h3 className="text-xl font-black tracking-tight">Zona de Risco / Configurações</h3>
              </div>
              <div className="flex items-center justify-between gap-10">
                <p className="text-text-dim text-xs leading-relaxed max-w-md">
                  A reinicialização do cache limpa apenas dados locais do navegador atual. Registros no banco de dados permanecem intactos.
                </p>
                <button 
                  onClick={() => confirm('Deseja realmente limpar o cache local?') && resetData()}
                  className="py-3 px-8 border border-rose-500/30 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all font-black text-[9px] uppercase tracking-widest whitespace-nowrap"
                >
                  Limpar Cache
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="bg-gradient-to-br from-card to-bg p-12 rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden group mb-12">
        <Layout className="absolute right-[-40px] bottom-[-40px] w-80 h-80 opacity-5 text-accent-blue group-hover:rotate-12 transition-transform duration-1000" />
        <div className="relative z-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-blue/10 text-accent-blue text-[10px] font-black rounded-full border border-accent-blue/20 uppercase tracking-[0.2em] mb-6">
            Centro de Comando Pedagógico
          </div>
          <h2 className="text-5xl font-black mb-6 tracking-tighter">Painel do Professor</h2>
          <p className="text-text-dim text-lg leading-relaxed max-w-2xl">
            Bem-vindo à sua central de inteligência. Acompanhe o desempenho das turmas e gerencie o ecossistema educacional.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <nav className="bg-card border border-border rounded-[2rem] p-4 sticky top-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    isActive 
                      ? 'bg-accent-blue text-bg shadow-lg shadow-accent-blue/20' 
                      : 'text-text-dim hover:bg-bg hover:text-text-main hover:pl-8'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

