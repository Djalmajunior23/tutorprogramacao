import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Rocket, ArrowRight, User, Hash, Mail, Lock, Users, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { authService } from '../services/api';

interface ProfileSetupProps {
  onComplete: (profile: Partial<UserProfile>) => void;
  onLogin: (credentials: any) => Promise<any>;
  onRegister: (data: any) => Promise<any>;
}

export default function ProfileSetup({ onComplete, onLogin, onRegister }: ProfileSetupProps) {
  const [step, setStep] = useState<'CHOICE' | 'AUTH' | 'RECOVERY'>('CHOICE');
  const [recoveryStep, setRecoveryStep] = useState<'EMAIL' | 'NEW_PASSWORD' | 'SUCCESS'>('EMAIL');
  const [isLoginView, setIsLoginView] = useState(false);
  const [role, setRole] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [className, setClassName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (step === 'RECOVERY') {
        if (recoveryStep === 'EMAIL') {
          await authService.verifyEmail(email);
          setRecoveryStep('NEW_PASSWORD');
        } else if (recoveryStep === 'NEW_PASSWORD') {
          await authService.resetPassword({ email, newPassword });
          setRecoveryStep('SUCCESS');
        }
        return;
      }

      if (isLoginView) {
        await onLogin({ email, password });
      } else {
        await onRegister({ 
          name, 
          email, 
          password, 
          role,
          className: role === 'STUDENT' ? className : 'STAFF' 
        });
      }
    } catch (err: any) {
      console.error("LOGIN ERROR DETAILS:", err);
      console.error("RESPONSE:", err.response);
      console.error("MESSAGE:", err.message);
      setError(err.response?.data?.error || 'Erro na operação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (selectedRole: 'STUDENT' | 'TEACHER' | 'ADMIN') => {
    setRole(selectedRole);
    setStep('AUTH');
  };

  const handleVisitante = () => {
    onComplete({ name: 'Visitante', className: 'LOCAL', role: 'STUDENT', isGuest: true });
  };

  if (step === 'RECOVERY') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-bg/90 backdrop-blur-2xl overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1e1b4b_0%,transparent_70%)] pointer-events-none opacity-40"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-xl bg-card rounded-[3rem] p-8 sm:p-14 border border-white/10 shadow-[0_32px_128px_-20px_rgba(0,0,0,0.8)] relative z-1 my-auto"
        >
          <button 
            onClick={() => setStep('AUTH')}
            className="absolute left-8 top-8 text-text-dim hover:text-text-main transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
          >
            <ArrowRight className="rotate-180" size={14} /> Voltar ao Login
          </button>

          <div className="flex flex-col items-center mb-10 text-center mt-4">
            <motion.div className="w-20 h-20 bg-accent-blue/10 rounded-3xl flex items-center justify-center mb-6 border-2 border-accent-blue/20">
               <Lock className="text-accent-blue" size={36} />
            </motion.div>
            <h1 className="text-3xl font-black tracking-tighter text-text-main">
              Recuperação de Senha
            </h1>
            <p className="text-text-dim mt-3 font-medium text-sm opacity-70">
              {recoveryStep === 'EMAIL' && "Informe seu e-mail para receber as instruções de redefinição."}
              {recoveryStep === 'NEW_PASSWORD' && "E-mail validado. Agora escolha sua nova senha de acesso."}
              {recoveryStep === 'SUCCESS' && "Sua senha foi redefinida com sucesso!"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest p-4 rounded-xl text-center"
              >
                {error}
              </motion.div>
            )}
            {recoveryStep === 'EMAIL' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1">E-mail Cadastrado</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-accent-blue transition-colors" size={18} />
                  <input 
                    required
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-bg/50 border border-border rounded-2xl pl-14 pr-5 py-4.5 outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10 transition-all font-bold text-text-main"
                    placeholder="seu@e-mail.com"
                  />
                </div>
              </div>
            )}

            {recoveryStep === 'NEW_PASSWORD' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1">Nova Senha</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-accent-blue transition-colors" size={18} />
                  <input 
                    required
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-bg/50 border border-border rounded-2xl pl-14 pr-5 py-4.5 outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10 transition-all font-bold text-text-main"
                    placeholder="Nova senha robusta"
                  />
                </div>
              </div>
            )}

            {recoveryStep !== 'SUCCESS' ? (
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-accent-blue text-bg rounded-2xl font-black transition-all flex items-center justify-center gap-4 group shadow-xl shadow-accent-blue/20 uppercase tracking-[0.3em] text-[11px] outline-none"
              >
                {loading ? 'Verificando...' : (recoveryStep === 'EMAIL' ? 'Verificar E-mail' : 'Salvar Nova Senha')}
                <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
              </button>
            ) : (
              <button 
                type="button"
                onClick={() => {
                  setStep('AUTH');
                  setIsLoginView(true);
                  setRecoveryStep('EMAIL');
                }}
                className="w-full py-5 bg-accent-green text-bg rounded-2xl font-black transition-all flex items-center justify-center gap-4 group shadow-xl shadow-accent-green/20 uppercase tracking-[0.3em] text-[11px] outline-none"
              >
                Ir para Login
                <ArrowRight size={20} />
              </button>
            )}
          </form>
        </motion.div>
      </div>
    );
  }

  if (step === 'CHOICE') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-bg/95 backdrop-blur-3xl overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1e1b4b_0%,transparent_70%)] pointer-events-none opacity-40"></div>
        
        <div className="w-full max-w-5xl relative z-1 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-accent-blue/10 text-accent-blue text-[10px] font-black rounded-full border border-accent-blue/20 uppercase tracking-[0.3em] mb-6">
              <span className="w-2 h-2 bg-accent-blue rounded-full animate-pulse" />
              Sincronização de Identidade
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-text-main tracking-tighter mb-4">
              Portal <span className="logo-gradient">I.D.E.A</span>
            </h1>
            <p className="text-text-dim max-w-xl mx-auto font-medium text-lg leading-relaxed">
              Bem-vindo ao ambiente integrado de desenvolvimento. Escolha seu perfil para acessar as trilhas, laboratórios e diagnósticos.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
          >
            {/* Student Choice */}
            <motion.button
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect('STUDENT')}
              className="bg-card/40 border border-white/5 p-12 rounded-[4rem] text-center group hover:bg-accent-blue/5 hover:border-accent-blue/30 transition-all duration-500 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-24 h-24 bg-accent-blue/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border-2 border-accent-blue/20 group-hover:bg-accent-blue group-hover:text-bg transition-all shadow-[0_0_50px_rgba(59,130,246,0.1)]">
                <Rocket size={48} className="group-hover:rotate-12 transition-transform" />
              </div>
              <h2 className="text-3xl font-black mb-4 tracking-tighter uppercase">Estudante</h2>
              <p className="text-text-dim font-medium leading-relaxed mb-8">
                Desenvolva seu algoritmo, resolva desafios e conquiste seu lugar no topo do ranking.
              </p>
              <div className="inline-flex items-center gap-3 bg-accent-blue/10 text-accent-blue px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-accent-blue/20 group-hover:bg-accent-blue group-hover:text-bg transition-all">
                Iniciar Aprendizado <ArrowRight size={16} />
              </div>
            </motion.button>

            {/* Teacher Choice */}
            <motion.button
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect('TEACHER')}
              className="bg-card/40 border border-white/5 p-12 rounded-[4rem] text-center group hover:bg-accent-purple/5 hover:border-accent-purple/30 transition-all duration-500 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-24 h-24 bg-accent-purple/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border-2 border-accent-purple/20 group-hover:bg-accent-purple group-hover:text-bg transition-all shadow-[0_0_50px_rgba(139,92,246,0.1)]">
                <Users size={48} className="group-hover:-rotate-12 transition-transform" />
              </div>
              <h2 className="text-3xl font-black mb-4 tracking-tighter uppercase">Professor</h2>
              <p className="text-text-dim font-medium leading-relaxed mb-8">
                Acompanhe o progresso das turmas, gerencie conteúdos e visualize diagnósticos.
              </p>
              <div className="inline-flex items-center gap-3 bg-accent-purple/10 text-accent-purple px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-accent-purple/20 group-hover:bg-accent-purple group-hover:text-bg transition-all">
                Painel Docente <ArrowRight size={16} />
              </div>
            </motion.button>

            {/* Admin Choice */}
            <motion.button
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect('ADMIN')}
              className="bg-card/40 border border-white/5 p-12 rounded-[4rem] text-center group hover:bg-accent-green/5 hover:border-accent-green/30 transition-all duration-500 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-24 h-24 bg-accent-green/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border-2 border-accent-green/20 group-hover:bg-accent-green group-hover:text-bg transition-all shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                <Shield size={48} className="group-hover:rotate-12 transition-transform" />
              </div>
              <h2 className="text-3xl font-black mb-4 tracking-tighter uppercase">Admin</h2>
              <p className="text-text-dim font-medium leading-relaxed mb-8">
                Acesso total, gestão da plataforma e configuração global de usuários.
              </p>
              <div className="inline-flex items-center gap-3 bg-accent-green/10 text-accent-green px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-accent-green/20 group-hover:bg-accent-green group-hover:text-bg transition-all">
                Acesso Admin <ArrowRight size={16} />
              </div>
            </motion.button>

            <button 
              onClick={handleVisitante}
              className="md:col-span-3 text-text-dim/20 hover:text-text-dim transition-colors text-[9px] font-black uppercase tracking-[0.5em] mt-8 py-4"
            >
              — Explorar em modo anônimo —
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/90 backdrop-blur-2xl overflow-y-auto p-4 md:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1e1b4b_0%,transparent_70%)] pointer-events-none opacity-40"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-xl bg-card rounded-[3rem] p-8 sm:p-14 border border-white/10 shadow-[0_32px_128px_-20px_rgba(0,0,0,0.8)] relative z-1"
      >
        <button 
          onClick={() => setStep('CHOICE')}
          className="absolute left-8 top-8 text-text-dim hover:text-text-main transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
        >
          <ArrowRight className="rotate-180" size={14} /> Voltar
        </button>

        <div className="flex flex-col items-center mb-10 text-center mt-4">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: role === 'TEACHER' ? -5 : role === 'ADMIN' ? 0 : 5 }}
            className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 border-2 transition-colors duration-500 ${role === 'TEACHER' ? 'bg-accent-purple/10 border-accent-purple/20 shadow-[0_0_40px_rgba(139,92,246,0.1)]' : role === 'ADMIN' ? 'bg-accent-green/10 border-accent-green/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]' : 'bg-accent-blue/10 border-accent-blue/20 shadow-[0_0_40px_rgba(59,130,246,0.1)]'}`}
          >
            {role === 'TEACHER' ? <Users className="text-accent-purple" size={36} /> : role === 'ADMIN' ? <Shield className="text-accent-green" size={36} /> : <Rocket className="text-accent-blue" size={36} />}
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-text-main">
            {isLoginView ? 'Acesso ao Portal' : `Novo ${role === 'TEACHER' ? 'Professor' : role === 'ADMIN' ? 'Administrador' : 'Estudante'}`}
          </h1>
          <p className="text-text-dim mt-3 font-medium text-sm sm:text-base opacity-70">
             {isLoginView 
               ? `Bem-vindo de volta.` 
               : role === 'TEACHER' 
                 ? 'Crie sua conta para começar a gerenciar suas turmas.' 
                 : role === 'ADMIN'
                   ? 'Crie sua conta administrativa.'
                   : 'Prepare-se para conquistar novos desafios e códigos.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest p-4 rounded-xl text-center"
            >
              {error}
            </motion.div>
          )}

          {!isLoginView && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1">Nome Completo</label>
              <div className="relative group">
                <User className={`absolute left-5 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-[var(--tw-prose-links)] transition-colors ${role === 'TEACHER' ? 'group-focus-within:text-accent-purple' : role === 'ADMIN' ? 'group-focus-within:text-accent-green' : 'group-focus-within:text-accent-blue'}`} size={18} />
                <input 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={`w-full bg-bg/50 border border-border rounded-2xl pl-14 pr-5 py-4.5 outline-none focus:ring-4 transition-all font-bold text-text-main ${role === 'TEACHER' ? 'focus:border-accent-purple focus:ring-accent-purple/10' : role === 'ADMIN' ? 'focus:border-accent-green focus:ring-accent-green/10' : 'focus:border-accent-blue focus:ring-accent-blue/10'}`}
                  placeholder="Seu nome"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1">E-mail Institucional</label>
            <div className="relative group">
              <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 text-text-dim transition-colors ${role === 'TEACHER' ? 'group-focus-within:text-accent-purple' : role === 'ADMIN' ? 'group-focus-within:text-accent-green' : 'group-focus-within:text-accent-blue'}`} size={18} />
              <input 
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full bg-bg/50 border border-border rounded-2xl pl-14 pr-5 py-4.5 outline-none focus:ring-4 transition-all font-bold text-text-main ${role === 'TEACHER' ? 'focus:border-accent-purple focus:ring-accent-purple/10' : role === 'ADMIN' ? 'focus:border-accent-green focus:ring-accent-green/10' : 'focus:border-accent-blue focus:ring-accent-blue/10'}`}
                placeholder="exemplo@ifsp.edu.br"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1">Senha de Acesso</label>
            <div className="relative group">
              <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 text-text-dim transition-colors ${role === 'TEACHER' ? 'group-focus-within:text-accent-purple' : role === 'ADMIN' ? 'group-focus-within:text-accent-green' : 'group-focus-within:text-accent-blue'}`} size={18} />
              <input 
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`w-full bg-bg/50 border border-border rounded-2xl pl-14 pr-5 py-4.5 outline-none focus:ring-4 transition-all font-bold text-text-main ${role === 'TEACHER' ? 'focus:border-accent-purple focus:ring-accent-purple/10' : role === 'ADMIN' ? 'focus:border-accent-green focus:ring-accent-green/10' : 'focus:border-accent-blue focus:ring-accent-blue/10'}`}
                placeholder="••••••••"
              />
            </div>
          </div>

          {!isLoginView && role === 'STUDENT' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1">Sua Turma</label>
              <div className="relative group">
                <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-accent-blue transition-colors" size={18} />
                <input 
                  required
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                  className="w-full bg-bg/50 border border-border rounded-2xl pl-14 pr-5 py-4.5 outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10 transition-all font-bold text-text-main"
                  placeholder="Ex: 3º INF B"
                />
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-4 group shadow-xl uppercase tracking-[0.3em] text-[11px] outline-none ${role === 'TEACHER' ? 'bg-accent-purple text-bg shadow-accent-purple/20 hover:brightness-110' : role === 'ADMIN' ? 'bg-accent-green text-bg shadow-accent-green/20 hover:brightness-110' : 'bg-accent-blue text-bg shadow-accent-blue/20 hover:brightness-110'}`}
          >
            {loading ? 'Sincronizando...' : (isLoginView ? 'Autenticar no Portal' : 'Finalizar Cadastro')}
            <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
          </button>
        </form>

        {isLoginView && (
          <div className="mt-4 text-center">
            <button 
              onClick={() => {
                setStep('RECOVERY');
                setRecoveryStep('EMAIL');
                setError('');
              }}
              className="text-text-dim hover:text-accent-blue transition-colors text-[9px] font-black uppercase tracking-[0.2em]"
            >
              Esqueci minha senha
            </button>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
          <button 
            onClick={() => {
              setIsLoginView(!isLoginView);
              setError('');
            }}
            className="text-text-dim hover:text-text-main transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
          >
            {isLoginView ? 'Ainda não possui conta? Cadastre-se' : 'Já possui conta? Clique para entrar'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
