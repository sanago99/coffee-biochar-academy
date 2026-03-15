"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../firebase/config";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { useParams } from "next/navigation";
import AdminGuard from "../../../components/AdminGuard";
import AdminNav from "../../../components/AdminNav";
import type { Module, UserData } from "../../../types";

export default function UserDetail() {
  const { id: userId } = useParams() as { id: string };

  const [user,    setUser]    = useState<UserData | null>(null);
  const [modules, setModules] = useState<Module[]>([]);

  // score editing state: moduleOrder → draft value string
  const [drafts,  setDrafts]  = useState<Record<number, string>>({});
  const [saving,  setSaving]  = useState<Record<number, boolean>>({});
  const [saved,   setSaved]   = useState<Record<number, boolean>>({});

  // user data editing
  const [editingUser,  setEditingUser]  = useState(false);
  const [userDraft,    setUserDraft]    = useState<{ name: string; cluster: string; municipio: string; finca: string; telefono: string }>({ name: "", cluster: "", municipio: "", finca: "", telefono: "" });
  const [savingUser,   setSavingUser]   = useState(false);
  const [savedUser,    setSavedUser]    = useState(false);

  useEffect(() => {
    (async () => {
      const [userDoc, modulesSnap] = await Promise.all([
        getDoc(doc(db, "users", userId)),
        getDocs(collection(db, "modules")),
      ]);

      if (userDoc.exists()) setUser(userDoc.data() as UserData);

      const list = modulesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Module));
      list.sort((a, b) => a.order - b.order);
      setModules(list);
    })();
  }, [userId]);

  const startEditUser = () => {
    if (!user) return;
    setUserDraft({
      name:      user.name      ?? "",
      cluster:   user.cluster   ?? "",
      municipio: user.municipio ?? "",
      finca:     user.finca     ?? "",
      telefono:  user.telefono  ?? "",
    });
    setEditingUser(true);
  };

  const saveUser = async () => {
    if (!userDraft.name) return;
    setSavingUser(true);
    try {
      await updateDoc(doc(db, "users", userId), {
        name:      userDraft.name,
        cluster:   userDraft.cluster,
        municipio: userDraft.municipio,
        finca:     userDraft.finca,
        telefono:  userDraft.telefono,
      });
      setUser(prev => prev ? { ...prev, ...userDraft } : prev);
      setEditingUser(false);
      setSavedUser(true);
      setTimeout(() => setSavedUser(false), 2500);
    } finally {
      setSavingUser(false);
    }
  };

  const getStatus = (module: Module, u: UserData) => {
    const score = u.moduleScores?.[module.order];
    if (score !== undefined && score >= (module.passingScore || 70)) return { label: "Aprobado", cls: "badge-green" };
    if (module.order === 1) return { label: "Disponible", cls: "badge-amber" };
    const prev = u.moduleScores?.[module.order - 1];
    if (prev !== undefined && prev >= (modules.find(m => m.order === module.order - 1)?.passingScore || 70)) return { label: "Disponible", cls: "badge-amber" };
    if (score !== undefined) return { label: "No aprobado", cls: "badge-muted" };
    return { label: "Bloqueado", cls: "badge-muted" };
  };

  const saveScore = async (module: Module) => {
    const raw = drafts[module.order];
    if (raw === undefined || raw === "") return;
    const score = Number(raw);
    if (isNaN(score) || score < 0 || score > 100) return;

    setSaving(s => ({ ...s, [module.order]: true }));

    try {
      // Dot-notation update so we don't overwrite other moduleScores
      await updateDoc(doc(db, "users", userId), {
        [`moduleScores.${module.order}`]: score,
      });

      // Update local state
      setUser(prev => {
        if (!prev) return prev;
        const newScores = { ...(prev.moduleScores ?? {}), [module.order]: score };
        const passed = modules.filter(m => {
          const s = newScores[m.order];
          return s !== undefined && s >= (m.passingScore || 70);
        }).length;
        const progress = modules.length > 0 ? Math.round((passed / modules.length) * 100) : 0;
        // also persist progress
        updateDoc(doc(db, "users", userId), { progress });
        return { ...prev, moduleScores: newScores, progress };
      });

      setDrafts(d => { const n = { ...d }; delete n[module.order]; return n; });
      setSaved(s => ({ ...s, [module.order]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [module.order]: false })), 2000);
    } finally {
      setSaving(s => ({ ...s, [module.order]: false }));
    }
  };

  if (!user) {
    return (
      <AdminGuard>
        <div className="page-wrap">
          <AdminNav />
          <div className="admin-content">
            <p className="body-sm">Cargando usuario...</p>
          </div>
        </div>
      </AdminGuard>
    );
  }

  const passedCount = modules.filter(m => {
    const s = user.moduleScores?.[m.order];
    return s !== undefined && s >= (m.passingScore || 70);
  }).length;

  return (
    <AdminGuard>
      <div className="page-wrap">
        <AdminNav />
        <div className="admin-content">

          {/* HEADER */}
          <div className="card card-green-left fade-up" style={{ padding: "28px", marginBottom: "24px" }}>
            <a href="/admin/users" style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px", display: "block" }}>
              ← Volver a usuarios
            </a>

            <div className="flex-between" style={{ flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
              <h1 className="heading-1">{user.name}</h1>
              {!editingUser && (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}
                  onClick={startEditUser}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M9 2l2 2-7 7H2V9l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Editar datos
                </button>
              )}
            </div>

            {savedUser && (
              <p className="msg-success" style={{ marginBottom: "12px" }}>Datos actualizados correctamente</p>
            )}

            {editingUser ? (
              <div style={{ marginTop: "4px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label className="form-label" htmlFor="edit-name">Nombre completo *</label>
                    <input id="edit-name" className="input" style={{ fontSize: "14px" }}
                      value={userDraft.name} onChange={e => setUserDraft(d => ({ ...d, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="edit-cluster">Clúster</label>
                    <input id="edit-cluster" className="input" style={{ fontSize: "14px" }}
                      value={userDraft.cluster} onChange={e => setUserDraft(d => ({ ...d, cluster: e.target.value }))} />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="edit-municipio">Municipio</label>
                    <input id="edit-municipio" className="input" style={{ fontSize: "14px" }}
                      value={userDraft.municipio} onChange={e => setUserDraft(d => ({ ...d, municipio: e.target.value }))} />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="edit-finca">Finca</label>
                    <input id="edit-finca" className="input" style={{ fontSize: "14px" }}
                      value={userDraft.finca} onChange={e => setUserDraft(d => ({ ...d, finca: e.target.value }))} />
                  </div>
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label className="form-label" htmlFor="edit-telefono">Teléfono</label>
                  <input id="edit-telefono" className="input" style={{ fontSize: "14px", maxWidth: "240px" }}
                    value={userDraft.telefono} onChange={e => setUserDraft(d => ({ ...d, telefono: e.target.value }))} />
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn btn-primary btn-sm" style={{ cursor: "pointer" }}
                    onClick={saveUser} disabled={savingUser || !userDraft.name}>
                    {savingUser ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}
                    onClick={() => setEditingUser(false)}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-wrap">
                  {user.cluster   && <span className="badge badge-muted">Cluster: {user.cluster}</span>}
                  {user.municipio && <span className="badge badge-muted">{user.municipio}</span>}
                  {user.finca     && <span className="badge badge-muted">Finca: {user.finca}</span>}
                  {user.telefono  && <span className="badge badge-muted">{user.telefono}</span>}
                </div>
                <div style={{ marginTop: "20px", display: "flex", gap: "32px", flexWrap: "wrap" }}>
                  <div>
                    <p className="stat-lg" style={{ marginBottom: "2px" }}>
                      {passedCount}<span style={{ fontSize: "16px", color: "var(--text-muted)", fontWeight: 400 }}>/{modules.length}</span>
                    </p>
                    <p className="caption">Módulos aprobados</p>
                  </div>
                  {user.progress !== undefined && (
                    <div>
                      <p className="stat-lg" style={{ color: "var(--green-accent)", marginBottom: "2px" }}>
                        {user.progress}%
                      </p>
                      <p className="caption">Progreso del curso</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* MODULE TABLE */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "16px" }} className="fade-up-1">
            <h2 className="heading-2">Progreso por módulo</h2>
            <p className="body-sm">Ingresa la nota para registrar el avance</p>
          </div>

          <div className="card fade-up-2" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Módulo</th>
                    <th>Estado</th>
                    <th>Nota actual</th>
                    <th>Nota mínima</th>
                    <th>Registrar nota</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map(module => {
                    const { label, cls } = getStatus(module, user);
                    const score = user.moduleScores?.[module.order];
                    const draft = drafts[module.order] ?? "";
                    const isSaving = saving[module.order] ?? false;
                    const isSaved  = saved[module.order]  ?? false;
                    const passing  = module.passingScore || 70;
                    const draftNum = draft !== "" ? Number(draft) : NaN;
                    const invalid  = draft !== "" && (isNaN(draftNum) || draftNum < 0 || draftNum > 100);

                    return (
                      <tr key={module.id}>
                        <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                          <div className="flex-gap-sm">
                            <div className="mod-num" style={{ width: "26px", height: "26px", fontSize: "11px" }}>
                              {String(module.order).padStart(2, "0")}
                            </div>
                            {module.title}
                          </div>
                        </td>
                        <td><span className={`badge ${cls}`}>{label}</span></td>
                        <td style={{
                          fontWeight: score !== undefined ? 600 : 400,
                          color: score !== undefined
                            ? score >= passing ? "var(--green-accent)" : "var(--rust)"
                            : "var(--text-muted)",
                        }}>
                          {score ?? "—"}
                        </td>
                        <td style={{ color: "var(--text-muted)" }}>{passing}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              placeholder="0–100"
                              value={draft}
                              onChange={e => setDrafts(d => ({ ...d, [module.order]: e.target.value }))}
                              onKeyDown={e => { if (e.key === "Enter") saveScore(module); }}
                              style={{
                                width: "72px",
                                padding: "5px 8px",
                                fontSize: "13px",
                                background: "var(--bg-elevated)",
                                border: `1px solid ${invalid ? "var(--rust)" : "var(--border)"}`,
                                borderRadius: "var(--radius-sm)",
                                color: "var(--text-primary)",
                                outline: "none",
                              }}
                            />
                            {isSaved ? (
                              <span style={{ fontSize: "12px", color: "var(--green-accent)", fontWeight: 600 }}>✓ Guardado</span>
                            ) : (
                              <button
                                className="btn btn-sm btn-primary"
                                style={{ cursor: draft === "" || invalid ? "not-allowed" : "pointer", opacity: draft === "" || invalid ? 0.45 : 1, padding: "5px 12px", fontSize: "12px" }}
                                disabled={draft === "" || invalid || isSaving}
                                onClick={() => saveScore(module)}
                              >
                                {isSaving ? "..." : "Guardar"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </AdminGuard>
  );
}
