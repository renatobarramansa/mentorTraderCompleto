import { IsString, IsOptional, IsObject } from 'class-validator';

export class ChatResponseDto {
  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  conversationId?: string;

  @IsString()
  timestamp: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}