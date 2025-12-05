Write-Host "?? TESTANDO MIGRAÇÃO DO CHAT" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# 1. Verificar estrutura de arquivos
Write-Host "`n1. Verificando estrutura de arquivos..." -ForegroundColor Yellow
$filesToCheck = @(
    "apps\web\app\chat\page.tsx",
    "apps\web\app\chat\systemPrompt.tsx",
    "apps\web\app\api\chat\route.ts",
    "apps\web\components\Sidebar.tsx"
)

foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        Write-Host "   ? $file" -ForegroundColor Green
    } else {
        Write-Host "   ? $file (NÃO ENCONTRADO)" -ForegroundColor Red
    }
}

# 2. Verificar variáveis de ambiente
Write-Host "`n2. Verificando variáveis de ambiente..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "ANTHROPIC_API_KEY") {
        Write-Host "   ? ANTHROPIC_API_KEY encontrada" -ForegroundColor Green
    } else {
        Write-Host "   ?? ANTHROPIC_API_KEY não encontrada" -ForegroundColor Yellow
    }
    if ($envContent -match "NEXT_PUBLIC_API_URL") {
        Write-Host "   ? NEXT_PUBLIC_API_URL encontrada" -ForegroundColor Green
    }
} else {
    Write-Host "   ? .env não encontrado" -ForegroundColor Red
}

# 3. Verificar dependências
Write-Host "`n3. Verificando dependências..." -ForegroundColor Yellow
cd apps\web
if (Test-Path "node_modules\lucide-react") {
    Write-Host "   ? lucide-react instalado" -ForegroundColor Green
} else {
    Write-Host "   ? lucide-react não instalado" -ForegroundColor Red
}
cd ..\..

Write-Host "`n? TESTE CONCLUÍDO!" -ForegroundColor Green
Write-Host "`n?? PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "   1. Edite o arquivo .env e adicione sua ANTHROPIC_API_KEY real"
Write-Host "   2. Execute: docker-compose -f docker/docker-compose.yml up -d"
Write-Host "   3. Execute: cd apps/web && npm run dev"
Write-Host "   4. Acesse: http://localhost:3000/chat"
Write-Host "`n??  LEMBRETE: Seu route.ts já está configurado para usar ANTHROPIC_API_KEY"
