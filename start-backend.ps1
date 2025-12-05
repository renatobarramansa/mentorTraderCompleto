Write-Host "🔧 Iniciando Mentor Trader Backend..." -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Verificar Prisma Client
Write-Host "`n🔍 Verificando Prisma Client..." -ForegroundColor Yellow
if (Test-Path "node_modules\.prisma\client\index.js") {
    Write-Host "✅ Prisma Client disponível" -ForegroundColor Green
} else {
    Write-Host "❌ Prisma Client não encontrado" -ForegroundColor Red
    Write-Host "Gerando agora..." -ForegroundColor Yellow
    npx prisma generate
}

# Iniciar NestJS
Write-Host "`n🚀 Iniciando NestJS..." -ForegroundColor Green
npm run start:dev

Write-Host "`n📡 Backend rodando em: http://localhost:3333" -ForegroundColor Magenta
