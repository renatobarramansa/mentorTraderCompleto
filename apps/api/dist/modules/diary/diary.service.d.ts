import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateDiaryDto, UpdateDiaryDto } from './dto/diary.dto';
export declare class DiaryService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createDiaryDto: CreateDiaryDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        image: string | null;
        pair: string;
        direction: string;
        entry: number;
        exit: number | null;
        pips: number | null;
        notes: string;
        date: Date;
    }>;
    findAll(userId: string, filters?: {
        startDate?: Date;
        endDate?: Date;
        pair?: string;
        direction?: 'LONG' | 'SHORT';
    }): Promise<({
        user: {
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        image: string | null;
        pair: string;
        direction: string;
        entry: number;
        exit: number | null;
        pips: number | null;
        notes: string;
        date: Date;
    })[]>;
    findOne(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        image: string | null;
        pair: string;
        direction: string;
        entry: number;
        exit: number | null;
        pips: number | null;
        notes: string;
        date: Date;
    }>;
    update(userId: string, id: string, updateDiaryDto: UpdateDiaryDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        image: string | null;
        pair: string;
        direction: string;
        entry: number;
        exit: number | null;
        pips: number | null;
        notes: string;
        date: Date;
    }>;
    remove(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        image: string | null;
        pair: string;
        direction: string;
        entry: number;
        exit: number | null;
        pips: number | null;
        notes: string;
        date: Date;
    }>;
    getStats(userId: string): Promise<{
        totalTrades: number;
        winningTrades: number;
        losingTrades: number;
        winRate: number;
        totalPips: number;
        avgPips: number;
        pairStats: {};
    }>;
    getMonthlySummary(userId: string, year?: number, month?: number): Promise<{
        period: string;
        trades: number;
        stats: {
            totalTrades: number;
            winningTrades: number;
            losingTrades: number;
            winRate: number;
            totalPips: number;
            avgPips: number;
            pairStats: {};
        };
        tradesList: ({
            user: {
                name: string;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            image: string | null;
            pair: string;
            direction: string;
            entry: number;
            exit: number | null;
            pips: number | null;
            notes: string;
            date: Date;
        })[];
    }>;
}
