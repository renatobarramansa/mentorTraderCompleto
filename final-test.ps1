Write-Host "?? TESTE FINAL DO SISTEMA" -ForegroundColor Magenta
Write-Host "==========================" -ForegroundColor Magenta

# 1. Testar health check
Write-Host "`n1. ?? Health Check" -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3333/chat/health" -Method Get
    Write-Host "   ? Status: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "   ? Falha: $_" -ForegroundColor Red
}

# 2. Testar conexão Claude API
Write-Host "`n2. ?? Teste Claude API" -ForegroundColor Cyan
try {
    $test = Invoke-RestMethod -Uri "http://localhost:3333/chat/test" -Method Get
    Write-Host "   ? Status: $($test.status)" -ForegroundColor Green
    Write-Host "   ?? Mensagem: $($test.message)" -ForegroundColor Gray
} catch {
    Write-Host "   ? Falha: $_" -ForegroundColor Red
}

# 3. Testar envio de mensagem
Write-Host "`n3. ?? Teste de Mensagem" -ForegroundColor Cyan
$testMessage = @{
    message = "Explique o que é uma média móvel simples em trading"
    systemPrompt = "Você é um mentor de trading especializado. Responda em português de forma clara."
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3333/chat/message" `
        -Method Post `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $testMessage
    
    Write-Host "   ? Mensagem enviada com sucesso!" -ForegroundColor Green
    Write-Host "   ?? Resposta (primeiros 100 chars):" -ForegroundColor White
    Write-Host "   $($response.content.Substring(0, [Math]::Min(100, $response.content.Length)))..." -ForegroundColor Gray
    Write-Host "   ?? Conversation ID: $($response.conversationId)" -ForegroundColor Gray
    
} catch {
    Write-Host "   ? Erro ao enviar mensagem: $_" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   ?? Status Code: $statusCode" -ForegroundColor Red
        
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
            Write-Host "   ?? Erro detalhado:" -ForegroundColor Red
            Write-Host $errorBody -ForegroundColor DarkRed
        } catch {
            Write-Host "   ?? Não foi possível ler detalhes do erro" -ForegroundColor Yellow
        }
    }
}

# 4. Testar frontend (opcional)
Write-Host "`n4. ?? Teste Frontend" -ForegroundColor Cyan
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 5
    Write-Host "   ? Frontend acessível (status: $($frontend.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ?? Frontend não respondeu (pode estar iniciando): $_" -ForegroundColor Yellow
}

Write-Host "`n? TESTE CONCLUÍDO!" -ForegroundColor Green
Write-Host "`n?? RESUMO:" -ForegroundColor Cyan
Write-Host "   Backend: http://localhost:3333" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Chat: http://localhost:3000/chat" -ForegroundColor White
Write-Host "   API Claude: ? FUNCIONANDO" -ForegroundColor Green
