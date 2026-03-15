"use client";

import { useState } from "react";
import { db } from "../../../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import AdminGuard from "../../components/AdminGuard";
import AdminNav from "../../components/AdminNav";
import { useModules } from "../../hooks/useModules";
import { useSessions } from "../../hooks/useSessions";

export default function AdminContent() {
  const { modules, refresh: refreshModules } = useModules();
  const { sessions, refresh: refreshSessions } = useSessions();

  const [moduleTitle,    setModuleTitle]    = useState("");
  const [moduleOrder,    setModuleOrder]    = useState<number>(1);
  const [moduleFormLink, setModuleFormLink] = useState("");
  const [moduleMsg,      setModuleMsg]      = useState<{ ok: boolean; text: string } | null>(null);

  const [sessionTitle,    setSessionTitle]    = useState("");
  const [sessionLink,     setSessionLink]     = useState("");
  const [sessionMaterial, setSessionMaterial] = useState("");
  const [selectedModule,  setSelectedModule]  = useState("");
  const [sessionMsg,      setSessionMsg]      = useState<{ ok: boolean; text: string } | null>(null);

  const createModule = async () => {
    if (!moduleTitle) { setModuleMsg({ ok: false, text: "El nombre del módulo es obligatorio" }); return; }
    try {
      await addDoc(collection(db, "modules"), {
        title: moduleTitle, order: moduleOrder, formLink: moduleFormLink, passingScore: 60,
      });
      setModuleTitle(""); setModuleFormLink("");
      setModuleMsg({ ok: true, text: "Módulo creado correctamente" });
      refreshModules();
    } catch { setModuleMsg({ ok: false, text: "Error al crear el módulo" }); }
  };

  const createSession = async () => {
    if (!sessionTitle || !selectedModule) { setSessionMsg({ ok: false, text: "Título y módulo son obligatorios" }); return; }
    try {
      await addDoc(collection(db, "sessions"), {
        title: sessionTitle, link: sessionLink, material: sessionMaterial, moduleId: selectedModule, locked: false,
      });
      setSessionTitle(""); setSessionLink(""); setSessionMaterial(""); setSelectedModule("");
      setSessionMsg({ ok: true, text: "Sesión creada correctamente" });
      refreshSessions();
    } catch { setSessionMsg({ ok: false, text: "Error al crear la sesión" }); }
  };

  return (
    <AdminGuard>
      <div className="page-wrap">
        <AdminNav />
        <div className="admin-content">

          <h1 className="heading-1 fade-up" style={{ marginBottom: "40px" }}>Gestión de contenido</h1>

          <div className="grid-2" style={{ gap: "32px", alignItems: "start" }}>

            {/* CREATE MODULE */}
            <div className="card fade-up-1" style={{ padding: "28px" }}>
              <h2 className="heading-3" style={{ marginBottom: "4px" }}>Nuevo módulo</h2>
              <p className="body-sm" style={{ marginBottom: "20px" }}>Agrega un módulo al programa</p>

              <div className="form-group" style={{ marginTop: 0 }}>
                <label className="form-label">Nombre del módulo *</label>
                <input className="input" placeholder="Ej: Fundamentos del biochar"
                  value={moduleTitle} onChange={e => setModuleTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Orden</label>
                <input className="input" type="number" placeholder="1"
                  value={moduleOrder} onChange={e => setModuleOrder(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Link de evaluación (Google Forms)</label>
                <input className="input" placeholder="https://forms.google.com/..."
                  value={moduleFormLink} onChange={e => setModuleFormLink(e.target.value)} />
              </div>

              {moduleMsg && (
                <p className={moduleMsg.ok ? "msg-success" : "msg-error"}>{moduleMsg.text}</p>
              )}

              <button className="btn btn-primary btn-full" style={{ marginTop: "24px" }} onClick={createModule}>
                Crear módulo
              </button>
            </div>

            {/* CREATE SESSION */}
            <div className="card fade-up-2" style={{ padding: "28px" }}>
              <h2 className="heading-3" style={{ marginBottom: "4px" }}>Nueva sesión</h2>
              <p className="body-sm" style={{ marginBottom: "20px" }}>Agrega una sesión a un módulo</p>

              <div className="form-group" style={{ marginTop: 0 }}>
                <label className="form-label">Título de la sesión *</label>
                <input className="input" placeholder="Ej: Introducción al biochar"
                  value={sessionTitle} onChange={e => setSessionTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Link del video</label>
                <input className="input" placeholder="https://youtube.com/..."
                  value={sessionLink} onChange={e => setSessionLink(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Material adicional (URL)</label>
                <input className="input" placeholder="https://drive.google.com/..."
                  value={sessionMaterial} onChange={e => setSessionMaterial(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Módulo *</label>
                <select className="input" value={selectedModule} onChange={e => setSelectedModule(e.target.value)}>
                  <option value="">Seleccionar módulo</option>
                  {modules.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>

              {sessionMsg && (
                <p className={sessionMsg.ok ? "msg-success" : "msg-error"}>{sessionMsg.text}</p>
              )}

              <button className="btn btn-amber btn-full" style={{ marginTop: "24px" }} onClick={createSession}>
                Crear sesión
              </button>
            </div>
          </div>

          {/* MODULE LIST */}
          <h2 className="heading-2" style={{ marginTop: "48px", marginBottom: "16px" }}>
            Módulos existentes
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {modules.map(module => {
              const count = sessions.filter(s => s.moduleId === module.id).length;
              return (
                <div key={module.id} className="card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px" }}>
                  <div className="mod-num">{String(module.order).padStart(2, "0")}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500, fontSize: "15px", marginBottom: "2px" }}>{module.title}</p>
                    <p className="body-sm">{count} sesiones</p>
                  </div>
                  <span className="badge badge-muted">Orden {module.order}</span>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </AdminGuard>
  );
}
