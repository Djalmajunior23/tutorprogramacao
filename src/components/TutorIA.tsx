import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, Send, X, MessageSquare, Bot, ArrowRight } from 'lucide-react';
import { geminiService } from '../services/geminiService';

export default function TutorIA() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'tutor', text: string }[]>([
    { role: 'tutor', text: 'Olá! Sou o seu Tutor I.D.E.A. Estou aqui para te ajudar a pensar como um programador. Ficou com dúvida em algum conceito?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (customMsg?: string) => {
    const userMsg = customMsg || input;
    if (!userMsg.trim() || isLoading) return;

    if (!customMsg) setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await geminiService.askTutor(userMsg);
      setMessages(prev => [...prev, { role: 'tutor', text: response || 'Desculpe, tive um pequeno problema no meu processamento lógico.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'tutor', text: 'Ops! Parece que meus servidores de lógica estão ocupados. Tente novamente em breve.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const SUGGESTIONS = [
    'Explique o que é um algoritmo',
    'Exemplo de loop Enquanto',
    'Como declarar um vetor?',
    'Explique POO de forma simples'
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-10 w-20 h-20 bg-accent-blue rounded-full shadow-2xl shadow-accent-blue/40 flex items-center justify-center text-bg z-50 hover:scale-110 active:scale-95 transition-all group"
      >
        <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-20 group-hover:hidden"></div>
        <Brain size={32} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-32 right-10 w-[420px] h-[650px] bg-card border border-border rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-border bg-gradient-to-br from-card to-bg flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent-blue/10 rounded-2xl flex items-center justify-center text-accent-blue border border-accent-blue/10">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                    Tutor I.D.E.A <Sparkles size={14} className="text-accent-blue" />
                  </h3>
                  <p className="text-[10px] uppercase font-black tracking-widest text-text-dim">IA Pedagógica Ativa</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-card border border-transparent hover:border-border rounded-xl transition-all"
              >
                <X size={20} className="text-text-dim" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-dots-grid">
              {messages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-5 rounded-[1.5rem] text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-accent-blue text-bg rounded-tr-none font-medium' 
                      : 'bg-bg border border-border text-text-main rounded-tl-none font-medium'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-bg border border-border p-5 rounded-[1.5rem] rounded-tl-none flex gap-1">
                    <div className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-8 bg-bg/50 border-t border-border">
              <div className="flex flex-wrap gap-2 mb-6">
                {SUGGESTIONS.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(s)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-card border border-border rounded-lg text-[10px] font-black uppercase tracking-widest text-text-dim hover:text-accent-blue hover:border-accent-blue/30 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Dúvida em algoritmo, vetores...?"
                  className="w-full bg-card border border-border rounded-2xl px-6 py-5 pr-16 outline-none focus:border-accent-blue transition-all font-bold text-sm shadow-inner"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-accent-blue text-bg rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent-blue/20 disabled:opacity-50"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
              <p className="text-[9px] text-center text-text-dim mt-4 uppercase tracking-[0.2em] font-black">Powered by Gemini Pedagogy</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
