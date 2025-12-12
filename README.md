This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Quando der problema no prisma, instalar a versão anterior
npm install prisma@6 @prisma/client@6

****EXECUTAR O PROJETO***
PASSO 1 : Executar o docker no windows

PASSO 2: INICIAR O BANCO DE DADOS
bash
# Na raiz do projeto (C:\mentor-trader-completo)
docker-compose -f docker/docker-compose.yml up -d

PASSO 3: CONFIGURAR PRISMA
# Gerar Prisma Client
npx prisma generate

# Sincronizar banco de dados
npx prisma db push

PASSO 4: INICIAR BACKEND (NestJS)
# Abra um novo terminal/Tab
cd C:\mentor-trader-completo\apps\api
npm run start:dev
# Aguarde: http://localhost:3333

PASSO 5: INICIAR FRONTEND (Next.js)
# Abra outro terminal/Tab
cd apps/web
npm run dev
# Acesse: http://localhost:3000

PASSO 6: VERIFICAR TUDO
PostgreSQL: Rodando via Docker (porta 5432)

Backend API: http://localhost:3333/api ✅

Frontend: http://localhost:3000 ✅

Prisma Studio(versão prisma 7): npx prisma studio --config .\prisma\prisma.config.ts

COMANDOS IMPORTANTES DO PRISMA
npx prisma generate (REFAZER AS TABELAS)
npx prisma db push (SINCRONIZAR O BANCO)


PARA MOSTRAR A ESTRUTURA DE PASTAS E DIRETOÓRIOS
Na raiz do projeto executar node tree.js

Corrigir com o claude
C:\mentor-trader-completo\frontend\components\chat\MessageContent.tsx, nome do efeito highlighting
