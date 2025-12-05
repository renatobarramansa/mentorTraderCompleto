// src/modules/chat/repositories/chat.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChatRepository {
  constructor(private prisma: PrismaService) {}

  async createMessage(data: {
    role: string;
    content: string;
    conversationId: string;
    userId?: string;
    metadata?: any;
  }) {
    return this.prisma.chatMessage.create({
      data: {
        role: data.role,
        content: data.content,
        conversationId: data.conversationId,
        userId: data.userId,
        metadata: data.metadata || {},
      },
    });
  }

  async getConversationMessages(conversationId: string, limit: number = 50) {
    return this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  async getConversationSummary(conversationId: string) {
    const messages = await this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      totalMessages: await this.prisma.chatMessage.count({
        where: { conversationId },
      }),
      lastMessage: messages[0],
      firstMessage: messages[messages.length - 1],
      userMessageCount: await this.prisma.chatMessage.count({
        where: { conversationId, role: 'user' },
      }),
      assistantMessageCount: await this.prisma.chatMessage.count({
        where: { conversationId, role: 'assistant' },
      }),
    };
  }

  async deleteConversation(conversationId: string) {
    return this.prisma.chatMessage.deleteMany({
      where: { conversationId },
    });
  }

  async getUserConversations(userId: string) {
    return this.prisma.chatMessage.findMany({
      where: { userId },
      distinct: ['conversationId'],
      orderBy: { createdAt: 'desc' },
      select: {
        conversationId: true,
        createdAt: true,
        content: true,
      },
    });
  }
}
