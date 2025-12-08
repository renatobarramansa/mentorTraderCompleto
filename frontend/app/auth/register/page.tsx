"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.password !== form.confirm) {
      setError("Senhas não coincidem");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:3333/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess("Conta criada! Redirecionando para login...");
        setTimeout(() => router.push("/auth/login"), 2000);
      } else {
        setError(data.message || "Erro ao criar conta");
      }
    } catch (err) {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
        <h1 style={{ marginBottom: "30px", textAlign: "center" }}>Criar Conta</h1>
        
        {error && <div style={{ background: "#fee", color: "#c00", padding: "10px", borderRadius: "4px", marginBottom: "20px" }}>{error}</div>}
        {success && <div style={{ background: "#efe", color: "#080", padding: "10px", borderRadius: "4px", marginBottom: "20px" }}>{success}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <input name="name" type="text" placeholder="Nome" value={form.name} onChange={handleChange} style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "4px" }} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "4px" }} required />
          <input name="password" type="password" placeholder="Senha" value={form.password} onChange={handleChange} style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "4px" }} required />
          <input name="confirm" type="password" placeholder="Confirmar Senha" value={form.confirm} onChange={handleChange} style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "4px" }} required />
          
          <button type="submit" disabled={loading} style={{ padding: "12px", background: "#0070f3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            {loading ? "Criando..." : "Criar Conta"}
          </button>
        </form>
        
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <a href="/auth/login" style={{ color: "#0070f3", textDecoration: "none" }}>Já tem conta? Faça login</a>
        </div>
      </div>
    </div>
  );
}
