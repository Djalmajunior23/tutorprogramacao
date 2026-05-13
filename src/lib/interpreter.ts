
/**
 * A basic didactic Pseudocode (VisuAlg style) interpreter.
 * Not intended to be a full compiler, but to support basic learning commands.
 */

export interface InterpreterResult {
  output: string[];
  errors: string[];
  variables: Record<string, any>;
}

export function interpret(code: string, inputs: string[] = []): InterpreterResult {
  const lines = code.split('\n').map(l => l.trim()).filter(l => l !== '');
  const result: InterpreterResult = {
    output: [],
    errors: [],
    variables: {}
  };

  let inputIndex = 0;
  let inVarSection = false;
  let inInicioSection = false;

  try {
    for (const line of lines) {
      if (line.toUpperCase().startsWith('//')) continue;

      if (line.toUpperCase().startsWith('ALGORITMO')) continue;
      
      if (line.toUpperCase() === 'VAR') {
        inVarSection = true;
        continue;
      }
      
      if (line.toUpperCase() === 'INÍCIO' || line.toUpperCase() === 'INICIO') {
        inVarSection = false;
        inInicioSection = true;
        continue;
      }
      
      if (line.toUpperCase() === 'FIM') {
        inInicioSection = false;
        continue;
      }

      // Variable declaration
      if (inVarSection) {
        if (line.includes(':')) {
          const [namesStr, typeStr] = line.split(':');
          const names = namesStr.split(',').map(n => n.trim());
          const type = typeStr.trim().toUpperCase();
          names.forEach(n => {
            result.variables[n] = type === 'INTEIRO' || type === 'REAL' ? 0 : '';
          });
        }
        continue;
      }

      if (inInicioSection) {
        // ESCREVA
        if (line.toUpperCase().startsWith('ESCREVA')) {
          const content = line.match(/\((.*)\)/)?.[1];
          if (content) {
            // Very simple parser for strings and variables
            const parts = content.split(',').map(p => p.trim());
            let finalStr = '';
            parts.forEach(p => {
              if (p.startsWith('"') && p.endsWith('"')) {
                finalStr += p.slice(1, -1);
              } else if (result.variables[p] !== undefined) {
                finalStr += result.variables[p];
              } else {
                finalStr += p; // literal fallback
              }
            });
            result.output.push(finalStr);
          }
          continue;
        }

        // LEIA
        if (line.toUpperCase().startsWith('LEIA')) {
          const varName = line.match(/\((.*)\)/)?.[1]?.trim();
          if (varName && result.variables[varName] !== undefined) {
            const inputVal = inputs[inputIndex] || '';
            inputIndex++;
            // Try to preserve type
            const currentType = typeof result.variables[varName];
            if (currentType === 'number') {
              result.variables[varName] = Number(inputVal);
            } else {
              result.variables[varName] = inputVal;
            }
          }
          continue;
        }

        // Atribuição <-
        if (line.includes('<-')) {
          const [vName, value] = line.split('<-').map(s => s.trim());
          if (result.variables[vName] !== undefined) {
            let val: any = value;
            if (value.startsWith('"') && value.endsWith('"')) {
              val = value.slice(1, -1);
            } else if (!isNaN(Number(value))) {
              val = Number(value);
            } else if (result.variables[value] !== undefined) {
              val = result.variables[value];
            }
            result.variables[vName] = val;
          } else {
            result.errors.push(`Variável não declarada: ${vName}`);
          }
          continue;
        }
      }
    }
  } catch (e: any) {
    result.errors.push(`Erro de execução: ${e.message}`);
  }

  return result;
}
