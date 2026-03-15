"use client";

import { useEffect, useRef, useState } from "react";
import { auth, db } from "../../firebase/config";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useModules } from "../hooks/useModules";
import { useSessions } from "../hooks/useSessions";
import { useUserProgress } from "../hooks/useUserProgress";
import Message, { MessageState } from "../components/Message";
import { colors } from "../styles";
import type { Module, UserData } from "../types";

export default function Dashboard() {
  const router = useRouter();

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [message, setMessage] = useState<MessageState>(null);
  const certAttempted = useRef(false);

  const { modules } = useModules();
  const { sessions } = useSessions();
  const { completed, setCompleted } = useUserProgress(firebaseUser?.uid ?? null);

  /* AUTH */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setFirebaseUser(user);

      const q = query(collection(db, "users"), where("email", "==", user.email));
      const snap = await getDocs(q);

      if (!snap.empty) {
        setUserData(snap.docs[0].data() as UserData);
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* DERIVED STATE */

  const progress =
    sessions.length > 0
      ? Math.round((completed.length / sessions.length) * 100)
      : 0;

  const getModuleStatus = (module: Module): "approved" | "available" | "locked" => {
    const score = userData?.moduleScores?.[module.order];

    if (score !== undefined && score >= (module.passingScore || 60)) return "approved";

    const index = modules.findIndex(m => m.id === module.id);
    if (index === 0) return "available";

    const prevModule = modules[index - 1];
    const prevScore = userData?.moduleScores?.[prevModule.order];

    if (prevScore !== undefined && prevScore >= (prevModule.passingScore || 60)) return "available";

    return "locked";
  };

  const approvedModules = modules.filter(m => getModuleStatus(m) === "approved").length;

  /* CERTIFICATE AUTO-GENERATION */

  useEffect(() => {
    if (certAttempted.current) return;
    if (!firebaseUser || !userData || modules.length === 0) return;
    if (approvedModules !== modules.length) return;

    certAttempted.current = true;

    const checkAndGenerate = async () => {
      const certQ = query(
        collection(db, "certificates"),
        where("userId", "==", firebaseUser.uid)
      );
      const certSnap = await getDocs(certQ);

      if (!certSnap.empty) return;

      const certificateId = crypto.randomUUID();

      await addDoc(collection(db, "certificates"), {
        userId: firebaseUser.uid,
        name: userData.name,
        certificateId,
        issuedAt: new Date(),
      });

      setMessage({
        text: "¡Felicitaciones! Tu certificado ha sido generado.",
        type: "success",
      });
    };

    checkAndGenerate();
  }, [firebaseUser, userData, modules, approvedModules]);

  /* LOGOUT */

  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  /* COMPLETE SESSION */

  const completeSession = async (sessionId: string) => {
    if (completed.includes(sessionId)) return;

    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, "progress"), {
      userId: user.uid,
      sessionId,
    });

    setCompleted([...completed, sessionId]);
  };

  if (authLoading) {
    return (
      <div style={{ background: colors.bg, minHeight: "100vh", color: "white", padding: "30px" }}>
        Cargando...
      </div>
    );
  }

  return (
    <div style={{ background: colors.bg, minHeight: "100vh", color: "white", padding: "30px" }}>

      {/* HEADER */}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h2>Coffee Biochar Academy</h2>
          {userData && <p>Bienvenido {userData.name}</p>}
        </div>
        <button
          onClick={logout}
          style={{
            background: "#444",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </div>

      <Message message={message} />

      {/* PROGRESS BAR */}

      <div style={{ marginTop: "20px" }}>
        <p>Progreso del curso</p>
        <div
          style={{
            width: "100%",
            height: "10px",
            background: "#333",
            borderRadius: "5px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background:
                progress > 80 ? colors.green : progress > 40 ? colors.yellow : colors.orange,
              transition: "width 0.5s",
            }}
          />
        </div>
        <p style={{ marginTop: "5px" }}>{progress}% completado</p>
      </div>

      <p style={{ marginTop: "10px" }}>
        Módulos aprobados: {approvedModules} / {modules.length}
      </p>

      {/* TIMELINE */}

      <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {modules.map((module, index) => {
          const status = getModuleStatus(module);
          return (
            <div
              key={module.id}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                background:
                  status === "approved"
                    ? colors.green
                    : status === "available"
                    ? colors.yellow
                    : colors.gray,
              }}
            >
              {status === "approved" && "✔"}
              {status === "available" && "●"}
              {status === "locked" && "🔒"}
              {" "}M{index + 1}
            </div>
          );
        })}
      </div>

      {/* MODULES */}

      <h3 style={{ marginTop: "30px" }}>Módulos</h3>

      {modules.map(module => {
        const moduleSessions = sessions.filter(s => s.moduleId === module.id);
        const status = getModuleStatus(module);
        const score = userData?.moduleScores?.[module.order];
        const allSessionsDone =
          moduleSessions.length > 0 &&
          moduleSessions.every(s => completed.includes(s.id));

        return (
          <div
            key={module.id}
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: "8px",
              padding: "15px",
              marginTop: "15px",
            }}
          >
            <h4>{module.title}</h4>

            {status === "approved" && (
              <p style={{ color: colors.green }}>🟢 Aprobado — Score: {score}</p>
            )}
            {status === "available" && (
              <p style={{ color: colors.yellow }}>🟡 Disponible</p>
            )}
            {status === "locked" && (
              <p style={{ color: colors.textMuted }}>
                🔒 Completa el módulo anterior para desbloquear
              </p>
            )}

            <p style={{ color: colors.textMuted }}>{moduleSessions.length} sesiones</p>

            {/* SESSIONS */}

            {status !== "locked" && (
              <div style={{ marginTop: "10px" }}>
                {moduleSessions.map(session => {
                  const isCompleted = completed.includes(session.id);
                  return (
                    <div
                      key={session.id}
                      style={{
                        border: `1px solid ${colors.borderLight}`,
                        borderRadius: "6px",
                        padding: "10px",
                        marginTop: "10px",
                      }}
                    >
                      <p>{session.title}</p>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => {
                            window.open(session.link, "_blank");
                            completeSession(session.id);
                          }}
                          style={{
                            background: colors.green,
                            border: "none",
                            color: "white",
                            padding: "6px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          ▶ Ver sesión
                        </button>
                        {isCompleted && (
                          <span style={{ color: colors.green }}>✔ Completada</span>
                        )}
                      </div>
                      {session.material && (
                        <a
                          href={session.material}
                          target="_blank"
                          style={{ display: "block", marginTop: "5px", color: colors.yellow }}
                        >
                          Material adicional
                        </a>
                      )}
                    </div>
                  );
                })}

                {/* EVALUATION BUTTON */}

                {status === "available" && allSessionsDone && (
                  <div style={{ marginTop: "15px" }}>
                    <button
                      onClick={() => window.open(module.formLink, "_blank")}
                      style={{
                        background: colors.blue,
                        border: "none",
                        color: "white",
                        padding: "10px 14px",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
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
  );
}
