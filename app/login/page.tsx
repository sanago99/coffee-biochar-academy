"use client";

import { useState } from "react";
import Link from "next/link";
import { auth, db } from "../../firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import type { UserData } from "../types";

export default function Login() {
  const router = useRouter();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const login = async () => {
    if (!email || !password) { setError("Completa todos los campos"); return; }

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);

      const snap = await getDocs(
        query(collection(db, "users"), where("email", "==", email))
      );

      if (snap.empty) { setError("Usuario no encontrado"); setLoading(false); return; }

      const userData = snap.docs[0].data() as UserData;

      if (userData.status === "pending") {
        router.push("/pending");
        return;
      }

      router.push(userData.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      setError("Correo o contraseña incorrectos");
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") login(); };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "var(--bg-deep)",
      }}
    >
      {/* LEFT — photo panel */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          display: "none",
        }}
        className="login-photo-panel"
      >
        <img
          src="/fotos/training.jpg"
          alt="Formación Coffee Biochar"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            filter: "saturate(0.75) brightness(0.6)",
          }}
        />
        <div
          style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(160deg, rgba(12,10,7,0.3), rgba(12,10,7,0.85))",
            display: "flex", flexDirection: "column",
            justifyContent: "flex-end", padding: "48px",
          }}
        >
          <img src="/logo.png" alt="Coffee Biochar" style={{ height: "80px", width: "auto", marginBottom: "24px" }} />
          <h2 className="heading-2" style={{ marginBottom: "12px" }}>
            Formación para extensionistas
          </h2>
          <p className="body-lg" style={{ maxWidth: "360px" }}>
            Aprende a producir biochar, mejorar suelos cafeteros
            y registrar el impacto de carbono en campo.
          </p>
          <div style={{ marginTop: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src="/brand/biodiversal.png"
              alt="Biodiversal"
              style={{ height: "24px", filter: "brightness(0) invert(1)", opacity: 0.5 }}
            />
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Agricultura Regenerativa · Colombia</span>
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="auth-wrap" style={{ background: "transparent", gridColumn: "span 1" }}>
        <div className="auth-card fade-up">

          {/* Mobile logo */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <img src="/logo.png" alt="Coffee Biochar" style={{ height: "60px", width: "auto" }} />
          </div>

          <h2 className="heading-3" style={{ marginBottom: "4px" }}>Bienvenido</h2>
          <p className="body-sm" style={{ marginBottom: "28px" }}>Ingresa con tu cuenta para continuar</p>

          <div className="form-group" style={{ marginTop: 0 }}>
            <label className="form-label">Correo electrónico</label>
            <input
              className="input" type="email" placeholder="tu@correo.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={onKey} inputMode="email" autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              className="input" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={onKey} autoComplete="current-password"
            />
          </div>

          {error && <p className="msg-error">{error}</p>}

          <button
            className="btn btn-primary btn-full"
            style={{ marginTop: "24px" }}
            onClick={login}
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "var(--text-muted)" }}>
            ¿No tienes cuenta?{" "}
            <Link href="/register" style={{ color: "var(--amber)", fontWeight: 500 }}>
              Regístrate
            </Link>
          </p>

        </div>
      </div>

      <style>{`
        @media(min-width:768px){
          .login-photo-panel { display:flex !important; }
        }
      `}</style>
    </div>
  );
}
