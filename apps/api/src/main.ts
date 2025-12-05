import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carregar .env manualmente ANTES de tudo
const envPath = path.resolve(__dirname, '..', '..', '..', '.env');
console.log('?? Procurando .env em:', envPath);

const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('? Erro ao carregar .env:', result.error);
  
  // Tentar caminho alternativo
  const altPath = path.resolve(process.cwd(), '.env');
  console.log('?? Tentando caminho alternativo:', altPath);
  dotenv.config({ path: altPath });
} else {
  console.log('? .env carregado com sucesso');
  console.log('?? Diretório atual:', process.cwd());
  console.log('?? ANTHROPIC_API_KEY configurada:', !!process.env.ANTHROPIC_API_KEY);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para frontend
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Habilitar validação global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  const port = process.env.PORT || 3333;
  await app.listen(port);
  console.log(`?? Application is running on: http://localhost:${port}`);
}
bootstrap();
