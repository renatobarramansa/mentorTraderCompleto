import { DiaryService } from './diary.service';
import { CreateDiaryDto, UpdateDiaryDto } from './dto/diary.dto';
export declare class DiaryController {
    private readonly diaryService;
    constructor(diaryService: DiaryService);
    create(req: any, createDiaryDto: CreateDiaryDto): Promise<{
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
    findAll(req: any, startDate?: string, endDate?: string, pair?: string, direction?: 'LONG' | 'SHORT'): Promise<({
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
    getStats(req: any): Promise<{
        totalTrades: number;
        winningTrades: number;
        losingTrades: number;
        winRate: number;
        totalPips: number;
        avgPips: number;
        pairStats: {};
    }>;
    getMonthlySummary(req: any, year?: number, month?: number): Promise<{
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
    findOne(req: any, id: string): Promise<{
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
    update(req: any, id: string, updateDiaryDto: UpdateDiaryDto): Promise<{
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
    remove(req: any, id: string): Promise<{
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
}
