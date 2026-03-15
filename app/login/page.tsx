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
    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);

      const snap = await getDocs(
        query(collection(db, "users"), where("email", "==", email))
      );

      if (snap.empty) {
        setError("Usuario no encontrado");
        setLoading(false);
        return;
      }

      const userData = snap.docs[0].data() as UserData;
      router.push(userData.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      setError("Correo o contraseña incorrectos");
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") login();
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card fade-up">

        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <p className="nav-logo" style={{ fontSize: "20px" }}>
            Coffee <span>Biochar</span>
          </p>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
            Academy
          </p>
        </div>

        <h2 className="heading-3" style={{ marginBottom: "4px" }}>Bienvenido</h2>
        <p className="body-sm" style={{ marginBottom: "28px" }}>
          Ingresa con tu cuenta para continuar
        </p>

        <div className="form-group" style={{ marginTop: 0 }}>
          <label className="form-label">Correo electrónico</label>
          <input
            className="input"
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKey}
            inputMode="email"
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <input
            className="input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKey}
            autoComplete="current-password"
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
          <Link href="/register" style={{ color: "var(--green-accent)", fontWeight: 500 }}>
            Regístrate
          </Link>
        </p>

      </div>
    </div>
  );
}
