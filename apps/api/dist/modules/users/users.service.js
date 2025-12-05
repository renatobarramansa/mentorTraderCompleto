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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                createdAt: true,
                updatedAt: true,
                diaries: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: {
                        diaries: true,
                        messages: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        return user;
    }
    async updateProfile(userId, data) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                updatedAt: true,
            },
        });
    }
    async getUserStats(userId) {
        const [diaryStats, chatStats, user] = await Promise.all([
            this.prisma.diary.aggregate({
                where: { userId },
                _count: true,
                _avg: { pips: true },
                _sum: { pips: true },
            }),
            this.prisma.chatMessage.aggregate({
                where: { userId },
                _count: true,
            }),
            this.prisma.user.findUnique({
                where: { id: userId },
                select: { createdAt: true },
            }),
        ]);
        const daysSinceJoin = Math.floor((new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return {
            tradingStats: {
                totalTrades: diaryStats._count,
                averagePips: diaryStats._avg.pips,
                totalPips: diaryStats._sum.pips,
            },
            chatStats: {
                totalMessages: chatStats._count,
            },
            account: {
                daysSinceJoin,
                joinedAt: user.createdAt,
            },
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map