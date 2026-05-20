import React, { useState, useEffect } from 'react';
import { Shield, Users, BookMarked, Settings, AlertCircle, Database, Server, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminArea() {
  const [systemStats, setSystemStats] = useState({
    users: 1240,
    activeTrilhas: 9,
    dbHealth: 'Excelente',
    cpuUsage: '12%',
    memory: '240MB / 512MB'
  });

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black tracking-tighter text-text-main flex items-center gap-4">
             Painel <span className="text-accent-purple">ADMIN</span>
          </h2>
          <p className="text-text-dim mt-3 font-medium text-lg">Controle total da infraestrutura pedagógica e técnica do portal.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="px-6 py-3 bg-accent-green/10 border border-accent-green/20 rounded-2xl flex items-center gap-3">
            <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-accent-green">Sistema Online</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-8 rounded-[2rem] border border-border shadow-soft group hover:border-accent-blue/30 transition-all">
          <div className="w-12 h-12 bg-accent-blue/10 rounded-xl flex items-center justify-center mb-6 border border-accent-blue/10">
            <Users className="text-accent-blue" size={24} />
          </div>
          <p className="text-text-dim text-[10px] font-black uppercase tracking-widest mb-1">Total Usuários</p>
          <h3 className="text-3xl font-black text-text-main">{systemStats.users}</h3>
        </div>
        <div className="bg-card p-8 rounded-[2rem] border border-border shadow-soft group hover:border-accent-purple/30 transition-all">
          <div className="w-12 h-12 bg-accent-purple/10 rounded-xl flex items-center justify-center mb-6 border border-accent-purple/10">
            <BookMarked className="text-accent-purple" size={24} />
          </div>
          <p className="text-text-dim text-[10px] font-black uppercase tracking-widest mb-1">Conteúdos</p>
          <h3 className="text-3xl font-black text-text-main">{systemStats.activeTrilhas} Trilhas</h3>
        </div>
        <div className="bg-card p-8 rounded-[2rem] border border-border shadow-soft group hover:border-accent-green/30 transition-all">
          <div className="w-12 h-12 bg-accent-green/10 rounded-xl flex items-center justify-center mb-6 border border-accent-green/10">
            <Database className="text-accent-green" size={24} />
          </div>
          <p className="text-text-dim text-[10px] font-black uppercase tracking-widest mb-1">Banco de Dados</p>
          <h3 className="text-3xl font-black text-text-main">{systemStats.dbHealth}</h3>
        </div>
        <div className="bg-card p-8 rounded-[2rem] border border-border shadow-soft group hover:border-amber-500/30 transition-all">
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 border border-amber-500/10">
            <Cpu className="text-amber-500" size={24} />
          </div>
          <p className="text-text-dim text-[10px] font-black uppercase tracking-widest mb-1">Carga CPU</p>
          <h3 className="text-3xl font-black text-text-main">{systemStats.cpuUsage}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-card p-10 rounded-[3rem] border border-border overflow-hidden">
               <h4 className="text-xs font-black uppercase tracking-widest text-text-dim mb-10 flex items-center gap-3">
                  <Shield size={16} /> Auditoria do Sistema
               </h4>
               <div className="space-y-6">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex items-center justify-between p-6 bg-bg rounded-2xl border border-border">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue">
                             <Server size={18} />
                          </div>
                          <div>
                             <p className="font-bold text-text-main">Prisma Migration {40+i}</p>
                             <p className="text-[10px] text-text-dim font-black uppercase tracking-widest mt-1">Status: Aplicado com Sucesso</p>
                          </div>
                       </div>
                       <p className="text-[10px] font-black text-text-dim">Há {i} hora</p>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-gradient-to-br from-rose-500/20 to-bg p-10 rounded-[3rem] border border-rose-500/20 shadow-soft">
               <AlertCircle className="text-rose-500 mb-6" size={40} />
               <h4 className="text-xl font-black mb-4 text-text-main">Ações Críticas</h4>
               <p className="text-text-dim text-xs leading-relaxed mb-8">
                  Atenção: Estas ações são irreversíveis e afetam todos os usuários do portal.
               </p>
               <div className="space-y-3">
                  <button className="w-full py-4 bg-rose-500 text-bg rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all">
                    Resetar Cache
                  </button>
                  <button className="w-full py-4 bg-bg border border-rose-500/30 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500/5 transition-all">
                    Limpar Banco (DEV)
                  </button>
               </div>
            </div>

            <div className="bg-card p-10 rounded-[3rem] border border-border shadow-soft">
               <Settings className="text-accent-blue mb-6" size={40} />
               <h4 className="text-xl font-black mb-4 text-text-main">Configurações Base</h4>
               <p className="text-text-dim text-xs leading-relaxed mb-8">
                  Gerencie as chaves de API, variáveis de ambiente e segredos do servidor.
               </p>
               <button className="w-full py-4 bg-accent-blue text-bg rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-accent-blue/80 transition-all">
                 Editor de Segredos
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
