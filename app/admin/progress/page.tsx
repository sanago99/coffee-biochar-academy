"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from "recharts";
import AdminGuard from "../../components/AdminGuard";
import AdminNav from "../../components/AdminNav";
import type { UserData } from "../../types";

interface UserRow  { id: string; name: string; email: string; cluster: string; municipio: string; progress: number; moduleScores: Record<number,number>; }
interface ClusterStat { cluster: string; progress: number; users: number; }

/* Brand color tokens for Recharts (can't use CSS vars in SVG attributes) */
const C_AMBER = "#F5A623";
const C_AMBER_ALT = "#D4891A";
const C_GREEN = "#7AB648";
const C_GREEN_ALT = "#5A9E32";
const C_RUST  = "#C04A2A";
interface ModuleStat  { module: string; label: string; avg: number; approved: number; }

const tooltipStyle = {
  contentStyle: { background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px" },
  cursor: { fill: "rgba(255,255,255,0.02)" },
  labelStyle: { color: "var(--text-muted)" },
};

const moduleLabels: Record<number, string> = {
  1: "Habilidades", 2: "Carbono", 3: "Biochar",
  4: "Suelo", 5: "Agro", 6: "dMRV",
};

export default function AdminProgress() {
  const [rows,         setRows]         = useState<UserRow[]>([]);
  const [clusterStats, setClusterStats] = useState<ClusterStat[]>([]);
  const [moduleStats,  setModuleStats]  = useState<ModuleStat[]>([]);
  const [kpis,         setKpis]         = useState({ users: 0, avgProgress: 0, certs: 0, active: 0 });
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [scrolled,     setScrolled]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    (async () => {
      const [usersSnap, sessionsSnap, progressSnap, certSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "sessions")),
        getDocs(collection(db, "progress")),
        getDocs(collection(db, "certificates")),
      ]);

      const users    = usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as UserData & { id: string }));
      const total    = sessionsSnap.size;
      const progList = progressSnap.docs.map(d => d.data() as { userId: string });

      const userRows: UserRow[] = users.map(u => ({
        id: u.id, name: u.name, email: u.email ?? "", cluster: u.cluster ?? "", municipio: u.municipio ?? "",
        moduleScores: u.moduleScores ?? {},
        progress: total ? Math.round((progList.filter(p => p.userId === u.id).length / total) * 100) : 0,
      }));

      setRows(userRows);
      setLoading(false);

      const avg    = userRows.reduce((a, u) => a + u.progress, 0) / (userRows.length || 1);
      const active = userRows.filter(u => u.progress > 0 && u.progress < 100).length;
      setKpis({ users: userRows.length, avgProgress: Math.round(avg), certs: certSnap.size, active });

      // Cluster stats
      const cm: Record<string, { t: number; c: number }> = {};
      userRows.forEach(u => {
        if (!cm[u.cluster]) cm[u.cluster] = { t: 0, c: 0 };
        cm[u.cluster].t += u.progress; cm[u.cluster].c++;
      });
      setClusterStats(Object.entries(cm).map(([cluster, { t, c }]) => ({ cluster: cluster || "Sin cluster", progress: Math.round(t / c), users: c })));

      // Module stats
      const mm: Record<number, { t: number; c: number; approved: number }> = {};
      users.forEach(u => {
        Object.entries(u.moduleScores ?? {}).forEach(([mod, score]) => {
          const n = Number(mod);
          if (!mm[n]) mm[n] = { t: 0, c: 0, approved: 0 };
          mm[n].t += score as number;
          mm[n].c++;
          if ((score as number) >= 70) mm[n].approved++;
        });
      });
      setModuleStats(Object.entries(mm)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([mod, { t, c, approved }]) => ({
          module: `M${mod}`, label: moduleLabels[Number(mod)] ?? `M${mod}`,
          avg: Math.round(t / c), approved,
        })));
    })();
  }, []);

  const filtered = rows.filter(u =>
    `${u.name} ${u.cluster} ${u.municipio}`.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    // Collect all module orders that appear across all users
    const allMods = Array.from(new Set(rows.flatMap(u => Object.keys(u.moduleScores).map(Number)))).sort((a, b) => a - b);
    const headers = ["Nombre", "Email", "Clúster", "Municipio", "Progreso", ...allMods.map(m => `M${m} score`)];
    const rowData = rows.map(u => [
      u.name, u.email, u.cluster, u.municipio,
      `${u.progress}%`,
      ...allMods.map(m => u.moduleScores[m] !== undefined ? String(u.moduleScores[m]) : ""),
    ]);
    const csv = [headers, ...rowData]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "progreso-programa.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const kpiCards = [
    { n: kpis.users,       l: "Total extensionistas", color: "var(--green)",  sub: "registrados" },
    { n: `${kpis.avgProgress}%`, l: "Progreso promedio", color: "var(--amber)",  sub: "del programa" },
    { n: kpis.active,      l: "En formación",         color: "var(--green)",  sub: "activos ahora" },
    { n: kpis.certs,       l: "Certificados",          color: "var(--amber)",  sub: "completaron" },
  ];

  return (
    <AdminGuard>
      <div className="page-wrap">
        <AdminNav />
        <div className="admin-content">

          {/* Header */}
          <div className="fade-up" style={{ marginBottom: "32px" }}>
            <p className="eyebrow" style={{ marginBottom: "4px" }}>Analytics</p>
            <h1 className="heading-1">Progreso del programa</h1>
          </div>

          {/* KPI cards */}
          <div className="grid-4 fade-up-1" style={{ marginBottom: "32px" }}>
            {kpiCards.map(({ n, l, color, sub }) => (
              <div key={l} className="card" style={{ padding: "22px", borderLeft: `3px solid ${color}` }}>
                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "34px", fontWeight: 700, color, lineHeight: 1, marginBottom: "6px" }}>{n}</p>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>{l}</p>
                <p className="body-sm" style={{ fontSize: "11px" }}>{sub}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid-2 fade-up-2" style={{ marginBottom: "32px", gap: "20px" }}>
            {/* Cluster */}
            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "16px", fontWeight: 600, marginBottom: "4px", color: "var(--text-primary)" }}>
                Progreso por clúster
              </h3>
              <p className="body-sm" style={{ marginBottom: "20px" }}>Promedio de sesiones completadas</p>
              <div style={{ height: "200px" }}>
                {clusterStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clusterStats} barSize={32}>
                      <XAxis dataKey="cluster" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip {...tooltipStyle} formatter={(v) => [`${v}%`, "Progreso"]} />
                      <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
                        {clusterStats.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? C_GREEN : C_GREEN_ALT} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p className="body-sm">Sin datos aún</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modules */}
            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "16px", fontWeight: 600, marginBottom: "4px", color: "var(--text-primary)" }}>
                Evaluaciones por módulo
              </h3>
              <p className="body-sm" style={{ marginBottom: "20px" }}>Score promedio · aprobados</p>
              <div style={{ height: "200px" }}>
                {moduleStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={moduleStats} barSize={28}>
                      <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip {...tooltipStyle} formatter={(v, name) => [name === "avg" ? `${v} pts` : `${v}`, name === "avg" ? "Score" : "Aprobados"]} />
                      <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                        {moduleStats.map((m, i) => <Cell key={i} fill={m.avg >= 70 ? C_AMBER : C_RUST} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p className="body-sm">Sin evaluaciones aún</p>
                  </div>
                )}
              </div>
              {/* Legend */}
              <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: C_AMBER }} />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>≥ 70 pts</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: C_RUST }} />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>&lt; 70 pts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress distribution */}
          <div className="card fade-up-2" style={{ padding: "24px", marginBottom: "32px" }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "16px", fontWeight: 600, marginBottom: "4px", color: "var(--text-primary)" }}>
              Distribución del progreso
            </h3>
            <p className="body-sm" style={{ marginBottom: "16px" }}>Extensionistas por rango de avance</p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { label: "0%",     range: [0, 0],    color: "var(--text-muted)" },
                { label: "1–25%",  range: [1, 25],   color: C_RUST              },
                { label: "26–50%", range: [26, 50],  color: C_AMBER_ALT         },
                { label: "51–75%", range: [51, 75],  color: "var(--amber)"      },
                { label: "76–99%", range: [76, 99],  color: "var(--green)"      },
                { label: "100%",   range: [100, 100],color: C_GREEN             },
              ].map(({ label, range, color }) => {
                const count = rows.filter(u => u.progress >= range[0] && u.progress <= range[1]).length;
                const pct = rows.length ? Math.round((count / rows.length) * 100) : 0;
                return (
                  <div key={label} style={{ flex: 1, minWidth: "80px", padding: "14px 12px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", textAlign: "center" }}>
                    <p style={{ fontSize: "20px", fontWeight: 700, color, fontFamily: "'Playfair Display',serif", marginBottom: "4px" }}>{count}</p>
                    <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "2px" }}>{label}</p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{pct}%</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed table */}
          <div className="flex-between fade-up-3" style={{ marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", fontWeight: 600 }}>
              Detalle por extensionista
            </h2>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                className="btn btn-ghost btn-sm"
                style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}
                onClick={exportCSV}
                disabled={rows.length === 0}
                title="Descargar reporte como CSV"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 2v7M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 11h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                Exportar CSV
              </button>
            <div style={{ position: "relative" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}>
                <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input
                className="input"
                placeholder="Buscar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ maxWidth: "220px", paddingLeft: "32px" }}
              />
            </div>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <div style={{ width: "32px", height: "32px", border: "2px solid var(--border)", borderTop: "2px solid var(--amber)", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 12px" }} />
              <p className="body-sm">Cargando datos...</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Extensionista</th>
                      <th>Clúster</th>
                      <th>Municipio</th>
                      <th>Progreso</th>
                      <th>Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => {
                      const isCert  = u.progress >= 100;
                      const isActive = u.progress > 0 && u.progress < 100;
                      return (
                        <tr
                          key={u.id}
                          style={{ cursor: "pointer" }}
                          onClick={() => window.location.href = `/admin/users/${u.id}`}
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "")}
                          title="Ver detalle del extensionista"
                        >
                          <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</td>
                          <td>{u.cluster || "—"}</td>
                          <td>{u.municipio || "—"}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "110px" }}>
                              <div className="progress-track-sm" style={{ flex: 1 }}
                                role="progressbar"
                                aria-valuenow={u.progress}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`Progreso de ${u.name}: ${u.progress}%`}>
                                <div className="progress-fill-sm" style={{ width: `${u.progress}%`, background: isCert ? "var(--green)" : undefined }} />
                              </div>
                              <span style={{ fontSize: "12px", color: isCert ? "var(--green)" : "var(--text-muted)", minWidth: "30px", fontWeight: 600 }}>
                                {u.progress}%
                              </span>
                            </div>
                          </td>
                          <td>
                            {isCert  && <span className="badge badge-green" style={{ fontSize: "11px" }}>Certificado</span>}
                            {isActive && <span className="badge badge-amber" style={{ fontSize: "11px" }}>En curso</span>}
                            {!isCert && !isActive && <span className="badge badge-muted" style={{ fontSize: "11px" }}>Sin iniciar</span>}
                          </td>
                          <td>
                            <span style={{ fontSize: "12px", color: "var(--amber)", fontWeight: 600 }}>Ver →</span>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
                          No hay resultados para "{search}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {scrolled && (
        <button
          className="scroll-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Volver arriba"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 10l5-5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </AdminGuard>
  );
}
