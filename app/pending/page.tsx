"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import type { UserData } from "../types";

export default function PendingPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) { router.push("/login"); return; }

      const snap = await getDocs(query(collection(db, "users"), where("email", "==", user.email)));
      if (snap.empty) { router.push("/login"); return; }

      const data = snap.docs[0].data() as UserData;

      // If already approved, redirect away
      if (data.status !== "pending") {
        router.push(data.role === "admin" ? "/admin" : "/dashboard");
        return;
      }

      setUserData(data);
    });
    return () => unsub();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-deep)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div className="auth-card fade-up" style={{ maxWidth: "460px", textAlign: "center" }}>

        <img src="/logo.png" alt="Coffee Biochar" style={{ height: "64px", margin: "0 auto 28px" }} />

        {/* Pending icon */}
        <div style={{
          width: "64px", height: "64px", borderRadius: "50%",
          background: "var(--amber-glow)", border: "1px solid var(--amber-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="11" stroke="var(--amber)" strokeWidth="1.6"/>
            <path d="M14 8v7l4 2" stroke="var(--amber)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <p className="eyebrow" style={{ marginBottom: "10px" }}>Verificación pendiente</p>
        <h2 className="heading-3" style={{ marginBottom: "12px" }}>Tu cuenta está en revisión</h2>

        <p className="body-sm" style={{ lineHeight: 1.8, marginBottom: "20px" }}>
          El equipo de Coffee Biochar está verificando tu información.
          Cuando tu cuenta sea aprobada podrás acceder al programa de formación.
        </p>

        {userData && (
          <div style={{ padding: "16px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border)", marginBottom: "20px", textAlign: "left" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { l: "Nombre",   v: userData.name      },
                { l: "Correo",   v: userData.email     },
                { l: "Clúster",  v: userData.cluster   },
                { l: "Municipio",v: userData.municipio },
              ].map(({ l, v }) => v ? (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0 }}>{l}</span>
                  <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500, textAlign: "right" }}>{v}</span>
                </div>
              ) : null)}
            </div>
          </div>
        )}

        <p className="body-sm" style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "24px" }}>
          Si tienes dudas, contacta a tu coordinador de clúster.
        </p>

        <button
          className="btn btn-ghost btn-full"
          style={{ cursor: "pointer" }}
          onClick={async () => { await signOut(auth); router.push("/login"); }}
        >
          Cerrar sesión
        </button>

      </div>
    </div>
  );
}
