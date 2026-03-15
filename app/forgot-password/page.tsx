"use client";

import { useState } from "react";
import Link from "next/link";
import { auth } from "../../firebase/config";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [msg,     setMsg]     = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email) { setMsg({ ok: false, text: "Ingresa tu correo electrónico" }); return; }

    setLoading(true);
    setMsg(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setMsg({ ok: true, text: "Te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada." });
      setEmail("");
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : "";
      if (err.includes("user-not-found") || err.includes("invalid-email")) {
        setMsg({ ok: false, text: "No encontramos una cuenta con ese correo." });
      } else {
        setMsg({ ok: false, text: "No pudimos enviar el correo. Inténtalo de nuevo." });
      }
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") submit(); };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-deep)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div className="auth-card fade-up" style={{ maxWidth: "420px" }}>

        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <img src="/logo.png" alt="Coffee Biochar" style={{ height: "60px", width: "auto" }} />
        </div>

        {msg?.ok ? (
          /* Success state */
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%",
              background: "var(--green-glow)", border: "1px solid var(--green-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", color: "var(--green-accent)",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="heading-3" style={{ marginBottom: "10px" }}>Correo enviado</h2>
            <p className="body-sm" style={{ lineHeight: 1.7, marginBottom: "8px" }}>{msg.text}</p>
            <p className="body-sm" style={{ color: "var(--text-muted)", marginBottom: "28px" }}>
              Si no ves el correo, revisa tu carpeta de spam.
            </p>
            <Link href="/login">
              <button className="btn btn-outline btn-full" style={{ cursor: "pointer" }}>
                Volver al inicio de sesión
              </button>
            </Link>
          </div>
        ) : (
          /* Form state */
          <>
            <h2 className="heading-3" style={{ marginBottom: "4px" }}>¿Olvidaste tu contraseña?</h2>
            <p className="body-sm" style={{ marginBottom: "28px" }}>
              Ingresa tu correo y te enviaremos un enlace para restablecerla.
            </p>

            <div className="form-group" style={{ marginTop: 0 }}>
              <label className="form-label">Correo electrónico</label>
              <input
                className="input"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={onKey}
                inputMode="email"
                autoComplete="email"
                autoFocus
              />
            </div>

            {msg && <p className="msg-error">{msg.text}</p>}

            <button
              className="btn btn-primary btn-full"
              style={{ marginTop: "24px", cursor: "pointer" }}
              onClick={submit}
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>

            <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "var(--text-muted)" }}>
              <Link href="/login" style={{ color: "var(--amber)", fontWeight: 500 }}>
                ← Volver al inicio de sesión
              </Link>
            </p>
          </>
        )}

      </div>
    </div>
  );
}
