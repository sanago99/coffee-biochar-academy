"use client";

import { useEffect, useState } from "react";
import { auth } from "../../firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getDemoRole } from "../lib/demo";

export default function DemoBanner() {
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    return onAuthStateChanged(auth, user => setEmail(user?.email ?? null));
  }, []);

  const role = getDemoRole(email);
  if (!role) return null;

  return (
    <div style={{
      background: "rgba(245,166,35,0.1)",
      borderBottom: "1px solid var(--amber-border)",
      padding: "9px 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: "12px", flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: "var(--amber)", display: "inline-block", flexShrink: 0,
            animation: "pulse 2s ease-in-out infinite",
          }} />
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--amber)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Modo Demo
          </span>
        </div>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          {role === "student" ? "Vista de estudiante — así ve el programa un extensionista" : "Vista de administrador — así gestionas el programa"}
        </span>
      </div>
      <button
        className="btn btn-ghost btn-sm"
        style={{
          cursor: "pointer", fontSize: "12px", padding: "4px 12px", minHeight: "28px",
          borderColor: "var(--amber-border)", color: "var(--amber)",
        }}
        onClick={async () => { await signOut(auth); router.push("/login"); }}
      >
        Salir del demo
      </button>
    </div>
  );
}
