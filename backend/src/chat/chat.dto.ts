// backend/src/chat/chat.dto.ts
export class SendMessageDto {
  message: string;
  conversationId: string; // Agora obrigatório
  traderName?: string;
  traderLevel?: 'iniciante' | 'intermediario' | 'avancado' | 'profissional';
}

export class ChatResponseDto {
  message: string;
  conversationId: string;
  timestamp: Date;
  validationInfo?: {
    codesFound: number;
    validations: Array<{
      originalValid: boolean;
      errors: string[];
      warnings: string[];
      wasAutoCorrected: boolean;
    }>;
  };
}