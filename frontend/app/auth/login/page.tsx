// app/auth/login/page.tsx - CONECTADO AO BACKEND
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        // Fallback: testar direto com API NestJS
        const response = await fetch("http://localhost:3333/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("auth_token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          router.push("/dashboard");
        } else {
          setError("Credenciais inválidas");
        }
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
        <h1 style={{ marginBottom: "30px", textAlign: "center" }}>Login Mentor Trader</h1>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {error && <div style={{ padding: "10px", background: "#fee", color: "#c00", borderRadius: "4px" }}>{error}</div>}
          
          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
              required
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ 
              padding: "12px", 
              background: "#0070f3", 
              color: "white", 
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <Link href="/auth/register" style={{ color: "#0070f3", textDecoration: "none" }}>
            Criar nova conta
          </Link>
          <span style={{ margin: "0 10px" }}>•</span>
          <Link href="/" style={{ color: "#666", textDecoration: "none" }}>
            Voltar para Home
          </Link>
        </div>
        
        <div style={{ marginTop: "30px", padding: "15px", background: "#f0f8ff", borderRadius: "4px", fontSize: "14px" }}>
          <p><strong>Para teste rápido:</strong></p>
          <p>1. Primeiro crie uma conta em /auth/register</p>
          <p>2. Ou use API: curl -X POST http://localhost:3333/api/auth/register</p>
        </div>
      </div>
    </div>
  );
}
