import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class ChatRepository {
    private prisma;
    constructor(prisma: PrismaService);
    createMessage(data: {
        role: string;
        content: string;
        conversationId: string;
        userId?: string;
        metadata?: any;
    }): Promise<{
        conversationId: string;
        id: string;
        role: string;
        content: string;
        metadata: Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    }>;
    getConversationMessages(conversationId: string, limit?: number): Promise<{
        conversationId: string;
        id: string;
        role: string;
        content: string;
        metadata: Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    }[]>;
    getConversationSummary(conversationId: string): Promise<{
        totalMessages: number;
        lastMessage: {
            conversationId: string;
            id: string;
            role: string;
            content: string;
            metadata: Prisma.JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
        };
        firstMessage: {
            conversationId: string;
            id: string;
            role: string;
            content: string;
            metadata: Prisma.JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
        };
        userMessageCount: number;
        assistantMessageCount: number;
    }>;
    deleteConversation(conversationId: string): Promise<Prisma.BatchPayload>;
    getUserConversations(userId: string): Promise<{
        conversationId: string;
        content: string;
        createdAt: Date;
    }[]>;
}
