import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3333;
  await app.listen(port);
  
  console.log(`🚀 Backend NestJS rodando em: http://localhost:${port}`);
  console.log(`📚 API Docs: http://localhost:${port}/api`);
  console.log(`🌐 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
}

bootstrap().catch((error) => {
  console.error('💥 Falha ao iniciar o servidor:', error);
  process.exit(1);
});