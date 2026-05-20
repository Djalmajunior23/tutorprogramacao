
/**
 * A basic didactic Pseudocode (VisuAlg style) interpreter.
 * Not intended to be a full compiler, but to support basic learning commands.
 */

export interface Step {
  line: number;
  command: string;
  variables: Record<string, any>;
  output?: string;
  active: boolean;
}

export interface InterpreterResult {
  output: string[];
  errors: string[];
  variables: Record<string, any>;
  steps: Step[];
}

export function interpret(code: string, inputs: string[] = []): InterpreterResult {
  const allLines = code.split('\n');
  const result: InterpreterResult = {
    output: [],
    errors: [],
    variables: {},
    steps: []
  };

  let inputIndex = 0;
  let variables: Record<string, any> = {};
  let vectors: Record<string, { type: string, size: number, data: any[] }> = {};
  
  let pc = 0; // program counter
  const trimmedLines = allLines.map(l => l.trim().toUpperCase());

  // First pass: Find sections
  let inicioIdx = trimmedLines.findIndex(l => l === 'INÍCIO' || l === 'INICIO');
  let varIdx = trimmedLines.findIndex(l => l === 'VAR');

  if (varIdx !== -1) {
    for (let i = varIdx + 1; i < (inicioIdx !== -1 ? inicioIdx : allLines.length); i++) {
      const line = allLines[i].trim();
      if (line === '' || line.startsWith('//')) continue;
      if (line.includes(':')) {
        const [namesStr, typeStr] = line.split(':');
        const names = namesStr.split(',').map(n => n.trim());
        const type = typeStr.trim().toUpperCase();

        names.forEach(n => {
          if (type.startsWith('VETOR')) {
            const sizeMatch = type.match(/\[(\d+)\.\.(\d+)\]/);
            const start = sizeMatch ? parseInt(sizeMatch[1]) : 1;
            const end = sizeMatch ? parseInt(sizeMatch[2]) : 10;
            const dataType = type.split('DE')[1]?.trim() || 'INTEIRO';
            const size = end - start + 1;
            vectors[n] = {
              type: dataType,
              size,
              data: new Array(size).fill(dataType === 'INTEIRO' || dataType === 'REAL' ? 0 : '')
            };
          } else {
            variables[n] = (type === 'INTEIRO' || type === 'REAL') ? 0 : (type === 'LOGICO' ? false : '');
          }
        });
      }
    }
  }

  pc = inicioIdx !== -1 ? inicioIdx + 1 : 0;
  const maxSteps = 2000;
  let stepCount = 0;

  const evaluateExpression = (expr: string, vars: any, vecs: any): any => {
    let cleanExpr = expr.trim();
    
    // Replace vector accesses: mat[i]
    const vecRegex = /(\w+)\[(.*?)\]/g;
    cleanExpr = cleanExpr.replace(vecRegex, (match, vecName, indexExpr) => {
      if (vecs[vecName]) {
        const idx = evaluateExpression(indexExpr, vars, vecs);
        return vecs[vecName].data[idx - 1] ?? 0;
      }
      return match;
    });

    // Replace variable names with their values
    const sortedVarNames = Object.keys(vars).sort((a, b) => b.length - a.length);
    for (const name of sortedVarNames) {
      const regex = new RegExp(`\\b${name}\\b`, 'g');
      const val = typeof vars[name] === 'string' ? `"${vars[name]}"` : vars[name];
      cleanExpr = cleanExpr.replace(regex, val);
    }

    try {
      cleanExpr = cleanExpr
        .replace(/\bE\b/gi, '&&')
        .replace(/\bOU\b/gi, '||')
        .replace(/\bNAO\b/gi, '!')
        .replace(/<> /g, '!=')
        .replace(/=/g, '==');
      
      // eslint-disable-next-line no-eval
      return eval(cleanExpr);
    } catch (e) {
      return expr;
    }
  };

  while (pc < allLines.length && stepCount < maxSteps) {
    const rawLine = allLines[pc];
    const line = rawLine.trim();
    const upLine = line.toUpperCase();

    if (line === '' || line.startsWith('//') || upLine.startsWith('ALGORITMO') || upLine === 'VAR' || upLine === 'INÍCIO' || upLine === 'INICIO') {
      pc++;
      continue;
    }

    if (upLine === 'FIMALGORITMO' || upLine === 'FIM') break;

    const currentStep: Step = {
      line: pc + 1,
      command: line,
      variables: { ...variables, ...Object.fromEntries(Object.entries(vectors).map(([k, v]) => [k, `[${v.data.join(', ')}]`])) },
      active: true
    };

    // --- Commands ---
    if (upLine.startsWith('ESCREVA')) {
      const content = line.match(/\((.*)\)/)?.[1];
      if (content) {
        const parts = content.split(',').map(p => p.trim());
        let finalStr = '';
        parts.forEach(p => {
          if (p.startsWith('"') && p.endsWith('"')) {
            finalStr += p.slice(1, -1);
          } else {
            finalStr += evaluateExpression(p, variables, vectors);
          }
        });
        result.output.push(finalStr);
        currentStep.output = finalStr;
      }
      pc++;
    } 
    else if (upLine.startsWith('LEIA')) {
      const varName = line.match(/\((.*)\)/)?.[1]?.trim();
      if (varName && variables[varName] !== undefined) {
        const inputVal = inputs[inputIndex] || '0';
        inputIndex++;
        variables[varName] = !isNaN(Number(inputVal)) ? Number(inputVal) : inputVal;
      }
      pc++;
    }
    // SE
    else if (upLine.startsWith('SE ')) {
      const condition = line.match(/SE (.*) ENT/i)?.[1];
      if (condition) {
        const isTrue = evaluateExpression(condition, variables, vectors);
        if (!isTrue) {
          // Jump to SENAO or FIMSE
          let depth = 1;
          let tempPc = pc + 1;
          while (tempPc < allLines.length && depth > 0) {
            const nextL = allLines[tempPc].trim().toUpperCase();
            if (nextL.startsWith('SE ')) depth++;
            if (nextL === 'FIMSE') depth--;
            if (depth === 1 && nextL === 'SENAO') {
              pc = tempPc;
              break;
            }
            if (depth === 0) {
              pc = tempPc;
              break;
            }
            tempPc++;
          }
        }
      }
      pc++;
    }
    // PARA ... DE ... A ... FACA
    else if (upLine.startsWith('PARA ')) {
      const match = line.match(/PARA (.*) DE (.*) A (.*) FAC/i);
      if (match) {
        const vName = match[1].trim();
        const startVal = evaluateExpression(match[2], variables, vectors);
        if (variables[vName] === undefined) variables[vName] = startVal;
        
        const endVal = evaluateExpression(match[3], variables, vectors);
        if (variables[vName] > endVal) {
          // Skip loop
          let depth = 1;
          let tempPc = pc + 1;
          while (tempPc < allLines.length && depth > 0) {
            const nextL = allLines[tempPc].trim().toUpperCase();
            if (nextL.startsWith('PARA ')) depth++;
            if (nextL === 'FIMPARA') depth--;
            if (depth === 0) {
              pc = tempPc;
              break;
            }
            tempPc++;
          }
          pc++;
        } else {
          pc++;
        }
      } else { pc++; }
    }
    else if (upLine === 'FIMPARA') {
      // Find PARA line and increment
      let depth = 1;
      let tempPc = pc - 1;
      while (tempPc >= 0 && depth > 0) {
        const prevL = allLines[tempPc].trim().toUpperCase();
        if (prevL === 'FIMPARA') depth++;
        if (prevL.startsWith('PARA ')) depth--;
        if (depth === 0) {
          const match = allLines[tempPc].match(/PARA (.*) DE (.*) A (.*) FAC/i);
          if (match) {
            const vName = match[1].trim();
            variables[vName]++;
            pc = tempPc; // Jump back will re-evaluate end condition
          }
          break;
        }
        tempPc--;
      }
    }
    // ENQUANTO
    else if (upLine.startsWith('ENQUANTO')) {
      const condition = line.match(/ENQUANTO (.*) FAC/i)?.[1];
      if (condition) {
        const isTrue = evaluateExpression(condition, variables, vectors);
        if (!isTrue) {
          // Skip loop
          let depth = 1;
          let tempPc = pc + 1;
          while (tempPc < allLines.length && depth > 0) {
            const nextL = allLines[tempPc].trim().toUpperCase();
            if (nextL.startsWith('ENQUANTO')) depth++;
            if (nextL === 'FIMENQUANTO') depth--;
            if (depth === 0) {
              pc = tempPc;
              break;
            }
            tempPc++;
          }
          pc++;
        } else {
          pc++;
        }
      } else {
        pc++;
      }
    }
    else if (upLine === 'FIMENQUANTO') {
      // Find start of loop
      let depth = 1;
      let tempPc = pc - 1;
      while (tempPc >= 0 && depth > 0) {
        const prevL = allLines[tempPc].trim().toUpperCase();
        if (prevL === 'FIMENQUANTO') depth++;
        if (prevL.startsWith('ENQUANTO')) depth--;
        if (depth === 0) {
          pc = tempPc;
          break;
        }
        tempPc--;
      }
    }
    // REPITA ... ATE
    else if (upLine === 'REPITA') {
      pc++;
    }
    else if (upLine.startsWith('ATE')) {
      const condition = line.match(/ATE (.*)/i)?.[1];
      if (condition) {
        const isTrue = evaluateExpression(condition, variables, vectors);
        if (!isTrue) {
          // Loop back to REPITA
          let depth = 1;
          let tempPc = pc - 1;
          while (tempPc >= 0 && depth > 0) {
            const prevL = allLines[tempPc].trim().toUpperCase();
            if (prevL.startsWith('ATE')) depth++;
            if (prevL === 'REPITA') depth--;
            if (depth === 0) {
              pc = tempPc;
              break;
            }
            tempPc--;
          }
        } else {
          pc++;
        }
      } else {
        pc++;
      }
    }
    // Atribuição ou Vetor
    else if (line.includes('<-')) {
      const [vNameFull, valueExpr] = line.split('<-').map(s => s.trim());
      const val = evaluateExpression(valueExpr, variables, vectors);
      
      if (vNameFull.includes('[')) {
        const vMatch = vNameFull.match(/(\w+)\[(.*?)\]/);
        if (vMatch) {
          const vecName = vMatch[1];
          const idx = evaluateExpression(vMatch[2], variables, vectors);
          if (vectors[vecName]) {
            vectors[vecName].data[idx - 1] = val;
          }
        }
      } else if (variables[vNameFull] !== undefined) {
        variables[vNameFull] = val;
      } else {
        result.errors.push(`Variável não declarada: ${vNameFull}`);
      }
      pc++;
    } 
    else {
      pc++;
    }

    currentStep.variables = { 
      ...variables,
      ...Object.fromEntries(Object.entries(vectors).map(([k, v]) => [k, `[${v.data.join(', ')}]`]))
    };
    result.steps.push(currentStep);
    stepCount++;
  }

  if (stepCount >= maxSteps) {
    result.errors.push("Execução interrompida: loop infinito detectado ou código muito longo.");
  }

  result.variables = variables;
  return result;
}
