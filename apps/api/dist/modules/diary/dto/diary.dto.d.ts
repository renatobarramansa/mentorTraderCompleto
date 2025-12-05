export declare class CreateDiaryDto {
    pair: string;
    direction: 'LONG' | 'SHORT';
    entry: number;
    exit?: number;
    pips?: number;
    notes: string;
    image?: string;
    date?: Date;
}
export declare class UpdateDiaryDto {
    pair?: string;
    direction?: 'LONG' | 'SHORT';
    entry?: number;
    exit?: number;
    pips?: number;
    notes?: string;
    image?: string;
}
