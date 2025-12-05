import { IsString, IsNumber, IsOptional, IsDate, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateDiaryDto {
  @IsString()
  pair: string; // Ex: 'EUR/USD', 'BTC/USD'
  
  @IsEnum(['LONG', 'SHORT'])
  direction: 'LONG' | 'SHORT';
  
  @IsNumber()
  @Type(() => Number)
  entry: number; // Preço de entrada
  
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  exit?: number; // Preço de saída
  
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pips?: number; // Lucro/perda em pips
  
  @IsString()
  notes: string; // Anotações da operação
  
  @IsOptional()
  @IsString()
  image?: string; // URL da imagem (print do trade)
  
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date; // Data da operação (default: agora)
}

export class UpdateDiaryDto {
  @IsOptional()
  @IsString()
  pair?: string;
  
  @IsOptional()
  @IsEnum(['LONG', 'SHORT'])
  direction?: 'LONG' | 'SHORT';
  
  @IsOptional()
  @IsNumber()
  entry?: number;
  
  @IsOptional()
  @IsNumber()
  exit?: number;
  
  @IsOptional()
  @IsNumber()
  pips?: number;
  
  @IsOptional()
  @IsString()
  notes?: string;
  
  @IsOptional()
  @IsString()
  image?: string;
}
