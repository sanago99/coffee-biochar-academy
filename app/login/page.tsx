"use client";

import { useState } from "react";
import Link from "next/link";
import { auth, db } from "../../firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import type { UserData } from "../types";
import { DEMO_STUDENT_EMAIL, DEMO_ADMIN_EMAIL, DEMO_PASSWORD } from "../lib/demo";

export default function Login() {
  const router = useRouter();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,      setLoading]      = useState(false);
  const [demoLoading,  setDemoLoading]  = useState<"student" | "admin" | null>(null);

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

  const loginDemo = async (role: "student" | "admin") => {
    setDemoLoading(role);
    setError("");
    const demoEmail = role === "student" ? DEMO_STUDENT_EMAIL : DEMO_ADMIN_EMAIL;
    try {
      await signInWithEmailAndPassword(auth, demoEmail, DEMO_PASSWORD);
      router.push(role === "admin" ? "/admin" : "/dashboard");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (code === "auth/wrong-password" || code === "auth/invalid-login-credentials" || code === "auth/invalid-credential") {
        setError("Contraseña demo incorrecta. Agrega NEXT_PUBLIC_DEMO_PASSWORD=tucontraseña en .env.local");
      } else if (code === "auth/user-not-found") {
        setError("Cuenta demo no encontrada. Créala en Firebase Auth con el email: " + demoEmail);
      } else {
        setError(`Error al entrar al demo: ${code || String(err)}`);
      }
      setDemoLoading(null);
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
            <label className="form-label" htmlFor="login-email">Correo electrónico</label>
            <input
              id="login-email"
              className="input" type="email" placeholder="tu@correo.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={onKey} inputMode="email" autoComplete="email"
            />
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
              <label className="form-label" htmlFor="login-password" style={{ marginBottom: 0 }}>Contraseña</label>
              <Link href="/forgot-password" style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              id="login-password"
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

          {/* Demo section */}
          <div style={{ marginTop: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
              <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
                Explorar sin registrarse
              </span>
              <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button
                onClick={() => loginDemo("student")}
                disabled={demoLoading !== null || loading}
                style={{
                  padding: "12px 10px", borderRadius: "var(--radius-sm)", cursor: "pointer",
                  background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  textAlign: "left", transition: "border-color .15s, background .15s",
                  opacity: demoLoading === "student" ? 0.7 : 1,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--green-border)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--green-glow)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-elevated)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--green)", flexShrink: 0 }}>
                    <circle cx="7" cy="4.5" r="2.3" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {demoLoading === "student" ? "Entrando..." : "Demo Estudiante"}
                  </span>
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Ve el programa como un extensionista
                </p>
              </button>

              <button
                onClick={() => loginDemo("admin")}
                disabled={demoLoading !== null || loading}
                style={{
                  padding: "12px 10px", borderRadius: "var(--radius-sm)", cursor: "pointer",
                  background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  textAlign: "left", transition: "border-color .15s, background .15s",
                  opacity: demoLoading === "admin" ? 0.7 : 1,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--amber-border)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--amber-glow)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-elevated)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--amber)", flexShrink: 0 }}>
                    <rect x="1.5" y="2" width="11" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                    <rect x="1.5" y="5.5" width="7" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                    <rect x="1.5" y="9" width="9" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {demoLoading === "admin" ? "Entrando..." : "Demo Admin"}
                  </span>
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Gestiona usuarios, contenido y progreso
                </p>
              </button>
            </div>
          </div>

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
