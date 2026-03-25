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

  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [demoLoading, setDemoLoading] = useState<"student" | "admin" | null>(null);
  const [showPass,    setShowPass]    = useState(false);

  const login = async () => {
    if (!email || !password) { setError("Completa todos los campos"); return; }
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDocs(query(collection(db, "users"), where("email", "==", email)));
      if (snap.empty) { setError("Usuario no encontrado"); setLoading(false); return; }
      const userData = snap.docs[0].data() as UserData;
      if (userData.status === "pending") { router.push("/pending"); return; }
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
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, demoEmail, DEMO_PASSWORD);
      const snap = await getDocs(query(collection(db, "users"), where("email", "==", demoEmail)));
      if (snap.empty) {
        setError(`Cuenta demo autenticada pero sin perfil en Firestore. Crea el documento en la colección 'users' con email: ${demoEmail}`);
        setLoading(false); setDemoLoading(null); return;
      }
      const userData = snap.docs[0].data() as UserData;
      if (userData.status === "pending") { router.push("/pending"); return; }
      router.push(userData.role === "admin" ? "/admin" : "/dashboard");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(`Error demo (${code || "desconocido"}): revisa que el email "${demoEmail}" exista en Firebase Auth con contraseña "${DEMO_PASSWORD}"`);
      setLoading(false); setDemoLoading(null);
    }
  };

  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") login(); };

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "1fr",
      background: "#0C0A07",
    }}>
      <style>{`
        @media (min-width: 768px) {
          .login-layout { grid-template-columns: 1fr 1fr !important; }
          .login-photo { display: flex !important; }
          .login-form-col { grid-column: span 1 !important; }
          .login-logo-mobile { display: none !important; }
        }
        .login-input:focus { outline: none; border-color: rgba(245,166,35,0.5) !important; background: rgba(255,255,255,0.04) !important; }
        .demo-btn:hover { border-color: rgba(245,166,35,0.3) !important; background: rgba(245,166,35,0.06) !important; }
        .demo-btn-green:hover { border-color: rgba(122,182,72,0.3) !important; background: rgba(122,182,72,0.06) !important; }
      `}</style>

      <div className="login-layout" style={{ display: "grid", minHeight: "100vh" }}>

        {/* ── LEFT — Photo panel ───────────────────────────── */}
        <div
          className="login-photo"
          style={{ display: "none", position: "relative", overflow: "hidden" }}
        >
          <img
            src="/fotos/galeria/training.jpg"
            alt="Formación Coffee Biochar"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.7) brightness(0.55)" }}
          />
          {/* Gradient overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(160deg, rgba(12,10,7,0.2) 0%, rgba(12,10,7,0.75) 100%)",
          }} />
          {/* Content */}
          <div style={{
            position: "relative", zIndex: 1,
            display: "flex", flexDirection: "column",
            justifyContent: "flex-end", padding: "48px",
            height: "100%",
          }}>
            <img
              src="/logo.png" alt="Coffee Biochar Academy"
              style={{ height: "80px", width: "auto", marginBottom: "28px" }}
            />
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "28px", fontWeight: 700,
              color: "rgba(255,255,255,0.92)",
              marginBottom: "12px", lineHeight: 1.3,
            }}>
              Formación para<br />extensionistas rurales
            </h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: "340px" }}>
              Aprende a producir biochar, mejorar suelos cafeteros y registrar el impacto de carbono en campo.
            </p>
            {/* Stats row */}
            <div style={{ display: "flex", gap: "28px", marginTop: "32px" }}>
              {[
                { n: "6", l: "Módulos" },
                { n: "+200", l: "Extensionistas" },
                { n: "100%", l: "Certificado" },
              ].map(({ n, l }) => (
                <div key={l}>
                  <p style={{ fontSize: "20px", fontWeight: 800, color: "#F5A623", lineHeight: 1 }}>{n}</p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</p>
                </div>
              ))}
            </div>
            <p style={{ marginTop: "32px", fontSize: "11px", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Biodiversal SAS BIC · Agricultura Regenerativa · Colombia
            </p>
          </div>
        </div>

        {/* ── RIGHT — Form ─────────────────────────────────── */}
        <div
          className="login-form-col"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 24px",
            gridColumn: "span 1",
          }}
        >
          <div style={{ width: "100%", maxWidth: "400px" }}>

            {/* Mobile logo */}
            <div className="login-logo-mobile" style={{ textAlign: "center", marginBottom: "32px" }}>
              <img src="/logo.png" alt="Coffee Biochar Academy" style={{ height: "64px", width: "auto" }} />
            </div>

            {/* Heading */}
            <div style={{ marginBottom: "28px" }}>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "26px", fontWeight: 700,
                color: "rgba(255,255,255,0.92)",
                marginBottom: "6px",
              }}>
                Bienvenido de nuevo
              </h1>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.38)" }}>
                Ingresa con tu cuenta para continuar tu programa
              </p>
            </div>

            {/* Email */}
            <div style={{ marginBottom: "14px" }}>
              <label
                htmlFor="login-email"
                style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: "7px", letterSpacing: "0.04em" }}
              >
                Correo electrónico
              </label>
              <input
                id="login-email"
                className="login-input"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={onKey}
                inputMode="email"
                autoComplete="email"
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "12px 14px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.85)",
                  fontSize: "15px", outline: "none",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "7px" }}>
                <label
                  htmlFor="login-password"
                  style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: "0.04em" }}
                >
                  Contraseña
                </label>
                <Link href="/forgot-password" style={{ fontSize: "12px", color: "rgba(245,166,35,0.65)", textDecoration: "none" }}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  className="login-input"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={onKey}
                  autoComplete="current-password"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "12px 44px 12px 14px", borderRadius: "10px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.85)",
                    fontSize: "15px", outline: "none",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  style={{
                    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,0.3)", padding: "4px",
                    display: "flex", alignItems: "center",
                  }}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M2 2l12 12M6.5 6.6A3 3 0 0011.4 11.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      <path d="M4 4.4C2.7 5.4 1.8 6.6 1.5 8c.9 3.3 4 5.5 6.5 5.5 1.4 0 2.8-.5 3.9-1.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      <path d="M6.4 3C7 2.8 7.7 2.5 8.5 2.5c2.5 0 5.1 2.2 6 5.5-.3 1-.8 1.9-1.5 2.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M1.5 8C2.4 4.7 5 2.5 8 2.5s5.6 2.2 6.5 5.5C13.6 11.3 11 13.5 8 13.5S2.4 11.3 1.5 8z" stroke="currentColor" strokeWidth="1.4"/>
                      <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginTop: "12px", padding: "10px 14px", borderRadius: "9px",
                background: "rgba(220,50,50,0.08)", border: "1px solid rgba(220,50,50,0.2)",
                fontSize: "13px", color: "#e87070", lineHeight: 1.5,
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={login}
              disabled={loading}
              style={{
                width: "100%", marginTop: "20px",
                padding: "13px",
                borderRadius: "10px",
                background: loading ? "rgba(245,166,35,0.5)" : "linear-gradient(135deg, #F5A623, #e0901a)",
                border: "none",
                color: "#0C0A07",
                fontSize: "15px", fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.15s, transform 0.1s",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = "0.9"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>

            {/* Register link */}
            <p style={{ textAlign: "center", marginTop: "18px", fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
              ¿No tienes cuenta?{" "}
              <Link href="/register" style={{ color: "#F5A623", fontWeight: 600, textDecoration: "none" }}>
                Regístrate
              </Link>
            </p>

            {/* Demo section */}
            <div style={{ marginTop: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
                <span style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.12em", whiteSpace: "nowrap" }}>
                  Explorar sin registrarse
                </span>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {/* Demo student */}
                <button
                  className="demo-btn-green"
                  onClick={() => loginDemo("student")}
                  disabled={demoLoading !== null || loading}
                  style={{
                    padding: "12px 10px", borderRadius: "10px", cursor: "pointer",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    textAlign: "left",
                    transition: "border-color 0.15s, background 0.15s",
                    opacity: demoLoading === "student" ? 0.6 : 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "4px" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "#7AB648", flexShrink: 0 }} aria-hidden="true">
                      <circle cx="7" cy="4.5" r="2.3" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>
                      {demoLoading === "student" ? "Entrando..." : "Demo Estudiante"}
                    </span>
                  </div>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", lineHeight: 1.4 }}>
                    Ve el programa como extensionista
                  </p>
                </button>

                {/* Demo admin */}
                <button
                  className="demo-btn"
                  onClick={() => loginDemo("admin")}
                  disabled={demoLoading !== null || loading}
                  style={{
                    padding: "12px 10px", borderRadius: "10px", cursor: "pointer",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    textAlign: "left",
                    transition: "border-color 0.15s, background 0.15s",
                    opacity: demoLoading === "admin" ? 0.6 : 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "4px" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "#F5A623", flexShrink: 0 }} aria-hidden="true">
                      <rect x="1.5" y="2" width="11" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                      <rect x="1.5" y="5.5" width="7" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                      <rect x="1.5" y="9" width="9" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                    </svg>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>
                      {demoLoading === "admin" ? "Entrando..." : "Demo Admin"}
                    </span>
                  </div>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", lineHeight: 1.4 }}>
                    Gestiona usuarios y progreso
                  </p>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
