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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let ChatRepository = class ChatRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createMessage(data) {
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
    async getConversationMessages(conversationId, limit = 50) {
        return this.prisma.chatMessage.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            take: limit,
        });
    }
    async getConversationSummary(conversationId) {
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
    async deleteConversation(conversationId) {
        return this.prisma.chatMessage.deleteMany({
            where: { conversationId },
        });
    }
    async getUserConversations(userId) {
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
};
exports.ChatRepository = ChatRepository;
exports.ChatRepository = ChatRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatRepository);
//# sourceMappingURL=chat.repository.js.map