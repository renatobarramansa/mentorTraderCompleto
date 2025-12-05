export declare class MessageDto {
    role: 'user' | 'assistant';
    content: string;
}
export declare class ChatRequestDto {
    messages: MessageDto[];
    userId: string;
}
export declare class ChatResponseDto {
    message: string;
    timestamp: Date;
    tokensUsed: number;
}
