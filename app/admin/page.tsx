"use client";

import { useRouter } from "next/navigation";
import AdminGuard from "../components/AdminGuard";
import AdminNav from "../components/AdminNav";

const cards = [
  {
    href:  "/admin/content",
    icon:  "📚",
    title: "Contenido",
    desc:  "Crear y gestionar módulos y sesiones",
    accent: "var(--green-accent)",
  },
  {
    href:  "/admin/users",
    icon:  "👥",
    title: "Extensionistas",
    desc:  "Ver todos los usuarios registrados",
    accent: "var(--amber)",
  },
  {
    href:  "/admin/progress",
    icon:  "📊",
    title: "Progreso",
    desc:  "Analíticas y avance del programa",
    accent: "var(--green-light)",
  },
  {
    href:  "/admin/create-user",
    icon:  "➕",
    title: "Crear usuario",
    desc:  "Registrar nuevo extensionista",
    accent: "var(--amber-warm)",
  },
];

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <AdminGuard>
      <div className="page-wrap">
        <AdminNav />

        <div className="admin-content">
          <p className="eyebrow fade-up" style={{ marginBottom: "12px" }}>Panel de administración</p>
          <h1 className="heading-1 fade-up-1" style={{ marginBottom: "8px" }}>Dashboard</h1>
          <p className="body-sm fade-up-2" style={{ marginBottom: "40px" }}>
            Coffee Biochar Academy · Biodiversal
          </p>

          <div className="grid-4 fade-up-3">
            {cards.map(c => (
              <div
                key={c.href}
                className="card card-hover"
                style={{
                  cursor: "pointer",
                  borderTop: `2px solid ${c.accent}`,
                  padding: "28px 24px",
                  transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                }}
                onClick={() => router.push(c.href)}
              >
                <div style={{ fontSize: "28px", marginBottom: "14px" }}>{c.icon}</div>
                <h3 className="heading-3" style={{ marginBottom: "8px", fontSize: "18px" }}>
                  {c.title}
                </h3>
                <p className="body-sm">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
