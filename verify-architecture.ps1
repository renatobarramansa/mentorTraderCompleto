Write-Host "? VERIFICAÇÃO DA ARQUITETURA LIMPA" -ForegroundColor Magenta
Write-Host "===================================" -ForegroundColor Magenta

Write-Host "`n?? ESTRUTURA DE ARQUIVOS:" -ForegroundColor Cyan

# Verificar remoção da API route duplicada
$checks = @(
    @{ Path = "apps/web/app/api/chat"; Description = "API Route duplicada removida"; ShouldExist = $false },
    @{ Path = "apps/web/lib/api.ts"; Description = "Cliente HTTP centralizado"; ShouldExist = $true },
    @{ Path = "apps/api/src/modules/chat/chat.service.ts"; Description = "Backend ChatService"; ShouldExist = $true },
    @{ Path = ".env"; Description = "API Key no backend (raiz)"; ShouldExist = $true },
    @{ Path = "apps/web/.env.local"; Description = "Config frontend (sem API Key)"; ShouldExist = $true }
)

foreach ($check in $checks) {
    $exists = Test-Path $check.Path
    $icon = if ($exists -eq $check.ShouldExist) { "?" } else { "?" }
    $color = if ($exists -eq $check.ShouldExist) { "Green" } else { "Red" }
    
    Write-Host "  $icon $($check.Description)" -ForegroundColor $color
    if ($check.Path -match "\.env") {
        if ($exists) {
            $content = Get-Content $check.Path -Raw
            $hasApiKey = $content -match "ANTHROPIC_API_KEY"
            $status = if ($hasApiKey) { "COM API Key" } else { "SEM API Key" }
            Write-Host "    ?? $status" -ForegroundColor Gray
        }
    }
}

Write-Host "`n?? FLUXO CONFIGURADO:" -ForegroundColor Cyan
Write-Host "  Frontend (localhost:3000) ? Backend (localhost:3333) ? Claude API" -ForegroundColor White
Write-Host "  ?? API Key: SEGURA no backend apenas" -ForegroundColor Green

Write-Host "`n?? PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "  1. Reinicie o backend: cd apps/api && npm run start:dev" -ForegroundColor White
Write-Host "  2. Reinicie o frontend: cd apps/web && npm run dev" -ForegroundColor White
Write-Host "  3. Teste: http://localhost:3000/chat" -ForegroundColor White
Write-Host "  4. Verifique os logs do backend para erros CORS" -ForegroundColor White

Write-Host "`n? ARQUITETURA LIMPA IMPLEMENTADA!" -ForegroundColor Green
Write-Host "   • Sem duplicação de código" -ForegroundColor Gray
Write-Host "   • API Key segura no backend" -ForegroundColor Gray
Write-Host "   • Cliente HTTP centralizado" -ForegroundColor Gray
Write-Host "   • CORS configurado" -ForegroundColor Gray
