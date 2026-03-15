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

/* ── SVG icons (no emojis) ── */
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconLock = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <rect x="2.5" y="5.5" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M4 5.5V4a2 2 0 014 0v1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const IconPlay = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M3 2.5l6 3.5-6 3.5V2.5z" fill="currentColor"/>
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCert = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="3" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 17l4-2 4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 8h6M7 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

export default function Dashboard() {
  const router = useRouter();

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData,     setUserData]     = useState<UserData | null>(null);
  const [authLoading,  setAuthLoading]  = useState(true);
  const [certMsg,      setCertMsg]      = useState(false);
  const [certificate,  setCertificate]  = useState<{ certificateId: string } | null>(null);
  const [copied,       setCopied]       = useState(false);
  const [sessionToast, setSessionToast] = useState("");
  const [evalOpened,   setEvalOpened]   = useState<Record<string, boolean>>({});
  const [scrolled,     setScrolled]     = useState(false);
  const certAttempted = useRef(false);

  const { modules, loading: modulesLoading } = useModules();
  const { sessions }                         = useSessions();
  const { completed, setCompleted } = useUserProgress(firebaseUser?.uid ?? null);

  /* ── AUTH ─────────────────────────────────────────── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) { router.push("/login"); return; }
      setFirebaseUser(user);
      const snap = await getDocs(query(collection(db, "users"), where("email", "==", user.email)));
      if (!snap.empty) {
        const data = snap.docs[0].data() as UserData;
        if (data.status === "pending") { router.push("/pending"); return; }
        setUserData(data);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  /* ── HELPERS ──────────────────────────────────────── */
  const getModuleStatus = (module: Module): "approved" | "available" | "locked" => {
    const score = userData?.moduleScores?.[module.order];
    if (score !== undefined && score >= (module.passingScore || 70)) return "approved";
    const idx = modules.findIndex(m => m.id === module.id);
    if (idx === 0) return "available";
    const prev = modules[idx - 1];
    const prevScore = userData?.moduleScores?.[prev.order];
    if (prevScore !== undefined && prevScore >= (prev.passingScore || 70)) return "available";
    return "locked";
  };

  const progress        = sessions.length > 0 ? Math.round((completed.length / sessions.length) * 100) : 0;
  const approvedModules = modules.filter(m => getModuleStatus(m) === "approved").length;

  /* Next step logic */
  const nextStep = (() => {
    if (approvedModules === modules.length && modules.length > 0) return null; // all done
    for (const mod of modules) {
      const status = getModuleStatus(mod);
      if (status === "locked") continue;
      const modSessions = sessions.filter(s => s.moduleId === mod.id);
      const doneSessions = modSessions.filter(s => completed.includes(s.id));
      if (status === "available" && doneSessions.length < modSessions.length) {
        const nextSession = modSessions.find(s => !completed.includes(s.id));
        return { type: "session" as const, module: mod, session: nextSession };
      }
      if (status === "available" && doneSessions.length === modSessions.length) {
        return { type: "eval" as const, module: mod };
      }
    }
    return null;
  })();

  /* ── CERT AUTO-GEN ────────────────────────────────── */
  useEffect(() => {
    if (certAttempted.current) return;
    if (!firebaseUser || !userData || modules.length === 0) return;
    if (approvedModules !== modules.length) return;

    certAttempted.current = true;
    (async () => {
      const snap = await getDocs(query(collection(db, "certificates"), where("userId", "==", firebaseUser.uid)));
      if (!snap.empty) {
        setCertificate(snap.docs[0].data() as { certificateId: string });
        return;
      }
      const certId = crypto.randomUUID();
      await addDoc(collection(db, "certificates"), {
        userId: firebaseUser.uid,
        name: userData.name,
        certificateId: certId,
        issuedAt: new Date(),
      });
      setCertificate({ certificateId: certId });
      setCertMsg(true);
    })();
  }, [firebaseUser, userData, modules, approvedModules]);

  /* Also load certificate if already exists */
  useEffect(() => {
    if (!firebaseUser || certificate) return;
    (async () => {
      const snap = await getDocs(query(collection(db, "certificates"), where("userId", "==", firebaseUser.uid)));
      if (!snap.empty) setCertificate(snap.docs[0].data() as { certificateId: string });
    })();
  }, [firebaseUser]);

  /* ── SCROLL TO TOP ────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── COMPLETE SESSION ─────────────────────────────── */
  const completeSession = async (sessionId: string, sessionTitle?: string) => {
    if (completed.includes(sessionId)) return;
    const user = auth.currentUser;
    if (!user) return;
    await addDoc(collection(db, "progress"), { userId: user.uid, sessionId });
    setCompleted([...completed, sessionId]);
    setSessionToast(sessionTitle ? `"${sessionTitle}" marcada como completada` : "Sesión completada");
    setTimeout(() => setSessionToast(""), 3000);
  };

  const copyLink = (certId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/certificate/${certId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  /* ── LOADING ──────────────────────────────────────── */
  if (authLoading) {
    return (
      <div className="page-wrap flex-center" style={{ minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "36px", height: "36px", border: "2px solid var(--border)", borderTop: "2px solid var(--amber)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
          <p className="body-sm">Cargando tu programa...</p>
        </div>
      </div>
    );
  }

  const allDone = approvedModules === modules.length && modules.length > 0;

  return (
    <div className="page-wrap">

      {/* ── NAV ──────────────────────────────── */}
      <nav className="topnav">
        <div className="nav-logo">
          <img src="/logo.png" alt="Coffee Biochar" style={{ height: "34px", width: "auto" }} />
        </div>
        <div className="flex-gap-sm">
          {userData && (
            <a href="/profile" style={{ fontSize: "14px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}
              title="Ver mi perfil">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M2.5 13c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              {userData.name.split(" ")[0]}
            </a>
          )}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { signOut(auth); router.push("/login"); }}
            style={{ cursor: "pointer" }}
          >
            Salir
          </button>
        </div>
      </nav>

      <div className="page-content">

        {/* ── SESSION TOAST ─────────────────── */}
        {sessionToast && (
          <div className="fade-up" role="status" aria-live="polite" style={{
            position: "fixed", bottom: "calc(24px + env(safe-area-inset-bottom, 0px))", left: "50%", transform: "translateX(-50%)",
            background: "var(--green-glow)", border: "1px solid var(--green-border)",
            color: "var(--green)", padding: "10px 20px", borderRadius: "var(--radius-pill)",
            fontSize: "13px", fontWeight: 600, zIndex: 50, whiteSpace: "nowrap",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {sessionToast}
          </div>
        )}

        {/* ── CERT NEW BANNER ───────────────── */}
        {certMsg && (
          <div className="msg-success fade-up" style={{ marginBottom: "20px", fontSize: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
            <IconCert />
            <span style={{ flex: 1 }}>¡Felicitaciones! Tu certificado ha sido generado y está listo para compartir.</span>
            <button onClick={() => setCertMsg(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", opacity: 0.7, fontSize: "18px", lineHeight: 1, padding: "0 4px" }}>×</button>
          </div>
        )}

        {/* ── GREETING ──────────────────────── */}
        <div style={{ marginBottom: "24px" }}>
          <p className="eyebrow" style={{ marginBottom: "4px" }}>Academia Coffee Biochar</p>
          <h1 className="heading-2" style={{ lineHeight: 1.2 }}>
            {userData?.name ? `Hola, ${userData.name.split(" ")[0]}` : "Tu programa"}
          </h1>
          {userData?.municipio && (
            <p className="body-sm" style={{ marginTop: "4px" }}>
              {userData.cluster} · {userData.municipio}
            </p>
          )}
        </div>

        {/* ── NEXT STEP CARD ────────────────── */}
        {!allDone && nextStep && (
          <div className="next-step-card fade-up" style={{ marginBottom: "20px" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--green)", marginBottom: "4px" }}>
                Próximo paso
              </p>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>
                {nextStep.type === "session"
                  ? nextStep.session?.title ?? "Continúa tu sesión"
                  : `Tomar evaluación — ${nextStep.module.title}`}
              </p>
              <p className="body-sm">
                {nextStep.type === "session"
                  ? `Módulo ${modules.findIndex(m => m.id === nextStep.module.id) + 1} · ${nextStep.module.title}`
                  : "Completaste todas las sesiones de este módulo"}
              </p>
            </div>
            <button
              className={`btn btn-sm ${nextStep.type === "eval" ? "btn-amber" : "btn-green"}`}
              style={{ cursor: "pointer", gap: "8px" }}
              onClick={() => {
                if (nextStep.type === "eval") {
                  window.open(nextStep.module.formLink, "_blank");
                } else if (nextStep.session) {
                  window.open(nextStep.session.link, "_blank");
                  completeSession(nextStep.session.id, nextStep.session.title);
                }
              }}
            >
              {nextStep.type === "eval" ? "Ir a evaluación" : "Ver sesión"}
              <IconArrow />
            </button>
          </div>
        )}

        {/* ── ALL DONE CARD ─────────────────── */}
        {allDone && (
          <div className="next-step-card fade-up" style={{ marginBottom: "20px", borderLeftColor: "var(--amber)", borderColor: "var(--amber-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--amber-glow)", border: "1px solid var(--amber-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--amber)", flexShrink: 0 }}>
                <IconCert />
              </div>
              <div>
                <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--amber)", marginBottom: "2px" }}>
                  Programa completado
                </p>
                <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Eres Extensionista Certificado Coffee Biochar
                </p>
              </div>
            </div>
            {certificate && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <a href={`/certificate/${certificate.certificateId}`} target="_blank" rel="noreferrer">
                  <button className="btn btn-primary btn-sm" style={{ cursor: "pointer" }}>Ver certificado</button>
                </a>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ cursor: "pointer", color: copied ? "var(--green)" : undefined, borderColor: copied ? "var(--green-border)" : undefined }}
                  onClick={() => copyLink(certificate.certificateId)}
                >
                  {copied ? "¡Copiado!" : "Copiar enlace"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── PROGRESS HERO ─────────────────── */}
        <div className="card fade-up" style={{ marginBottom: "28px", padding: "24px" }}>

          {/* top row */}
          <div className="flex-between" style={{ marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: "4px" }}>Tu progreso</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span
                  className="stat-xl"
                  title={`${completed.length} de ${sessions.length} sesiones completadas`}
                >
                  {progress}%
                </span>
                <span className="body-sm">de sesiones</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", justifyContent: "flex-end" }}>
                <span className="stat-lg">
                  {approvedModules}
                </span>
                <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>/ {modules.length}</span>
              </div>
              <p className="caption" style={{ marginTop: "2px" }}>Módulos aprobados</p>
            </div>
          </div>

          {/* main bar */}
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          {/* sessions count */}
          <p className="body-sm" style={{ marginTop: "10px" }}>
            {completed.length} de {sessions.length} sesiones completadas
          </p>

          {/* module chips */}
          <div className="flex-wrap" style={{ marginTop: "16px", alignItems: "center" }}>
            {modules.map((m, i) => {
              const s = getModuleStatus(m);
              const tooltipText = s === "approved"
                ? `Módulo ${i + 1} aprobado`
                : s === "available"
                ? `Módulo ${i + 1} disponible`
                : `Módulo ${i + 1} bloqueado — aprueba el módulo anterior`;
              return (
                <span
                  key={m.id}
                  className={`badge badge-${s === "approved" ? "green" : s === "available" ? "amber" : "muted"}`}
                  style={{ cursor: "default" }}
                  title={tooltipText}
                  aria-label={tooltipText}
                  role="status"
                >
                  {s === "approved" ? <span aria-hidden="true"><IconCheck /></span> : s === "locked" ? <span aria-hidden="true"><IconLock /></span> : null}
                  M{i + 1}
                </span>
              );
            })}
            {/* Color legend — visible on all screens */}
            {modules.length > 0 && (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginLeft: "4px" }}>
                {[
                  { dot: "var(--green)", label: "Aprobado" },
                  { dot: "var(--amber)", label: "En curso" },
                  { dot: "var(--text-muted)", label: "Bloqueado" },
                ].map(({ dot, label }) => (
                  <span key={label} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--text-muted)" }}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: dot, display: "inline-block", flexShrink: 0 }} />
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── MODULES ───────────────────────── */}
        <h2 className="heading-3" style={{ marginBottom: "14px", fontSize: "16px", color: "var(--text-secondary)", fontFamily: "'Inter',sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Módulos del programa
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {modulesLoading ? (
            /* Skeleton cards */
            [1, 2, 3].map(n => (
              <div key={n} className="card" style={{ padding: "22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "var(--radius-sm)", background: "var(--border)", animation: "pulse 1.5s ease-in-out infinite" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: "14px", width: "55%", background: "var(--border)", borderRadius: "4px", marginBottom: "8px", animation: "pulse 1.5s ease-in-out infinite" }} />
                    <div style={{ height: "11px", width: "30%", background: "var(--border)", borderRadius: "4px", animation: "pulse 1.5s ease-in-out infinite" }} />
                  </div>
                  <div style={{ width: "72px", height: "24px", borderRadius: "var(--radius-pill)", background: "var(--border)", animation: "pulse 1.5s ease-in-out infinite" }} />
                </div>
              </div>
            ))
          ) : modules.map((module, idx) => {
            const moduleSessions = sessions.filter(s => s.moduleId === module.id);
            const status         = getModuleStatus(module);
            const score          = userData?.moduleScores?.[module.order];
            const doneSessions   = moduleSessions.filter(s => completed.includes(s.id));
            const allSessionsDone = moduleSessions.length > 0 && doneSessions.length === moduleSessions.length;
            const isLocked       = status === "locked";
            const sessionPct     = moduleSessions.length > 0 ? Math.round((doneSessions.length / moduleSessions.length) * 100) : 0;

            return (
              <div
                key={module.id}
                className={`card fade-up-${Math.min(idx + 1, 3)}`}
                style={{
                  opacity: isLocked ? 0.6 : 1,
                  borderColor: status === "approved"
                    ? "var(--green-border)"
                    : status === "available"
                    ? "var(--amber-border)"
                    : undefined,
                  transition: "opacity .2s",
                  position: "relative",
                }}
              >
                {/* Locked banner */}
                {isLocked && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "8px 12px", marginBottom: "14px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border)",
                    fontSize: "12px", color: "var(--text-muted)",
                  }}>
                    <IconLock />
                    Completa y aprueba el módulo anterior para desbloquear este contenido
                  </div>
                )}

                {/* Module header */}
                <div className="flex-between" style={{ flexWrap: "wrap", gap: "10px" }}>
                  <div className="flex-gap-sm">
                    <div
                      className="mod-num"
                      style={{
                        background: status === "approved" ? "var(--green-glow)" : undefined,
                        borderColor: status === "approved" ? "var(--green-border)" : undefined,
                        color: status === "approved" ? "var(--green)" : undefined,
                      }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "3px", color: "var(--text-primary)", fontFamily: "'Playfair Display',serif" }}>
                        {module.title}
                      </h3>
                      <p className="body-sm">
                        {moduleSessions.length} sesiones
                        {!isLocked && moduleSessions.length > 0 && (
                          <span style={{ color: "var(--text-muted)", marginLeft: "6px" }}>
                            · {doneSessions.length}/{moduleSessions.length} completadas
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    {status === "approved" && (
                      <span className="badge badge-green">
                        <IconCheck /> Aprobado · {score} pts
                      </span>
                    )}
                    {status === "available" && !allSessionsDone && (
                      <span className="badge badge-amber">En progreso</span>
                    )}
                    {status === "available" && allSessionsDone && (
                      <span className="badge badge-amber">Listo para evaluar</span>
                    )}
                    {status === "locked" && (
                      <span className="badge badge-muted">
                        <IconLock /> Bloqueado
                      </span>
                    )}
                  </div>
                </div>

                {/* Module progress bar (only when available and not approved) */}
                {!isLocked && status !== "approved" && moduleSessions.length > 0 && (
                  <div className="module-progress">
                    <div className="module-progress-fill" style={{ width: `${sessionPct}%` }} />
                  </div>
                )}

                {/* Sessions */}
                {!isLocked && moduleSessions.length > 0 && (
                  <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div className="divider-sm" style={{ margin: "0 0 8px" }} />

                    {moduleSessions.map(session => {
                      const done = completed.includes(session.id);
                      return (
                        <div
                          key={session.id}
                          className={`session-row ${done ? "session-row-done" : ""}`}
                        >
                          {/* Check */}
                          <div className={`session-check ${done ? "session-check-done" : ""}`}>
                            {done && <IconCheck />}
                          </div>

                          {/* Title */}
                          <span style={{ flex: 1, fontSize: "14px", color: done ? "var(--text-secondary)" : "var(--text-primary)", lineHeight: 1.4 }}>
                            {session.title}
                          </span>

                          {/* Actions */}
                          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                            {session.material && (
                              <a
                                href={session.material}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-ghost btn-sm"
                                style={{ fontSize: "12px", padding: "5px 12px", minHeight: "34px", cursor: "pointer" }}
                              >
                                Material
                              </a>
                            )}
                            <button
                              onClick={() => {
                                window.open(session.link, "_blank");
                                completeSession(session.id, session.title);
                              }}
                              className={`btn btn-sm ${done ? "btn-ghost" : "btn-primary"}`}
                              style={{ fontSize: "12px", padding: "5px 14px", minHeight: "34px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                            >
                              {!done && <IconPlay />}
                              {done ? "Repasar" : "Ver sesión"}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Eval CTA */}
                    {status === "available" && allSessionsDone && (
                      <>
                        <div className="eval-cta">
                          <div>
                            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--amber)", marginBottom: "2px" }}>
                              Sesiones completadas · ¡Puedes evaluar!
                            </p>
                            <p className="body-sm">Nota mínima de aprobación: 70 puntos</p>
                          </div>
                          <button
                            className="btn btn-amber btn-sm"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              window.open(module.formLink, "_blank");
                              setEvalOpened(prev => ({ ...prev, [module.id]: true }));
                            }}
                          >
                            Tomar evaluación
                          </button>
                        </div>
                        {evalOpened[module.id] && (
                          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px", textAlign: "center", lineHeight: 1.5 }}>
                            Completa el formulario y regresa aquí — el admin registrará tu puntaje para desbloquear el siguiente módulo.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Locked hint */}
                {isLocked && idx > 0 && (
                  <p className="body-sm" style={{ marginTop: "10px" }}>
                    Aprueba el módulo anterior para desbloquear.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ height: "48px" }} />
      </div>

      {/* ── SCROLL TO TOP ──────────────────── */}
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
    </div>
  );
}
