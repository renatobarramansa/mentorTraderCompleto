Write-Host "?? VERIFICAÇÃO COMPLETA DA ESTRUTURA" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

cd C:\mentor-trader-completo\apps\api

# Verificar estrutura de arquivos
Write-Host "`n?? ESTRUTURA DE ARQUIVOS:" -ForegroundColor Yellow

$files = @(
    "src\app.module.ts",
    "src\main.ts",
    "src\modules\chat\chat.module.ts",
    "src\modules\chat\chat.service.ts", 
    "src\modules\chat\chat.controller.ts",
    "src\modules\chat\dto\chat-request.dto.ts",
    "src\modules\chat\dto\chat-response.dto.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "   ? $file ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "   ? $file (FALTANDO)" -ForegroundColor Red
    }
}

# Verificar dependências no package.json
Write-Host "`n?? DEPENDÊNCIAS:" -ForegroundColor Yellow
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json

$requiredDeps = @("@nestjs/config", "class-validator", "class-transformer")
foreach ($dep in $requiredDeps) {
    if ($packageJson.dependencies.$dep -or $packageJson.devDependencies.$dep) {
        Write-Host "   ? $dep instalado" -ForegroundColor Green
    } else {
        Write-Host "   ? $dep não instalado" -ForegroundColor Red
    }
}

# Verificar se o módulo está configurado corretamente
Write-Host "`n?? CONFIGURAÇÃO DO MÓDULO:" -ForegroundColor Yellow
$appModule = Get-Content "src\app.module.ts" -Raw
if ($appModule -match "ChatModule") {
    Write-Host "   ? ChatModule importado no AppModule" -ForegroundColor Green
} else {
    Write-Host "   ? ChatModule NÃO importado" -ForegroundColor Red
    Write-Host "   Conteúdo do AppModule:" -ForegroundColor Gray
    Write-Host $appModule -ForegroundColor Gray
}

Write-Host "`n?? PRÓXIMOS PASSOS:" -ForegroundColor Magenta
Write-Host "   1. Reinicie o backend: Ctrl+C e 'npm run start:dev'" -ForegroundColor White
Write-Host "   2. Teste o health check: curl http://localhost:3333/chat/health" -ForegroundColor White
Write-Host "   3. Teste a API: curl http://localhost:3333/chat/test" -ForegroundColor White
Write-Host "   4. Verifique logs do NestJS para erros" -ForegroundColor White
Write-Host "`n?? COMANDOS DE TESTE:" -ForegroundColor Cyan
Write-Host '   curl -X POST http://localhost:3333/chat/message ^' -ForegroundColor Gray
Write-Host '     -H "Content-Type: application/json" ^' -ForegroundColor Gray
Write-Host '     -d "{\"message\":\"Teste\",\"systemPrompt\":\"Você é um assistente\"}"' -ForegroundColor Gray
