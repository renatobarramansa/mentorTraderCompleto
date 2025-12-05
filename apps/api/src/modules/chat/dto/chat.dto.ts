import { IsString, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class MessageDto {
  @IsEnum(['user', 'assistant'])
  role: 'user' | 'assistant';
  
  @IsString()
  content: string;
}

export class ChatRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];
  
  @IsString()
  userId: string;
}

export class ChatResponseDto {
  message: string;
  timestamp: Date;
  tokensUsed: number;
}
