"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../firebase/config";
import { setDoc, doc } from "firebase/firestore";
import AdminGuard from "../../components/AdminGuard";
import AdminNav from "../../components/AdminNav";

export default function CreateUser() {
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [municipio, setMunicipio] = useState("");
  const [cluster,   setCluster]   = useState("");
  const [msg,       setMsg]       = useState<{ ok: boolean; text: string } | null>(null);
  const [loading,   setLoading]   = useState(false);

  const createUser = async () => {
    if (!name || !email || !password || !municipio || !cluster) {
      setMsg({ ok: false, text: "Todos los campos son obligatorios" });
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", user.uid), {
        name, email, municipio, cluster,
        role: "user", progress: 0, createdAt: new Date(),
      });

      setMsg({ ok: true, text: "Extensionista creado correctamente" });
      setName(""); setEmail(""); setPassword(""); setMunicipio(""); setCluster("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setMsg({ ok: false, text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="page-wrap">
        <AdminNav />
        <div className="admin-content">

          <div style={{ maxWidth: "520px" }}>
            <a href="/admin/users" style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px", display: "block" }}>
              ← Volver a usuarios
            </a>

            <h1 className="heading-1 fade-up" style={{ marginBottom: "4px" }}>Crear extensionista</h1>
            <p className="body-sm fade-up-1" style={{ marginBottom: "32px" }}>
              Crea una cuenta de acceso para un nuevo extensionista
            </p>

            <div className="card fade-up-2" style={{ padding: "32px" }}>

              <div className="grid-2" style={{ gap: "16px" }}>
                <div>
                  <label className="form-label">Nombre completo *</label>
                  <input className="input" placeholder="Nombre y apellido"
                    value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Municipio *</label>
                  <input className="input" placeholder="Municipio"
                    value={municipio} onChange={e => setMunicipio(e.target.value)} />
                </div>
              </div>

              <div style={{ marginTop: "16px" }}>
                <label className="form-label">Cluster *</label>
                <input className="input" placeholder="Cluster asignado"
                  value={cluster} onChange={e => setCluster(e.target.value)} />
              </div>

              <div className="divider-sm" />

              <div>
                <label className="form-label">Correo electrónico *</label>
                <input className="input" type="email" placeholder="correo@ejemplo.com"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div style={{ marginTop: "16px" }}>
                <label className="form-label">Contraseña *</label>
                <input className="input" type="password" placeholder="Mínimo 6 caracteres"
                  value={password} onChange={e => setPassword(e.target.value)} />
              </div>

              {msg && (
                <p className={msg.ok ? "msg-success" : "msg-error"}>{msg.text}</p>
              )}

              <button
                className="btn btn-primary btn-full"
                style={{ marginTop: "24px" }}
                onClick={createUser}
                disabled={loading}
              >
                {loading ? "Creando cuenta..." : "Crear extensionista"}
              </button>

            </div>
          </div>

        </div>
      </div>
    </AdminGuard>
  );
}
