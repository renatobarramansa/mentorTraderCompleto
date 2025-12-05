import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  message: string;

  @IsString()
  systemPrompt: string;

  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  @IsBoolean()
  isContinuation?: boolean;
}
