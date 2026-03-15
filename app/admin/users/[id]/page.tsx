"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../firebase/config";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useParams } from "next/navigation";
import AdminGuard from "../../../components/AdminGuard";
import AdminNav from "../../../components/AdminNav";
import type { Module, UserData } from "../../../types";

export default function UserDetail() {
  const { id: userId } = useParams() as { id: string };

  const [user,    setUser]    = useState<UserData | null>(null);
  const [modules, setModules] = useState<Module[]>([]);

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

  const getStatus = (module: Module) => {
    const score = user?.moduleScores?.[module.order];
    if (score !== undefined && score >= (module.passingScore || 70)) return { label: "Aprobado", cls: "badge-green" };
    if (module.order === 1) return { label: "Disponible", cls: "badge-amber" };
    const prev = user?.moduleScores?.[module.order - 1];
    if (prev !== undefined && prev >= (modules.find(m => m.order === module.order - 1)?.passingScore || 70)) return { label: "Disponible", cls: "badge-amber" };
    if (score !== undefined) return { label: "No aprobado", cls: "badge-muted" };
    return { label: "Bloqueado", cls: "badge-muted" };
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
          <div className="card card-green-left fade-up" style={{ padding: "28px", marginBottom: "32px" }}>
            <a href="/admin/users" style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px", display: "block" }}>
              ← Volver a usuarios
            </a>
            <h1 className="heading-1" style={{ marginBottom: "8px" }}>{user.name}</h1>
            <div className="flex-wrap">
              {user.cluster && <span className="badge badge-muted">Cluster: {user.cluster}</span>}
              {user.municipio && <span className="badge badge-muted">{user.municipio}</span>}
              {user.finca && <span className="badge badge-muted">Finca: {user.finca}</span>}
            </div>
            <div style={{ marginTop: "20px", display: "flex", gap: "32px", flexWrap: "wrap" }}>
              <div>
                <p style={{ fontSize: "28px", fontFamily: "'Playfair Display',serif", fontWeight: 700 }}>
                  {passedCount}<span style={{ fontSize: "16px", color: "var(--text-muted)", fontWeight: 400 }}>/{modules.length}</span>
                </p>
                <p className="caption">Módulos aprobados</p>
              </div>
              {user.progress !== undefined && (
                <div>
                  <p style={{ fontSize: "28px", fontFamily: "'Playfair Display',serif", fontWeight: 700, color: "var(--green-accent)" }}>
                    {user.progress}%
                  </p>
                  <p className="caption">Progreso del curso</p>
                </div>
              )}
            </div>
          </div>

          {/* MODULE TABLE */}
          <h2 className="heading-2 fade-up-1" style={{ marginBottom: "16px" }}>Progreso por módulo</h2>

          <div className="card fade-up-2" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Módulo</th>
                    <th>Estado</th>
                    <th>Score</th>
                    <th>Nota mínima</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map(module => {
                    const { label, cls } = getStatus(module);
                    const score = user.moduleScores?.[module.order];
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
                        <td style={{ fontWeight: score !== undefined ? 600 : 400, color: score !== undefined ? "var(--text-primary)" : "var(--text-muted)" }}>
                          {score ?? "—"}
                        </td>
                        <td style={{ color: "var(--text-muted)" }}>{module.passingScore || 70}</td>
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
