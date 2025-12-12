// backend/src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { AnthropicService } from '../anthropic/anthropic.service';
import { NTSLValidator } from '../utils/ntslValidator';
import { getSystemPrompt } from '../lib/prompts/systemPrompt'; // Import do arquivo separado

@Injectable()
export class ChatService {
  constructor(private readonly anthropicService: AnthropicService) {}

  async processMessage(
    message: string,
    conversationId?: string,
    traderName?: string,
    traderLevel?: string,
    useSystemPrompt: boolean = true,
  ): Promise<string> {
    
    console.log(`[ChatService] Processando chat: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
    console.log(`[ChatService] Trader: ${traderName || 'Não informado'}, Nível: ${traderLevel || 'intermediario'}`);
    
    // ✅ USANDO a função importada do arquivo separado
    const systemPrompt = useSystemPrompt 
      ? getSystemPrompt(traderName, traderLevel) // ← Função importada
      : '';
    
    console.log(`[ChatService] System prompt: ${useSystemPrompt ? '✅ ATIVO' : '❌ DESATIVADO'}`);
    console.log(`[ChatService] Tamanho do prompt: ${systemPrompt.length} caracteres`);
    
    // Criar objeto de requisição para o AnthropicService
    const anthropicRequest = {
      message: message,
      conversationId: conversationId,
      systemPrompt: systemPrompt,
      maxTokens: 1000,
      temperature: 0.7,
    };
    
    // Chamar o AnthropicService
    try {
      console.log('[ChatService] Chamando Anthropic API...');
      let response = await this.anthropicService.generateResponse(anthropicRequest);
      
      console.log(`[ChatService] 📥 Resposta bruta da IA (${response.length} chars):`);
      console.log('='.repeat(50));
      console.log(response.substring(0, 500) + (response.length > 500 ? '...' : ''));
      console.log('='.repeat(50));
      
      // ETAPA 1: Garantir formatação markdown com backticks
      console.log('[ChatService] 🔧 Etapa 1: Verificando formatação markdown...');
      response = this.enforceCodeBlockFormat(response);
      
      // ETAPA 2: Validar e corrigir marcação de linguagem
      console.log('[ChatService] 🔧 Etapa 2: Validando marcação de linguagem...');
      response = this.validateAndFixMarkdown(response);
      
      // ETAPA 3: Validar sintaxe NTSL (se tiver código)
      console.log('[ChatService] 🔧 Etapa 3: Validando sintaxe NTSL...');
      const codeBlocks = this.extractNTSLCode(response);
      
      if (codeBlocks.length > 0) {
        console.log(`[ChatService] ✅ ${codeBlocks.length} blocos de código encontrados`);
        
        for (let i = 0; i < codeBlocks.length; i++) {
          const block = codeBlocks[i];
          console.log(`[ChatService] 📦 Bloco ${i + 1}: ${block.code.split('\n').length} linhas`);
          
          const validation = NTSLValidator.validate(block.code);
          
          if (!validation.valid) {
            console.warn(`[ChatService] ⚠️ Erros no bloco ${i + 1}:`, validation.errors);
            
            const fixed = NTSLValidator.autoFix(block.code);
            const revalidation = NTSLValidator.validate(fixed);
            
            if (revalidation.valid) {
              console.log(`[ChatService] ✅ Bloco ${i + 1} corrigido automaticamente`);
              
              // Substituir mantendo os backticks
              const newBlock = `\`\`\`ntsl\n${fixed}\n\`\`\``;
              response = response.replace(block.fullMatch, newBlock);
            } else {
              console.warn(`[ChatService] ⚠️ Não foi possível corrigir bloco ${i + 1}`);
            }
          } else {
            console.log(`[ChatService] ✅ Bloco ${i + 1} válido`);
          }
        }
      } else {
        console.log('[ChatService] ℹ️ Nenhum bloco de código encontrado na resposta');
      }
      
      // ETAPA 4: Garantir formatação final
      console.log('[ChatService] 🔧 Etapa 4: Aplicando formatação final...');
      response = this.ensureFinalFormatting(response);
      
      // Log final
      console.log(`[ChatService] 📤 Resposta final (${response.length} caracteres)`);
      console.log('[ChatService] ✅ Formatação verificada:');
      console.log(`  - Tem \`\`\`ntsl? ${response.includes('```ntsl') ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`  - Tem \`\`\`pascal? ${response.includes('```pascal') ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`  - Tem backticks? ${response.includes('```') ? '✅ SIM' : '❌ NÃO'}`);
      
      return response;
    } catch (error) {
      console.error('[ChatService] ❌ Erro ao chamar AnthropicService:', error);
      throw new Error(`Falha ao gerar resposta: ${error.message}`);
    }
  }

  /**
   * GARANTE que a resposta tenha blocos de código formatados corretamente
   * Se encontrar código NTSL sem backticks, adiciona automaticamente
   */
  private enforceCodeBlockFormat(response: string): string {
    console.log('[ChatService.enforceCodeBlockFormat] Verificando código sem backticks...');
    
    // Padrão para encontrar código NTSL sem backticks
    const ntslCodePattern = /(^|\n)(\/\/[^\n]*\n)?((?:input|var|begin)[\s\S]*?end\.)(\n|$)/gi;
    const matches: Array<{full: string, start: number, end: number}> = [];

    let match;
    while ((match = ntslCodePattern.exec(response)) !== null) {
      const fullMatch = match[0];
      const codeStart = match.index + (match[1]?.length || 0);
      const codeEnd = ntslCodePattern.lastIndex - (match[4]?.length || 0);
      
      // Verificar se JÁ TEM backticks ao redor
      const beforeStart = Math.max(0, codeStart - 10);
      const before = response.substring(beforeStart, codeStart);
      const after = response.substring(codeEnd, Math.min(response.length, codeEnd + 10));
      
      const hasBackticksBefore = before.includes('```');
      const hasBackticksAfter = after.includes('```');
      
      if (!hasBackticksBefore && !hasBackticksAfter) {
        console.log('[ChatService.enforceCodeBlockFormat] ❌ Código sem backticks encontrado');
        
        matches.push({
          full: response.substring(codeStart, codeEnd),
          start: codeStart,
          end: codeEnd
        });
      }
    }
    
    // Se encontrou código sem backticks, adiciona
    if (matches.length > 0) {
      console.log(`[ChatService.enforceCodeBlockFormat] ⚠️ Encontrado ${matches.length} blocos sem backticks. Corrigindo...`);
      
      // Reconstruir a string do final para o início
      let corrected = response;
      
      for (let i = matches.length - 1; i >= 0; i--) {
        const { full, start, end } = matches[i];
        const before = corrected.substring(0, start);
        const after = corrected.substring(end);
        
        corrected = `${before}\n\`\`\`ntsl\n${full}\n\`\`\`\n${after}`;
      }
      
      console.log('[ChatService.enforceCodeBlockFormat] ✅ Backticks adicionados');
      return corrected;
    }
    
    console.log('[ChatService.enforceCodeBlockFormat] ✅ Todos os códigos já têm backticks');
    return response;
  }

  /**
   * Verifica e corrige se o código está dentro de blocos markdown corretos
   */
  private validateAndFixMarkdown(response: string): string {
    console.log('[ChatService.validateAndFixMarkdown] Validando marcação markdown...');
    let fixed = response;
    
    // 1. Garantir que seja ```ntsl (não ```pascal ou outro)
    fixed = fixed.replace(/```\s*pascal\s*\n/gi, '```ntsl\n');
    fixed = fixed.replace(/```\s*Pascal\s*\n/gi, '```ntsl\n');
    
    // 2. Remover qualquer outra linguagem especificada para código NTSL
    const ntslKeywords = ['BuyAtMarket', 'SellShortAtMarket', 'input', 'var', 'begin', 'end.', 'Media(', 'IFR('];
    const hasNTSLContent = ntslKeywords.some(keyword => fixed.includes(keyword));
    
    if (hasNTSLContent) {
      // Encontrar blocos ```qualquercoisa que contenham código NTSL
      const blockRegex = /```(\w+)\n([\s\S]*?)```/g;
      let blockMatch;
      
      while ((blockMatch = blockRegex.exec(fixed)) !== null) {
        const [fullBlock, language, code] = blockMatch;
        const isNTSLCode = ntslKeywords.some(keyword => code.includes(keyword));
        
        if (isNTSLCode && language.toLowerCase() !== 'ntsl') {
          console.log(`[ChatService.validateAndFixMarkdown] 🔄 Convertendo \`\`\`${language} para \`\`\`ntsl`);
          const newBlock = `\`\`\`ntsl\n${code}\n\`\`\``;
          fixed = fixed.replace(fullBlock, newBlock);
        }
      }
    }
    
    console.log('[ChatService.validateAndFixMarkdown] ✅ Marcação validada');
    return fixed;
  }

  /**
   * Aplica formatação final para garantir consistência
   */
  private ensureFinalFormatting(response: string): string {
    console.log('[ChatService.ensureFinalFormatting] Aplicando formatação final...');
    let formatted = response;
    
    // 1. Garantir que há pelo menos um espaço antes do código após backticks
    formatted = formatted.replace(/(```ntsl)([^\n])/g, '$1\n$2');
    
    // 2. Garantir que há uma linha em branco após o fechamento de backticks
    formatted = formatted.replace(/```\n(\S)/g, '```\n\n$1');
    
    // 3. Remover múltiplas linhas em branco consecutivas
    formatted = formatted.replace(/\n{4,}/g, '\n\n\n');
    
    console.log('[ChatService.ensureFinalFormatting] ✅ Formatação final aplicada');
    return formatted;
  }

  /**
   * Extrai blocos de código NTSL da resposta
   */
  private extractNTSLCode(text: string): Array<{ 
    fullMatch: string; 
    code: string; 
    language: string;
  }> {
    console.log('[ChatService.extractNTSLCode] Extraindo blocos de código...');
    
    // Busca por ```ntsl ou ```pascal (já convertido para ntsl)
    const regex = /```(ntsl)\n([\s\S]*?)```/gi;
    const blocks: Array<{ fullMatch: string; code: string; language: string }> = [];
    let match;
    let count = 0;
    
    while ((match = regex.exec(text)) !== null) {
      count++;
      const fullMatch = match[0];
      const language = match[1].toLowerCase();
      const code = match[2].trim();
      
      // Verifica se realmente é NTSL
      const ntslIndicators = [
        /^(input|var|begin)/im,                    // Começa com input, var OU begin
        /BuyAtMarket\(/i,
        /SellShortAtMarket\(/i,
        /Media\(/i,
        /IFR\(/i,
        /TakeProfit\(/i,
        /StopLoss\(/i,
        /ConsoleLog\(/i,
        /end\.\s*$/m                               // Termina com end.
      ];
      
      const isNTSL = ntslIndicators.some(pattern => pattern.test(code));
      
      if (isNTSL) {
        console.log(`[ChatService.extractNTSLCode] ✅ Bloco ${count} é NTSL (${code.split('\n').length} linhas)`);
        blocks.push({ 
          fullMatch, 
          code, 
          language: 'ntsl'
        });
      } else {
        console.log(`[ChatService.extractNTSLCode] ⚠️ Bloco ${count} não parece ser NTSL`);
      }
    }
    
    console.log(`[ChatService.extractNTSLCode] 📊 ${blocks.length} blocos NTSL válidos extraídos`);
    return blocks;
  }
  

}