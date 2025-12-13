// backend/src/anthropic/anthropic.service.ts
import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { AnthropicRequest } from './anthropic.dto';
import { getSystemPrompt } from '../lib/prompts/systemPrompt';
import { NTSLValidator, ValidationResult } from '../utils/ntslValidator';

// Interface para mensagens no formato Claude


export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Interface para histórico interno
export interface InternalMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  id: string;
  messages: InternalMessage[];
  createdAt: Date;
  updatedAt: Date;
  traderName?: string;
  traderLevel?: 'iniciante' | 'intermediario' | 'avancado' | 'profissional';
}

interface ValidationInfo {
  codesFound: number;
  validations: Array<{
    originalValid: boolean;
    errors: string[];
    warnings: string[];
    wasAutoCorrected: boolean;
  }>;
}

@Injectable()
export class AnthropicService {
  private readonly logger = new Logger(AnthropicService.name);
  private conversationHistory: Map<string, Conversation> = new Map();
  private anthropic: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      this.logger.warn('ANTHROPIC_API_KEY não encontrada nas variáveis de ambiente');
    }
    
    this.anthropic = new Anthropic({
      apiKey: apiKey || '',
    });
    
    this.logger.log('AnthropicService inicializado com NTSL Validator');
  }

  /**
   * Extrai blocos de código NTSL da resposta do Claude
   */
  private extractNTSLCode(text: string): string[] {
    const codeBlocks: string[] = [];
    
    // Padrão 1: Código com backticks ```ntsl ou ```pascal
    const backtickPattern = /```(?:ntsl|pascal|NTSL|Pascal)?\n([\s\S]*?)```/g;
    let match: RegExpExecArray | null;
    
    while ((match = backtickPattern.exec(text)) !== null) {
      const code = match[1].trim();
      if (this.looksLikeNTSL(code)) {
        codeBlocks.push(code);
        this.logger.debug(`Código NTSL encontrado com backticks (${code.length} chars)`);
      }
    }
    
    // Padrão 2: Código solto (sem backticks) que parece NTSL
    if (codeBlocks.length === 0) {
      const ntslPatterns = [
        /(input[\s\S]*?end\.)/i,
        /(var[\s\S]*?begin[\s\S]*?end\.)/i,
        /(begin[\s\S]*?end\.)/i
      ];
      
      for (const pattern of ntslPatterns) {
        const match = text.match(pattern);
        if (match) {
          codeBlocks.push(match[0].trim());
          this.logger.debug(`Código NTSL encontrado sem backticks (${match[0].length} chars)`);
          break;
        }
      }
    }
    
    return codeBlocks;
  }

  /**
   * Verifica se um texto parece ser código NTSL
   */
  private looksLikeNTSL(text: string): boolean {
    const ntslKeywords = [
      'input', 'var', 'begin', 'end',
      'BuyAtMarket', 'SellShortAtMarket',
      'Media', 'IFR', 'ADX', 'MACD',
      'Close', 'Open', 'High', 'Low'
    ];
    
    const lowerText = text.toLowerCase();
    const keywordCount = ntslKeywords.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    ).length;
    
    // Precisa ter pelo menos 2 keywords NTSL para considerar
    return keywordCount >= 2;
  }

  /**
   * Valida e corrige código NTSL se necessário
   */
  private async validateAndFixNTSL(
    code: string,
    conversation: Conversation
  ): Promise<{ 
    code: string; 
    wasFixed: boolean; 
    validation: ValidationResult;
    method: 'original' | 'autofix' | 'claude-correction';
  }> {
    // Validar código original
    const validation = NTSLValidator.validate(code);
    
    this.logger.log(`Validação NTSL: ${validation.valid ? 'OK' : 'ERROS'} - Erros: ${validation.errors.length}, Warnings: ${validation.warnings.length}`);

    // Se válido, retornar como está
    if (validation.valid) {
      return { 
        code, 
        wasFixed: false, 
        validation,
        method: 'original'
      };
    }

    // Tentar correção automática
    this.logger.log('Tentando correção automática...');
    const fixedCode = NTSLValidator.autoFix(code);
    const fixedValidation = NTSLValidator.validate(fixedCode);

    // Se a correção automática resolveu, retornar código corrigido
    if (fixedValidation.valid) {
      this.logger.log('✅ Código corrigido automaticamente com sucesso!');
      return { 
        code: fixedCode, 
        wasFixed: true, 
        validation: fixedValidation,
        method: 'autofix'
      };
    }

    // Se ainda tem erros, pedir ao Claude para corrigir
    this.logger.warn('⚠️ Código com erros após autofix, solicitando correção ao Claude...');
    
    try {
      const correctedCode = await this.requestCodeCorrectionFromClaude(
        code, 
        validation,
        conversation
      );

      // Validar código corrigido pelo Claude
      const finalValidation = NTSLValidator.validate(correctedCode);
      
      if (finalValidation.valid) {
        this.logger.log('✅ Claude corrigiu o código com sucesso!');
      } else {
        this.logger.warn('⚠️ Claude não conseguiu corrigir todos os erros');
      }

      return { 
        code: correctedCode, 
        wasFixed: true, 
        validation: finalValidation,
        method: 'claude-correction'
      };
    } catch (error) {
      this.logger.error('❌ Erro ao solicitar correção ao Claude:', error);
      // Retornar código com autofix mesmo que não esteja 100%
      return { 
        code: fixedCode, 
        wasFixed: true, 
        validation: fixedValidation,
        method: 'autofix'
      };
    }
  }

  /**
   * Solicita correção de código ao Claude
   */
  private async requestCodeCorrectionFromClaude(
    code: string,
    validation: ValidationResult,
    conversation: Conversation
  ): Promise<string> {
    // Construir prompt de correção
    let correctionPrompt = '🔧 **CORREÇÃO DE CÓDIGO NTSL NECESSÁRIA**\n\n';
    correctionPrompt += 'O código NTSL gerado possui os seguintes **ERROS**:\n\n';
    
    validation.errors.forEach((error, idx) => {
      correctionPrompt += `${idx + 1}. ${error}\n`;
    });
    
    if (validation.warnings.length > 0) {
      correctionPrompt += '\n⚠️ **AVISOS**:\n';
      validation.warnings.forEach((warning, idx) => {
        correctionPrompt += `${idx + 1}. ${warning}\n`;
      });
    }
    
    correctionPrompt += '\n📝 **Código original**:\n```ntsl\n' + code + '\n```\n\n';
    correctionPrompt += '✅ **INSTRUÇÕES**:\n';
    correctionPrompt += '- Corrija TODOS os erros listados acima\n';
    correctionPrompt += '- Mantenha a lógica original da estratégia\n';
    correctionPrompt += '- Responda SOMENTE com o código corrigido entre ```ntsl e ```\n';
    correctionPrompt += '- NÃO adicione explicações, apenas o código corrigido\n';

    // Preparar mensagens para o Claude
    const messages: ClaudeMessage[] = [
      ...conversation.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: correctionPrompt
      }
    ];

    // Usar system prompt com foco em NTSL
    const systemPrompt = getSystemPrompt(
      conversation.traderName || 'trader',
      conversation.traderLevel || 'intermediario'
    );

    // Chamar Claude para correção
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.1, // Baixa temperatura para respostas mais determinísticas
      system: systemPrompt + '\n\nVocê está em modo de CORREÇÃO DE CÓDIGO. Seja preciso e objetivo.',
      messages: messages
    });

    const responseText = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as Anthropic.TextBlock).text)
      .join('\n');

    // Extrair código corrigido
    const correctedCodes = this.extractNTSLCode(responseText);
    
    if (correctedCodes.length === 0) {
      this.logger.warn('Claude não retornou código corrigido, usando código com autofix');
      return NTSLValidator.autoFix(code);
    }

    return correctedCodes[0];
  }

  /**
   * Método principal de geração de resposta com validação NTSL integrada
   */
  async generateResponse(request: AnthropicRequest): Promise<{
    response: string;
    validationInfo?: ValidationInfo;
  }> {
    try {
      const { message, conversationId, traderName, traderLevel } = request;

      this.logger.debug(`📨 Requisição: trader=${traderName}, level=${traderLevel}`);
      
      // Obter ou criar conversa
      let conversation = this.conversationHistory.get(conversationId);
      if (!conversation) {
        conversation = {
          id: conversationId,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          traderName,
          traderLevel,
        };
        this.conversationHistory.set(conversationId, conversation);
        this.logger.log(`➕ Nova conversa criada: ${conversationId}`);
      } else {
        if (traderName) conversation.traderName = traderName;
        if (traderLevel) conversation.traderLevel = traderLevel;
        conversation.updatedAt = new Date();
      }

      // Adicionar mensagem do usuário ao histórico
      conversation.messages.push({ role: 'user', content: message });
      
      // Limitar histórico a 20 mensagens (10 ida e volta)
      if (conversation.messages.length > 20) {
        conversation.messages = conversation.messages.slice(-20);
        this.logger.debug('📝 Histórico limitado a 20 mensagens');
      }

      // Gerar system prompt dinâmico
      const systemPrompt = getSystemPrompt(
        conversation.traderName || 'trader',
        conversation.traderLevel || 'intermediario'
      );

      // Converter para formato Claude
      const messages: ClaudeMessage[] = conversation.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      this.logger.log(`🚀 Enviando para Claude - Conv: ${conversationId}, Msgs: ${messages.length}`);

      // Chamar API da Anthropic (Claude)
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        temperature: 0.3,
        system: systemPrompt,
        messages: messages,
      });

      let assistantResponse = response.content[0].type === 'text' 
        ? response.content[0].text 
        : 'Resposta não disponível em formato texto';

      // 🔍 VALIDAÇÃO NTSL: Extrair e validar códigos
      const ntslCodes = this.extractNTSLCode(assistantResponse);

      if (ntslCodes.length > 0) {
        this.logger.log(`🔍 Encontrados ${ntslCodes.length} blocos de código NTSL para validação`);
        
        const validationResults: ValidationInfo['validations'] = [];
        
        for (const code of ntslCodes) {
          const result = await this.validateAndFixNTSL(code, conversation);
          
          validationResults.push({
            originalValid: !result.wasFixed,
            errors: result.validation.errors,
            warnings: result.validation.warnings,
            wasAutoCorrected: result.wasFixed
          });

          // Substituir código original pelo corrigido na resposta
          if (result.wasFixed) {
            this.logger.log(`🔧 Substituindo código (método: ${result.method})`);
            assistantResponse = assistantResponse.replace(code, result.code);
          }
        }

        // Adicionar resposta do assistente ao histórico
        conversation.messages.push({ role: 'assistant', content: assistantResponse });
        conversation.updatedAt = new Date();
        this.conversationHistory.set(conversationId, conversation);

        this.logger.log(`✅ Resposta processada - Tamanho: ${assistantResponse.length} chars`);

        return {
          response: assistantResponse,
          validationInfo: {
            codesFound: ntslCodes.length,
            validations: validationResults
          }
        };
      }

      // Sem código NTSL, retornar resposta normal
      conversation.messages.push({ role: 'assistant', content: assistantResponse });
      conversation.updatedAt = new Date();
      this.conversationHistory.set(conversationId, conversation);

      this.logger.log(`✅ Resposta processada (sem código NTSL) - Tamanho: ${assistantResponse.length} chars`);

      return { response: assistantResponse };

    } catch (error) {
      this.logger.error('❌ Erro ao chamar API Anthropic:', error);
      
      // Usar fallback inteligente baseado no systemPrompt
      return { 
        response: this.getFallbackResponse(request, error) 
      };
    }
  }

  /**
   * ⚠️ REFATORADO: Fallback inteligente usando systemPrompt
   * Remove duplicação de código e mantém consistência
   */
  private getFallbackResponse(request: AnthropicRequest, error: any): string {
    this.logger.warn('🔄 Usando resposta de fallback');

    // Obter system prompt padrão (sem necessidade de duplicar lógica)
    const systemPromptPreview = getSystemPrompt(
      request.traderName || 'trader',
      request.traderLevel || 'intermediario'
    ).substring(0, 500);

    const errorType = error?.status === 401 
      ? 'autenticação' 
      : error?.status === 429 
        ? 'limite de requisições' 
        : 'conexão';

    return `⚠️ **Mentor Trader - Modo Offline**

Olá ${request.traderName || 'Trader'}! 👋

No momento estou com problemas de **${errorType}** com a API do Claude.

**Sua mensagem foi recebida:**
"${request.message.substring(0, 150)}${request.message.length > 150 ? '...' : ''}"

---

📚 **Enquanto isso, posso te ajudar com:**

${request.traderLevel === 'iniciante' ? `
**Para Iniciantes:**
- Conceitos básicos de NTSL (input, var, begin, end)
- Estrutura de uma estratégia
- Funções básicas: Media(), Close, Open, High, Low
- Ordens simples: BuyAtMarket(1)
` : request.traderLevel === 'avancado' || request.traderLevel === 'profissional' ? `
**Para Traders Avançados:**
- Otimização de estratégias NTSL
- Backtesting e análise estatística
- Padrões complexos (múltiplos timeframes)
- Gerenciamento avançado de risco
` : `
**Para Traders Intermediários:**
- Indicadores técnicos: IFR, MACD, ADX, Bollinger
- Cruzamentos de médias móveis
- Stop Loss e Take Profit dinâmicos
- Validação de sinais
`}

---

💡 **Tente novamente em alguns instantes** ou verifique:
1. Sua conexão com a internet
2. Status da API Anthropic
3. Configuração de variáveis de ambiente

**Precisa de ajuda urgente?**
Consulte a documentação NTSL em: https://help.nelogica.com.br

---
_Esta é uma resposta automática. A IA Claude estará disponível em breve._`;
  }

  // =========================================================================
  // MÉTODOS AUXILIARES E GERENCIAMENTO DE HISTÓRICO
  // =========================================================================

  /**
   * Obtém histórico de uma conversa
   */
  getConversationHistory(conversationId: string): InternalMessage[] {
    const conversation = this.conversationHistory.get(conversationId);
    return conversation ? conversation.messages : [];
  }

  /**
   * Limpa histórico de uma conversa
   */
  clearConversationHistory(conversationId: string): void {
    if (this.conversationHistory.has(conversationId)) {
      const conversation = this.conversationHistory.get(conversationId)!;
      conversation.messages = [];
      conversation.updatedAt = new Date();
      this.conversationHistory.set(conversationId, conversation);
      this.logger.log(`🗑️ Histórico limpo: ${conversationId}`);
    }
  }

  /**
   * Lista todas as conversas
   */
  getAllConversations(): Conversation[] {
    return Array.from(this.conversationHistory.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  /**
   * Deleta uma conversa
   */
  deleteConversation(conversationId: string): void {
    this.conversationHistory.delete(conversationId);
    this.logger.log(`🗑️ Conversa deletada: ${conversationId}`);
  }

  /**
   * Testa conexão com a API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1,
        messages: [{ role: 'user' as const, content: 'Test' }],
      });
      this.logger.log('✅ Teste de conexão: OK');
      return true;
    } catch (error) {
      this.logger.error('❌ Teste de conexão: FALHOU', error);
      return false;
    }
  }

  /**
   * Método auxiliar para compatibilidade com código legado
   */
  async generateNTSLResponse(request: AnthropicRequest): Promise<string> {
    const result = await this.generateResponse(request);
    return result.response;
  }

  /**
   * Formata código NTSL (expõe funcionalidade do validador)
   */
  formatNTSLCode(code: string): string {
    return NTSLValidator.format(code);
  }

  /**
   * Analisa código NTSL (expõe funcionalidade do validador)
   */
  analyzeNTSLCode(code: string) {
    return NTSLValidator.analyze(code);
  }

  /**
   * Valida código NTSL sem processar conversa
   */
  validateNTSLCode(code: string): ValidationResult {
    return NTSLValidator.validate(code);
  }
}