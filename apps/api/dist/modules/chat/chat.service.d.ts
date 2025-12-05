import { ConfigService } from '@nestjs/config';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
import { ChatRepository } from './repositories/chat.repository';
export declare class ChatService {
    private configService;
    private chatRepository;
    private readonly logger;
    constructor(configService: ConfigService, chatRepository: ChatRepository);
    getChatResponse(chatRequest: ChatRequestDto): Promise<ChatResponseDto>;
    getConversationHistory(conversationId: string): Promise<{
        conversationId: string;
        messages: {
            role: string;
            content: string;
            timestamp: string;
        }[];
        summary: {
            totalMessages: number;
            lastMessage: {
                conversationId: string;
                id: string;
                role: string;
                content: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                createdAt: Date;
                updatedAt: Date;
                userId: string | null;
            };
            firstMessage: {
                conversationId: string;
                id: string;
                role: string;
                content: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                createdAt: Date;
                updatedAt: Date;
                userId: string | null;
            };
            userMessageCount: number;
            assistantMessageCount: number;
        };
    }>;
    deleteConversation(conversationId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    private generateConversationId;
    testConnection(): Promise<{
        status: string;
        message: string;
    }>;
}
