import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Terminal, 
  Trophy, 
  Users, 
  ScrollText, 
  LogOut, 
  User as UserIcon,
  Bell,
  ChevronRight,
  CheckCircle2,
  Lock,
  Code2,
  Trash2,
  Download,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from './hooks/useUser';
import { TRAILS, MODULES } from './data/content';
import { CHALLENGES } from './data/challenges';
import { ANNOUNCEMENTS } from './data/avisos';
import { interpret } from './lib/interpreter';

// Components
import Dashboard from './components/Dashboard';
import ModuleList from './components/ModuleList';
import Laboratory from './components/Laboratory';
import Challenges from './components/Challenges';
import Ranking from './components/Ranking';
import TeacherArea from './components/TeacherArea';
import ProfileSetup from './components/ProfileSetup';

type View = 'dashboard' | 'trails' | 'laboratory' | 'challenges' | 'ranking' | 'teacher';

export default function App() {
  const { 
    user, 
    isProfileSetup, 
    isAuthenticated,
    isLoading,
    updateProfile, 
    login,
    register,
    logout,
    completeModule, 
    completeChallenge, 
    resetData 
  } = useUser();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.ok ? setBackendStatus('online') : setBackendStatus('offline'))
      .catch(() => setBackendStatus('offline'));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!isProfileSetup) {
    return <ProfileSetup onComplete={updateProfile} onLogin={login} onRegister={register} />;
  }

  const studentNav = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'trails', label: 'Trilhas', icon: BookOpen },
    { id: 'laboratory', label: 'Laboratório', icon: Terminal },
    { id: 'challenges', label: 'Desafios', icon: Trophy },
    { id: 'ranking', label: 'Ranking', icon: Users },
  ];

  const teacherNav = [
    { id: 'dashboard', label: 'Painel Gestor', icon: LayoutDashboard },
    { id: 'teacher', label: 'Gestão de Turmas', icon: ScrollText },
    { id: 'ranking', label: 'Ranking Alunos', icon: Users },
    { id: 'laboratory', label: 'Laboratório', icon: Terminal },
  ];

  const navItems = user.role === 'TEACHER' ? teacherNav : studentNav;
  const userAvatar = user.role === 'TEACHER' ? '👨‍🏫' : user.avatar;

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return (
        <Dashboard 
          user={user} 
          onStartTrilha={user.role === 'TEACHER' ? () => setCurrentView('teacher') : () => setCurrentView('trails')} 
        />
      );
      case 'trails': return <ModuleList user={user} onSelectModule={setActiveModuleId} />;
      case 'laboratory': return <Laboratory />;
      case 'challenges': return <Challenges user={user} onComplete={completeChallenge} />;
      case 'ranking': return <Ranking user={user} />;
      case 'teacher': return <TeacherArea resetData={resetData} />;
      default: return <Dashboard user={user} onStartTrilha={() => setCurrentView('trails')} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-main font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="logo-gradient font-black text-xl leading-tight tracking-tighter uppercase">Portal<br/>Interativo</h1>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim opacity-50">Lógica & Algoritmos</p>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => {
                setCurrentView(item.id as View);
                setActiveModuleId(null);
              }}
              aria-current={currentView === item.id ? 'page' : undefined}
              aria-label={`Navegar para ${item.label}`}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50 ${
                currentView === item.id 
                  ? 'bg-accent-blue/10 text-accent-blue' 
                  : 'text-text-dim hover:bg-slate-800/50 hover:text-text-main'
              }`}
            >
              <item.icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center text-xl border border-border">
                {userAvatar}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold truncate text-sm">{user.name}</p>
                <p className="text-[10px] text-accent-blue font-bold uppercase tracking-wider">{user.className}</p>
              </div>
            </div>
            {isAuthenticated && (
              <button 
                onClick={logout}
                className="w-full mt-4 flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-all border border-rose-500/20"
              >
                <Lock size={12} />
                Sair da Conta
              </button>
            )}
            <div className="w-full bg-border h-1.5 rounded-full overflow-hidden mt-4">
              <div 
                className="bg-gradient-to-r from-accent-blue to-accent-purple h-full transition-all duration-1000" 
                style={{ width: `${Math.min((user.xp % 100), 100)}%` }}
              />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
             <p className="text-[9px] font-bold text-text-dim uppercase tracking-[0.2em] leading-relaxed">
               <strong>PROFESSOR RESPONSÁVEL</strong><br/>
               Djalma Batista Barbosa Junior<br/>
               <span className="opacity-60">Engenharia de Software</span>
             </p>
             <div className="mt-3 flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  backendStatus === 'online' ? 'bg-accent-green animate-pulse' : 
                  backendStatus === 'offline' ? 'bg-rose-500' : 'bg-text-dim'
                }`}></div>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-40">
                  Sistema {backendStatus === 'online' ? 'Sincronizado' : backendStatus === 'offline' ? 'Offline' : 'Conectando...'}
                </span>
              </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-bg relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#1e1b4b_0%,transparent_40%)] pointer-events-none"></div>
        
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-card/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-dim">
              {navItems.find(i => i.id === currentView)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              id="btn-notifications" 
              className="p-2 text-text-dim hover:text-accent-blue transition-colors relative outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50 rounded-lg"
              aria-label="Notificações"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent-purple rounded-full"></span>
            </button>
            <div className="h-4 w-[1px] bg-border"></div>
            <button 
              id="btn-settings" 
              className="p-2 text-text-dim hover:text-accent-blue transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50 rounded-lg"
              aria-label="Configurações"
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto outline-none relative z-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView + (activeModuleId || '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-8 max-w-7xl mx-auto w-full"
            >
              {activeModuleId ? (
                <ModuleDetail 
                  moduleId={activeModuleId} 
                  onBack={() => setActiveModuleId(null)}
                  onComplete={(id, xp) => {
                    completeModule(id, xp);
                    setActiveModuleId(null);
                  }}
                  isCompleted={user.completedModules.includes(activeModuleId)}
                />
              ) : renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Module Detail Component (Temporary inline for ease, will move to separate file if requested)
function ModuleDetail({ moduleId, onBack, onComplete, isCompleted }: { 
  moduleId: string; 
  onBack: () => void;
  onComplete: (id: string, xp: number) => void;
  isCompleted: boolean;
}) {
  const mod = MODULES.find(m => m.id === moduleId);
  if (!mod) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={onBack}
        aria-label="Voltar para Trilhas"
        className="mb-8 flex items-center gap-2 text-text-dim hover:text-text-main transition-colors text-sm font-bold uppercase tracking-widest outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50 rounded-lg px-2"
      >
        <ChevronRight className="rotate-180" size={16} />
        Voltar para Trilhas
      </button>

      <div className="bg-card rounded-2xl p-8 border border-border shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
        
        <div className="flex justify-between items-start mb-8 relative z-1">
          <div>
            <span className="px-3 py-1 bg-accent-blue/10 text-accent-blue text-[10px] font-black rounded-full border border-accent-blue/20 uppercase tracking-[0.2em]">
              Módulo de Estudo
            </span>
            <h2 className="text-4xl font-black mt-4 tracking-tight">{mod.title}</h2>
          </div>
          <div className="text-right">
            <p className="text-text-dim text-[10px] font-bold uppercase tracking-widest mb-1">Prêmio</p>
            <p className="text-accent-purple font-black text-2xl tracking-tighter">+{mod.xpReward} XP</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none mb-12 relative z-1">
          <p className="text-text-dim whitespace-pre-line leading-relaxed text-lg transition-all">
            {mod.description}
          </p>
          <div className="mt-8 p-8 bg-slate-900/50 rounded-2xl border border-border">
             <h4 className="text-text-main font-bold mb-4 uppercase tracking-widest text-xs flex items-center gap-2">
               <BookOpen size={14} className="text-accent-blue" />
               Conteúdo Teórico
             </h4>
             <p className="text-text-dim leading-relaxed">{mod.content}</p>
          </div>
        </div>

        <div className="space-y-8 relative z-1">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <Terminal size={20} className="text-accent-purple" />
            Exemplos Práticos
          </h3>
          
          {mod.examples.map((example, idx) => (
            <div key={idx} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] pl-1">Pseudocódigo</p>
                <pre className="bg-black/40 p-5 rounded-xl border border-border text-[13px] font-mono leading-relaxed text-slate-300 overflow-x-auto min-h-[160px]">
                   <code>{example.pseudo}</code>
                </pre>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] pl-1">Visual C#</p>
                <pre className="bg-black/40 p-5 rounded-xl border border-border text-[13px] font-mono leading-relaxed text-accent-blue overflow-x-auto min-h-[160px]">
                   <code>{example.csharp}</code>
                </pre>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] pl-1">Java Class</p>
                <pre className="bg-black/40 p-5 rounded-xl border border-border text-[13px] font-mono leading-relaxed text-[#f97316] overflow-x-auto min-h-[160px]">
                   <code>{example.java}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-end border-t border-border pt-8 relative z-1">
          {isCompleted ? (
            <div className="flex items-center gap-3 text-accent-green font-black bg-accent-green/10 px-8 py-4 rounded-xl border border-accent-green/20 uppercase tracking-widest text-sm">
              <CheckCircle2 size={24} />
              Módulo Concluído
            </div>
          ) : (
            <button 
              onClick={() => onComplete(mod.id, mod.xpReward)}
              className="bg-accent-blue hover:bg-accent-blue/80 text-bg font-black px-12 py-4 rounded-xl transition-all shadow-lg shadow-accent-blue/10 active:scale-95 uppercase tracking-widest text-sm outline-none focus-visible:ring-4 focus-visible:ring-accent-blue/30"
            >
              Finalizar Estudos
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
