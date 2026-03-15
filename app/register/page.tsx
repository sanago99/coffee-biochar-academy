"use client";

import { useState } from "react";
import Link from "next/link";
import { auth, db } from "../../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Register() {
  const [name,      setName]      = useState("");
  const [municipio, setMunicipio] = useState("");
  const [finca,     setFinca]     = useState("");
  const [cluster,   setCluster]   = useState("");
  const [telefono,  setTelefono]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState(false);
  const [loading,   setLoading]   = useState(false);

  const register = async () => {
    if (!name || !municipio || !cluster || !email || !password) {
      setError("Nombre, municipio, clúster, correo y contraseña son obligatorios");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", user.uid), {
        name, municipio, finca, cluster, telefono,
        email, role: "user", progress: 0,
        status: "pending",
        createdAt: new Date(),
      });

      setSuccess(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("email-already-in-use")) {
        setError("Ya existe una cuenta con ese correo electrónico.");
      } else if (msg.includes("invalid-email")) {
        setError("El formato del correo no es válido.");
      } else {
        setError("Error al registrar. Inténtalo de nuevo.");
      }
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-wrap" style={{ background: "var(--bg-deep)" }}>
        <div className="auth-card fade-up" style={{ textAlign: "center", maxWidth: "440px" }}>
          <img src="/logo.png" alt="Coffee Biochar" style={{ height: "60px", margin: "0 auto 24px" }} />

          <div style={{
            width: "56px", height: "56px", borderRadius: "50%",
            background: "var(--amber-glow)", border: "1px solid var(--amber-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", color: "var(--amber)",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="currentColor" opacity=".35"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 7v6M12 16v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>

          <h2 className="heading-3" style={{ marginBottom: "10px" }}>Registro recibido</h2>
          <p className="body-sm" style={{ marginBottom: "8px", lineHeight: 1.7 }}>
            Tu cuenta fue creada exitosamente. El equipo de Coffee Biochar
            verificará tu información y activará tu acceso.
          </p>
          <p className="body-sm" style={{ color: "var(--amber)" }}>
            Te avisaremos cuando puedas ingresar.
          </p>

          <div style={{ marginTop: "28px", padding: "14px 16px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "4px" }}>
              Correo registrado
            </p>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{email}</p>
          </div>

          <Link href="/login">
            <button className="btn btn-outline btn-full" style={{ marginTop: "20px", cursor: "pointer" }}>
              Ir al inicio de sesión
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-deep)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div className="auth-card fade-up" style={{ maxWidth: "500px" }}>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <img src="/logo.png" alt="Coffee Biochar" style={{ height: "60px", width: "auto" }} />
        </div>

        <h2 className="heading-3" style={{ marginBottom: "4px" }}>Registro de extensionista</h2>
        <p className="body-sm" style={{ marginBottom: "24px" }}>
          Tu cuenta quedará pendiente hasta que el equipo la verifique.
        </p>

        {/* Datos personales */}
        <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "14px" }}>
          Datos personales
        </p>

        <div className="grid-2" style={{ gap: "14px" }}>
          <div>
            <label className="form-label">Nombre completo *</label>
            <input className="input" placeholder="Tu nombre" value={name}
              onChange={e => setName(e.target.value)} autoComplete="name" />
          </div>
          <div>
            <label className="form-label">Municipio *</label>
            <input className="input" placeholder="Tu municipio" value={municipio}
              onChange={e => setMunicipio(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Clúster *</label>
            <input className="input" placeholder="Clúster asignado" value={cluster}
              onChange={e => setCluster(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Finca</label>
            <input className="input" placeholder="Nombre de la finca" value={finca}
              onChange={e => setFinca(e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: "14px" }}>
          <label className="form-label">Teléfono</label>
          <input className="input" placeholder="300 000 0000" value={telefono}
            onChange={e => setTelefono(e.target.value)} inputMode="tel" />
        </div>

        <div className="divider-sm" />

        {/* Credenciales */}
        <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "14px" }}>
          Acceso a la plataforma
        </p>

        <div>
          <label className="form-label">Correo electrónico *</label>
          <input className="input" type="email" placeholder="tu@correo.com" value={email}
            onChange={e => setEmail(e.target.value)} inputMode="email" autoComplete="email" />
        </div>
        <div style={{ marginTop: "14px" }}>
          <label className="form-label">Contraseña *</label>
          <input className="input" type="password" placeholder="Mínimo 6 caracteres" value={password}
            onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
        </div>

        {error && <p className="msg-error">{error}</p>}

        <button
          className="btn btn-primary btn-full"
          style={{ marginTop: "24px", cursor: "pointer" }}
          onClick={register}
          disabled={loading}
        >
          {loading ? "Creando cuenta..." : "Solicitar acceso"}
        </button>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "var(--text-muted)" }}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" style={{ color: "var(--amber)", fontWeight: 500 }}>Iniciar sesión</Link>
        </p>

      </div>
    </div>
  );
}
