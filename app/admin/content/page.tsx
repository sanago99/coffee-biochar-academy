"use client";

import { useState } from "react";
import { db } from "../../../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import AdminGuard from "../../components/AdminGuard";
import AdminNav from "../../components/AdminNav";
import { useModules } from "../../hooks/useModules";
import { useSessions } from "../../hooks/useSessions";

const IconSession = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M5 4.5l3.5 2L5 8.5V4.5z" fill="currentColor"/>
  </svg>
);
const IconMod = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <rect x="1.5" y="2" width="10" height="2" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="1.5" y="5.5" width="6.5" height="2" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="1.5" y="9" width="8" height="2" rx="1" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
);

export default function AdminContent() {
  const { modules, refresh: refreshModules } = useModules();
  const { sessions, refresh: refreshSessions } = useSessions();

  const [moduleTitle,    setModuleTitle]    = useState("");
  const [moduleOrder,    setModuleOrder]    = useState<number>(1);
  const [moduleFormLink, setModuleFormLink] = useState("");
  const [moduleMsg,      setModuleMsg]      = useState<{ ok: boolean; text: string } | null>(null);
  const [modLoading,     setModLoading]     = useState(false);

  const [sessionTitle,    setSessionTitle]    = useState("");
  const [sessionLink,     setSessionLink]     = useState("");
  const [sessionMaterial, setSessionMaterial] = useState("");
  const [selectedModule,  setSelectedModule]  = useState("");
  const [sessionMsg,      setSessionMsg]      = useState<{ ok: boolean; text: string } | null>(null);
  const [sesLoading,      setSesLoading]      = useState(false);

  const [expandedMod, setExpandedMod] = useState<string | null>(null);

  const createModule = async () => {
    if (!moduleTitle) { setModuleMsg({ ok: false, text: "El nombre del módulo es obligatorio" }); return; }
    setModLoading(true);
    try {
      await addDoc(collection(db, "modules"), { title: moduleTitle, order: moduleOrder, formLink: moduleFormLink, passingScore: 70 });
      setModuleTitle(""); setModuleFormLink(""); setModuleOrder(modules.length + 2);
      setModuleMsg({ ok: true, text: `Módulo "${moduleTitle}" creado` });
      refreshModules();
    } catch { setModuleMsg({ ok: false, text: "Error al crear el módulo" }); }
    setModLoading(false);
  };

  const createSession = async () => {
    if (!sessionTitle || !selectedModule) { setSessionMsg({ ok: false, text: "Título y módulo son obligatorios" }); return; }
    setSesLoading(true);
    try {
      await addDoc(collection(db, "sessions"), { title: sessionTitle, link: sessionLink, material: sessionMaterial, moduleId: selectedModule, locked: false });
      setSessionTitle(""); setSessionLink(""); setSessionMaterial(""); setSelectedModule("");
      setSessionMsg({ ok: true, text: `Sesión "${sessionTitle}" creada` });
      refreshSessions();
    } catch { setSessionMsg({ ok: false, text: "Error al crear la sesión" }); }
    setSesLoading(false);
  };

  return (
    <AdminGuard>
      <div className="page-wrap">
        <AdminNav />
        <div className="admin-content">

          <div className="fade-up" style={{ marginBottom: "32px" }}>
            <p className="eyebrow" style={{ marginBottom: "4px" }}>Gestión</p>
            <h1 className="heading-1">Contenido del programa</h1>
          </div>

          {/* Forms row */}
          <div className="grid-2 fade-up-1" style={{ gap: "24px", alignItems: "start", marginBottom: "40px" }}>

            {/* MODULE FORM */}
            <div className="card" style={{ padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "var(--radius-sm)", background: "var(--green-glow)", border: "1px solid var(--green-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)" }}>
                  <IconMod />
                </div>
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "17px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "1px" }}>Nuevo módulo</h2>
                  <p className="body-sm" style={{ fontSize: "12px" }}>Agrega un módulo al programa</p>
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="mod-title">Nombre del módulo *</label>
                <input id="mod-title" className="input" placeholder="Ej: Fundamentos del biochar"
                  value={moduleTitle} onChange={e => setModuleTitle(e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "14px" }}>
                <div>
                  <label className="form-label" htmlFor="mod-order">Orden</label>
                  <input id="mod-order" className="input" type="number" min={1} value={moduleOrder}
                    onChange={e => setModuleOrder(Number(e.target.value))} />
                </div>
                <div>
                  <label className="form-label" htmlFor="mod-passing">Puntos mínimos</label>
                  <input id="mod-passing" className="input" type="number" value="70" disabled
                    style={{ opacity: 0.45, cursor: "not-allowed", background: "var(--bg-elevated)", color: "var(--text-muted)" }}
                    title="El puntaje mínimo está fijo en 70" />
                </div>
              </div>
              <div style={{ marginTop: "14px" }}>
                <label className="form-label" htmlFor="mod-form">Link de evaluación (Google Forms)</label>
                <input id="mod-form" className="input" placeholder="https://forms.google.com/..."
                  value={moduleFormLink} onChange={e => setModuleFormLink(e.target.value)} />
              </div>

              {moduleMsg && <p className={moduleMsg.ok ? "msg-success" : "msg-error"}>{moduleMsg.text}</p>}

              <button className="btn btn-green btn-full" style={{ marginTop: "20px", cursor: "pointer" }}
                onClick={createModule} disabled={modLoading}>
                {modLoading ? "Creando..." : "Crear módulo"}
              </button>
            </div>

            {/* SESSION FORM */}
            <div className="card" style={{ padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "var(--radius-sm)", background: "var(--amber-glow)", border: "1px solid var(--amber-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--amber)" }}>
                  <IconSession />
                </div>
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "17px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "1px" }}>Nueva sesión</h2>
                  <p className="body-sm" style={{ fontSize: "12px" }}>Agrega una sesión a un módulo</p>
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="ses-module">Módulo *</label>
                <select id="ses-module" className="input" value={selectedModule} onChange={e => setSelectedModule(e.target.value)}>
                  <option value="">Seleccionar módulo</option>
                  {modules.map(m => <option key={m.id} value={m.id}>{String(m.order).padStart(2,"0")} · {m.title}</option>)}
                </select>
              </div>
              <div style={{ marginTop: "14px" }}>
                <label className="form-label" htmlFor="ses-title">Título de la sesión *</label>
                <input id="ses-title" className="input" placeholder="Ej: Comunicación efectiva"
                  value={sessionTitle} onChange={e => setSessionTitle(e.target.value)} />
              </div>
              <div style={{ marginTop: "14px" }}>
                <label className="form-label" htmlFor="ses-link">Link del video (YouTube / Drive)</label>
                <input id="ses-link" className="input" placeholder="https://youtube.com/watch?v=..."
                  value={sessionLink} onChange={e => setSessionLink(e.target.value)} />
              </div>
              <div style={{ marginTop: "14px" }}>
                <label className="form-label" htmlFor="ses-material">Material adicional (URL)</label>
                <input id="ses-material" className="input" placeholder="https://drive.google.com/..."
                  value={sessionMaterial} onChange={e => setSessionMaterial(e.target.value)} />
              </div>

              {sessionMsg && <p className={sessionMsg.ok ? "msg-success" : "msg-error"}>{sessionMsg.text}</p>}

              <button className="btn btn-primary btn-full" style={{ marginTop: "20px", cursor: "pointer" }}
                onClick={createSession} disabled={sesLoading}>
                {sesLoading ? "Creando..." : "Crear sesión"}
              </button>
            </div>
          </div>

          {/* MODULE LIST */}
          <div className="fade-up-2">
            <div className="flex-between" style={{ marginBottom: "16px" }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", fontWeight: 600 }}>
                Módulos del programa
              </h2>
              <span className="badge badge-muted">{modules.length} módulos · {sessions.length} sesiones</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {modules.length === 0 && (
                <div className="card" style={{ padding: "40px", textAlign: "center" }}>
                  <p className="body-sm">Aún no hay módulos. Crea el primero arriba.</p>
                </div>
              )}
              {modules.map(module => {
                const modSessions = sessions.filter(s => s.moduleId === module.id);
                const isOpen = expandedMod === module.id;
                return (
                  <div key={module.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                    {/* Header */}
                    <div
                      style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px", cursor: "pointer" }}
                      onClick={() => setExpandedMod(isOpen ? null : module.id)}
                    >
                      <div className="mod-num">{String(module.order).padStart(2, "0")}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: "15px", color: "var(--text-primary)", marginBottom: "2px" }}>{module.title}</p>
                        <p className="body-sm">{modSessions.length} sesión{modSessions.length !== 1 ? "es" : ""}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="badge badge-muted" style={{ fontSize: "11px" }}>
                          {modSessions.length} sesiones
                        </span>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--text-muted)", transition: "transform .2s", transform: isOpen ? "rotate(180deg)" : "" }}>
                          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>

                    {/* Sessions */}
                    {isOpen && (
                      <div style={{ borderTop: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
                        {modSessions.length === 0 ? (
                          <p className="body-sm" style={{ padding: "14px 20px" }}>Sin sesiones — crea una arriba seleccionando este módulo.</p>
                        ) : (
                          modSessions.map((s, i) => (
                            <div key={s.id} style={{
                              display: "flex", alignItems: "center", gap: "12px",
                              padding: "12px 20px",
                              borderBottom: i < modSessions.length - 1 ? "1px solid var(--border)" : undefined,
                            }}>
                              <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "var(--amber-glow)", border: "1px solid var(--amber-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--amber)", flexShrink: 0 }}>
                                <IconSession />
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "1px" }}>{s.title}</p>
                                {s.link && <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Video · {s.link.slice(0, 50)}{s.link.length > 50 ? "…" : ""}</p>}
                              </div>
                              <div style={{ display: "flex", gap: "6px" }}>
                                {s.material && (
                                  <a href={s.material} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ fontSize: "11px", padding: "4px 10px", minHeight: "28px" }}>Material</a>
                                )}
                                {s.link && (
                                  <a href={s.link} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ fontSize: "11px", padding: "4px 10px", minHeight: "28px" }}>Video</a>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </AdminGuard>
  );
}
