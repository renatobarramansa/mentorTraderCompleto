import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Post()
  async handleChat(@Body() chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    this.logger.log(`Recebida requisição de chat - Conversação: ${chatRequest.conversationId || 'Nova'}`);
    
    // Log para debug
    this.logger.debug({
      messageLength: chatRequest.message?.length || 0,
      hasSystemPrompt: !!chatRequest.systemPrompt,
      conversationId: chatRequest.conversationId,
    });

    const response = await this.chatService.processChat(chatRequest);
    
    this.logger.log(`Resposta gerada - Tamanho: ${response.content.length} caracteres`);
    
    return response;
  }

  @Post('test')
  async testConnection(): Promise<{ status: string; message: string }> {
    this.logger.log('Teste de conexão recebido');
    
    return {
      status: 'success',
      message: '✅ Backend NestJS está funcionando corretamente!',
    };
  }
}