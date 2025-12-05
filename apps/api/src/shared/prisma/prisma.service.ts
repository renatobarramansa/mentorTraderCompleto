import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService 
  extends PrismaClient 
  implements OnModuleInit, OnModuleDestroy {
  
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'], // Log detalhado em desenvolvimento
    });
  }
  
  // Conecta ao banco quando o módulo iniciar
  async onModuleInit() {
    await this.$connect();
    console.log(' Prisma conectado ao PostgreSQL');
  }
  
  // Desconecta quando o módulo for destruído
  async onModuleDestroy() {
    await this.$disconnect();
    console.log(' Prisma desconectado');
  }
  
  // Método utilitário para transações
  async transaction(callback: (tx: PrismaClient) => Promise<any>) {
    return this.$transaction(callback);
  }
}
