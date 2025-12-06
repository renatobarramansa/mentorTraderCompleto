// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Mentor Trader</h1>
      <p>Sistema de mentoramento para traders</p>
      <div style={{ marginTop: "30px" }}>
        <Link 
          href="/auth/login" 
          style={{ 
            padding: "12px 24px", 
            background: "#0070f3", 
            color: "white", 
            textDecoration: "none",
            borderRadius: "4px",
            marginRight: "10px"
          }}
        >
          Entrar
        </Link>
        <Link 
          href="/dashboard" 
          style={{ 
            padding: "12px 24px", 
            background: "#555", 
            color: "white", 
            textDecoration: "none",
            borderRadius: "4px"
          }}
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
