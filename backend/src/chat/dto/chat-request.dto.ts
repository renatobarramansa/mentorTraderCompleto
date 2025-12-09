import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  systemPrompt?: string;

  @IsString()
  @IsOptional()
  conversationId?: string;

  @IsBoolean()
  @IsOptional()
  isContinuation?: boolean;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}