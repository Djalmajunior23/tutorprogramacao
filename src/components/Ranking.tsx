import React from 'react';
import { UserProfile } from '../types';
import { Users, Trophy, Medal } from 'lucide-react';
import { educationService } from '../services/api';

export default function Ranking({ user }: { user: UserProfile }) {
  const [ranking, setRanking] = React.useState<any[]>([]);

  React.useEffect(() => {
    educationService.getRanking()
      .then(data => {
         if (!Array.isArray(data)) {
           console.error('Ranking data is not an array:', data);
           return;
         }
         const formatted = data.map((s: any) => ({
           id: s.id,
           name: s.user?.name || 'Inconhecido',
           className: s.classId || 'Sem Turma',
           xp: s.xp,
           isUser: s.userId === localStorage.getItem('userId')
         }));
         setRanking(formatted);
      })
      .catch(() => {
        // Fallback to local if fetch fails
        setRanking([
          { name: user.name, className: user.className, xp: user.xp, isUser: true },
          { name: 'Ana Oliveira', className: '1º B', xp: 1250, isUser: false },
        ]);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-5xl font-black mb-4 tracking-tighter">Quadro de Honra</h2>
        <p className="text-text-dim text-lg">Reconhecimento aos mestres da lógica e algoritmos.</p>
      </div>

      <div className="bg-card rounded-[2.5rem] border border-border overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-blue via-accent-purple to-accent-blue opacity-50"></div>
        
        <div className="p-10 bg-slate-900/40 border-b border-border flex justify-between items-center">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-accent-blue/10 rounded-lg flex items-center justify-center border border-accent-blue/10">
                <Users className="text-accent-blue" size={20} />
              </div>
              <span className="font-black uppercase tracking-[0.2em] text-text-dim text-xs">Ranking Acadêmico Global</span>
           </div>
           <div className="flex items-center gap-2 text-[10px] text-accent-green font-black uppercase tracking-widest bg-accent-green/5 px-3 py-1 rounded-full border border-accent-green/10">
             <div className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse"></div>
             Tempo Real
           </div>
        </div>

        <ul className="divide-y divide-border">
          {ranking.map((player, idx) => (
            <li 
              key={idx} 
              className={`p-8 flex items-center gap-8 transition-all hover:bg-white/[0.02] group ${player.isUser ? 'bg-accent-blue/[0.03]' : ''}`}
            >
              <div className="w-8 text-center font-black text-3xl text-text-dim/20 group-hover:text-accent-blue/40 transition-colors">
                {idx + 1}
              </div>
              
              <div className="w-16 h-16 bg-bg rounded-2xl flex items-center justify-center text-3xl border border-border shadow-inner group-hover:scale-110 transition-transform">
                 {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '👤'}
              </div>

              <div className="flex-1">
                <h4 className={`text-xl font-black tracking-tight ${player.isUser ? 'text-accent-blue' : 'text-text-main'}`}>
                  {player.name} {player.isUser && <span className="ml-3 text-[9px] font-black bg-accent-blue text-bg px-2.5 py-1 rounded-md uppercase tracking-widest align-middle">Seu Perfil</span>}
                </h4>
                <p className="text-text-dim text-sm font-medium mt-1">{player.className}</p>
              </div>

              <div className="text-right">
                <p className="text-3xl font-black text-text-main group-hover:text-accent-purple transition-colors">{player.xp}</p>
                <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] mt-1 opacity-50">Pontos de XP</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
