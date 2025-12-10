import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { AnthropicRequest } from './anthropic.dto';
// Importação corrigida - certifique-se que o arquivo existe
import { getSystemPrompt } from '../lib/prompts/systemPrompt';

// Interface para mensagens no formato Claude
interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Interface para histórico interno
interface InternalMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  messages: InternalMessage[];
  createdAt: Date;
  updatedAt: Date;
  traderName?: string;
  traderLevel?: 'iniciante' | 'intermediario' | 'avancado' | 'profissional';
}

@Injectable()
export class AnthropicService {
  private readonly logger = new Logger(AnthropicService.name);
  private conversationHistory: Map<string, Conversation> = new Map();
  private anthropic: Anthropic;

  constructor() {
    // Inicializar cliente Anthropic com API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      this.logger.warn('ANTHROPIC_API_KEY não encontrada nas variáveis de ambiente');
    }
    
    // Configuração corrigida
    this.anthropic = new Anthropic({
      apiKey: apiKey || '',
    });
    
    this.logger.log('AnthropicService inicializado');
  }

  async generateResponse(request: AnthropicRequest): Promise<string> {
    try {
      const { message, conversationId, traderName, traderLevel } = request;

          // LOG 1: Verificar parâmetros recebidos
    this.logger.debug(`Parâmetros recebidos: traderName=${traderName}, traderLevel=${traderLevel}, message=${message.substring(0, 50)}...`);
    
    // LOG 2: Testar a função getSystemPrompt
    try {
      const testPrompt = getSystemPrompt(traderName || 'teste', traderLevel || 'intermediario');
      this.logger.debug(`SystemPrompt gerado (primeiros 200 chars): ${testPrompt.substring(0, 200)}...`);
    } catch (error) {
      this.logger.error(`ERRO ao chamar getSystemPrompt: ${error.message}`);
    }
      
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
      } else {
        // Atualizar dados do trader se fornecidos
        if (traderName) conversation.traderName = traderName;
        if (traderLevel) conversation.traderLevel = traderLevel;
        conversation.updatedAt = new Date();
      }

      // Adicionar mensagem do usuário ao histórico
      conversation.messages.push({ role: 'user', content: message });
      
      // Limitar histórico a 20 mensagens (10 ida e volta)
      if (conversation.messages.length > 20) {
        conversation.messages = conversation.messages.slice(-20);
      }

      // Gerar system prompt dinâmico
      const systemPrompt = getSystemPrompt(
        conversation.traderName || 'trader',
        conversation.traderLevel || 'intermediario'
      );

      // Converter para formato Claude - CORREÇÃO DO TIPO
      const messages: ClaudeMessage[] = conversation.messages.map(msg => ({
        role: msg.role, // Já é 'user' | 'assistant'
        content: msg.content,
      }));

      this.logger.log(`Enviando para Claude API - Conversation: ${conversationId}, Messages: ${messages.length}`);

      // Chamar API da Anthropic (Claude)
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4000,
        temperature: 0.3,
        system: systemPrompt,
        messages: messages,
      });

      const assistantResponse = response.content[0].type === 'text' 
        ? response.content[0].text 
        : 'Resposta não disponível em formato texto';

      // Adicionar resposta do assistente ao histórico
      conversation.messages.push({ role: 'assistant', content: assistantResponse });
      conversation.updatedAt = new Date();

      // Atualizar histórico
      this.conversationHistory.set(conversationId, conversation);

      this.logger.log(`Resposta recebida da Claude - Tamanho: ${assistantResponse.length} chars`);

      return assistantResponse;
    } catch (error) {
      this.logger.error('Erro ao chamar API Anthropic:', error);
      
      // Fallback para respostas simuladas se a API falhar
      return this.getFallbackResponse(request.message);
    }
  }

  // Método de fallback se a API não estiver disponível
  private getFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Resposta genérica de fallback
    return `Olá! Sou seu Mentor Trader. 

Recebi sua mensagem: "${message}"

No momento, estou com limitações técnicas, mas posso te ajudar com:

📊 **Estratégias NTSL:**
- Médias móveis (cruzamentos, bandas)
- IFR/RSI (sobrecomprado/sobrevendido)
- MACD, Bollinger Bands, ADX
- Padrões de candlestick

💻 **Programação NTSL:**
- Sintaxe correta: input/var/begin
- Funções: Media(), IFR(), Highest(), Lowest()
- Ordens: BuyAtMarket, SellShortAtMarket
- Controle: HasPosition, Date, Time

⚠️ **Gerenciamento de Risco:**
- Stop Loss (fixo, trailing, ATR)
- Take Profit (ratio, alvo fixo)
- Position sizing
- Controle de reentrada

Por favor, tente novamente em alguns instantes para obter uma resposta completa da Claude AI.

Enquanto isso, posso te ajudar com alguma dúvida específica sobre NTSL ou trading?`;
  }

  // Métodos para gerenciamento de histórico
  getConversationHistory(conversationId: string): InternalMessage[] {
    const conversation = this.conversationHistory.get(conversationId);
    return conversation ? conversation.messages : [];
  }

  clearConversationHistory(conversationId: string): void {
    if (this.conversationHistory.has(conversationId)) {
      const conversation = this.conversationHistory.get(conversationId)!;
      conversation.messages = [];
      conversation.updatedAt = new Date();
      this.conversationHistory.set(conversationId, conversation);
    }
  }

  getAllConversations(): Conversation[] {
    return Array.from(this.conversationHistory.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  deleteConversation(conversationId: string): void {
    this.conversationHistory.delete(conversationId);
  }

  // Método para teste da API
  async testConnection(): Promise<boolean> {
    try {
      await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user' as const, content: 'Test' }],
      });
      return true;
    } catch (error) {
      this.logger.error('Teste de conexão falhou:', error);
      return false;
    }
  }

  // Método auxiliar para compatibilidade
  async generateNTSLResponse(request: AnthropicRequest): Promise<string> {
    // Redireciona para o método principal
    return this.generateResponse(request);
  }
}