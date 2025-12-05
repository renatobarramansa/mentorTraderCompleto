// lib/api.ts
// Cliente HTTP centralizado para comunicação com o backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export interface ChatRequest {
  message: string;
  systemPrompt: string;
  conversationId?: string;
  isContinuation?: boolean;
}

export interface ChatResponse {
  content: string;
  conversationId: string;
  timestamp: string;
}

export class ApiClient {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error?.message || errorMessage;
        } catch {
          // Se não for JSON, tentar como texto
          const textError = await response.text();
          if (textError) {
            errorMessage = textError.substring(0, 200);
          }
        }
        
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido na requisição');
    }
  }

  // Chat endpoints
  static async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>('/chat/message', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async testConnection(): Promise<{ status: string; message: string }> {
    return this.request('/chat/test');
  }

  static async healthCheck(): Promise<{ status: string; timestamp: string; service: string }> {
    return this.request('/chat/health');
  }

  // Futuros endpoints (diário, usuários, etc.)
  static async getTradeDiary() {
    return this.request('/diary');
  }

  static async createTradeEntry(data: any) {
    return this.request('/diary', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Métodos de conveniência para uso direto (sem precisar instanciar)
export const api = {
  sendMessage: ApiClient.sendMessage,
  testConnection: ApiClient.testConnection,
  healthCheck: ApiClient.healthCheck,
  getTradeDiary: ApiClient.getTradeDiary,
  createTradeEntry: ApiClient.createTradeEntry,
};