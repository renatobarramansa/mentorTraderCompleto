import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(userData: {
    email: string;
    password: string;
    name?: string;
  }) {
    const existingUser = await this.findByEmail(userData.email);
    
    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    return this.prisma.user.create({
      data: userData,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
  
  // PERFIL DO USUÁRIO
  async getProfile(userId: string) {
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
      throw new NotFoundException('Usuário não encontrado');
    }
    
    return user;
  }
  
  // ATUALIZAR PERFIL
  async updateProfile(userId: string, data: { name?: string; image?: string }) {
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
  
  // ESTATÍSTICAS DO USUÁRIO
  async getUserStats(userId: string) {
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
    
    const daysSinceJoin = Math.floor(
      (new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    
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
}
