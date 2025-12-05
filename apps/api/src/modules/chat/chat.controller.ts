import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  async sendMessage(@Body() chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    return this.chatService.getChatResponse(chatRequest);
  }

  @Get('history/:conversationId')
  async getConversationHistory(@Param('conversationId') conversationId: string) {
    return this.chatService.getConversationHistory(conversationId);
  }

  @Delete('history/:conversationId')
  async deleteConversation(@Param('conversationId') conversationId: string) {
    return this.chatService.deleteConversation(conversationId);
  }

  @Get('test')
  async testConnection() {
    return this.chatService.testConnection();
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'chat',
      database: 'connected',
    };
  }
}
