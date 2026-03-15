"use client";

import { useEffect, useRef, useState } from "react";
import { auth, db } from "../../firebase/config";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useModules } from "../hooks/useModules";
import { useSessions } from "../hooks/useSessions";
import { useUserProgress } from "../hooks/useUserProgress";
import type { Module, UserData } from "../types";

export default function Dashboard() {
  const router = useRouter();

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData,     setUserData]     = useState<UserData | null>(null);
  const [authLoading,  setAuthLoading]  = useState(true);
  const [certMsg,      setCertMsg]      = useState(false);
  const certAttempted = useRef(false);

  const { modules }                            = useModules();
  const { sessions }                           = useSessions();
  const { completed, setCompleted }            = useUserProgress(firebaseUser?.uid ?? null);

  /* AUTH */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) { router.push("/login"); return; }

      setFirebaseUser(user);

      const snap = await getDocs(
        query(collection(db, "users"), where("email", "==", user.email))
      );
      if (!snap.empty) setUserData(snap.docs[0].data() as UserData);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  /* HELPERS */
  const getModuleStatus = (module: Module): "approved" | "available" | "locked" => {
    const score = userData?.moduleScores?.[module.order];
    if (score !== undefined && score >= (module.passingScore || 60)) return "approved";

    const idx = modules.findIndex(m => m.id === module.id);
    if (idx === 0) return "available";

    const prev = modules[idx - 1];
    const prevScore = userData?.moduleScores?.[prev.order];
    if (prevScore !== undefined && prevScore >= (prev.passingScore || 60)) return "available";

    return "locked";
  };

  const progress        = sessions.length > 0 ? Math.round((completed.length / sessions.length) * 100) : 0;
  const approvedModules = modules.filter(m => getModuleStatus(m) === "approved").length;

  /* CERTIFICATE AUTO-GEN */
  useEffect(() => {
    if (certAttempted.current) return;
    if (!firebaseUser || !userData || modules.length === 0) return;
    if (approvedModules !== modules.length) return;

    certAttempted.current = true;

    (async () => {
      const snap = await getDocs(
        query(collection(db, "certificates"), where("userId", "==", firebaseUser.uid))
      );
      if (!snap.empty) return;

      await addDoc(collection(db, "certificates"), {
        userId: firebaseUser.uid,
        name: userData.name,
        certificateId: crypto.randomUUID(),
        issuedAt: new Date(),
      });
      setCertMsg(true);
    })();
  }, [firebaseUser, userData, modules, approvedModules]);

  /* COMPLETE SESSION */
  const completeSession = async (sessionId: string) => {
    if (completed.includes(sessionId)) return;
    const user = auth.currentUser;
    if (!user) return;
    await addDoc(collection(db, "progress"), { userId: user.uid, sessionId });
    setCompleted([...completed, sessionId]);
  };

  if (authLoading) {
    return (
      <div className="page-wrap flex-center" style={{ minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "2px solid var(--border)", borderTop: "2px solid var(--green-accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p className="body-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap">

      {/* ── NAV ──────────────────────────────────── */}
      <nav className="topnav">
        <span className="nav-logo">Coffee <span>Biochar</span></span>
        <div className="flex-gap-sm">
          {userData && (
            <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              {userData.name}
            </span>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => { signOut(auth); router.push("/login"); }}>
            Salir
          </button>
        </div>
      </nav>

      <div className="page-content">

        {/* ── CERT BANNER ───────────────────────── */}
        {certMsg && (
          <div className="msg-success fade-up" style={{ marginBottom: "20px", fontSize: "15px" }}>
            🎓 ¡Felicitaciones! Tu certificado ha sido generado.
          </div>
        )}

        {/* ── PROGRESS HERO ─────────────────────── */}
        <div
          className="card card-green-left fade-up"
          style={{ marginBottom: "24px", padding: "28px" }}
        >
          <div className="flex-between" style={{ marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: "6px" }}>Tu progreso</p>
              <h2 className="heading-1" style={{ lineHeight: 1 }}>
                <span style={{ color: "var(--green-accent)" }}>{progress}%</span>
                <span style={{ fontSize: "18px", color: "var(--text-muted)", fontWeight: 400 }}> completado</span>
              </h2>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "28px", fontFamily: "'Playfair Display',serif", fontWeight: 700, color: "var(--text-primary)" }}>
                {approvedModules}<span style={{ fontSize: "16px", color: "var(--text-muted)", fontWeight: 400 }}>/{modules.length}</span>
              </p>
              <p className="caption">Módulos aprobados</p>
            </div>
          </div>

          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          {/* Timeline chips */}
          <div className="flex-wrap" style={{ marginTop: "20px" }}>
            {modules.map((m, i) => {
              const s = getModuleStatus(m);
              return (
                <span
                  key={m.id}
                  className={`badge badge-${s === "approved" ? "green" : s === "available" ? "amber" : "muted"}`}
                >
                  {s === "approved" ? "✓" : s === "locked" ? "🔒" : "●"} M{i + 1}
                </span>
              );
            })}
          </div>
        </div>

        {/* ── MODULES ───────────────────────────── */}
        <h2 className="heading-2" style={{ marginBottom: "16px" }}>Módulos</h2>

        {modules.map((module, idx) => {
          const moduleSessions = sessions.filter(s => s.moduleId === module.id);
          const status         = getModuleStatus(module);
          const score          = userData?.moduleScores?.[module.order];
          const allDone        = moduleSessions.length > 0 && moduleSessions.every(s => completed.includes(s.id));
          const isLocked       = status === "locked";

          return (
            <div
              key={module.id}
              className={`card fade-up-${Math.min(idx + 1, 3)}`}
              style={{
                marginBottom: "12px",
                opacity: isLocked ? 0.55 : 1,
                borderColor: status === "approved" ? "var(--green-border)" : undefined,
              }}
            >
              {/* Module header */}
              <div className="flex-between" style={{ flexWrap: "wrap", gap: "10px" }}>
                <div className="flex-gap-sm">
                  <div className="mod-num">{String(idx + 1).padStart(2, "0")}</div>
                  <div>
                    <h3 className="heading-3" style={{ fontSize: "17px", marginBottom: "4px" }}>
                      {module.title}
                    </h3>
                    <p className="body-sm">{moduleSessions.length} sesiones</p>
                  </div>
                </div>

                <div className="flex-gap-sm">
                  {status === "approved" && (
                    <span className="badge badge-green">✓ Aprobado · {score} pts</span>
                  )}
                  {status === "available" && (
                    <span className="badge badge-amber">● Disponible</span>
                  )}
                  {status === "locked" && (
                    <span className="badge badge-muted">🔒 Bloqueado</span>
                  )}
                </div>
              </div>

              {/* Sessions */}
              {!isLocked && moduleSessions.length > 0 && (
                <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div className="divider-sm" style={{ marginTop: 0 }} />

                  {moduleSessions.map(session => {
                    const done = completed.includes(session.id);
                    return (
                      <div
                        key={session.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          background: done ? "rgba(82,183,136,0.05)" : "var(--bg-elevated)",
                          flexWrap: "wrap",
                        }}
                      >
                        <div className="flex-gap-sm" style={{ flex: 1 }}>
                          <div style={{
                            width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                            background: done ? "var(--green-glow)" : "rgba(255,255,255,0.05)",
                            border: done ? "1px solid var(--green-border)" : "1px solid var(--border)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "10px", color: done ? "var(--green-accent)" : "var(--text-muted)",
                          }}>
                            {done ? "✓" : ""}
                          </div>
                          <span style={{ fontSize: "14px", color: done ? "var(--text-secondary)" : "var(--text-primary)" }}>
                            {session.title}
                          </span>
                        </div>

                        <div className="flex-gap-sm">
                          {session.material && (
                            <a
                              href={session.material}
                              target="_blank"
                              className="btn btn-ghost btn-sm"
                              style={{ fontSize: "12px", padding: "6px 12px" }}
                            >
                              Material
                            </a>
                          )}
                          <button
                            onClick={() => { window.open(session.link, "_blank"); completeSession(session.id); }}
                            className={`btn btn-sm ${done ? "btn-ghost" : "btn-primary"}`}
                            style={{ fontSize: "13px" }}
                          >
                            {done ? "Ver de nuevo" : "▶ Ver sesión"}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Evaluation CTA */}
                  {status === "available" && allDone && (
                    <div
                      style={{
                        marginTop: "8px",
                        padding: "16px",
                        borderRadius: "8px",
                        background: "rgba(233,196,106,0.06)",
                        border: "1px solid rgba(233,196,106,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--amber)", marginBottom: "2px" }}>
                          ¡Todas las sesiones completadas!
                        </p>
                        <p className="body-sm">Ya puedes tomar la evaluación del módulo.</p>
                      </div>
                      <button
                        className="btn btn-amber btn-sm"
                        onClick={() => window.open(module.formLink, "_blank")}
                      >
                        Tomar evaluación
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}
