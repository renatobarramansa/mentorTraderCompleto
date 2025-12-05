"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const dotenv = require("dotenv");
const path = require("path");
const envPath = path.resolve(__dirname, '..', '..', '..', '.env');
console.log('?? Procurando .env em:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
    console.error('? Erro ao carregar .env:', result.error);
    const altPath = path.resolve(process.cwd(), '.env');
    console.log('?? Tentando caminho alternativo:', altPath);
    dotenv.config({ path: altPath });
}
else {
    console.log('? .env carregado com sucesso');
    console.log('?? Diret�rio atual:', process.cwd());
    console.log('?? ANTHROPIC_API_KEY configurada:', !!process.env.ANTHROPIC_API_KEY);
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: 'http://localhost:3000',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    const port = process.env.PORT || 3333;
    await app.listen(port);
    console.log(`?? Application is running on: http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map