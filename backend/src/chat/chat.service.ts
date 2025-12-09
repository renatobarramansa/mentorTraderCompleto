import { Injectable, Logger } from '@nestjs/common';
import { AnthropicService } from '../anthropic/anthropic.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly conversationHistory: Map<string, any> = new Map();

  constructor(private readonly anthropicService: AnthropicService) {}

  async processChat(chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    this.logger.log(`Processando chat: ${chatRequest.message.substring(0, 100)}...`);
    
    const conversationId = chatRequest.conversationId || this.generateConversationId();
    
    // Get or create conversation history
    let history = this.conversationHistory.get(conversationId);
    if (!history) {
      history = {
        conversationId,
        messages: [],
        createdAt: new Date().toISOString(),
      };
      this.conversationHistory.set(conversationId, history);
    }

    try {
      // Add user message to history
      history.messages.push({
        role: 'user',
        content: chatRequest.message,
        timestamp: new Date().toISOString(),
      });

      // Prepare messages for Claude (limit to last 20 messages)
      const recentMessages = history.messages.slice(-20);
      
      // Call Claude API
      const claudeResponse = await this.anthropicService.generateResponse({
        messages: recentMessages,
        systemPrompt: chatRequest.systemPrompt,
      });

      // Add assistant response to history
      history.messages.push({
        role: 'assistant',
        content: claudeResponse,
        timestamp: new Date().toISOString(),
      });

      history.updatedAt = new Date().toISOString();

      // Clean old conversations (older than 24 hours)
      this.cleanOldConversations();

      return {
        content: claudeResponse,
        conversationId,
        timestamp: new Date().toISOString(),
        metadata: {
          messageCount: history.messages.length,
          tokensUsed: 'N/A', // Would come from Claude API response
        },
      };
    } catch (error) {
      this.logger.error(`Erro ao processar chat: ${error.message}`, error.stack);
      
      // Return error response
      return {
        content: `Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.\n\nErro: ${error.message}`,
        conversationId,
        timestamp: new Date().toISOString(),
        metadata: {
          error: true,
          message: error.message,
        },
      };
    }
  }

  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private cleanOldConversations(): void {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    for (const [conversationId, history] of this.conversationHistory.entries()) {
      const lastUpdated = new Date(history.updatedAt || history.createdAt).getTime();
      if (now - lastUpdated > twentyFourHours) {
        this.conversationHistory.delete(conversationId);
        this.logger.log(`Removida conversa antiga: ${conversationId}`);
      }
    }
  }

  // For testing
  getConversationCount(): number {
    return this.conversationHistory.size;
  }
}