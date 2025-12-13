// backend/src/chat/chat.service.ts - VERSÃO CORRIGIDA
import { Injectable, Logger } from '@nestjs/common';
import { AnthropicService } from '../anthropic/anthropic.service';
import { SendMessageDto } from './chat.dto';

interface ChatResponse {
  message: string;
  conversationId: string;
  timestamp: Date;
  validationInfo?: {
    codesFound: number;
    validations: Array<{
      originalValid: boolean;
      errors: string[];
      warnings: string[];
      wasAutoCorrected: boolean;
    }>;
  };
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly anthropicService: AnthropicService) {}

  async sendMessage(sendMessageDto: SendMessageDto): Promise<ChatResponse> {
    const { message, conversationId, traderName, traderLevel } = sendMessageDto;

    try {
      this.logger.log(`📨 Nova mensagem: ${message.substring(0, 50)}...`);

      // Chamar AnthropicService que agora retorna OBJETO, não string
      const anthropicResult = await this.anthropicService.generateResponse({
        message,
        conversationId,
        traderName,
        traderLevel,
      });

      // Extrair a resposta string do objeto
      const responseText = anthropicResult.response;
      const validationInfo = anthropicResult.validationInfo;

      this.logger.log(`✅ Resposta gerada: ${responseText.length} caracteres`);

      // Verificar se tem código NTSL
      if (responseText.includes('```ntsl') || 
          responseText.includes('```pascal') || 
          responseText.includes('```NTSL')) {
        this.logger.log('🔍 Código NTSL detectado na resposta');
      }

      // Formatar resposta para o frontend
      const formattedResponse = this.formatResponse(responseText);

      return {
        message: formattedResponse,
        conversationId,
        timestamp: new Date(),
        validationInfo,
      };

    } catch (error) {
      this.logger.error('❌ Erro no ChatService:', error);

      // Fallback local
      const fallbackResponse = this.getFallbackResponse(message, traderName, traderLevel);

      return {
        message: fallbackResponse,
        conversationId,
        timestamp: new Date(),
      };
    }
  }

  private formatResponse(response: string): string {
    // Limitar resposta muito longa para performance
    if (response.length > 10000) {
      this.logger.warn(`Resposta muito longa (${response.length} chars), truncando...`);
      return response.substring(0, 10000) + '\n\n... (resposta truncada para performance)';
    }

    // Adicionar formatação Markdown se não tiver
    if (!response.includes('#') && !response.includes('*') && !response.includes('`')) {
      return `## Resposta do moderador\n\n${response}\n\n---\n*Validador de código NTSL*`;
    }

    return response;
  }

  private getFallbackResponse(
    message: string, 
    traderName?: string, 
    traderLevel?: string
  ): string {
    return `⚠️ **Mentor Trader - Modo Local**

Olá ${traderName || 'Trader'}! 👋

No momento estou com problemas temporários de conexão.

**Sua mensagem:** "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"

---

📚 **Dica para ${traderLevel || 'intermediário'}:** 
${this.getTradingTipByLevel(traderLevel)}

---

💡 **Tente novamente em alguns instantes ou:**

1. Verifique sua conexão com a internet
2. Considere reiniciar a aplicação
3. Contate o suporte se o problema persistir

---
_Esta é uma resposta local de fallback._`;
  }

  private getTradingTipByLevel(level?: string): string {
    switch (level) {
      case 'iniciante':
        return 'Foque em entender os conceitos básicos: suporte, resistência, tendências. Não opere com dinheiro real até dominar o plano de trade.';
      
      case 'avancado':
      case 'profissional':
        return 'Revise seu gerenciamento de risco. Às vezes, menos é mais - reduza o tamanho da posição e aumente o foco na qualidade das entradas.';
      
      default: // intermediario
        return 'Analise seu diário de trades. Identifique padrões nos seus erros e acertos para criar regras mais consistentes.';
    }
  }

  // Métodos para gerenciamento de conversas (delegar para AnthropicService)
  async getConversationHistory(conversationId: string) {
    return this.anthropicService.getConversationHistory(conversationId);
  }

  async clearConversationHistory(conversationId: string) {
    return this.anthropicService.clearConversationHistory(conversationId);
  }

  async getAllConversations() {
    return this.anthropicService.getAllConversations();
  }

  async deleteConversation(conversationId: string) {
    return this.anthropicService.deleteConversation(conversationId);
  }

  // Método para compatibilidade com código legado
  async generateSimpleResponse(message: string, conversationId: string): Promise<string> {
    const result = await this.sendMessage({
      message,
      conversationId,
    });
    
    return result.message;
  }
}