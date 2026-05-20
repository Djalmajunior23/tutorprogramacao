import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Edit3, Trash2, Power, KeyRound, Check, X, GraduationCap } from 'lucide-react';
import { studentsService, educationService } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';

export default function StudentManager() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    registration: '',
    phone: '',
    classId: '',
    active: true
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, [page, searchTerm, classFilter, statusFilter]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await studentsService.getAll({ 
        page, 
        limit: 10, 
        search: searchTerm,
        classId: classFilter,
        active: statusFilter === '' ? undefined : statusFilter === 'active'
      });
      setStudents(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await educationService.getClasses();
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
      setClasses([]);
    }
  };

  const openModal = (student?: any) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        email: student.email,
        password: '', // Leave empty for edit
        registration: student.studentProfile?.registration || '',
        phone: student.studentProfile?.phone || '',
        classId: student.studentProfile?.classId || '',
        active: student.active
      });
    } else {
      setEditingStudent(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        registration: '',
        phone: '',
        classId: '',
        active: true
      });
    }
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    
    try {
      if (editingStudent) {
        // Update
        const payload: any = { ...formData };
        if (!payload.password) delete payload.password; // Don't send empty password if not changing
        await studentsService.update(editingStudent.id, payload);
      } else {
        // Create
        if (!formData.password) {
          setFormError('Senha é obrigatória para novos alunos.');
          setFormLoading(false);
          return;
        }
        await studentsService.create(formData);
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (error: any) {
      setFormError(error.response?.data?.error || 'Ocorreu um erro ao salvar o aluno.');
    } finally {
      setFormLoading(false);
    }
  };

  const toggleStudentStatus = async (id: string, currentStatus: boolean) => {
    try {
      await studentsService.updateStatus(id, !currentStatus);
      fetchStudents();
    } catch (error) {
      console.error('Erro ao atualizar status', error);
      alert('Erro ao atualizar status.');
    }
  };

  const resetPassword = async (id: string) => {
    const newPass = prompt("Digite a nova senha temporária (mín. 6 caracteres):");
    if (!newPass) return;
    if (newPass.length < 6) {
      alert("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    
    try {
      await studentsService.resetPassword(id, { password: newPass });
      alert("Senha redefinida com sucesso.");
    } catch (error: any) {
      alert("Erro ao redefinir a senha: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-blue/10 text-accent-blue text-[10px] font-black rounded-full border border-accent-blue/20 uppercase tracking-[0.2em] mb-4">
            Módulo Administrativo
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Gestão de Alunos</h2>
          <p className="text-text-dim text-base mt-2">
            Controle de matrículas, acessos e vinculações de estudantes.
          </p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-accent-blue text-bg px-6 py-4 rounded-2xl font-black hover:brightness-110 shadow-lg shadow-accent-blue/20 transition-all flex items-center gap-2"
        >
          <UserPlus size={18} /> Cadastrar Aluno
        </button>
      </div>

      <div className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden relative min-h-[400px]">
        {/* Toolbar */}
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between bg-bg/50">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-accent-blue transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-3 outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10 transition-all font-medium text-sm"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <select 
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setPage(1);
              }}
              className="bg-card border border-border rounded-xl px-4 py-3 outline-none focus:border-accent-blue transition-all font-medium text-sm text-text-dim"
            >
              <option value="">Todas as Turmas</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-card border border-border rounded-xl px-4 py-3 outline-none focus:border-accent-blue transition-all font-medium text-sm text-text-dim"
            >
              <option value="">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg/40 text-[10px] uppercase font-black tracking-widest text-text-dim">
                <th className="px-6 py-5 border-b border-border font-black">Aluno</th>
                <th className="px-6 py-5 border-b border-border font-black">Matrícula</th>
                <th className="px-6 py-5 border-b border-border font-black">Status</th>
                <th className="px-6 py-5 border-b border-border font-black">Data de Cadastro</th>
                <th className="px-6 py-5 border-b border-border text-right font-black">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-border/50">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-border" />
                        <div>
                          <div className="h-4 w-32 bg-border rounded mb-2" />
                          <div className="h-3 w-48 bg-border/50 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5"><div className="h-4 w-24 bg-border rounded" /></td>
                    <td className="px-6 py-5"><div className="h-6 w-16 bg-border rounded-full" /></td>
                    <td className="px-6 py-5"><div className="h-4 w-24 bg-border rounded" /></td>
                    <td className="px-6 py-5"><div className="h-8 w-24 bg-border rounded ml-auto" /></td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-text-dim font-medium">
                     Nenhum aluno encontrado.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="border-b border-border/50 hover:bg-bg/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center text-accent-blue font-bold shadow-inner">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-text-main">{student.name}</p>
                          <p className="text-xs text-text-dim">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-mono text-text-dim">
                      {student.studentProfile?.registration || '-'}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${student.active ? 'bg-accent-green/10 text-accent-green' : 'bg-rose-500/10 text-rose-500'}`}>
                        {student.active ? <Check size={12}/> : <X size={12}/>}
                        {student.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-text-dim">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => resetPassword(student.id)}
                          className="p-2 text-text-dim hover:text-accent-green bg-card border border-border hover:border-accent-green/30 rounded-lg transition-colors"
                          title="Resetar Senha"
                        >
                          <KeyRound size={16} />
                        </button>
                        <button 
                          onClick={() => openModal(student)}
                          className="p-2 text-text-dim hover:text-accent-blue bg-card border border-border hover:border-accent-blue/30 rounded-lg transition-colors"
                          title="Editar Aluno"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => toggleStudentStatus(student.id, student.active)}
                          className={`p-2 bg-card border rounded-lg transition-colors ${student.active ? 'text-text-dim border-border hover:text-rose-500 hover:border-rose-500/30' : 'text-text-dim border-border hover:text-accent-green hover:border-accent-green/30'}`}
                          title={student.active ? "Inativar Aluno" : "Ativar Aluno"}
                        >
                          <Power size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="p-6 border-t border-border flex justify-between items-center bg-bg/50">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 text-sm font-bold text-text-dim hover:text-text-main disabled:opacity-50 transition-colors"
            >
              Anterior
            </button>
            <span className="text-xs font-bold text-text-dim uppercase tracking-widest">
              Página {page} de {totalPages}
            </span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-4 py-2 text-sm font-bold text-text-dim hover:text-text-main disabled:opacity-50 transition-colors"
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-card border border-border shadow-2xl rounded-[2rem] overflow-hidden"
            >
              <div className="p-8 border-b border-border flex justify-between items-center bg-bg/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent-blue/10 rounded-2xl flex items-center justify-center text-accent-blue">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">{editingStudent ? 'Editar Aluno' : 'Novo Aluno'}</h3>
                    <p className="text-sm text-text-dim">Preencha os dados do estudante.</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-text-dim hover:text-rose-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {formError && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm font-medium">
                    {formError}
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1">Nome Completo</label>
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-bg/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10 transition-all font-medium"
                      placeholder="Nome do aluno"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1">E-mail</label>
                    <input 
                      required
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-bg/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10 transition-all font-medium"
                      placeholder="aluno@ifsp.edu.br"
                    />
                  </div>
                  {!editingStudent && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1">Senha Inicial</label>
                      <input 
                        required={!editingStudent}
                        type="password"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-bg/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10 transition-all font-medium"
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1">Matrícula (opcional)</label>
                    <input 
                      type="text"
                      value={formData.registration}
                      onChange={e => setFormData({...formData, registration: e.target.value})}
                      className="w-full bg-bg/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10 transition-all font-medium"
                      placeholder="Ex: SP123456"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1">Telefone (opcional)</label>
                    <input 
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-bg/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10 transition-all font-medium"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1">Turma Principal</label>
                    <select 
                      value={formData.classId}
                      onChange={e => setFormData({...formData, classId: e.target.value})}
                      className="w-full bg-bg/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10 transition-all font-medium text-text-main"
                    >
                      <option value="">Nenhuma turma vinculada</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-full pt-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={formData.active}
                        onChange={e => setFormData({...formData, active: e.target.checked})}
                        className="w-5 h-5 rounded bg-bg/50 border border-border text-accent-blue focus:ring-accent-blue/20"
                      />
                      <span className="text-sm font-bold text-text-dim group-hover:text-text-main transition-colors">Cadastro Ativo</span>
                    </label>
                  </div>
                </div>

                <div className="pt-6 flex justify-end gap-4 border-t border-border/50">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 rounded-xl font-bold text-text-dim hover:text-text-main hover:bg-bg/50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={formLoading}
                    className="bg-accent-blue text-bg px-8 py-3 rounded-xl font-black hover:brightness-110 shadow-lg shadow-accent-blue/20 transition-all disabled:opacity-50"
                  >
                    {formLoading ? 'Salvando...' : 'Salvar Aluno'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
