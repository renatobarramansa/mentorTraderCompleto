// app/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div style={{ padding: "40px" }}>
      <h1>Dashboard Mentor Trader</h1>
      <p>Bem-vindo ao seu painel de trading!</p>
      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: "20px",
        marginTop: "30px"
      }}>
        <div style={{ padding: "20px", background: "#f0f0f0", borderRadius: "8px" }}>
          <h3>Chat com IA</h3>
          <p>Converse com o mentor de trading</p>
          <Link href="/dashboard/chat">Acessar →</Link>
        </div>
        
        <div style={{ padding: "20px", background: "#f0f0f0", borderRadius: "8px" }}>
          <h3>Diário de Trades</h3>
          <p>Registre suas operações</p>
          <Link href="/dashboard/diary">Acessar →</Link>
        </div>
        
        <div style={{ padding: "20px", background: "#f0f0f0", borderRadius: "8px" }}>
          <h3>Análises</h3>
          <p>Estatísticas e gráficos</p>
          <Link href="/dashboard/analytics">Acessar →</Link>
        </div>
      </div>
      
      <div style={{ marginTop: "40px" }}>
        <Link href="/" style={{ color: "#0070f3" }}>← Voltar para Home</Link>
      </div>
    </div>
  );
}
