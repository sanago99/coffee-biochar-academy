"use client";

import { useState } from "react";
import { db } from "../../../firebase/config";
import { collection, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import AdminGuard from "../../components/AdminGuard";
import AdminNav from "../../components/AdminNav";
import ConfirmModal from "../../components/ConfirmModal";
import { useModules } from "../../hooks/useModules";
import { useSessions } from "../../hooks/useSessions";
import type { Module, Session } from "../../types";

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
const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M9 2l2 2-7 7H2V9l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M2 3.5h9M5 3.5V2.5h3v1M4.5 3.5l.5 7h3l.5-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function AdminContent() {
  const { modules, refresh: refreshModules } = useModules();
  const { sessions, refresh: refreshSessions } = useSessions();

  /* ── Create module ── */
  const [moduleTitle,    setModuleTitle]    = useState("");
  const [moduleOrder,    setModuleOrder]    = useState<number>(1);
  const [moduleFormLink, setModuleFormLink] = useState("");
  const [moduleMsg,      setModuleMsg]      = useState<{ ok: boolean; text: string } | null>(null);
  const [modLoading,     setModLoading]     = useState(false);

  /* ── Create session ── */
  const [sessionTitle,       setSessionTitle]       = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [sessionLink,        setSessionLink]        = useState("");
  const [sessionMaterial,    setSessionMaterial]    = useState("");
  const [selectedModule,     setSelectedModule]     = useState("");
  const [sessionMsg,      setSessionMsg]      = useState<{ ok: boolean; text: string } | null>(null);
  const [sesLoading,      setSesLoading]      = useState(false);

  /* ── Expand/collapse ── */
  const [expandedMod, setExpandedMod] = useState<string | null>(null);

  /* ── Edit module ── */
  const [editingMod,  setEditingMod]  = useState<string | null>(null);
  const [editModData, setEditModData] = useState<{ title: string; order: number; formLink: string }>({ title: "", order: 1, formLink: "" });
  const [savingMod,   setSavingMod]   = useState(false);

  /* ── Edit session ── */
  const [editingSes,  setEditingSes]  = useState<string | null>(null);
  const [editSesData, setEditSesData] = useState<{ title: string; description: string; link: string; material: string }>({ title: "", description: "", link: "", material: "" });
  const [savingSes,   setSavingSes]   = useState(false);

  /* ── Delete confirm ── */
  const [confirmDelete, setConfirmDelete] = useState<{ type: "module" | "session"; id: string; name: string; hasChildren?: boolean } | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ── Create handlers ── */
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
      await addDoc(collection(db, "sessions"), { title: sessionTitle, description: sessionDescription, link: sessionLink, material: sessionMaterial, moduleId: selectedModule, locked: false });
      setSessionTitle(""); setSessionDescription(""); setSessionLink(""); setSessionMaterial(""); setSelectedModule("");
      setSessionMsg({ ok: true, text: `Sesión "${sessionTitle}" creada` });
      refreshSessions();
    } catch { setSessionMsg({ ok: false, text: "Error al crear la sesión" }); }
    setSesLoading(false);
  };

  /* ── Edit module handlers ── */
  const startEditMod = (m: Module) => {
    setEditingMod(m.id);
    setEditModData({ title: m.title, order: m.order, formLink: m.formLink ?? "" });
    setExpandedMod(m.id);
  };

  const saveEditMod = async (id: string) => {
    if (!editModData.title) return;
    setSavingMod(true);
    try {
      await updateDoc(doc(db, "modules", id), {
        title: editModData.title,
        order: editModData.order,
        formLink: editModData.formLink,
      });
      setEditingMod(null);
      refreshModules();
    } finally {
      setSavingMod(false);
    }
  };

  /* ── Edit session handlers ── */
  const startEditSes = (s: Session) => {
    setEditingSes(s.id);
    setEditSesData({ title: s.title, description: s.description ?? "", link: s.link ?? "", material: s.material ?? "" });
  };

  const saveEditSes = async (id: string) => {
    if (!editSesData.title) return;
    setSavingSes(true);
    try {
      await updateDoc(doc(db, "sessions", id), {
        title: editSesData.title,
        description: editSesData.description,
        link: editSesData.link,
        material: editSesData.material,
      });
      setEditingSes(null);
      refreshSessions();
    } finally {
      setSavingSes(false);
    }
  };

  /* ── Delete handlers ── */
  const confirmDeleteMod = (m: Module) => {
    const hasSessions = sessions.some(s => s.moduleId === m.id);
    setConfirmDelete({ type: "module", id: m.id, name: m.title, hasChildren: hasSessions });
  };

  const confirmDeleteSes = (s: Session) => {
    setConfirmDelete({ type: "session", id: s.id, name: s.title });
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      if (confirmDelete.type === "module") {
        // Delete module and all its sessions
        const modSessions = sessions.filter(s => s.moduleId === confirmDelete.id);
        await Promise.all(modSessions.map(s => deleteDoc(doc(db, "sessions", s.id))));
        await deleteDoc(doc(db, "modules", confirmDelete.id));
        if (expandedMod === confirmDelete.id) setExpandedMod(null);
        refreshModules();
        refreshSessions();
      } else {
        await deleteDoc(doc(db, "sessions", confirmDelete.id));
        refreshSessions();
      }
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
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
                <label className="form-label" htmlFor="ses-desc">Descripción breve</label>
                <textarea id="ses-desc" className="input" placeholder="Ej: Aprende los fundamentos del biochar y su aplicación..." rows={2}
                  value={sessionDescription} onChange={e => setSessionDescription(e.target.value)}
                  style={{ resize: "vertical", minHeight: "64px" }} />
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
                const isOpen    = expandedMod === module.id;
                const isEditing = editingMod === module.id;

                return (
                  <div key={module.id} className="card" style={{ padding: 0, overflow: "hidden" }}>

                    {/* Module header / edit form */}
                    {isEditing ? (
                      <div style={{ padding: "16px 20px", background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                        <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--amber)", marginBottom: "12px" }}>
                          Editando módulo
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", marginBottom: "10px" }}>
                          <input
                            className="input"
                            placeholder="Nombre del módulo"
                            value={editModData.title}
                            onChange={e => setEditModData(d => ({ ...d, title: e.target.value }))}
                            style={{ fontSize: "14px" }}
                            autoFocus
                          />
                          <input
                            className="input"
                            type="number"
                            min={1}
                            value={editModData.order}
                            onChange={e => setEditModData(d => ({ ...d, order: Number(e.target.value) }))}
                            style={{ width: "72px", fontSize: "14px" }}
                            title="Orden"
                          />
                        </div>
                        <input
                          className="input"
                          placeholder="Link de evaluación (Google Forms)"
                          value={editModData.formLink}
                          onChange={e => setEditModData(d => ({ ...d, formLink: e.target.value }))}
                          style={{ fontSize: "14px", marginBottom: "12px" }}
                        />
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button className="btn btn-primary btn-sm" style={{ cursor: "pointer" }}
                            onClick={() => saveEditMod(module.id)} disabled={savingMod || !editModData.title}>
                            {savingMod ? "Guardando..." : "Guardar cambios"}
                          </button>
                          <button className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}
                            onClick={() => setEditingMod(null)}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px" }}>
                        <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "14px", flex: 1 }}
                          onClick={() => setExpandedMod(isOpen ? null : module.id)}>
                          <div className="mod-num">{String(module.order).padStart(2, "0")}</div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 600, fontSize: "15px", color: "var(--text-primary)", marginBottom: "2px" }}>{module.title}</p>
                            <p className="body-sm">{modSessions.length} sesión{modSessions.length !== 1 ? "es" : ""}</p>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ cursor: "pointer", padding: "5px 10px", minHeight: "32px", display: "flex", alignItems: "center", gap: "5px", fontSize: "12px" }}
                            onClick={() => startEditMod(module)}
                            title="Editar módulo"
                          >
                            <IconEdit /> Editar
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ cursor: "pointer", padding: "5px 10px", minHeight: "32px", display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#e06040" }}
                            onClick={() => confirmDeleteMod(module)}
                            title="Eliminar módulo"
                          >
                            <IconTrash /> Eliminar
                          </button>
                          <div style={{ cursor: "pointer", padding: "4px" }} onClick={() => setExpandedMod(isOpen ? null : module.id)}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--text-muted)", transition: "transform .2s", transform: isOpen ? "rotate(180deg)" : "", display: "block" }}>
                              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sessions list */}
                    {isOpen && (
                      <div style={{ borderTop: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
                        {modSessions.length === 0 ? (
                          <p className="body-sm" style={{ padding: "14px 20px" }}>Sin sesiones — crea una arriba seleccionando este módulo.</p>
                        ) : (
                          modSessions.map((s, i) => (
                            <div key={s.id} style={{ borderBottom: i < modSessions.length - 1 ? "1px solid var(--border)" : undefined }}>
                              {editingSes === s.id ? (
                                /* Inline session edit form */
                                <div style={{ padding: "14px 20px" }}>
                                  <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--amber)", marginBottom: "10px" }}>
                                    Editando sesión
                                  </p>
                                  <input
                                    className="input"
                                    placeholder="Título"
                                    value={editSesData.title}
                                    onChange={e => setEditSesData(d => ({ ...d, title: e.target.value }))}
                                    style={{ fontSize: "14px", marginBottom: "8px" }}
                                    autoFocus
                                  />
                                  <textarea
                                    className="input"
                                    placeholder="Descripción breve"
                                    value={editSesData.description}
                                    onChange={e => setEditSesData(d => ({ ...d, description: e.target.value }))}
                                    rows={2}
                                    style={{ fontSize: "14px", marginBottom: "8px", resize: "vertical", minHeight: "60px" }}
                                  />
                                  <input
                                    className="input"
                                    placeholder="Link del video"
                                    value={editSesData.link}
                                    onChange={e => setEditSesData(d => ({ ...d, link: e.target.value }))}
                                    style={{ fontSize: "14px", marginBottom: "8px" }}
                                  />
                                  <input
                                    className="input"
                                    placeholder="Material adicional (URL)"
                                    value={editSesData.material}
                                    onChange={e => setEditSesData(d => ({ ...d, material: e.target.value }))}
                                    style={{ fontSize: "14px", marginBottom: "12px" }}
                                  />
                                  <div style={{ display: "flex", gap: "8px" }}>
                                    <button className="btn btn-primary btn-sm" style={{ cursor: "pointer" }}
                                      onClick={() => saveEditSes(s.id)} disabled={savingSes || !editSesData.title}>
                                      {savingSes ? "Guardando..." : "Guardar"}
                                    </button>
                                    <button className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}
                                      onClick={() => setEditingSes(null)}>
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* Session row */
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px" }}>
                                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "var(--amber-glow)", border: "1px solid var(--amber-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--amber)", flexShrink: 0 }}>
                                    <IconSession />
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "2px" }}>{s.title}</p>
                                    {s.description && <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "2px" }}>{s.description}</p>}
                                    {s.link && <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Video · {s.link.slice(0, 50)}{s.link.length > 50 ? "…" : ""}</p>}
                                  </div>
                                  <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                                    {s.material && (
                                      <a href={s.material} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ fontSize: "11px", padding: "4px 8px", minHeight: "28px" }}>Material</a>
                                    )}
                                    {s.link && (
                                      <a href={s.link} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ fontSize: "11px", padding: "4px 8px", minHeight: "28px" }}>Video</a>
                                    )}
                                    <button
                                      className="btn btn-ghost btn-sm"
                                      style={{ cursor: "pointer", padding: "4px 8px", minHeight: "28px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}
                                      onClick={() => startEditSes(s)}
                                      title="Editar sesión"
                                    >
                                      <IconEdit />
                                    </button>
                                    <button
                                      className="btn btn-ghost btn-sm"
                                      style={{ cursor: "pointer", padding: "4px 8px", minHeight: "28px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", color: "#e06040" }}
                                      onClick={() => confirmDeleteSes(s)}
                                      title="Eliminar sesión"
                                    >
                                      <IconTrash />
                                    </button>
                                  </div>
                                </div>
                              )}
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

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <ConfirmModal
          message={
            confirmDelete.type === "module"
              ? `¿Eliminar el módulo "${confirmDelete.name}"?${confirmDelete.hasChildren ? " También se eliminarán todas sus sesiones." : ""}`
              : `¿Eliminar la sesión "${confirmDelete.name}"?`
          }
          confirmLabel={deleting ? "Eliminando..." : "Eliminar"}
          danger
          onConfirm={doDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </AdminGuard>
  );
}
