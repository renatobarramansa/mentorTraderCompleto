"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const chat_repository_1 = require("./repositories/chat.repository");
let ChatService = ChatService_1 = class ChatService {
    constructor(configService, chatRepository) {
        this.configService = configService;
        this.chatRepository = chatRepository;
        this.logger = new common_1.Logger(ChatService_1.name);
    }
    async getChatResponse(chatRequest) {
        try {
            const apiKey = this.configService.get('ANTHROPIC_API_KEY');
            if (!apiKey) {
                throw new Error('ANTHROPIC_API_KEY não configurada');
            }
            this.logger.log(`Processando mensagem para conversa: ${chatRequest.conversationId || 'nova'}`);
            const fullMessage = chatRequest.isContinuation
                ? chatRequest.message
                : `${chatRequest.systemPrompt}\n\n${chatRequest.message}`;
            const userMessage = await this.chatRepository.createMessage({
                role: 'user',
                content: chatRequest.message,
                conversationId: chatRequest.conversationId || this.generateConversationId(),
                metadata: {
                    systemPrompt: chatRequest.systemPrompt,
                    isContinuation: chatRequest.isContinuation,
                    timestamp: new Date().toISOString(),
                },
            });
            const conversationId = userMessage.conversationId;
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 4000,
                    messages: [
                        {
                            role: 'user',
                            content: fullMessage,
                        },
                    ],
                    system: chatRequest.systemPrompt,
                }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Erro na API da Claude');
            }
            const data = await response.json();
            const assistantContent = data.content[0].text;
            const assistantMessage = await this.chatRepository.createMessage({
                role: 'assistant',
                content: assistantContent,
                conversationId: conversationId,
                metadata: {
                    model: data.model,
                    usage: data.usage,
                    responseId: data.id,
                    timestamp: new Date().toISOString(),
                },
            });
            this.logger.log(`Conversa ${conversationId} salva no banco (2 mensagens)`);
            return {
                content: assistantContent,
                conversationId: conversationId,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Erro no ChatService:', error);
            throw error;
        }
    }
    async getConversationHistory(conversationId) {
        try {
            const messages = await this.chatRepository.getConversationMessages(conversationId);
            return {
                conversationId,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.createdAt.toISOString(),
                })),
                summary: await this.chatRepository.getConversationSummary(conversationId),
            };
        }
        catch (error) {
            this.logger.error('Erro ao buscar histórico:', error);
            throw error;
        }
    }
    async deleteConversation(conversationId) {
        try {
            const result = await this.chatRepository.deleteConversation(conversationId);
            this.logger.log(`Conversa ${conversationId} deletada: ${result.count} mensagens removidas`);
            return result;
        }
        catch (error) {
            this.logger.error('Erro ao deletar conversa:', error);
            throw error;
        }
    }
    generateConversationId() {
        return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async testConnection() {
        const apiKey = this.configService.get('ANTHROPIC_API_KEY');
        if (!apiKey) {
            return {
                status: 'error',
                message: 'ANTHROPIC_API_KEY não configurada',
            };
        }
        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 10,
                    messages: [{ role: 'user', content: 'Teste de conexão' }],
                    system: 'Responda apenas com "Conexão OK!"',
                }),
            });
            if (response.ok) {
                try {
                    const dbTest = await this.chatRepository.getConversationMessages('test', 1);
                    return {
                        status: 'success',
                        message: 'Conexão com Claude API e banco de dados estabelecida',
                    };
                }
                catch (dbError) {
                    return {
                        status: 'warning',
                        message: 'Claude API OK, mas banco de dados pode ter problemas',
                    };
                }
            }
            else {
                const error = await response.json();
                return {
                    status: 'error',
                    message: `Erro na API: ${error.error?.message || 'Desconhecido'}`,
                };
            }
        }
        catch (error) {
            return {
                status: 'error',
                message: `Falha na conexão: ${error.message}`,
            };
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        chat_repository_1.ChatRepository])
], ChatService);
//# sourceMappingURL=chat.service.js.map