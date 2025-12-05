Write-Host "?? VERIFICANDO MÓDULO CHAT DO BACKEND" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

cd C:\mentor-trader-completo\apps\api\src\modules\chat

# Verificar todos os arquivos
$files = @(
    "chat.service.ts",
    "chat.controller.ts", 
    "chat.module.ts",
    "dto/chat-request.dto.ts",
    "dto/chat-response.dto.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "? $file ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "? $file (NÃO ENCONTRADO)" -ForegroundColor Red
    }
}

# Verificar se o método existe no service
$serviceContent = Get-Content "chat.service.ts" -Raw
if ($serviceContent -match "async getChatResponse") {
    Write-Host "? Método getChatResponse encontrado no ChatService" -ForegroundColor Green
} else {
    Write-Host "? Método getChatResponse NÃO encontrado" -ForegroundColor Red
}

# Verificar AppModule
cd ..\..\..
$appModule = Get-Content "app.module.ts" -Raw
if ($appModule -match "ChatModule") {
    Write-Host "? ChatModule importado no AppModule" -ForegroundColor Green
} else {
    Write-Host "? ChatModule NÃO importado no AppModule" -ForegroundColor Red
}

Write-Host "`n?? PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Reinicie o backend: Ctrl+C e 'npm run start:dev' novamente" -ForegroundColor White
Write-Host "2. Teste a API: curl http://localhost:3333/chat/health" -ForegroundColor White
Write-Host "3. Teste o endpoint: curl -X POST http://localhost:3333/chat/message ^" -ForegroundColor White
Write-Host "   -H 'Content-Type: application/json' ^" -ForegroundColor White
Write-Host "   -d '{\"message\":\"Teste\",\"systemPrompt\":\"Você é um assistente\"}'" -ForegroundColor White
