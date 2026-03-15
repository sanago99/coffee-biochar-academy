"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import AdminGuard from "../../components/AdminGuard";
import AdminNav from "../../components/AdminNav";
import ConfirmModal from "../../components/ConfirmModal";
import type { UserData } from "../../types";

type UserRow = UserData & { id: string };
type Tab = "all" | "pending" | "active";

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}>
    <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const IconArrow = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M2.5 6.5h8M8 4l2.5 2.5L8 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M2.5 6.5l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function UserAvatar({ name }: { name: string }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
  const colors: [string, string, string][] = [
    ["rgba(122,182,72,0.22)", "var(--green)",  "rgba(122,182,72,0.45)"],
    ["rgba(245,166,35,0.22)", "var(--amber)",  "rgba(245,166,35,0.45)"],
    ["rgba(192,74,42,0.22)",  "#e06040",       "rgba(192,74,42,0.45)" ],
  ];
  const [bg, color, border] = colors[name.charCodeAt(0) % 3];
  return (
    <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: bg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color, flexShrink: 0, fontFamily: "'Inter',sans-serif" }}>
      {initials || "?"}
    </div>
  );
}

function ScoreDots({ scores }: { scores: Record<number, number> }) {
  const entries = Object.entries(scores ?? {});
  if (!entries.length) return <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>—</span>;
  return (
    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
      {entries.map(([mod, score]) => (
        <span key={mod} title={`Módulo ${mod}: ${score} pts`} style={{
          width: "28px", height: "20px", borderRadius: "4px",
          background: Number(score) >= 70 ? "var(--green-glow)" : "rgba(192,74,42,0.1)",
          border: `1px solid ${Number(score) >= 70 ? "var(--green-border)" : "rgba(192,74,42,0.25)"}`,
          fontSize: "10px", fontWeight: 700,
          color: Number(score) >= 70 ? "var(--green)" : "#e06040",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          M{mod}
        </span>
      ))}
    </div>
  );
}

export default function UsersAdmin() {
  const [users,    setUsers]    = useState<UserRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [cluster,  setCluster]  = useState("all");
  const [tab,      setTab]      = useState<Tab>("all");
  const [approving,       setApproving]       = useState<string | null>(null);
  const [confirmApprove,  setConfirmApprove]  = useState<string | null>(null);

  const load = () => {
    getDocs(collection(db, "users")).then(snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as UserRow)));
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const approve = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmApprove(userId);
  };

  const doApprove = async (userId: string) => {
    setConfirmApprove(null);
    setApproving(userId);
    await updateDoc(doc(db, "users", userId), { status: "active" });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: "active" } : u));
    setApproving(null);
  };

  const clusters = Array.from(new Set(users.map(u => u.cluster).filter(Boolean)));

  const pendingCount   = users.filter(u => u.status === "pending").length;
  const hasActiveFilters = search !== "" || cluster !== "all" || tab !== "all";
  const clearFilters = () => { setSearch(""); setCluster("all"); setTab("all"); };

  const filtered = users.filter(u => {
    const q = `${u.name} ${u.municipio} ${u.cluster}`.toLowerCase();
    const matchSearch  = q.includes(search.toLowerCase());
    const matchCluster = cluster === "all" || u.cluster === cluster;
    const matchTab     = tab === "all" || (tab === "pending" ? u.status === "pending" : u.status !== "pending");
    return matchSearch && matchCluster && matchTab;
  });

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: "7px 16px", borderRadius: "var(--radius-pill)", fontSize: "13px", fontWeight: 600,
    cursor: "pointer", border: "1px solid",
    background: tab === t ? (t === "pending" ? "rgba(245,166,35,0.12)" : "var(--green-glow)") : "transparent",
    borderColor: tab === t ? (t === "pending" ? "var(--amber-border)" : "var(--green-border)") : "var(--border)",
    color: tab === t ? (t === "pending" ? "var(--amber)" : "var(--green)") : "var(--text-muted)",
    transition: "all .15s",
    display: "flex", alignItems: "center", gap: "6px",
  });

  return (
    <AdminGuard>
      <div className="page-wrap">
        <AdminNav />
        <div className="admin-content">

          {/* Header */}
          <div className="flex-between fade-up" style={{ marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: "4px" }}>Gestión</p>
              <h1 className="heading-1" style={{ marginBottom: "4px" }}>Extensionistas</h1>
              <p className="body-sm">
                {users.filter(u => u.status !== "pending").length} activos
                {pendingCount > 0 && <span style={{ color: "var(--amber)", fontWeight: 600 }}> · {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}</span>}
              </p>
            </div>
            <a href="/admin/create-user">
              <button className="btn btn-primary btn-sm" style={{ cursor: "pointer" }}>
                + Crear extensionista
              </button>
            </a>
          </div>

          {/* Tabs + Filters */}
          <div className="fade-up-1" style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button style={tabStyle("all")} onClick={() => setTab("all")}>
                Todos <span style={{ fontSize: "11px", opacity: .7 }}>({users.length})</span>
              </button>
              <button style={tabStyle("pending")} onClick={() => setTab("pending")}>
                {pendingCount > 0 && (
                  <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: "var(--amber)", color: "#0C0A07", fontSize: "10px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {pendingCount}
                  </span>
                )}
                Pendientes
              </button>
              <button style={tabStyle("active")} onClick={() => setTab("active")}>
                Activos <span style={{ fontSize: "11px", opacity: .7 }}>({users.filter(u => u.status !== "pending").length})</span>
              </button>
            </div>

            {/* Search + cluster filter */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              {hasActiveFilters && (
                <button onClick={clearFilters} style={{
                  fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", background: "none",
                  border: "1px solid var(--border)", borderRadius: "var(--radius-pill)",
                  padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                }}>× Limpiar filtros</button>
              )}
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ position: "relative", flex: 1, minWidth: "200px", maxWidth: "300px" }}>
                <IconSearch />
                <input className="input" placeholder="Buscar nombre, municipio..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: "34px" }} />
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {["all", ...clusters].map(c => (
                  <button key={c} onClick={() => setCluster(c)} style={{
                    padding: "6px 14px", borderRadius: "var(--radius-pill)", fontSize: "12px",
                    fontWeight: 600, cursor: "pointer", border: "1px solid",
                    background: cluster === c ? "var(--amber-glow)" : "transparent",
                    borderColor: cluster === c ? "var(--amber-border)" : "var(--border)",
                    color: cluster === c ? "var(--amber)" : "var(--text-muted)",
                    transition: "all .15s",
                  }}>
                    {c === "all" ? "Todos los clústeres" : c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pending alert banner */}
          {pendingCount > 0 && tab !== "active" && (
            <div className="fade-up-1" style={{
              padding: "14px 18px", borderRadius: "var(--radius-sm)", marginBottom: "16px",
              background: "rgba(245,166,35,0.07)", border: "1px solid var(--amber-border)",
              display: "flex", alignItems: "center", gap: "12px",
            }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--amber)", flexShrink: 0 }} />
              <p style={{ fontSize: "13px", color: "var(--amber)", fontWeight: 500 }}>
                {pendingCount} extensionista{pendingCount !== 1 ? "s" : ""} esperando verificación — revisa la pestaña <strong>Pendientes</strong>
              </p>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <div style={{ width: "32px", height: "32px", border: "2px solid var(--border)", borderTop: "2px solid var(--amber)", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 12px" }} />
              <p className="body-sm">Cargando usuarios...</p>
            </div>
          ) : (
            <div className="card fade-up-2" style={{ padding: 0, overflow: "hidden" }}>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Extensionista</th>
                      <th>Clúster · Municipio</th>
                      <th>Módulos</th>
                      <th>Progreso</th>
                      <th>Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(user => {
                      const isPending = user.status === "pending";
                      return (
                        <tr
                          key={user.id}
                          style={{ cursor: isPending ? "default" : "pointer", opacity: isPending ? 0.9 : 1 }}
                          onClick={() => !isPending && (window.location.href = `/admin/users/${user.id}`)}
                        >
                          <td data-label="">
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <UserAvatar name={user.name || "?"} />
                              <div>
                                <p style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)", marginBottom: "1px" }}>{user.name || "—"}</p>
                                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{user.email || ""}</p>
                              </div>
                            </div>
                          </td>
                          <td data-label="Clúster">
                            <p style={{ fontSize: "13px", color: "var(--text-primary)", marginBottom: "1px" }}>{user.cluster || "—"}</p>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{user.municipio || "—"}</p>
                          </td>
                          <td data-label="Módulos">
                            {isPending
                              ? <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>—</span>
                              : <ScoreDots scores={user.moduleScores ?? {}} />}
                          </td>
                          <td data-label="Progreso">
                            {isPending ? (
                              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>—</span>
                            ) : (
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "120px" }}>
                                <div className="progress-track-sm" style={{ flex: 1 }}
                                  role="progressbar"
                                  aria-valuenow={user.progress || 0}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                  aria-label={`Progreso de ${user.name}: ${user.progress || 0}%`}>
                                  <div className="progress-fill-sm" style={{ width: `${user.progress || 0}%` }} />
                                </div>
                                <span style={{ fontSize: "12px", color: "var(--text-muted)", minWidth: "30px", fontWeight: 600 }}>
                                  {user.progress || 0}%
                                </span>
                              </div>
                            )}
                          </td>
                          <td data-label="Estado">
                            {isPending ? (
                              <span className="badge badge-amber" style={{ fontSize: "11px" }}>Pendiente</span>
                            ) : (
                              <span className="badge badge-green" style={{ fontSize: "11px" }}>
                                <IconCheck /> Activo
                              </span>
                            )}
                          </td>
                          <td data-label="" onClick={e => e.stopPropagation()}>
                            {isPending ? (
                              <button
                                className="btn btn-green btn-sm"
                                style={{ cursor: "pointer", fontSize: "12px", padding: "5px 14px", minHeight: "32px", display: "flex", alignItems: "center", gap: "6px" }}
                                disabled={approving === user.id}
                                onClick={e => approve(user.id, e)}
                              >
                                {approving === user.id ? "..." : <><IconCheck /> Aprobar</>}
                              </button>
                            ) : (
                              <a href={`/admin/users/${user.id}`}>
                                <button className="btn btn-ghost btn-sm" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                                  Ver <IconArrow />
                                </button>
                              </a>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "56px 20px" }}>
                          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "6px" }}>
                            {tab === "pending" ? "No hay cuentas pendientes de aprobación" : "No se encontraron usuarios"}
                          </p>
                          {search && (
                            <button className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }} onClick={() => setSearch("")}>
                              Limpiar búsqueda
                            </button>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filtered.length > 0 && (
                <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
                  <p className="body-sm">{filtered.length} de {users.length} extensionistas</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {confirmApprove && (
        <ConfirmModal
          message="¿Aprobar esta cuenta? El extensionista podrá acceder al programa de formación."
          confirmLabel="Aprobar"
          onConfirm={() => doApprove(confirmApprove)}
          onCancel={() => setConfirmApprove(null)}
        />
      )}
    </AdminGuard>
  );
}
