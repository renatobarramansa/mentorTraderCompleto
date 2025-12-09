# ============================================
# SCRIPT: RESTAURAR AUTENTICAÇÃO (BACKUP)
# ============================================

Write-Host "?? RESTAURANDO AUTENTICAÇÃO" -ForegroundColor Cyan
Write-Host "============================"

# 1. Restaurar dependências
Write-Host "`n1. Instalando NextAuth..." -ForegroundColor Yellow
npm install next-auth @auth/prisma-adapter @types/next-auth

# 2. Restaurar estrutura de pastas
Write-Host "`n2. Restaurando pastas de autenticação..." -ForegroundColor Yellow

# Criar pasta auth se não existir
if (-not (Test-Path "app/auth")) {
    New-Item -Path "app/auth" -ItemType Directory -Force
    New-Item -Path "app/auth/login" -ItemType Directory -Force
    New-Item -Path "app/auth/register" -ItemType Directory -Force
}

Write-Host "`n? Script de restauração criado como: restore-auth.ps1"
Write-Host "`n??  NOTA: Execute este script quando quiser restaurar a autenticação"
