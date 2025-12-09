// backend/src/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AnthropicService } from '../anthropic/anthropic.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, AnthropicService],
})
export class ChatModule {}