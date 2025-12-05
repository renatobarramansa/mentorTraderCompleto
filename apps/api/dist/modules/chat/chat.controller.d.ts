import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    sendMessage(chatRequest: ChatRequestDto): Promise<ChatResponseDto>;
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
    testConnection(): Promise<{
        status: string;
        message: string;
    }>;
    healthCheck(): {
        status: string;
        timestamp: string;
        service: string;
        database: string;
    };
}
