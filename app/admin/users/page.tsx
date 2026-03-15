"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import AdminGuard from "../../components/AdminGuard";
import AdminNav from "../../components/AdminNav";
import type { UserData } from "../../types";

type UserRow = UserData & { id: string };

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

function UserAvatar({ name }: { name: string }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
  const colors = [
    ["rgba(122,182,72,0.15)",  "var(--green)"],
    ["rgba(245,166,35,0.15)",  "var(--amber)"],
    ["rgba(192,74,42,0.15)",   "#e06040"],
  ];
  const idx = name.charCodeAt(0) % 3;
  const [bg, color] = colors[idx];
  return (
    <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: bg, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color, flexShrink: 0, fontFamily: "'Inter',sans-serif" }}>
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
        <span
          key={mod}
          title={`Módulo ${mod}: ${score} pts`}
          style={{
            width: "28px", height: "20px", borderRadius: "4px",
            background: Number(score) >= 70 ? "var(--green-glow)" : "rgba(192,74,42,0.1)",
            border: `1px solid ${Number(score) >= 70 ? "var(--green-border)" : "rgba(192,74,42,0.25)"}`,
            fontSize: "10px", fontWeight: 700,
            color: Number(score) >= 70 ? "var(--green)" : "#e06040",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          M{mod}
        </span>
      ))}
    </div>
  );
}

export default function UsersAdmin() {
  const [users,   setUsers]   = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [cluster, setCluster] = useState("all");

  useEffect(() => {
    getDocs(collection(db, "users")).then(snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as UserRow)));
      setLoading(false);
    });
  }, []);

  const clusters = Array.from(new Set(users.map(u => u.cluster).filter(Boolean)));

  const filtered = users.filter(u => {
    const q = `${u.name} ${u.municipio} ${u.cluster}`.toLowerCase();
    const matchSearch = q.includes(search.toLowerCase());
    const matchCluster = cluster === "all" || u.cluster === cluster;
    return matchSearch && matchCluster;
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
              <p className="body-sm">{users.length} usuarios · {users.filter(u => (u.progress||0) === 100).length} certificados</p>
            </div>
            <a href="/admin/create-user">
              <button className="btn btn-primary btn-sm" style={{ cursor: "pointer" }}>
                + Crear extensionista
              </button>
            </a>
          </div>

          {/* Filters */}
          <div className="fade-up-1" style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: "1", minWidth: "220px", maxWidth: "320px" }}>
              <IconSearch />
              <input
                className="input"
                placeholder="Buscar nombre, municipio..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: "34px" }}
              />
            </div>

            {/* Cluster filter chips */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {["all", ...clusters].map(c => (
                <button
                  key={c}
                  onClick={() => setCluster(c)}
                  style={{
                    padding: "6px 14px", borderRadius: "var(--radius-pill)",
                    fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "1px solid",
                    background: cluster === c ? "var(--amber-glow)" : "transparent",
                    borderColor: cluster === c ? "var(--amber-border)" : "var(--border)",
                    color: cluster === c ? "var(--amber)" : "var(--text-muted)",
                    transition: "all .15s",
                  }}
                >
                  {c === "all" ? "Todos" : c}
                </button>
              ))}
            </div>
          </div>

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
                      <th>Cluster · Municipio</th>
                      <th>Módulos</th>
                      <th>Progreso</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(user => (
                      <tr key={user.id} style={{ cursor: "pointer" }} onClick={() => window.location.href = `/admin/users/${user.id}`}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <UserAvatar name={user.name || "?"} />
                            <div>
                              <p style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)", marginBottom: "1px" }}>{user.name || "—"}</p>
                              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{user.email || ""}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <p style={{ fontSize: "13px", color: "var(--text-primary)", marginBottom: "1px" }}>{user.cluster || "—"}</p>
                          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{user.municipio || "—"}</p>
                        </td>
                        <td><ScoreDots scores={user.moduleScores ?? {}} /></td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "120px" }}>
                            <div className="progress-track" style={{ flex: 1 }}>
                              <div className="progress-fill-sm" style={{ width: `${user.progress || 0}%` }} />
                            </div>
                            <span style={{ fontSize: "12px", color: (user.progress||0) >= 100 ? "var(--green)" : "var(--text-muted)", minWidth: "30px", fontWeight: 600 }}>
                              {user.progress || 0}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}
                            onClick={e => { e.stopPropagation(); window.location.href = `/admin/users/${user.id}`; }}
                          >
                            Ver <IconArrow />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: "56px 20px" }}>
                          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "6px" }}>
                            No se encontraron extensionistas
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
                <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p className="body-sm">{filtered.length} de {users.length} extensionistas</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
