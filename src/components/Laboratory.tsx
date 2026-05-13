import React, { useState, useEffect } from 'react';
import { Terminal, Play, RotateCcw, Save, Trash2, Download, Copy, Code2 } from 'lucide-react';
import { interpret } from '../lib/interpreter';

const EXAMPLES = [
  {
    title: 'Olá Mundo',
    code: 'ALGORITMO "OlaMundo"\nINÍCIO\n   ESCREVA("Olá, Mundo!")\nFIM'
  },
  {
    title: 'Input Usuário',
    code: 'ALGORITMO "Input"\nVAR\n   nome : CARACTERE\nINÍCIO\n   ESCREVA("Qual seu nome?")\n   LEIA(nome)\n   ESCREVA("Seja bem-vindo, ", nome)\nFIM'
  },
  {
    title: 'Soma de Dois',
    code: 'ALGORITMO "Soma"\nVAR\n   N1, N2, RES : INTEIRO\nINÍCIO\n   N1 <- 10\n   N2 <- 5\n   RES <- N1 + N2\n   ESCREVA("A soma é: ", RES)\nFIM'
  }
];

export default function Laboratory() {
  const [code, setCode] = useState(() => localStorage.getItem('lab_code') || EXAMPLES[0].code);
  const [output, setOutput] = useState<string[]>([]);
  const [inputs, setInputs] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [waitingForInput, setWaitingForInput] = useState(false);

  useEffect(() => {
    localStorage.setItem('lab_code', code);
  }, [code]);

  const runCode = () => {
    const result = interpret(code, inputs);
    setOutput(result.output);
    if (result.errors.length > 0) {
      setOutput(prev => [...prev, ...result.errors.map(e => `[ERRO] ${e}`)]);
    }
  };

  const clearLab = () => {
    setOutput([]);
    setInputs([]);
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col gap-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-soft">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <label htmlFor="select-lab-example" className="text-[10px] font-black uppercase tracking-widest text-text-dim px-2">Exemplos</label>
            <select 
              id="select-lab-example"
              aria-label="Selecionar código de exemplo"
              onChange={(e) => setCode(EXAMPLES.find(ex => ex.title === e.target.value)?.code || '')}
              className="bg-bg border border-border rounded-lg px-4 py-2 text-xs outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all text-text-main font-bold"
            >
              <option value="">Selecione um código...</option>
              {EXAMPLES.map(ex => <option key={ex.title} value={ex.title}>{ex.title}</option>)}
            </select>
          </div>
          <div className="h-6 w-[1px] bg-border"></div>
          <div className="flex gap-2">
            <button 
              id="btn-lab-clear" 
              onClick={() => setCode('')} 
              className="p-2 text-text-dim hover:text-rose-500 transition-colors focus-visible:ring-2 focus-visible:ring-rose-500 rounded" 
              title="Limpar Editor"
              aria-label="Limpar todo o código do editor"
            >
              <Trash2 size={18} />
            </button>
            <button 
              id="btn-lab-copy" 
              onClick={() => navigator.clipboard.writeText(code)} 
              className="p-2 text-text-dim hover:text-accent-blue transition-colors focus-visible:ring-2 focus-visible:ring-accent-blue rounded" 
              title="Copiar Código"
              aria-label="Copiar código para a área de transferência"
            >
              <Copy size={18} />
            </button>
          </div>
        </div>
        <div className="flex gap-4">
           <button 
             id="btn-lab-run"
             onClick={runCode}
             className="bg-accent-blue hover:bg-accent-blue/80 text-bg font-black px-8 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-accent-blue/10 active:scale-95 uppercase tracking-widest text-xs"
           >
             <Play size={14} fill="currentColor" />
             Executar Script
           </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Editor Area */}
        <div className="bg-bg rounded-2xl border border-border overflow-hidden flex flex-col shadow-2xl">
          <div className="px-6 py-3 border-b border-border bg-card/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Code2 size={14} className="text-accent-purple" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim">Editor de Algoritmos</span>
            </div>
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-border"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-border"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-border"></div>
            </div>
          </div>
          <textarea
            id="textarea-lab-code"
            aria-label="Editor de código"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full bg-transparent p-8 font-mono text-[13px] leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-accent-blue/30 text-text-main caret-accent-blue selection:bg-accent-blue/20"
            spellCheck={false}
            placeholder="Comece seu código aqui..."
          />
        </div>

        {/* Console Area */}
        <div className="bg-black/40 rounded-2xl border border-border overflow-hidden flex flex-col shadow-inner backdrop-blur-sm">
          <div className="px-6 py-3 border-b border-border bg-card/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Terminal size={14} className="text-accent-green" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim">Saída do Sistema</span>
            </div>
            <button onClick={clearLab} className="text-[10px] uppercase font-black tracking-widest text-text-dim hover:text-text-main transition-colors">
              Limpar Logs
            </button>
          </div>
          <div className="flex-1 p-8 font-mono text-[13px] overflow-y-auto space-y-2">
            {output.length === 0 ? (
              <p className="text-text-dim/30 italic">Aguardando execução do algoritmo...</p>
            ) : (
              output.map((line, idx) => (
                <div key={idx} className={`flex gap-3 ${line.startsWith('[ERRO]') ? 'text-rose-400' : 'text-slate-200'}`}>
                  <span className="text-text-dim opacity-30 select-none">[{idx + 1}]</span>
                  <span>{line}</span>
                </div>
              ))
            )}
            
            {/* Input simulation */}
            <div className="mt-6 flex gap-3 bg-white/5 p-4 rounded-lg border border-white/5 focus-within:border-accent-blue/50 transition-colors">
              <span className="text-accent-blue font-bold" aria-hidden="true">»</span>
              <input 
                id="input-lab-terminal"
                type="text"
                aria-label="Campo de entrada do terminal"
                value={currentInput}
                onChange={e => setCurrentInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setInputs(prev => [...prev, currentInput]);
                    setCurrentInput('');
                    setOutput(prev => [...prev, `[INPUT] ${currentInput}`]);
                  }
                }}
                placeholder="Entrada de dados..."
                className="bg-transparent border-none outline-none text-text-main flex-1 placeholder:text-text-dim/30"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
