import { PrismaService } from '../../shared/prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        email: string;
        image: string;
        diaries: {
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
        }[];
        _count: {
            diaries: number;
            messages: number;
        };
    }>;
    updateProfile(userId: string, data: {
        name?: string;
        image?: string;
    }): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        email: string;
        image: string;
    }>;
    getUserStats(userId: string): Promise<{
        tradingStats: {
            totalTrades: number;
            averagePips: number;
            totalPips: number;
        };
        chatStats: {
            totalMessages: number;
        };
        account: {
            daysSinceJoin: number;
            joinedAt: Date;
        };
    }>;
}
