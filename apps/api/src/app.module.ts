import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';
// ... outros módulos

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env', // Aponte para o .env da raiz
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    // ... outros módulos
  ],
})
export class AppModule {}