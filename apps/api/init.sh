#!/bin/bash
echo " Iniciando setup do Mentor Trader Backend..."

# Instalar dependências
echo " Instalando dependências..."
npm install

# Gerar cliente do Prisma
echo " Gerando cliente Prisma..."
npx prisma generate

# Rodar migrações
echo " Executando migrações..."
npx prisma db push

# Compilar projeto
echo " Compilando NestJS..."
npm run build

echo " Setup completo! Inicie com: npm run start:dev"
