"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import AdminGuard from "../components/AdminGuard";
import AdminNav from "../components/AdminNav";

const IconContent = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect x="2" y="3" width="18" height="3.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="2" y="9.5" width="12" height="3.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="2" y="16" width="15" height="3.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);
const IconUsers = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="8" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1.5 19c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16 8a3 3 0 010 6M19.5 19c0-2.6-1.5-4.8-3.5-5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const IconChart = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M2 16L7 10l4.5 4L18 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 20h18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="18" cy="6" r="2" fill="currentColor" opacity=".3" stroke="currentColor" strokeWidth="1.3"/>
  </svg>
);
const IconPlus = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M11 7v8M7 11h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const cards = [
  { href: "/admin/content",     Icon: IconContent, title: "Contenido",     desc: "Módulos y sesiones del programa",       color: "var(--green)",  bg: "var(--green-glow)",  border: "var(--green-border)"  },
  { href: "/admin/users",       Icon: IconUsers,   title: "Extensionistas",desc: "Gestionar usuarios registrados",        color: "var(--amber)",  bg: "var(--amber-glow)",  border: "var(--amber-border)"  },
  { href: "/admin/progress",    Icon: IconChart,   title: "Analíticas",    desc: "Progreso y evaluaciones del programa",  color: "var(--green)",  bg: "var(--green-glow)",  border: "var(--green-border)"  },
  { href: "/admin/create-user", Icon: IconPlus,    title: "Crear cuenta",  desc: "Registrar nuevo extensionista",         color: "var(--amber)",  bg: "var(--amber-glow)",  border: "var(--amber-border)"  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [counts, setCounts] = useState({ modules: 0, users: 0, certs: 0, sessions: 0 });
  const [kpiLoading, setKpiLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [m, u, c, s] = await Promise.all([
        getDocs(collection(db, "modules")),
        getDocs(collection(db, "users")),
        getDocs(collection(db, "certificates")),
        getDocs(collection(db, "sessions")),
      ]);
      setCounts({ modules: m.size, users: u.size, certs: c.size, sessions: s.size });
      setKpiLoading(false);
    })();
  }, []);

  const kpis = [
    { n: counts.modules,  l: "Módulos",        color: "var(--green)"  },
    { n: counts.sessions, l: "Sesiones",        color: "var(--amber)"  },
    { n: counts.users,    l: "Extensionistas",  color: "var(--green)"  },
    { n: counts.certs,    l: "Certificados",    color: "var(--amber)"  },
  ];

  return (
    <AdminGuard>
      <div className="page-wrap">
        <AdminNav />
        <div className="admin-content">

          {/* Header */}
          <div className="fade-up" style={{ marginBottom: "36px" }}>
            <p className="eyebrow" style={{ marginBottom: "6px" }}>Panel de administración</p>
            <h1 className="heading-1" style={{ marginBottom: "6px" }}>Dashboard</h1>
            <p className="body-sm">Coffee Biochar Academy · Biodiversal SAS BIC</p>
          </div>

          {/* KPI strip */}
          <div className="fade-up-1" style={{
            display: "grid", gridTemplateColumns: "repeat(4,1fr)",
            background: "var(--border)", gap: "1px",
            borderRadius: "var(--radius-md)", overflow: "hidden",
            marginBottom: "36px", border: "1px solid var(--border)",
          }}>
            <style>{`@media(max-width:640px){ .kpi-strip { grid-template-columns:repeat(2,1fr) !important; } }`}</style>
            {kpis.map(({ n, l, color }) => (
              <div key={l} style={{ background: "var(--bg-card)", padding: "24px 20px", textAlign: "center" }}>
                {kpiLoading ? (
                  <div style={{ height: "36px", background: "var(--border)", borderRadius: "6px", marginBottom: "8px", animation: "pulse 1.5s ease-in-out infinite" }} />
                ) : (
                  <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "36px", fontWeight: 700, color, lineHeight: 1, marginBottom: "6px" }}>{n}</p>
                )}
                <p className="caption">{l}</p>
              </div>
            ))}
          </div>

          {/* Nav cards */}
          <div className="fade-up-2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "16px" }}>
            <style>{`@media(max-width:580px){ .admin-cards { grid-template-columns:1fr !important; } }`}</style>
            {cards.map(({ href, Icon, title, desc, color, bg, border }) => (
              <div
                key={href}
                className="card"
                style={{ cursor: "pointer", padding: "28px", display: "flex", alignItems: "flex-start", gap: "18px",
                  transition: "border-color .2s, box-shadow .2s, transform .15s",
                }}
                onClick={() => router.push(href)}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = border;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "";
                  (e.currentTarget as HTMLElement).style.transform = "";
                  (e.currentTarget as HTMLElement).style.boxShadow = "";
                }}
              >
                <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-sm)", background: bg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
                  <Icon />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "17px", fontWeight: 600, marginBottom: "4px", color: "var(--text-primary)" }}>{title}</h3>
                  <p className="body-sm" style={{ marginBottom: "12px" }}>{desc}</p>
                  <span style={{ fontSize: "12px", fontWeight: 600, color, display: "flex", alignItems: "center", gap: "4px" }}>
                    Ir a {title} <IconArrow />
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </AdminGuard>
  );
}
