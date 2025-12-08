import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // HABILITAR CORS - ESSENCIAL
  app.enableCors({
    origin: "http://localhost:3000", // Frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  });
  
  app.setGlobalPrefix("api");
  
  const port = process.env.PORT || 3333;
  await app.listen(port);
  console.log(`🚀 API rodando em: http://localhost:${port}`);
  console.log(`✅ CORS habilitado para: http://localhost:3000`);
}
bootstrap();
