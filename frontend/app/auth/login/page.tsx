"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      const response = await fetch("http://localhost:3333/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Salvar dados
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Redirecionar
        router.push("/dashboard");
      } else {
        // Mostrar mensagem de erro do backend
        setError(data.message || "Credenciais inválidas");
      }
    } catch (err) {
      console.error("Erro:", err);
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "#f5f5f5"
    }}>
      <div style={{ 
        background: "white", 
        padding: "40px", 
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "400px"
      }}>
        <h1 style={{ marginBottom: "30px", textAlign: "center" }}>Login Mentor Trader</h1>
        
        {error && (
          <div style={{ 
            background: "#fee", 
            color: "#c00", 
            padding: "10px", 
            borderRadius: "4px",
            marginBottom: "20px"
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "12px", 
                border: "1px solid #ddd", 
                borderRadius: "4px" 
              }}
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "12px", 
                border: "1px solid #ddd", 
                borderRadius: "4px" 
              }}
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
              fontSize: "16px"
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <a 
            href="/auth/register" 
            style={{ color: "#0070f3", textDecoration: "none" }}
          >
            Criar uma conta
          </a>
        </div>
        
        <div style={{ 
          marginTop: "30px", 
          padding: "15px", 
          background: "#f0f8ff", 
          borderRadius: "4px",
          fontSize: "14px"
        }}>
          <p><strong>Para teste rápido:</strong></p>
          <p>1. Crie uma conta primeiro em /auth/register</p>
          <p>2. Ou use o curl para criar:</p>
          <code style={{ fontSize: "12px", display: "block", marginTop: "5px" }}>
            curl -X POST http://localhost:3333/api/auth/register -H &quot;Content-Type: application/json&quot; -d &apos;{`{"email":"test@test.com","name":"Test","password":"123456"}`}&apos;
          </code>
        </div>
      </div>
    </div>
  );
}