"use client";

import { useEffect, useRef, useState } from "react";
import { auth, db } from "../../firebase/config";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useModules } from "../hooks/useModules";
import { useSessions } from "../hooks/useSessions";
import { useUserProgress } from "../hooks/useUserProgress";
import DemoBanner from "../components/DemoBanner";
import type { Module, UserData } from "../types";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

/* ── SVG icons ─────────────────────────────────────────────────── */
const IconCheck = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconLock = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <rect x="2.5" y="5.5" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M4 5.5V4a2 2 0 014 0v1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const IconPlay = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M3 2.5l6 3.5-6 3.5V2.5z" fill="currentColor"/>
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCert = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="2" y="3" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 17l4-2 4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 8h6M7 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);
const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M2.5 13c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);
const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M5 7h7M9 4.5l2.5 2.5L9 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 2H3a1 1 0 00-1 1v8a1 1 0 001 1h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

/* ── Progress Ring ──────────────────────────────────────────────── */
function ProgressRing({
  pct,
  size = 52,
  stroke = 3.5,
  color = "#F5A623",
  trackColor = "rgba(255,255,255,0.06)",
}: {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
}) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(pct, 100) / 100);
  const cx = size / 2;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <circle
        cx={cx} cy={cx} r={r} fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  );
}

/* ── Custom Recharts Tooltip ──────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1A1712", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "8px", padding: "8px 12px", fontSize: "12px",
    }}>
      <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "2px" }}>{label}</p>
      <p style={{ color: "#F5A623", fontWeight: 700 }}>{payload[0].value}% completado</p>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════ */
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
  const [expandedMod,  setExpandedMod]  = useState<string | null>(null);
  const certAttempted = useRef(false);

  const { modules, loading: modulesLoading } = useModules();
  const { sessions }                         = useSessions();
  const { completed, setCompleted } = useUserProgress(firebaseUser?.uid ?? null);

  /* ── AUTH ────────────────────────────────────────────────── */
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

  /* ── HELPERS ─────────────────────────────────────────────── */
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
    if (approvedModules === modules.length && modules.length > 0) return null;
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

  /* Recharts data — module completion % */
  const chartData = modules.map((m, i) => {
    const modSessions = sessions.filter(s => s.moduleId === m.id);
    const done = modSessions.filter(s => completed.includes(s.id)).length;
    const pct = modSessions.length > 0 ? Math.round((done / modSessions.length) * 100) : 0;
    return { name: `M${i + 1}`, pct, status: getModuleStatus(m) };
  });

  /* ── CERT AUTO-GEN ───────────────────────────────────────── */
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

  useEffect(() => {
    if (!firebaseUser || certificate) return;
    (async () => {
      const snap = await getDocs(query(collection(db, "certificates"), where("userId", "==", firebaseUser.uid)));
      if (!snap.empty) setCertificate(snap.docs[0].data() as { certificateId: string });
    })();
  }, [firebaseUser]);

  /* ── SCROLL ──────────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── COMPLETE SESSION ────────────────────────────────────── */
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

  /* ── LOADING ─────────────────────────────────────────────── */
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0C0A07" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "36px", height: "36px", border: "2px solid rgba(255,255,255,0.08)", borderTop: "2px solid #F5A623", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>Cargando tu programa...</p>
        </div>
      </div>
    );
  }

  const allDone = approvedModules === modules.length && modules.length > 0;

  return (
    <div className="page-wrap">

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className="topnav">
        <div className="nav-logo">
          <img src="/logo.png" alt="Coffee Biochar Academy" style={{ height: "32px", width: "auto" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {userData && (
            <a
              href="/profile"
              title="Ver mi perfil"
              style={{
                display: "flex", alignItems: "center", gap: "7px",
                fontSize: "13px", color: "rgba(255,255,255,0.55)",
                padding: "6px 10px", borderRadius: "8px",
                border: "1px solid transparent",
                transition: "all 0.15s",
                textDecoration: "none",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.85)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "transparent";
                (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.55)";
              }}
            >
              <IconUser />
              {userData.name.split(" ")[0]}
            </a>
          )}
          <button
            onClick={() => { signOut(auth); router.push("/login"); }}
            title="Cerrar sesión"
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              fontSize: "13px", color: "rgba(255,255,255,0.4)",
              padding: "6px 10px", borderRadius: "8px",
              border: "1px solid transparent", background: "none",
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.65)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)";
            }}
          >
            <IconLogout />
            Salir
          </button>
        </div>
      </nav>

      <DemoBanner />

      <div className="page-content">

        {/* ── SESSION TOAST ─────────────────────────────────── */}
        {sessionToast && (
          <div
            role="status"
            aria-live="polite"
            style={{
              position: "fixed",
              bottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
              left: "50%", transform: "translateX(-50%)",
              background: "rgba(122, 182, 72, 0.15)",
              border: "1px solid rgba(122, 182, 72, 0.3)",
              color: "#7AB648", padding: "10px 20px",
              borderRadius: "100px", fontSize: "13px",
              fontWeight: 600, zIndex: 50, whiteSpace: "nowrap",
              boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
              display: "flex", alignItems: "center", gap: "8px",
              backdropFilter: "blur(12px)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {sessionToast}
          </div>
        )}

        {/* ── CERT NEW BANNER ───────────────────────────────── */}
        {certMsg && (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "14px 18px", borderRadius: "12px",
            background: "rgba(245, 166, 35, 0.08)",
            border: "1px solid rgba(245, 166, 35, 0.25)",
            marginBottom: "20px", fontSize: "14px",
            color: "rgba(255,255,255,0.85)",
          }}>
            <span style={{ color: "#F5A623", flexShrink: 0 }}><IconCert /></span>
            <span style={{ flex: 1 }}>¡Felicitaciones! Tu certificado ha sido generado y está listo para compartir.</span>
            <button
              onClick={() => setCertMsg(false)}
              aria-label="Cerrar"
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: "18px", lineHeight: 1, padding: "0 4px" }}
            >×</button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            HERO HEADER — Greeting + Progress
        ═══════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: "28px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#F5A623", marginBottom: "6px", opacity: 0.7 }}>
            Coffee Biochar Academy
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(26px, 5vw, 36px)",
            fontWeight: 700, lineHeight: 1.15,
            color: "rgba(255,255,255,0.92)",
            marginBottom: "4px",
          }}>
            {userData?.name ? `Hola, ${userData.name.split(" ")[0]}` : "Tu programa"}
          </h1>
          {userData?.municipio && (
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", marginTop: "4px" }}>
              {userData.cluster} · {userData.municipio}
            </p>
          )}
        </div>

        {/* ── PROGRESS HERO CARD ─────────────────────────────── */}
        <div
          className="card fade-up"
          style={{
            padding: "24px 28px",
            marginBottom: "20px",
            background: "linear-gradient(135deg, rgba(245,166,35,0.06) 0%, rgba(12,10,7,0) 60%), rgba(255,255,255,0.03)",
            border: "1px solid rgba(245,166,35,0.15)",
            position: "relative", overflow: "hidden",
          }}
        >
          {/* decorative glow */}
          <div style={{
            position: "absolute", top: "-60px", right: "-60px",
            width: "180px", height: "180px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", flexWrap: "wrap" }}>
            {/* Left: progress % */}
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <ProgressRing pct={progress} size={72} stroke={4.5} color="#F5A623" />
                <span style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", fontWeight: 800, color: "#F5A623",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {progress}%
                </span>
              </div>
              <div>
                <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginBottom: "3px" }}>
                  Progreso general
                </p>
                <p style={{ fontSize: "22px", fontWeight: 800, color: "rgba(255,255,255,0.9)", lineHeight: 1 }}>
                  {completed.length}
                  <span style={{ fontSize: "14px", fontWeight: 400, color: "rgba(255,255,255,0.35)", marginLeft: "4px" }}>
                    / {sessions.length} sesiones
                  </span>
                </p>
              </div>
            </div>

            {/* Right: modules approved */}
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginBottom: "3px" }}>
                Módulos aprobados
              </p>
              <p style={{ fontSize: "22px", fontWeight: 800, color: "rgba(255,255,255,0.9)", lineHeight: 1 }}>
                {approvedModules}
                <span style={{ fontSize: "14px", fontWeight: 400, color: "rgba(255,255,255,0.35)", marginLeft: "4px" }}>
                  / {modules.length}
                </span>
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: "20px" }}>
            <div style={{ height: "5px", borderRadius: "100px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: "100px",
                background: "linear-gradient(90deg, #F5A623, #7AB648)",
                width: `${progress}%`,
                transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
              }} />
            </div>
            {/* Module chips */}
            <div style={{ display: "flex", gap: "6px", marginTop: "12px", flexWrap: "wrap", alignItems: "center" }}>
              {modules.map((m, i) => {
                const s = getModuleStatus(m);
                return (
                  <span
                    key={m.id}
                    title={s === "approved" ? `M${i+1} aprobado` : s === "available" ? `M${i+1} en progreso` : `M${i+1} bloqueado`}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "4px",
                      padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700,
                      letterSpacing: "0.03em",
                      background: s === "approved"
                        ? "rgba(122,182,72,0.15)"
                        : s === "available"
                        ? "rgba(245,166,35,0.12)"
                        : "rgba(255,255,255,0.04)",
                      border: `1px solid ${s === "approved" ? "rgba(122,182,72,0.3)" : s === "available" ? "rgba(245,166,35,0.25)" : "rgba(255,255,255,0.07)"}`,
                      color: s === "approved" ? "#7AB648" : s === "available" ? "#F5A623" : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {s === "approved" ? <IconCheck size={9} /> : s === "locked" ? <IconLock size={9} /> : null}
                    M{i + 1}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            NEXT STEP CARD
        ═══════════════════════════════════════════════════════ */}
        {!allDone && nextStep && (
          <div
            className="fade-up"
            style={{
              padding: "20px 24px",
              borderRadius: "14px",
              marginBottom: "20px",
              background: nextStep.type === "eval"
                ? "rgba(245,166,35,0.07)"
                : "rgba(122,182,72,0.07)",
              border: `1px solid ${nextStep.type === "eval" ? "rgba(245,166,35,0.25)" : "rgba(122,182,72,0.25)"}`,
              display: "flex", alignItems: "center",
              gap: "16px", flexWrap: "wrap",
            }}
          >
            <div style={{
              width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0,
              background: nextStep.type === "eval" ? "rgba(245,166,35,0.15)" : "rgba(122,182,72,0.15)",
              border: `1px solid ${nextStep.type === "eval" ? "rgba(245,166,35,0.3)" : "rgba(122,182,72,0.3)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: nextStep.type === "eval" ? "#F5A623" : "#7AB648",
              fontSize: "18px",
            }}>
              {nextStep.type === "eval"
                ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><rect x="3" y="2" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M6 6h6M6 9h6M6 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                : <IconPlay />
              }
            </div>

            <div style={{ flex: 1, minWidth: "200px" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: nextStep.type === "eval" ? "#F5A623" : "#7AB648", marginBottom: "3px" }}>
                Próximo paso
              </p>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "rgba(255,255,255,0.9)", marginBottom: "2px", lineHeight: 1.3 }}>
                {nextStep.type === "session"
                  ? nextStep.session?.title ?? "Continúa tu sesión"
                  : `Evaluación — ${nextStep.module.title}`}
              </p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
                {nextStep.type === "session"
                  ? `Módulo ${modules.findIndex(m => m.id === nextStep.module.id) + 1} · ${nextStep.module.title}`
                  : "Completaste todas las sesiones de este módulo"}
              </p>
            </div>

            <button
              className={`btn btn-sm ${nextStep.type === "eval" ? "btn-amber" : "btn-green"}`}
              style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, paddingLeft: "18px", paddingRight: "18px" }}
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

        {/* ═══════════════════════════════════════════════════════
            ALL DONE — Certificate Card
        ═══════════════════════════════════════════════════════ */}
        {allDone && (
          <div
            className="fade-up"
            style={{
              padding: "24px", borderRadius: "14px", marginBottom: "20px",
              background: "linear-gradient(135deg, rgba(245,166,35,0.1), rgba(122,182,72,0.06))",
              border: "1px solid rgba(245,166,35,0.3)",
              display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap",
            }}
          >
            <div style={{
              width: "48px", height: "48px", borderRadius: "12px",
              background: "rgba(245,166,35,0.15)",
              border: "1px solid rgba(245,166,35,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#F5A623", flexShrink: 0,
            }}>
              <IconCert />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#F5A623", marginBottom: "3px" }}>
                Programa completado
              </p>
              <p style={{ fontSize: "16px", fontWeight: 700, color: "rgba(255,255,255,0.9)", fontFamily: "'Playfair Display', serif" }}>
                Eres Extensionista Certificado Coffee Biochar
              </p>
            </div>
            {certificate && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <a href={`/certificate/${certificate.certificateId}`} target="_blank" rel="noreferrer">
                  <button className="btn btn-primary btn-sm" style={{ cursor: "pointer" }}>Ver certificado</button>
                </a>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ cursor: "pointer", color: copied ? "#7AB648" : undefined }}
                  onClick={() => copyLink(certificate.certificateId)}
                >
                  {copied ? "¡Copiado!" : "Copiar enlace"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            MODULE GRID — 2×3
        ═══════════════════════════════════════════════════════ */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <h2 style={{
            fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)",
          }}>
            Módulos del programa
          </h2>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>
            {approvedModules}/{modules.length} aprobados
          </span>
        </div>

        {/* Module grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
          gap: "12px",
          marginBottom: "28px",
        }}>
          {modulesLoading ? (
            [1,2,3,4,5,6].map(n => (
              <div key={n} className="card" style={{ padding: "20px", minHeight: "130px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", animation: "pulse 1.5s ease-in-out infinite", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: "13px", width: "60%", background: "rgba(255,255,255,0.05)", borderRadius: "4px", marginBottom: "8px", animation: "pulse 1.5s ease-in-out infinite" }} />
                    <div style={{ height: "11px", width: "40%", background: "rgba(255,255,255,0.04)", borderRadius: "4px", animation: "pulse 1.5s ease-in-out infinite" }} />
                  </div>
                </div>
              </div>
            ))
          ) : modules.map((module, idx) => {
            const moduleSessions  = sessions.filter(s => s.moduleId === module.id);
            const status          = getModuleStatus(module);
            const score           = userData?.moduleScores?.[module.order];
            const doneSessions    = moduleSessions.filter(s => completed.includes(s.id));
            const allSessionsDone = moduleSessions.length > 0 && doneSessions.length === moduleSessions.length;
            const isLocked        = status === "locked";
            const sessionPct      = moduleSessions.length > 0 ? Math.round((doneSessions.length / moduleSessions.length) * 100) : 0;
            const isExpanded      = expandedMod === module.id;

            const ringColor = status === "approved" ? "#7AB648" : status === "available" ? "#F5A623" : "rgba(255,255,255,0.12)";
            const borderColor = status === "approved"
              ? "rgba(122,182,72,0.2)"
              : status === "available"
              ? "rgba(245,166,35,0.2)"
              : "rgba(255,255,255,0.04)";

            return (
              <div
                key={module.id}
                className={`card fade-up-${Math.min(idx + 1, 3)}`}
                style={{
                  padding: "20px",
                  borderColor,
                  opacity: isLocked ? 0.55 : 1,
                  cursor: isLocked ? "default" : "pointer",
                  transition: "border-color 0.2s, opacity 0.2s, transform 0.15s, box-shadow 0.15s",
                }}
                onClick={() => !isLocked && setExpandedMod(isExpanded ? null : module.id)}
                onMouseEnter={e => {
                  if (!isLocked) {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)";
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = "";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                }}
              >
                {/* Card header */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  {/* Progress ring with module number */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <ProgressRing
                      pct={status === "approved" ? 100 : sessionPct}
                      size={52}
                      stroke={3}
                      color={ringColor}
                    />
                    <span style={{
                      position: "absolute", inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", fontWeight: 800,
                      color: status === "approved" ? "#7AB648" : status === "available" ? "#F5A623" : "rgba(255,255,255,0.3)",
                    }}>
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: "14px", fontWeight: 600, lineHeight: 1.35,
                      fontFamily: "'Playfair Display', serif",
                      color: isLocked ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.9)",
                      marginBottom: "5px",
                    }}>
                      {module.title}
                    </h3>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      {status === "approved" && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          fontSize: "11px", fontWeight: 700, color: "#7AB648",
                          background: "rgba(122,182,72,0.12)", border: "1px solid rgba(122,182,72,0.25)",
                          padding: "2px 7px", borderRadius: "6px",
                        }}>
                          <IconCheck size={9} /> Aprobado · {score} pts
                        </span>
                      )}
                      {status === "available" && !allSessionsDone && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          fontSize: "11px", fontWeight: 700, color: "#F5A623",
                          background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.2)",
                          padding: "2px 7px", borderRadius: "6px",
                        }}>
                          En progreso
                        </span>
                      )}
                      {status === "available" && allSessionsDone && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          fontSize: "11px", fontWeight: 700, color: "#F5A623",
                          background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.2)",
                          padding: "2px 7px", borderRadius: "6px",
                        }}>
                          Listo para evaluar
                        </span>
                      )}
                      {isLocked && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          fontSize: "11px", color: "rgba(255,255,255,0.25)",
                        }}>
                          <IconLock size={9} /> Bloqueado
                        </span>
                      )}
                    </div>

                    {!isLocked && moduleSessions.length > 0 && status !== "approved" && (
                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "5px" }}>
                        {doneSessions.length}/{moduleSessions.length} sesiones
                      </p>
                    )}
                  </div>

                  {/* Expand chevron */}
                  {!isLocked && (
                    <svg
                      width="14" height="14" viewBox="0 0 14 14" fill="none"
                      style={{ flexShrink: 0, color: "rgba(255,255,255,0.25)", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                      aria-hidden="true"
                    >
                      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>

                {/* ── Expanded sessions ── */}
                {isExpanded && !isLocked && moduleSessions.length > 0 && (
                  <div style={{ marginTop: "16px" }}>
                    <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "12px" }} />

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {moduleSessions.map(session => {
                        const done = completed.includes(session.id);
                        return (
                          <div
                            key={session.id}
                            style={{
                              display: "flex", alignItems: "center", gap: "10px",
                              padding: "9px 12px", borderRadius: "9px",
                              background: done ? "rgba(122,182,72,0.05)" : "rgba(255,255,255,0.02)",
                              border: `1px solid ${done ? "rgba(122,182,72,0.12)" : "rgba(255,255,255,0.05)"}`,
                            }}
                          >
                            <div style={{
                              width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                              background: done ? "rgba(122,182,72,0.2)" : "rgba(255,255,255,0.04)",
                              border: `1.5px solid ${done ? "rgba(122,182,72,0.4)" : "rgba(255,255,255,0.1)"}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: done ? "#7AB648" : "rgba(255,255,255,0.3)",
                            }}>
                              {done ? <IconCheck size={9} /> : <IconPlay />}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{
                                fontSize: "13px", lineHeight: 1.4,
                                color: done ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.8)",
                                textDecoration: done ? "line-through" : "none",
                                textDecorationColor: "rgba(255,255,255,0.2)",
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              }}>
                                {session.title}
                              </p>
                            </div>

                            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                              {session.material && (
                                <a
                                  href={session.material}
                                  target="_blank" rel="noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  style={{
                                    fontSize: "11px", padding: "4px 10px",
                                    borderRadius: "7px",
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    color: "rgba(255,255,255,0.45)",
                                    textDecoration: "none", cursor: "pointer",
                                  }}
                                >
                                  Material
                                </a>
                              )}
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  window.open(session.link, "_blank");
                                  completeSession(session.id, session.title);
                                }}
                                style={{
                                  fontSize: "11px", padding: "4px 10px",
                                  borderRadius: "7px",
                                  background: done
                                    ? "rgba(255,255,255,0.04)"
                                    : "rgba(245,166,35,0.15)",
                                  border: `1px solid ${done ? "rgba(255,255,255,0.08)" : "rgba(245,166,35,0.3)"}`,
                                  color: done ? "rgba(255,255,255,0.35)" : "#F5A623",
                                  cursor: "pointer",
                                  display: "flex", alignItems: "center", gap: "5px",
                                }}
                              >
                                {!done && <IconPlay />}
                                {done ? "Repasar" : "Ver"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Eval CTA */}
                    {status === "available" && allSessionsDone && (
                      <div style={{
                        marginTop: "12px", padding: "14px 16px", borderRadius: "10px",
                        background: "rgba(245,166,35,0.08)",
                        border: "1px solid rgba(245,166,35,0.25)",
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap",
                      }}>
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "#F5A623", marginBottom: "2px" }}>
                            Sesiones completadas · ¡Puedes evaluar!
                          </p>
                          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
                            Nota mínima de aprobación: 70 puntos
                          </p>
                        </div>
                        <button
                          className="btn btn-amber btn-sm"
                          style={{ cursor: "pointer" }}
                          onClick={e => {
                            e.stopPropagation();
                            window.open(module.formLink, "_blank");
                            setEvalOpened(prev => ({ ...prev, [module.id]: true }));
                          }}
                        >
                          Tomar evaluación
                        </button>
                      </div>
                    )}

                    {evalOpened[module.id] && (
                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "10px", textAlign: "center", lineHeight: 1.5 }}>
                        Completa el formulario y regresa aquí — el admin registrará tu puntaje para desbloquear el siguiente módulo.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ═══════════════════════════════════════════════════════
            PROGRESS CHART — Sessions per module
        ═══════════════════════════════════════════════════════ */}
        {chartData.length > 0 && !modulesLoading && (
          <div className="card fade-up" style={{ padding: "22px 24px", marginBottom: "28px" }}>
            <p style={{
              fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)",
              marginBottom: "18px",
            }}>
              Avance por módulo
            </p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} barCategoryGap="30%" margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 600 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.status === "approved"
                          ? "#7AB648"
                          : entry.status === "available"
                          ? "#F5A623"
                          : "rgba(255,255,255,0.08)"
                      }
                      fillOpacity={entry.status === "locked" ? 1 : 0.75}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div style={{ height: "48px" }} />
      </div>

      {/* ── SCROLL TO TOP ───────────────────────────────────── */}
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
