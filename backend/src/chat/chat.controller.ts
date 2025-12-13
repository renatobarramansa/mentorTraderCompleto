import { Controller, Post, Body, Get } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './chat.dto'; // Importar o DTO

@Controller('chat')
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
  async sendMessage(  // Renomear de 'chat' para 'sendMessage'
    @Body() body: { 
      message: string; 
      conversationId?: string;
      traderName?: string;
      traderLevel?: string;
      useSystemPrompt?: boolean;
    },
  ) {
    // Criar DTO correto
    const sendMessageDto: SendMessageDto = {
      message: body.message,
      conversationId: body.conversationId || `conv_${Date.now()}`,
      traderName: body.traderName,
      traderLevel: body.traderLevel as any, // Cast se necessário
    };
    
    // Chamar método correto com DTO
    const result = await this.chatService.sendMessage(sendMessageDto);
    
    // Retornar resultado formatado
    return {
      content: result.message, // Extrair a mensagem do objeto
      conversationId: result.conversationId,
      timestamp: result.timestamp.toISOString(),
      metadata: {
        traderName: body.traderName || 'trader',
        traderLevel: body.traderLevel || 'intermediario',
        useSystemPrompt: body.useSystemPrompt ?? true,
        validationInfo: result.validationInfo // Incluir info de validação se existir
      }
    };
  }
}