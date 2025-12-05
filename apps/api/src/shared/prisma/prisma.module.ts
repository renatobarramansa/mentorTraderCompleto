import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Torna o serviço disponível em toda a aplicação
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Exporta para outros módulos usarem
})
export class PrismaModule {}
