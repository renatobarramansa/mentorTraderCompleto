export class AnthropicRequest {
  message: string;
  conversationId: string;
  traderName?: string;
  traderLevel?: 'iniciante' | 'intermediario' | 'avancado' | 'profissional';
  context?: 'trading' | 'programming' | 'general';
}

export class AnthropicResponse {
  response: string;
  conversationId: string;
  timestamp: Date;
}