import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Play, RotateCcw, Save, Trash2, Download, Copy, Code2, Globe, Sparkles, ChevronRight, Brain, Info, Bot, Check } from 'lucide-react';
import { interpret, Step } from '../lib/interpreter';
import { motion, AnimatePresence } from 'motion/react';
import ConceptComparator from './ConceptComparator';
import { geminiService } from '../services/geminiService';

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
  },
  {
    title: 'Condicional (SE)',
    code: 'ALGORITMO "Votacao"\nVAR\n   idade : INTEIRO\nINÍCIO\n   ESCREVA("Sua idade?")\n   LEIA(idade)\n   SE idade >= 18 ENTAO\n      ESCREVA("Voto Obrigatório")\n   SENAO\n      ESCREVA("Voto não Obrigatório")\n   FIMSE\nFIM'
  },
  {
    title: 'Loop (ENQUANTO)',
    code: 'ALGORITMO "Contador"\nVAR\n   cont : INTEIRO\nINÍCIO\n   cont <- 1\n   ENQUANTO cont <= 5 FAC\n      ESCREVA("Número: ", cont)\n      cont <- cont + 1\n   FIMENQUANTO\nFIM'
  }
];

export default function Laboratory() {
  const [activeTab, setActiveTab] = useState<'editor' | 'comparator'>('editor');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [code, setCode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lab_code');
      if (saved !== null) return saved;
    }
    return EXAMPLES[0].code;
  });
  
  const [output, setOutput] = useState<string[]>([]);
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [inputs, setInputs] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  
  // Stepping functionality
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(-1);
  const [isStepping, setIsStepping] = useState(false);
  const [view, setView] = useState<'variables' | 'trace'>('variables');
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState('');
  
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      localStorage.setItem('lab_code', code);
      setSaveStatus('saved');
      const resetTimer = setTimeout(() => setSaveStatus('idle'), 2000);
      return () => clearTimeout(resetTimer);
    }, 1500);
    return () => clearTimeout(timer);
  }, [code]);

  const saveToLocalStorage = () => {
    localStorage.setItem('lab_code', code);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'algoritmo.alg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const runCode = async () => {
    setIsStepping(false);
    setCurrentStepIdx(-1);
    setExplanation('');
    const result = interpret(code, inputs);
    setOutput(result.output);
    setVariables(result.variables);
    
    if (result.errors.length > 0) {
      setOutput(prev => [...prev, ...result.errors.map(e => `[ERRO] ${e}`)]);
      // Use Gemini to explain the error
      setIsExplaining(true);
      try {
        const msg = await geminiService.explainError(code, result.errors[0]);
        setExplanation(msg);
      } catch (e) {
        setExplanation("Ocorreu um erro na lógica do algoritmo. Verifique a sintaxe ou tipos de dados.");
      } finally {
        setIsExplaining(false);
      }
    }
  };

  // History of variables for Teste de Mesa
  const [history, setHistory] = useState<{ line: number, command: string, variable: string, value: any }[]>([]);

  const startStepping = () => {
    const result = interpret(code, inputs);
    setSteps(result.steps);
    setCurrentStepIdx(0);
    setIsStepping(true);
    setOutput([]);
    setHistory([]);
    
    if (result.steps[0]) {
      const step = result.steps[0];
      setVariables(step.variables || {});
      if (step.output) setOutput([step.output]);
    }
  };

  const nextStep = () => {
    if (currentStepIdx < steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      const step = steps[nextIdx];
      const prevStep = steps[currentStepIdx];
      
      // Track changes for history
      const changes: any[] = [];
      Object.entries(step.variables).forEach(([key, val]) => {
        if (val !== prevStep.variables[key]) {
          changes.push({ 
            line: step.line, 
            command: step.command,
            variable: key,
            value: val 
          });
        }
      });
      
      setHistory(prev => [...prev, ...changes]);
      setCurrentStepIdx(nextIdx);
      setVariables(step.variables);
      if (step.output) {
        setOutput(prev => [...prev, step.output!]);
      }
    } else {
      setIsStepping(false);
      setCurrentStepIdx(-1);
    }
  };

  const clearLab = () => {
    setOutput([]);
    setVariables({});
    setInputs([]);
    setIsStepping(false);
    setCurrentStepIdx(-1);
  };

  const currentLine = isStepping && currentStepIdx !== -1 ? steps[currentStepIdx].line : -1;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black tracking-tighter text-text-main flex items-center gap-4">
             Laboratório <span className="text-accent-blue">I.D.E.A</span>
          </h2>
          <p className="text-text-dim mt-3 font-medium text-lg">Seu ambiente seguro para experimentação e tradução de algoritmos.</p>
        </div>
        
        <div className="flex bg-card p-1.5 rounded-2xl border border-border h-fit">
          <button 
            onClick={() => setActiveTab('editor')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'editor' ? 'bg-accent-blue text-bg shadow-lg shadow-accent-blue/20' : 'text-text-dim hover:text-text-main'}`}
          >
            <Terminal size={14} /> Editor
          </button>
          <button 
            onClick={() => setActiveTab('comparator')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'comparator' ? 'bg-accent-green text-bg shadow-lg shadow-accent-green/20' : 'text-text-dim hover:text-text-main'}`}
          >
            <Globe size={14} /> Comparador
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'editor' ? (
          <motion.div 
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card p-6 rounded-2xl border border-border shadow-soft gap-6">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <label htmlFor="select-lab-example" className="text-[10px] font-black uppercase tracking-widest text-text-dim px-2">Exemplos</label>
                  <select 
                    id="select-lab-example"
                    aria-label="Selecionar código de exemplo"
                    onChange={(e) => {
                      const ex = EXAMPLES.find(ex => ex.title === e.target.value);
                      if (ex) {
                        setCode(ex.code);
                        clearLab();
                      }
                    }}
                    className="bg-bg border border-border rounded-lg px-4 py-2 text-xs outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all text-text-main font-bold"
                  >
                    <option value="">Selecione um código...</option>
                    {EXAMPLES.map(ex => <option key={ex.title} value={ex.title}>{ex.title}</option>)}
                  </select>
                </div>
                <div className="hidden md:block h-6 w-[1px] bg-border"></div>
                <div className="flex gap-2 items-center">
                  <button 
                    onClick={() => { setCode(''); clearLab(); }} 
                    className="p-2 text-text-dim hover:text-rose-500 transition-colors" 
                    title="Limpar Editor"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button 
                    onClick={saveToLocalStorage} 
                    className="p-2 text-text-dim hover:text-accent-blue transition-colors" 
                    title="Salvar Localmente"
                  >
                    <Save size={18} />
                  </button>
                  <button 
                    onClick={downloadCode} 
                    className="p-2 text-text-dim hover:text-accent-green transition-colors" 
                    title="Baixar Algoritmo (.alg)"
                  >
                    <Download size={18} />
                  </button>
                  <button 
                    onClick={() => navigator.clipboard.writeText(code)} 
                    className="p-2 text-text-dim hover:text-accent-blue transition-colors" 
                    title="Copiar Código"
                  >
                    <Copy size={18} />
                  </button>

                  <AnimatePresence>
                    {saveStatus === 'saved' && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[9px] font-black uppercase tracking-widest text-accent-green flex items-center gap-1 border border-accent-green/20 bg-accent-green/10 px-2 py-1 rounded"
                      >
                        <Check size={10} /> Salvo
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                 {isStepping ? (
                   <button 
                    onClick={nextStep}
                    className="flex-1 md:flex-none bg-accent-purple text-bg font-black px-8 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent-purple/20 active:scale-95 uppercase tracking-widest text-[10px]"
                  >
                    <ChevronRight size={16} />
                    Próximo Passo ({currentStepIdx + 1}/{steps.length})
                  </button>
                 ) : (
                   <button 
                    onClick={startStepping}
                    className="flex-1 md:flex-none border border-accent-purple text-accent-purple hover:bg-accent-purple/10 font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-[10px]"
                    title="Executar linha por linha"
                  >
                    <Sparkles size={16} />
                    Modo Passo a Passo
                  </button>
                 )}
                 
                 <button 
                   onClick={runCode}
                   disabled={isStepping}
                   className="flex-1 md:flex-none bg-accent-blue hover:bg-accent-blue/80 disabled:opacity-50 text-bg font-black px-10 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent-blue/20 active:scale-95 uppercase tracking-widest text-[10px]"
                 >
                   <Play size={14} fill="currentColor" />
                   Execução Rápida
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
              {/* Editor Area with Line Highlighting workaround */}
              <div className="lg:col-span-8 bg-bg rounded-3xl border border-border overflow-hidden flex flex-col shadow-2xl relative">
                <div className="px-6 py-4 border-b border-border bg-card/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Code2 size={16} className="text-accent-purple" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim">Editor Dinâmico</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 bg-accent-green/10 text-accent-green text-[8px] font-black uppercase rounded tracking-widest">Pseudocódigo ativo</div>
                  </div>
                </div>
                
                <div className="relative flex-1 flex overflow-hidden">
                   {/* Line numbers and highlights */}
                   <div className="w-12 bg-card/50 border-r border-border font-mono text-[11px] text-text-dim/40 pt-8 flex flex-col items-center select-none">
                      {code.split('\n').map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-6 leading-6 w-full text-center transition-colors ${currentLine === i + 1 ? 'bg-accent-purple/20 text-accent-purple font-black' : ''}`}
                        >
                          {i + 1}
                        </div>
                      ))}
                   </div>
                   
                   <textarea
                    ref={editorRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 bg-transparent p-8 font-mono text-[14px] leading-6 resize-none focus:outline-none text-text-main caret-accent-blue selection:bg-accent-blue/20 h-full overflow-y-auto"
                    spellCheck={false}
                    placeholder={`ALGORITMO "Logica"\nVAR\n   X : INTEIRO\nINICIO\n   X <- 10\nFIM`}
                  />

                  {/* Visual indication of active line */}
                  {isStepping && currentLine !== -1 && (
                     <div 
                       className="absolute left-12 right-0 bg-accent-purple/5 border-y border-accent-purple/10 pointer-events-none"
                       style={{ 
                         top: `calc(32px + ${(currentLine - 1) * 24}px)`,
                         height: '24px'
                       }}
                     />
                  )}
                </div>
              </div>

              {/* Sidebar: Console & Variable Watch Area */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {/* Console */}
                <div className="flex-1 bg-black/60 rounded-3xl border border-border overflow-hidden flex flex-col shadow-inner backdrop-blur-md min-h-[300px]">
                  <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Terminal size={14} className="text-accent-green" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim/70">Console de Saída</span>
                    </div>
                    <button onClick={clearLab} className="text-[10px] uppercase font-black tracking-widest text-text-dim hover:text-white transition-colors">
                      <RotateCcw size={14} />
                    </button>
                  </div>
                  <div className="flex-1 p-6 font-mono text-[13px] overflow-y-auto space-y-2">
                    {output.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8">
                         <Info size={32} className="text-text-dim/20 mb-4" />
                         <p className="text-text-dim/30 text-xs italic">Aguardando execução do algoritmo para processar saída de dados...</p>
                      </div>
                    ) : (
                      output.map((line, idx) => (
                        <div key={idx} className={`flex gap-3 items-start ${line.startsWith('[ERRO]') ? 'text-rose-400' : line.startsWith('[INPUT]') ? 'text-accent-purple font-black' : 'text-slate-200'}`}>
                          <span className="text-text-dim opacity-30 select-none text-[10px] mt-0.5">[{idx + 1}]</span>
                          <span className="leading-relaxed">{line}</span>
                        </div>
                      ))
                    )}
                    
                    {/* Input simulation */}
                    <div className="mt-4 flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 focus-within:border-accent-blue/50 transition-all group">
                      <span className="text-accent-blue font-black group-focus-within:scale-125 transition-transform" aria-hidden="true">»</span>
                      <input 
                        value={currentInput}
                        onChange={e => setCurrentInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && currentInput.trim()) {
                            setInputs(prev => [...prev, currentInput]);
                            setCurrentInput('');
                            if (!isStepping) {
                               setOutput(prev => [...prev, `[INPUT] ${currentInput}`]);
                            }
                          }
                        }}
                        placeholder="Injetar entrada..."
                        className="bg-transparent border-none outline-none text-text-main flex-1 placeholder:text-text-dim/30 text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Pedagogical Feedback (Gemini) */}
                {(explanation || isExplaining) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-accent-blue/10 border border-accent-blue/20 rounded-3xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                       <Bot size={20} className="text-accent-blue" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-accent-blue">Dica do Tutor I.D.E.A</span>
                    </div>
                    {isExplaining ? (
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-text-main leading-relaxed">
                        {explanation}
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Simulador de Mesa (Variable Watch) */}
                <div className="bg-card rounded-3xl border border-border overflow-hidden flex flex-col shadow-2xl">
                  <div className="px-6 py-4 border-b border-border bg-bg/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles size={16} className="text-accent-blue" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim">Simulador de Memória</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col h-[400px]">
                    <div className="p-4 bg-accent-blue/5 border-b border-border">
                        <div className="grid grid-cols-2 gap-2">
                           <button onClick={() => setView('variables')} className={`py-2 text-[8px] font-black uppercase rounded-lg tracking-widest ${view === 'variables' ? 'bg-accent-blue text-bg' : 'text-text-dim'}`}>Variáveis</button>
                           <button onClick={() => setView('trace')} className={`py-2 text-[8px] font-black uppercase rounded-lg tracking-widest ${view === 'trace' ? 'bg-accent-purple text-bg' : 'text-text-dim'}`}>Teste de Mesa</button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                      {view === 'variables' ? (
                        <div className="space-y-3">
                            {Object.keys(variables).length === 0 ? (
                                <div className="py-10 text-center">
                                <Brain size={40} className="mx-auto text-text-dim/10 mb-3" />
                                <p className="text-xs text-text-dim/40 font-medium italic">Declare variáveis no bloco VAR<br/>para rastrear seus valores.</p>
                                </div>
                            ) : (
                                Object.entries(variables).map(([key, val]) => (
                                <motion.div 
                                    key={key} 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex justify-between items-center p-4 bg-bg border border-border rounded-xl group hover:border-accent-blue/40 transition-all shadow-sm"
                                >
                                    <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase text-text-dim/50 tracking-widest mb-1">Nome</span>
                                    <span className="font-mono text-sm text-accent-blue font-black">{key}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-black uppercase text-text-dim/50 tracking-widest mb-1">Valor Atual</span>
                                    <span className="font-mono text-sm text-text-main bg-card px-3 py-1.5 rounded-lg border border-border min-w-[60px] text-center shadow-inner">
                                        {typeof val === 'string' ? `"${val}"` : (typeof val === 'boolean' ? (val ? 'VERDADE' : 'FALSO') : val)}
                                    </span>
                                    </div>
                                </motion.div>
                                ))
                            )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                           {history.length === 0 ? (
                               <div className="py-10 text-center text-text-dim/30">
                                  <RotateCcw size={32} className="mx-auto mb-4 opacity-20" />
                                  <p className="text-xs italic font-medium">As alterações de memória<br/>aparecerão aqui durante o passo a passo.</p>
                               </div>
                           ) : (
                               <div className="rounded-xl border border-border overflow-hidden">
                                  <table className="w-full text-left border-collapse">
                                     <thead className="bg-bg border-b border-border">
                                        <tr className="text-[8px] font-black uppercase text-text-dim tracking-widest">
                                           <th className="px-3 py-3">Linha</th>
                                           <th className="px-3 py-3">Var</th>
                                           <th className="px-3 py-3 text-right">Valor</th>
                                        </tr>
                                     </thead>
                                     <tbody className="font-mono text-[11px]">
                                        {history.map((h, i) => (
                                            <tr key={i} className="border-b border-border/40 hover:bg-white/5 transition-colors">
                                               <td className="px-3 py-2 text-text-dim">{h.line}</td>
                                               <td className="px-3 py-2 text-accent-purple font-bold">{h.variable}</td>
                                               <td className="px-3 py-2 text-right font-black text-text-main">{typeof h.value === 'string' ? `"${h.value}"` : String(h.value)}</td>
                                            </tr>
                                        ))}
                                     </tbody>
                                  </table>
                               </div>
                           )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="comparator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ConceptComparator />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
