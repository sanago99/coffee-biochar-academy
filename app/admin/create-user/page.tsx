"use client";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../firebase/config";
import { setDoc, doc, collection, getDocs } from "firebase/firestore";
import AdminGuard from "../../components/AdminGuard";
import AdminNav from "../../components/AdminNav";

const IconBack = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function CreateUser() {
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [municipio, setMunicipio] = useState("");
  const [cluster,   setCluster]   = useState("");
  const [clusters,  setClusters]  = useState<string[]>([]);
  const [finca,     setFinca]     = useState("");
  const [telefono,  setTelefono]  = useState("");
  const [msg,       setMsg]       = useState<{ ok: boolean; text: string } | null>(null);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    getDocs(collection(db, "users")).then(snap => {
      const unique = Array.from(new Set(
        snap.docs.map(d => d.data().cluster as string).filter(Boolean)
      )).sort();
      setClusters(unique);
    });
  }, []);

  const reset = (keepCluster = false) => {
    setName(""); setEmail(""); setPassword(""); setMunicipio("");
    if (!keepCluster) setCluster("");
    setFinca(""); setTelefono("");
  };

  const createUser = async () => {
    if (!name || !email || !password || !municipio || !cluster) {
      setMsg({ ok: false, text: "Nombre, municipio, clúster, correo y contraseña son obligatorios" });
      return;
    }
    if (password.length < 6) {
      setMsg({ ok: false, text: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", user.uid), {
        name, email, municipio, cluster, finca, telefono,
        role: "user", progress: 0, createdAt: new Date(),
      });
      setMsg({ ok: true, text: `Cuenta creada para ${name}. Ya puede iniciar sesión.` });
      reset(false);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "Error desconocido";
      if (errMsg.includes("email-already-in-use")) {
        setMsg({ ok: false, text: "Ya existe una cuenta con ese correo." });
      } else if (errMsg.includes("invalid-email")) {
        setMsg({ ok: false, text: "El formato del correo no es válido." });
      } else {
        setMsg({ ok: false, text: errMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="page-wrap">
        <AdminNav />
        <div className="admin-content">

          <div style={{ maxWidth: "560px" }}>
            {/* Back */}
            <a href="/admin/users" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px", cursor: "pointer" }}>
              <IconBack /> Volver a usuarios
            </a>

            {/* Header */}
            <div className="fade-up" style={{ marginBottom: "28px" }}>
              <p className="eyebrow" style={{ marginBottom: "4px" }}>Gestión de usuarios</p>
              <h1 className="heading-1" style={{ marginBottom: "4px" }}>Crear extensionista</h1>
              <p className="body-sm">Crea una cuenta de acceso con email y contraseña</p>
            </div>

            <div className="card fade-up-1" style={{ padding: "32px" }}>

              {/* Datos personales */}
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "16px" }}>
                Datos personales
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label className="form-label">Nombre completo *</label>
                  <input className="input" placeholder="Nombre y apellido" value={name}
                    onChange={e => setName(e.target.value)} autoComplete="off" />
                </div>
                <div>
                  <label className="form-label">Municipio *</label>
                  <input className="input" placeholder="Ej: Ataco" value={municipio}
                    onChange={e => setMunicipio(e.target.value)} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "14px" }}>
                <div>
                  <label className="form-label">Clúster *</label>
                  <input
                    className="input"
                    list="clusters-list"
                    placeholder="Ej: Cluster 3 – Nariño"
                    value={cluster}
                    onChange={e => setCluster(e.target.value)}
                    autoComplete="off"
                  />
                  <datalist id="clusters-list">
                    {clusters.map(c => <option key={c} value={c} />)}
                  </datalist>
                  {clusters.length > 0 && (
                    <p className="body-sm" style={{ marginTop: "5px", fontSize: "11px" }}>
                      {clusters.length} clúster{clusters.length !== 1 ? "s" : ""} existente{clusters.length !== 1 ? "s" : ""}
                    </p>
                  )}
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
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "16px" }}>
                Credenciales de acceso
              </p>

              <div>
                <label className="form-label">Correo electrónico *</label>
                <input className="input" type="email" placeholder="correo@ejemplo.com" value={email}
                  onChange={e => setEmail(e.target.value)} autoComplete="off" />
              </div>
              <div style={{ marginTop: "14px" }}>
                <label className="form-label">Contraseña *</label>
                <input className="input" type="password" placeholder="Mínimo 6 caracteres" value={password}
                  onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
                <p className="body-sm" style={{ marginTop: "6px", fontSize: "11px" }}>
                  El extensionista podrá cambiarla desde su perfil.
                </p>
              </div>

              {msg && <p className={msg.ok ? "msg-success" : "msg-error"}>{msg.text}</p>}

              <div style={{ marginTop: "24px", display: "flex", gap: "10px" }}>
                <button className="btn btn-primary" style={{ flex: 1, cursor: "pointer" }}
                  onClick={createUser} disabled={loading}>
                  {loading ? "Creando cuenta..." : "Crear extensionista"}
                </button>
                {msg?.ok && (
                  <button
                    className="btn btn-ghost"
                    style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                    onClick={() => { reset(true); setMsg(null); }}
                  >
                    + Crear otro
                  </button>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </AdminGuard>
  );
}
