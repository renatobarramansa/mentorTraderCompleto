import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para o frontend
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Definir prefixo global da API
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3333;
  await app.listen(port);

  console.log(`🚀 Backend NestJS rodando em: http://localhost:${port}`);
  console.log(`📚 API Docs: http://localhost:${port}/api`);
  console.log(`🌐 Frontend: http://localhost:3000`);
  
  // Log para debug
  console.log(`[DEBUG] ANTHROPIC_API_KEY configurada: ${process.env.ANTHROPIC_API_KEY ? 'SIM' : 'NÃO'}`);
}

bootstrap();
