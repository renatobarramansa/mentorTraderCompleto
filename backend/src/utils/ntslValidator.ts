// backend/src/utils/ntslValidator.ts

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class NTSLValidator {
  /**
   * Valida código NTSL e retorna erros encontrados
   */
  static validate(code: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!code || code.trim().length === 0) {
      errors.push('Código vazio');
      return { valid: false, errors, warnings };
    }

    // 1. Verificar se começa com palavra proibida
    const firstLine = code.trim().split('\n')[0].trim().toLowerCase();
    if (firstLine === 'pascal' || firstLine === 'ntsl') {
      errors.push('❌ Código não pode começar com "pascal" ou "ntsl"');
    }

    // 2. Verificar TakeProfit e StopLoss
    const usesToProfit = code.includes('TakeProfit') && !code.match(/TakeProfit\s*\(/);
    const usesStopLoss = code.includes('StopLoss') && !code.match(/StopLoss\s*\(/);
    
    if (usesToProfit || usesStopLoss) {
      // Extrair seção input
      const inputMatch = code.match(/input[\s\S]*?(?=var|begin)/i);
      const inputSection = inputMatch ? inputMatch[0] : '';
      
      if (usesToProfit && !inputSection.includes('TakeProfit(')) {
        errors.push('❌ TakeProfit usado nas ordens mas não declarado no input');
      }
      
      if (usesStopLoss && !inputSection.includes('StopLoss(')) {
        errors.push('❌ StopLoss usado nas ordens mas não declarado no input');
      }
    }

    // 3. Verificar declarações de var dentro de blocos begin/end
    // Remove strings e comentários primeiro para evitar falsos positivos
    const codeWithoutStrings = code.replace(/"[^"]*"/g, '""').replace(/'[^']*'/g, "''");
    const codeWithoutComments = codeWithoutStrings.replace(/\/\/.*$/gm, '');
    
    // Procura por padrão de declaração de var dentro de blocos
    const varInsideBlockPattern = /begin[\s\S]*?\bvar\s+\w+\s*:/gi;
    if (varInsideBlockPattern.test(codeWithoutComments)) {
      errors.push('❌ Variável declarada dentro de bloco begin/end (deve estar no bloco var)');
    }

    // 4. Verificar se termina com "end."
    const trimmedCode = code.trim();
    if (!trimmedCode.endsWith('end.')) {
      if (trimmedCode.endsWith('end;')) {
        errors.push('❌ Código deve terminar com "end." (com ponto) e não "end;"');
      } else if (trimmedCode.endsWith('end')) {
        errors.push('❌ Código deve terminar com "end." (falta o ponto)');
      } else {
        warnings.push('⚠️ Código parece não terminar com "end."');
      }
    }

    // 5. Verificar uso de nomes de funções como variáveis
    const forbiddenVarNames = [
      'media', 'mediaexp', 'ifr', 'adx', 'macd', 'close', 'open', 'high', 'low',
      'volume', 'highest', 'lowest', 'max', 'min', 'plot', 'alert'
    ];
    
    const varMatch = code.match(/var[\s\S]*?begin/i);
    if (varMatch) {
      const varSection = varMatch[0].toLowerCase();
      forbiddenVarNames.forEach(name => {
        const pattern = new RegExp(`\\b${name}\\s*:`, 'i');
        if (pattern.test(varSection)) {
          errors.push(`❌ Não use "${name}" como nome de variável (é uma função nativa)`);
        }
      });
    }

    // 6. Verificar ConsoleLog sem concatenação
    const consoleLogPattern = /ConsoleLog\s*\(\s*[^"'][^)]*\)/g;
    const matches = code.match(consoleLogPattern);
    if (matches) {
      matches.forEach(match => {
        if (!match.includes('+') && !match.includes('"')) {
          warnings.push('⚠️ ConsoleLog deve usar concatenação: ConsoleLog("Texto: " + variavel)');
        }
      });
    }

    // 7. Verificar ordens sem quantidade
    const ordersWithoutQty = [
      /BuyAtMarket\s*\(\s*\)/gi,
      /SellShortAtMarket\s*\(\s*\)/gi,
      /BuyToCoverAtMarket\s*\(\s*\)/gi,
      /SellToCoverAtMarket\s*\(\s*\)/gi,
    ];
    
    ordersWithoutQty.forEach(pattern => {
      if (pattern.test(code)) {
        warnings.push('⚠️ Ordem de mercado sem quantidade especificada');
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Tenta corrigir automaticamente erros comuns
   */
  static autoFix(code: string): string {
    let fixed = code;

    // 1. Remover "pascal" ou "ntsl" do início
    fixed = fixed.replace(/^(pascal|ntsl)\s*\n/i, '');

    // 2. Adicionar TakeProfit e StopLoss no input se necessário
    const usesToProfit = fixed.includes('TakeProfit') && !fixed.match(/TakeProfit\s*\(/);
    const usesStopLoss = fixed.includes('StopLoss') && !fixed.match(/StopLoss\s*\(/);
    
    if (usesToProfit || usesStopLoss) {
      const inputMatch = fixed.match(/(input[\s\S]*?)(var|begin)/i);
      
      if (inputMatch) {
        let inputSection = inputMatch[1];
        const separator = inputMatch[2];
        
        // Adicionar TakeProfit se necessário
        if (usesToProfit && !inputSection.includes('TakeProfit(')) {
          // Encontrar a última linha do input para adicionar antes
          const lines = inputSection.split('\n');
          const lastLineIndex = lines.length - 1;
          lines.splice(lastLineIndex, 0, '    TakeProfit(6);');
          inputSection = lines.join('\n');
        }
        
        // Adicionar StopLoss se necessário
        if (usesStopLoss && !inputSection.includes('StopLoss(')) {
          const lines = inputSection.split('\n');
          const lastLineIndex = lines.length - 1;
          lines.splice(lastLineIndex, 0, '    StopLoss(3);');
          inputSection = lines.join('\n');
        }
        
        fixed = fixed.replace(inputMatch[1], inputSection);
      } else {
        // Se não tem bloco input, criar um
        let newInput = 'input\n';
        if (usesToProfit) newInput += '    TakeProfit(6);\n';
        if (usesStopLoss) newInput += '    StopLoss(3);\n';
        
        // Inserir antes de var ou begin
        if (fixed.match(/^var/im)) {
          fixed = newInput + '\n' + fixed;
        } else if (fixed.match(/^begin/im)) {
          fixed = newInput + '\n' + fixed;
        }
      }
    }

    // 3. Corrigir "end;" para "end."
    const trimmed = fixed.trim();
    if (trimmed.endsWith('end;')) {
      fixed = fixed.trim().slice(0, -1) + '.';
    } else if (trimmed.endsWith('end')) {
      fixed = fixed.trim() + '.';
    }

    // 4. Normalizar espaçamento
    fixed = fixed.replace(/\n{3,}/g, '\n\n'); // Máximo 2 linhas em branco

    return fixed;
  }

  /**
   * Extrai informações do código NTSL
   */
  static analyze(code: string): {
    hasInput: boolean;
    hasVar: boolean;
    variables: string[];
    parameters: string[];
    hasOrders: boolean;
    orderTypes: string[];
  } {
    const analysis = {
      hasInput: /^input/im.test(code),
      hasVar: /^var/im.test(code),
      variables: [] as string[],
      parameters: [] as string[],
      hasOrders: false,
      orderTypes: [] as string[]
    };

    // Extrair variáveis
    const varMatch = code.match(/var([\s\S]*?)begin/i);
    if (varMatch) {
      const varSection = varMatch[1];
      const varPattern = /(\w+)\s*:/g;
      let match;
      while ((match = varPattern.exec(varSection)) !== null) {
        analysis.variables.push(match[1]);
      }
    }

    // Extrair parâmetros
    const inputMatch = code.match(/input([\s\S]*?)(?:var|begin)/i);
    if (inputMatch) {
      const inputSection = inputMatch[1];
      const paramPattern = /(\w+)\s*\(/g;
      let match;
      while ((match = paramPattern.exec(inputSection)) !== null) {
        analysis.parameters.push(match[1]);
      }
    }

    // Detectar ordens
    const orderPatterns = [
      'BuyAtMarket', 'BuyLimit', 'BuyStop',
      'SellShortAtMarket', 'SellShortLimit', 'SellShortStop',
      'BuyToCoverAtMarket', 'BuyToCoverLimit', 'BuyToCoverStop',
      'SellToCoverAtMarket', 'SellToCoverLimit', 'SellToCoverStop'
    ];

    orderPatterns.forEach(order => {
      if (code.includes(order)) {
        analysis.hasOrders = true;
        analysis.orderTypes.push(order);
      }
    });

    return analysis;
  }

  /**
   * Formata código NTSL com indentação correta
   */
  static format(code: string): string {
    const lines = code.split('\n');
    let indentLevel = 0;
    const indentSize = 4;
    const formatted: string[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Pular linhas vazias
      if (trimmed.length === 0) {
        formatted.push('');
        return;
      }

      // Diminuir indentação antes de end
      if (trimmed.startsWith('end')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Aplicar indentação
      const indent = ' '.repeat(indentLevel * indentSize);
      formatted.push(indent + trimmed);

      // Aumentar indentação depois de begin, input, var
      if (trimmed === 'begin' || trimmed === 'input' || trimmed === 'var') {
        indentLevel++;
      }

      // Aumentar indentação depois de then
      if (trimmed.endsWith('then')) {
        indentLevel++;
      }

      // Diminuir depois de end; (mas não end.)
      if (trimmed === 'end;') {
        indentLevel = Math.max(0, indentLevel - 1);
      }
    });

    return formatted.join('\n');
  }
}