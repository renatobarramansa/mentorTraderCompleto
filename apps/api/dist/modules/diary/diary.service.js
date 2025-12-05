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
exports.DiaryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
let DiaryService = class DiaryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createDiaryDto) {
        return this.prisma.diary.create({
            data: {
                ...createDiaryDto,
                userId,
                date: createDiaryDto.date || new Date(),
            },
        });
    }
    async findAll(userId, filters) {
        const where = { userId };
        if (filters?.startDate || filters?.endDate) {
            where.date = {};
            if (filters.startDate)
                where.date.gte = filters.startDate;
            if (filters.endDate)
                where.date.lte = filters.endDate;
        }
        if (filters?.pair) {
            where.pair = filters.pair;
        }
        if (filters?.direction) {
            where.direction = filters.direction;
        }
        return this.prisma.diary.findMany({
            where,
            orderBy: { date: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async findOne(userId, id) {
        const diary = await this.prisma.diary.findFirst({
            where: { id, userId },
        });
        if (!diary) {
            throw new common_1.NotFoundException('Trade não encontrado');
        }
        return diary;
    }
    async update(userId, id, updateDiaryDto) {
        await this.findOne(userId, id);
        return this.prisma.diary.update({
            where: { id },
            data: updateDiaryDto,
        });
    }
    async remove(userId, id) {
        await this.findOne(userId, id);
        return this.prisma.diary.delete({
            where: { id },
        });
    }
    async getStats(userId) {
        const trades = await this.prisma.diary.findMany({
            where: { userId },
        });
        const totalTrades = trades.length;
        const winningTrades = trades.filter(t => (t.pips || 0) > 0).length;
        const losingTrades = trades.filter(t => (t.pips || 0) < 0).length;
        const totalPips = trades.reduce((sum, t) => sum + (t.pips || 0), 0);
        const avgPips = totalTrades > 0 ? totalPips / totalTrades : 0;
        const pairStats = trades.reduce((acc, trade) => {
            if (!acc[trade.pair]) {
                acc[trade.pair] = { trades: 0, totalPips: 0, wins: 0, losses: 0 };
            }
            acc[trade.pair].trades++;
            acc[trade.pair].totalPips += trade.pips || 0;
            if ((trade.pips || 0) > 0)
                acc[trade.pair].wins++;
            if ((trade.pips || 0) < 0)
                acc[trade.pair].losses++;
            return acc;
        }, {});
        return {
            totalTrades,
            winningTrades,
            losingTrades,
            winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
            totalPips,
            avgPips,
            pairStats,
        };
    }
    async getMonthlySummary(userId, year, month) {
        const date = new Date();
        const targetYear = year || date.getFullYear();
        const targetMonth = month !== undefined ? month : date.getMonth();
        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = new Date(targetYear, targetMonth + 1, 0);
        const trades = await this.findAll(userId, {
            startDate,
            endDate,
        });
        const stats = await this.getStats(userId);
        return {
            period: `${targetMonth + 1}/${targetYear}`,
            trades: trades.length,
            stats,
            tradesList: trades,
        };
    }
};
exports.DiaryService = DiaryService;
exports.DiaryService = DiaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DiaryService);
//# sourceMappingURL=diary.service.js.map