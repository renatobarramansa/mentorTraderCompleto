import { Controller, Post, Body, Get } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')  // REMOVI 'api/' daqui, pois já tem no global prefix
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('health')
  healthCheck(): object {
    return {
      status: 'online',
      timestamp: new Date().toISOString(),
      service: 'mentor-trader-chat'
    };
  }

  @Post()
  async chat(
    @Body() body: { 
      message: string; 
      conversationId?: string;
      traderName?: string;
      traderLevel?: string;
      useSystemPrompt?: boolean;
    },
  ) {
    const response = await this.chatService.processMessage(
      body.message,
      body.conversationId,
      body.traderName,
      body.traderLevel,
      body.useSystemPrompt ?? true,
    );
    
    return {
      content: response,
      conversationId: body.conversationId || `conv_${Date.now()}`,
      timestamp: new Date().toISOString(),
      metadata: {
        traderName: body.traderName || 'trader',
        traderLevel: body.traderLevel || 'intermediario',
        useSystemPrompt: body.useSystemPrompt ?? true
      }
    };
  }
}
