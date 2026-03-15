"use client";

import { useState } from "react";
import Link from "next/link";
import { db } from "../../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const [name,      setName]      = useState("");
  const [municipio, setMunicipio] = useState("");
  const [finca,     setFinca]     = useState("");
  const [cluster,   setCluster]   = useState("");
  const [telefono,  setTelefono]  = useState("");
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState(false);
  const [loading,   setLoading]   = useState(false);

  const register = async () => {
    if (!name || !municipio || !cluster) {
      setError("Nombre, municipio y cluster son obligatorios");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await addDoc(collection(db, "users"), {
        name, municipio, finca, cluster, telefono, progress: 0,
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Error al registrar. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-wrap">
        <div className="auth-card fade-up" style={{ textAlign: "center" }}>
          <img src="/logo.png" alt="Coffee Biochar" style={{ height: "60px", margin: "0 auto 24px" }} />
          <div style={{
            width: "52px", height: "52px", borderRadius: "50%",
            background: "var(--green-glow)", border: "1px solid var(--green-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: "22px", color: "var(--green)",
          }}>✓</div>
          <h2 className="heading-3">¡Registro exitoso!</h2>
          <p className="body-sm" style={{ marginTop: "8px" }}>Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-deep)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div className="auth-card fade-up" style={{ maxWidth: "500px" }}>

        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <img src="/logo.png" alt="Coffee Biochar" style={{ height: "60px", width: "auto" }} />
        </div>

        <h2 className="heading-3" style={{ marginBottom: "4px" }}>Registro de extensionista</h2>
        <p className="body-sm" style={{ marginBottom: "24px" }}>
          Crea tu cuenta para acceder al programa de formación
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
            <label className="form-label">Cluster *</label>
            <input className="input" placeholder="Cluster asignado" value={cluster}
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

        {error && <p className="msg-error">{error}</p>}

        <button
          className="btn btn-primary btn-full"
          style={{ marginTop: "24px" }}
          onClick={register}
          disabled={loading}
        >
          {loading ? "Registrando..." : "Crear cuenta"}
        </button>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "var(--text-muted)" }}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" style={{ color: "var(--amber)", fontWeight: 500 }}>Iniciar sesión</Link>
        </p>

      </div>
    </div>
  );
}
