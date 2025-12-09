// app/dashboard/page.tsx
"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Mentor Trader</h1>
      <p className="text-gray-600 mt-1">Bem-vindo ao seu painel de trading!</p>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">

        {/* CARD - Chat IA */}
        <div className="p-6 bg-gray-100 rounded-xl shadow hover:shadow-md transition">
          <h3 className="text-lg font-semibold text-gray-800">Chat com IA</h3>
          <p className="text-gray-600 mt-1">Converse com o mentor de trading</p>
          <Link 
            href="/dashboard/chat"
            className="text-purple-600 font-semibold mt-3 inline-block hover:underline"
          >
            Acessar →
          </Link>
        </div>

        {/* CARD - Diário */}
        <div className="p-6 bg-gray-100 rounded-xl shadow hover:shadow-md transition">
          <h3 className="text-lg font-semibold text-gray-800">Diário de Trades</h3>
          <p className="text-gray-600 mt-1">Registre suas operações</p>
          <Link 
            href="/dashboard/diary"
            className="text-purple-600 font-semibold mt-3 inline-block hover:underline"
          >
            Acessar →
          </Link>
        </div>

        {/* CARD - Análises */}
        <div className="p-6 bg-gray-100 rounded-xl shadow hover:shadow-md transition">
          <h3 className="text-lg font-semibold text-gray-800">Análises</h3>
          <p className="text-gray-600 mt-1">Estatísticas e gráficos</p>
          <Link 
            href="/dashboard/analytics"
            className="text-purple-600 font-semibold mt-3 inline-block hover:underline"
          >
            Acessar →
          </Link>
        </div>

      </div>

      {/* VOLTAR */}
      <div className="mt-10">
        <Link 
          href="/"
          className="text-blue-600 hover:underline font-medium"
        >
          ← Voltar para Home
        </Link>
      </div>
    </div>
  );
}
