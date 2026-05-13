import React, { useState, useEffect } from 'react';
import { ScrollText, Trash2, Download, Plus, Users, Layout } from 'lucide-react';
import api from '../services/api';

export default function TeacherArea({ resetData }: { resetData: () => void }) {
  const [classes, setClasses] = useState<any[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      // Assuming a route exists or just for UI demo
      const response = await api.get('/ranking'); // Reusing ranking to see students
      // Filter or map to classes in a real scenario
    } catch (error) {}
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/classes', { name: newClassName, course: newCourse });
      setNewClassName('');
      setNewCourse('');
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

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="bg-gradient-to-br from-card to-bg p-12 rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden group">
        <Layout className="absolute right-[-40px] bottom-[-40px] w-80 h-80 opacity-5 text-accent-blue group-hover:rotate-12 transition-transform duration-1000" />
        <div className="relative z-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-blue/10 text-accent-blue text-[10px] font-black rounded-full border border-accent-blue/20 uppercase tracking-[0.2em] mb-6">
            Centro de Comando Pedagógico
          </div>
          <h2 className="text-5xl font-black mb-6 tracking-tighter">Painel do Professor</h2>
          <p className="text-text-dim text-lg leading-relaxed max-w-2xl">
            Gerencie suas turmas, acompanhe o engajamento dos alunos e configure trilhas personalizadas para sua metodologia de ensino.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Create Class Form */}
        <div className="bg-card p-10 rounded-[2rem] border border-border flex flex-col shadow-soft h-fit">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-12 h-12 bg-accent-blue/10 rounded-xl flex items-center justify-center text-accent-blue border border-accent-blue/10">
               <Plus size={24} />
             </div>
             <h3 className="text-2xl font-black tracking-tight">Nova Turma</h3>
          </div>
          <form onSubmit={handleCreateClass} className="space-y-6">
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
              className="w-full py-4 bg-accent-blue text-bg rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-accent-blue/80 transition-all shadow-xl shadow-accent-blue/10"
            >
              {loading ? 'Criando...' : 'Registrar Turma'}
            </button>
          </form>
        </div>

        {/* Existing Classes / Stats */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-card p-10 rounded-[2rem] border border-border shadow-soft">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-text-dim mb-8 flex items-center gap-4">
               <div className="w-8 h-[1px] bg-accent-purple"></div>
               Turmas Ativas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[1,2,3].map(i => (
                 <div key={i} className="p-6 bg-bg/50 rounded-2xl border border-border flex items-center justify-between group hover:border-accent-purple/30 transition-all cursor-pointer">
                    <div>
                      <h4 className="font-bold text-text-main">Turma 0{i} - INF</h4>
                      <p className="text-xs text-text-dim mt-1 uppercase tracking-widest">32 Alunos Ativos</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-accent-purple/10 flex items-center justify-center text-accent-purple group-hover:bg-accent-purple group-hover:text-bg transition-all">
                      <Users size={18} />
                    </div>
                 </div>
               ))}
               <div className="p-6 border-2 border-dashed border-border rounded-2xl flex items-center justify-center text-text-dim text-xs font-black uppercase tracking-widest opacity-40">
                  Aguardando Sincronização...
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-card p-10 rounded-[2.5rem] border border-border flex flex-col group hover:border-rose-500/20 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <Trash2 className="text-rose-500" size={24} />
                <h3 className="text-xl font-black tracking-tight">Reinicialização</h3>
              </div>
              <p className="text-text-dim text-xs mb-8 leading-relaxed">
                Limpa todos os dados locais. Use para preparar equipamentos públicos.
              </p>
              <button 
                onClick={() => confirm('Resetar sistema?') && resetData()}
                className="mt-auto py-3 border border-rose-500/30 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all font-black text-[9px] uppercase tracking-widest"
              >
                Limpar Cache Local
              </button>
            </div>

            <div className="bg-card p-10 rounded-[2.5rem] border border-border flex flex-col group hover:border-accent-blue/20 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <Download className="text-accent-blue" size={24} />
                <h3 className="text-xl font-black tracking-tight">Exportação</h3>
              </div>
              <p className="text-text-dim text-xs mb-8 leading-relaxed">
                Baixe o relatório de progresso condensado em formato JSON.
              </p>
              <button 
                onClick={exportProgress}
                className="mt-auto py-3 bg-accent-blue text-bg rounded-xl hover:bg-accent-blue/80 transition-all font-black text-[9px] uppercase tracking-widest"
              >
                Baixar Diagnóstico
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
