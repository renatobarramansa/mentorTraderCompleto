import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateDiaryDto, UpdateDiaryDto } from './dto/diary.dto';

@Injectable()
export class DiaryService {
  constructor(private prisma: PrismaService) {}
  
  // CRIAR NOVO REGISTRO
  async create(userId: string, createDiaryDto: CreateDiaryDto) {
    return this.prisma.diary.create({
      data: {
        ...createDiaryDto,
        userId,
        date: createDiaryDto.date || new Date(),
      },
    });
  }
  
  // LISTAR TODOS OS TRADES DO USUÁRIO
  async findAll(userId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    pair?: string;
    direction?: 'LONG' | 'SHORT';
  }) {
    const where: any = { userId };
    
    // Aplica filtros
    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
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
  
  // BUSCAR TRADE POR ID
  async findOne(userId: string, id: string) {
    const diary = await this.prisma.diary.findFirst({
      where: { id, userId },
    });
    
    if (!diary) {
      throw new NotFoundException('Trade não encontrado');
    }
    
    return diary;
  }
  
  // ATUALIZAR TRADE
  async update(userId: string, id: string, updateDiaryDto: UpdateDiaryDto) {
    // Verifica se o trade existe e pertence ao usuário
    await this.findOne(userId, id);
    
    return this.prisma.diary.update({
      where: { id },
      data: updateDiaryDto,
    });
  }
  
  // REMOVER TRADE
  async remove(userId: string, id: string) {
    // Verifica se o trade existe e pertence ao usuário
    await this.findOne(userId, id);
    
    return this.prisma.diary.delete({
      where: { id },
    });
  }
  
  // ESTATÍSTICAS DO DIÁRIO
  async getStats(userId: string) {
    const trades = await this.prisma.diary.findMany({
      where: { userId },
    });
    
    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => (t.pips || 0) > 0).length;
    const losingTrades = trades.filter(t => (t.pips || 0) < 0).length;
    const totalPips = trades.reduce((sum, t) => sum + (t.pips || 0), 0);
    const avgPips = totalTrades > 0 ? totalPips / totalTrades : 0;
    
    // Estatísticas por par
    const pairStats = trades.reduce((acc, trade) => {
      if (!acc[trade.pair]) {
        acc[trade.pair] = { trades: 0, totalPips: 0, wins: 0, losses: 0 };
      }
      acc[trade.pair].trades++;
      acc[trade.pair].totalPips += trade.pips || 0;
      if ((trade.pips || 0) > 0) acc[trade.pair].wins++;
      if ((trade.pips || 0) < 0) acc[trade.pair].losses++;
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
  
  // RESUMO MENSAL
  async getMonthlySummary(userId: string, year?: number, month?: number) {
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
}
