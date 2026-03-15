"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "../../firebase/config";
import { signOut } from "firebase/auth";
import ConfirmModal from "./ConfirmModal";
import DemoBanner from "./DemoBanner";

const IconHome = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M1.5 6.5L7.5 1.5l6 5V13a.5.5 0 01-.5.5H9.5V9.5h-4v4H2a.5.5 0 01-.5-.5V6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
  </svg>
);
const IconContent = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1.5" y="2" width="12" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
    <rect x="1.5" y="6.5" width="8" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
    <rect x="1.5" y="11" width="10" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
  </svg>
);
const IconUsers = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <circle cx="5.5" cy="4.5" r="2.3" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M1 13c0-2.485 2.015-4.5 4.5-4.5S10 10.515 10 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M11 5.5a2 2 0 010 4M13.5 13c0-1.8-1.1-3.3-2.5-3.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconChart = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M1.5 11.5L5 7l3 3 4-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1.5 13.5h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5 2H2.5A.5.5 0 002 2.5v9a.5.5 0 00.5.5H5M9.5 10l2.5-3-2.5-3M12 7H5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconMenu = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const links = [
  { href: "/admin",             label: "Inicio",      Icon: IconHome    },
  { href: "/admin/content",     label: "Contenido",   Icon: IconContent },
  { href: "/admin/users",       label: "Usuarios",    Icon: IconUsers   },
  { href: "/admin/create-user", label: "Crear",       Icon: IconPlus    },
  { href: "/admin/progress",    label: "Progreso",    Icon: IconChart   },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router   = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [menuOpen,        setMenuOpen]        = useState(false);

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await signOut(auth);
    router.push("/login");
  };

  return (
    <>
      <nav className="topnav" style={{ paddingLeft: "20px", paddingRight: "20px" }}>
        <div className="nav-logo" style={{ gap: "12px" }}>
          <img src="/logo.png" alt="Coffee Biochar" style={{ height: "32px", width: "auto" }} />
          <span style={{
            fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em",
            background: "rgba(245,166,35,0.12)", color: "var(--amber)",
            border: "1px solid var(--amber-border)", borderRadius: "4px", padding: "3px 8px",
          }}>Admin</span>
        </div>

        {/* Desktop nav links */}
        <div className="nav-links" style={{ gap: "2px" }}>
          {links.map(({ href, label, Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <a key={href} href={href} className="nav-link"
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  color: active ? "var(--amber)" : undefined,
                  background: active ? "var(--amber-glow)" : undefined,
                }}
              >
                <Icon />{label}
              </a>
            );
          })}
        </div>

        {/* Desktop logout */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="btn btn-ghost btn-sm nav-desktop-only"
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
        >
          <IconLogout />Salir
        </button>

        {/* Mobile hamburger */}
        <button
          className="btn btn-ghost btn-sm nav-mobile-only"
          style={{ cursor: "pointer", padding: "8px" }}
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>
      </nav>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 90,
            background: "rgba(12,10,7,0.7)",
            backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
          }}
          onClick={() => setMenuOpen(false)}
        >
          <div
            style={{
              position: "absolute", top: "64px", left: 0, right: 0,
              background: "var(--bg-card)",
              borderBottom: "1px solid var(--border)",
              padding: "12px 16px 20px",
              display: "flex", flexDirection: "column", gap: "4px",
            }}
            onClick={e => e.stopPropagation()}
          >
            {links.map(({ href, label, Icon }) => {
              const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
              return (
                <a
                  key={href} href={href}
                  className="nav-link"
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "12px 14px", borderRadius: "var(--radius-sm)",
                    fontSize: "14px",
                    color: active ? "var(--amber)" : "var(--text-secondary)",
                    background: active ? "var(--amber-glow)" : "transparent",
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon />{label}
                </a>
              );
            })}
            <div style={{ borderTop: "1px solid var(--border)", marginTop: "8px", paddingTop: "12px" }}>
              <button
                className="btn btn-ghost btn-full"
                style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}
                onClick={() => { setMenuOpen(false); setShowLogoutModal(true); }}
              >
                <IconLogout /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <ConfirmModal
          message="¿Cerrar sesión del panel de administración?"
          confirmLabel="Cerrar sesión"
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

      <DemoBanner />
    </>
  );
}
