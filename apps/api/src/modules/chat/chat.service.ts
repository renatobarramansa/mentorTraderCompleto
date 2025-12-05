import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
import { ChatRepository } from './repositories/chat.repository';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private configService: ConfigService,
    private chatRepository: ChatRepository,
  ) {}

  async getChatResponse(chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    try {
      const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
      
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY não configurada');
      }

      this.logger.log(`Processando mensagem para conversa: ${chatRequest.conversationId || 'nova'}`);

      // Prepara a mensagem considerando contexto
      const fullMessage = chatRequest.isContinuation 
        ? chatRequest.message // Já inclui contexto do cliente
        : `${chatRequest.systemPrompt}\n\n${chatRequest.message}`;

      // 1. Primeiro salva a mensagem do usuário no banco
      const userMessage = await this.chatRepository.createMessage({
        role: 'user',
        content: chatRequest.message,
        conversationId: chatRequest.conversationId || this.generateConversationId(),
        metadata: {
          systemPrompt: chatRequest.systemPrompt,
          isContinuation: chatRequest.isContinuation,
          timestamp: new Date().toISOString(),
        },
      });

      const conversationId = userMessage.conversationId;

      // 2. Chama a API da Claude
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: fullMessage,
            },
          ],
          system: chatRequest.systemPrompt,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erro na API da Claude');
      }

      const data = await response.json();
      const assistantContent = data.content[0].text;
      
      // 3. Salva a resposta do assistente no banco
      const assistantMessage = await this.chatRepository.createMessage({
        role: 'assistant',
        content: assistantContent,
        conversationId: conversationId,
        metadata: {
          model: data.model,
          usage: data.usage,
          responseId: data.id,
          timestamp: new Date().toISOString(),
        },
      });

      this.logger.log(`Conversa ${conversationId} salva no banco (2 mensagens)`);
      
      return {
        content: assistantContent,
        conversationId: conversationId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Erro no ChatService:', error);
      throw error;
    }
  }

  async getConversationHistory(conversationId: string) {
    try {
      const messages = await this.chatRepository.getConversationMessages(conversationId);
      
      return {
        conversationId,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.createdAt.toISOString(),
        })),
        summary: await this.chatRepository.getConversationSummary(conversationId),
      };
    } catch (error) {
      this.logger.error('Erro ao buscar histórico:', error);
      throw error;
    }
  }

  async deleteConversation(conversationId: string) {
    try {
      const result = await this.chatRepository.deleteConversation(conversationId);
      this.logger.log(`Conversa ${conversationId} deletada: ${result.count} mensagens removidas`);
      return result;
    } catch (error) {
      this.logger.error('Erro ao deletar conversa:', error);
      throw error;
    }
  }

  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async testConnection(): Promise<{ status: string; message: string }> {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    
    if (!apiKey) {
      return {
        status: 'error',
        message: 'ANTHROPIC_API_KEY não configurada',
      };
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Teste de conexão' }],
          system: 'Responda apenas com "Conexão OK!"',
        }),
      });

      if (response.ok) {
        // Testa também a conexão com o banco
        try {
          const dbTest = await this.chatRepository.getConversationMessages('test', 1);
          return {
            status: 'success',
            message: 'Conexão com Claude API e banco de dados estabelecida',
          };
        } catch (dbError) {
          return {
            status: 'warning',
            message: 'Claude API OK, mas banco de dados pode ter problemas',
          };
        }
      } else {
        const error = await response.json();
        return {
          status: 'error',
          message: `Erro na API: ${error.error?.message || 'Desconhecido'}`,
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Falha na conexão: ${error.message}`,
      };
    }
  }
}
