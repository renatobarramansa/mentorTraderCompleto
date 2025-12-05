import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
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
    updateProfile(req: any, data: {
        name?: string;
        image?: string;
    }): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        email: string;
        image: string;
    }>;
    getStats(req: any): Promise<{
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
