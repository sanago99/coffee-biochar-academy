"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import AdminGuard from "../../components/AdminGuard";
import AdminNav from "../../components/AdminNav";
import type { UserData } from "../../types";

interface UserRow  { id: string; name: string; cluster: string; municipio: string; progress: number; moduleScores: Record<number,number>; }
interface ClusterStat { cluster: string; progress: number; }
interface ModuleStat  { module: string; score: number; }
interface Stats { users: number; avgProgress: number; certificates: number; }

const TooltipStyle = {
  contentStyle: { background: "#181818", border: "1px solid #252525", borderRadius: "8px", color: "#f0efed" },
  cursor:       { fill: "rgba(255,255,255,0.03)" },
};

export default function AdminProgress() {
  const [data,         setData]         = useState<UserRow[]>([]);
  const [clusterStats, setClusterStats] = useState<ClusterStat[]>([]);
  const [moduleStats,  setModuleStats]  = useState<ModuleStat[]>([]);
  const [stats,        setStats]        = useState<Stats>({ users: 0, avgProgress: 0, certificates: 0 });
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");

  useEffect(() => {
    (async () => {
      const [usersSnap, sessionsSnap, progressSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "sessions")),
        getDocs(collection(db, "progress")),
      ]);

      const users    = usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as UserData & { id: string }));
      const total    = sessionsSnap.size;
      const progList = progressSnap.docs.map(d => d.data() as { userId: string });

      const rows: UserRow[] = users.map(u => ({
        id: u.id, name: u.name, cluster: u.cluster, municipio: u.municipio,
        moduleScores: u.moduleScores ?? {},
        progress: total ? Math.round((progList.filter(p => p.userId === u.id).length / total) * 100) : 0,
      }));

      setData(rows);
      setLoading(false);

      const avg  = rows.reduce((a, u) => a + u.progress, 0) / (rows.length || 1);
      const certs = rows.filter(u => u.progress === 100).length;
      setStats({ users: rows.length, avgProgress: Math.round(avg), certificates: certs });

      // Cluster stats
      const cm: Record<string, { t: number; c: number }> = {};
      rows.forEach(u => {
        if (!cm[u.cluster]) cm[u.cluster] = { t: 0, c: 0 };
        cm[u.cluster].t += u.progress; cm[u.cluster].c++;
      });
      setClusterStats(Object.entries(cm).map(([cluster, { t, c }]) => ({ cluster, progress: Math.round(t / c) })));

      // Module stats
      const mm: Record<string, { t: number; c: number }> = {};
      users.forEach(u => {
        Object.entries(u.moduleScores ?? {}).forEach(([mod, score]) => {
          if (!mm[mod]) mm[mod] = { t: 0, c: 0 };
          mm[mod].t += score as number; mm[mod].c++;
        });
      });
      setModuleStats(Object.entries(mm).map(([mod, { t, c }]) => ({ module: `M${mod}`, score: Math.round(t / c) })));
    })();
  }, []);

  const filtered = data.filter(u =>
    `${u.name} ${u.cluster} ${u.municipio}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminGuard>
      <div className="page-wrap">
        <AdminNav />
        <div className="admin-content">

          <h1 className="heading-1 fade-up" style={{ marginBottom: "32px" }}>Progreso del programa</h1>

          {/* STAT CARDS */}
          <div className="grid-3 fade-up-1" style={{ marginBottom: "40px" }}>
            {[
              { n: stats.users,       l: "Extensionistas",   accent: "var(--green-accent)" },
              { n: `${stats.avgProgress}%`, l: "Progreso promedio", accent: "var(--amber)" },
              { n: stats.certificates, l: "Certificados",    accent: "var(--green-light)" },
            ].map(({ n, l, accent }) => (
              <div key={l} className="card" style={{ padding: "28px", borderTop: `2px solid ${accent}` }}>
                <p style={{ fontSize: "40px", fontFamily: "'Playfair Display',serif", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1, marginBottom: "8px" }}>
                  {n}
                </p>
                <p className="caption">{l}</p>
              </div>
            ))}
          </div>

          {/* CHARTS */}
          <div className="grid-2 fade-up-2" style={{ marginBottom: "40px", gap: "24px" }}>
            <div className="card" style={{ padding: "24px" }}>
              <h3 className="heading-3" style={{ marginBottom: "20px", fontSize: "16px" }}>
                Progreso por cluster
              </h3>
              <div style={{ height: "220px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clusterStats} {...TooltipStyle}>
                    <XAxis dataKey="cluster" tick={{ fill: "#5a5a5a", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#5a5a5a", fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip {...TooltipStyle} formatter={(v) => [`${v}%`, "Progreso"]} />
                    <Bar dataKey="progress" radius={[4,4,0,0]}>
                      {clusterStats.map((_, i) => <Cell key={i} fill="#40916c" />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card" style={{ padding: "24px" }}>
              <h3 className="heading-3" style={{ marginBottom: "20px", fontSize: "16px" }}>
                Score promedio por módulo
              </h3>
              <div style={{ height: "220px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moduleStats}>
                    <XAxis dataKey="module" tick={{ fill: "#5a5a5a", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#5a5a5a", fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip {...TooltipStyle} formatter={(v) => [`${v}`, "Score"]} />
                    <Bar dataKey="score" radius={[4,4,0,0]}>
                      {moduleStats.map((_, i) => <Cell key={i} fill="#e9c46a" />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="flex-between fade-up-3" style={{ marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <h2 className="heading-2" style={{ fontSize: "22px" }}>Detalle por extensionista</h2>
            <input className="input" placeholder="Buscar..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ maxWidth: "260px" }} />
          </div>

          {loading ? (
            <p className="body-sm">Cargando datos...</p>
          ) : (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Extensionista</th>
                      <th>Cluster</th>
                      <th>Municipio</th>
                      <th>Progreso</th>
                      <th>Cert.</th>
                      <th>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{u.name}</td>
                        <td>{u.cluster || "—"}</td>
                        <td>{u.municipio || "—"}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "120px" }}>
                            <div className="progress-track" style={{ flex: 1 }}>
                              <div className="progress-fill-sm" style={{ width: `${u.progress}%` }} />
                            </div>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)", minWidth: "30px" }}>
                              {u.progress}%
                            </span>
                          </div>
                        </td>
                        <td>
                          {u.progress === 100
                            ? <span className="badge badge-green">✓</span>
                            : <span className="badge badge-muted">—</span>}
                        </td>
                        <td>
                          <a href={`/admin/users/${u.id}`} style={{ fontSize: "13px", color: "var(--green-accent)", fontWeight: 500 }}>
                            Ver →
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </AdminGuard>
  );
}
