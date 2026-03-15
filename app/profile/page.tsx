"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/config";
import {
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { UserData } from "../types";

export default function ProfilePage() {
  const router = useRouter();
  const [userData,  setUserData]  = useState<UserData | null>(null);
  const [userId,    setUserId]    = useState("");
  const [loading,   setLoading]   = useState(true);

  /* ── Personal data ── */
  const [editingData, setEditingData] = useState(false);
  const [dataDraft,   setDataDraft]   = useState({ name: "", finca: "", telefono: "" });
  const [savingData,  setSavingData]  = useState(false);
  const [dataMsg,     setDataMsg]     = useState<{ ok: boolean; text: string } | null>(null);

  /* ── Password ── */
  const [showPwd,    setShowPwd]    = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd,     setNewPwd]     = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [savingPwd,  setSavingPwd]  = useState(false);
  const [pwdMsg,     setPwdMsg]     = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) { router.push("/login"); return; }
      const snap = await getDocs(query(collection(db, "users"), where("email", "==", user.email)));
      if (snap.empty) { router.push("/login"); return; }
      const data = snap.docs[0].data() as UserData;
      if (data.status === "pending") { router.push("/pending"); return; }
      setUserData(data);
      setUserId(snap.docs[0].id);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const startEditData = () => {
    if (!userData) return;
    setDataDraft({ name: userData.name ?? "", finca: userData.finca ?? "", telefono: userData.telefono ?? "" });
    setEditingData(true);
    setDataMsg(null);
  };

  const saveData = async () => {
    if (!dataDraft.name) return;
    setSavingData(true);
    try {
      await updateDoc(doc(db, "users", userId), {
        name: dataDraft.name,
        finca: dataDraft.finca,
        telefono: dataDraft.telefono,
      });
      setUserData(prev => prev ? { ...prev, ...dataDraft } : prev);
      setEditingData(false);
      setDataMsg({ ok: true, text: "Datos actualizados correctamente" });
    } catch {
      setDataMsg({ ok: false, text: "Error al guardar. Inténtalo de nuevo." });
    } finally {
      setSavingData(false);
    }
  };

  const changePassword = async () => {
    if (!newPwd || !currentPwd) { setPwdMsg({ ok: false, text: "Completa todos los campos" }); return; }
    if (newPwd.length < 6)      { setPwdMsg({ ok: false, text: "La nueva contraseña debe tener al menos 6 caracteres" }); return; }
    if (newPwd !== confirmPwd)  { setPwdMsg({ ok: false, text: "Las contraseñas no coinciden" }); return; }

    setSavingPwd(true);
    setPwdMsg(null);

    const user = auth.currentUser;
    if (!user || !user.email) { setPwdMsg({ ok: false, text: "Sesión expirada. Recarga la página." }); setSavingPwd(false); return; }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPwd);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPwd);
      setPwdMsg({ ok: true, text: "Contraseña actualizada correctamente" });
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      setShowPwd(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setPwdMsg({ ok: false, text: "La contraseña actual es incorrecta" });
      } else {
        setPwdMsg({ ok: false, text: "Error al cambiar la contraseña. Inténtalo de nuevo." });
      }
    } finally {
      setSavingPwd(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrap flex-center" style={{ minHeight: "100vh" }}>
        <div style={{ width: "36px", height: "36px", border: "2px solid var(--border)", borderTop: "2px solid var(--amber)", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="page-wrap">
      {/* Nav */}
      <nav className="topnav">
        <div className="nav-logo">
          <img src="/logo.png" alt="Coffee Biochar" style={{ height: "34px", width: "auto" }} />
        </div>
        <div className="flex-gap-sm">
          <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}>
            ← Dashboard
          </Link>
        </div>
      </nav>

      <div className="page-content" style={{ maxWidth: "620px" }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: "32px" }}>
          <p className="eyebrow" style={{ marginBottom: "4px" }}>Mi cuenta</p>
          <h1 className="heading-2">Perfil</h1>
        </div>

        {/* Personal data card */}
        <div className="card fade-up-1" style={{ padding: "28px", marginBottom: "20px" }}>
          <div className="flex-between" style={{ marginBottom: "20px" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "2px" }}>
                Datos personales
              </p>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "18px", fontWeight: 600 }}>
                {userData.name}
              </h2>
            </div>
            {!editingData && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ cursor: "pointer", fontSize: "12px" }}
                onClick={startEditData}
              >
                Editar
              </button>
            )}
          </div>

          {dataMsg && <p className={dataMsg.ok ? "msg-success" : "msg-error"} style={{ marginBottom: "16px" }}>{dataMsg.text}</p>}

          {editingData ? (
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label className="form-label" htmlFor="p-name">Nombre completo *</label>
                  <input id="p-name" className="input"
                    value={dataDraft.name} onChange={e => setDataDraft(d => ({ ...d, name: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label" htmlFor="p-finca">Finca</label>
                  <input id="p-finca" className="input" placeholder="Nombre de tu finca"
                    value={dataDraft.finca} onChange={e => setDataDraft(d => ({ ...d, finca: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label" htmlFor="p-telefono">Teléfono</label>
                  <input id="p-telefono" className="input" placeholder="300 000 0000" inputMode="tel"
                    value={dataDraft.telefono} onChange={e => setDataDraft(d => ({ ...d, telefono: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
                <button className="btn btn-primary btn-sm" style={{ cursor: "pointer" }}
                  onClick={saveData} disabled={savingData || !dataDraft.name}>
                  {savingData ? "Guardando..." : "Guardar cambios"}
                </button>
                <button className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}
                  onClick={() => { setEditingData(false); setDataMsg(null); }}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Correo",    value: userData.email     },
                { label: "Clúster",   value: userData.cluster   },
                { label: "Municipio", value: userData.municipio },
                { label: "Finca",     value: userData.finca     },
                { label: "Teléfono",  value: userData.telefono  },
              ].map(({ label, value }) => value ? (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 500, textAlign: "right" }}>{value}</span>
                </div>
              ) : null)}
              <p className="body-sm" style={{ fontSize: "11px", marginTop: "4px" }}>
                Clúster y municipio solo pueden ser cambiados por un administrador.
              </p>
            </div>
          )}
        </div>

        {/* Password card */}
        <div className="card fade-up-2" style={{ padding: "28px" }}>
          <div className="flex-between" style={{ marginBottom: showPwd ? "20px" : "0" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "2px" }}>
                Seguridad
              </p>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "18px", fontWeight: 600 }}>
                Contraseña
              </h2>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ cursor: "pointer", fontSize: "12px" }}
              onClick={() => { setShowPwd(v => !v); setPwdMsg(null); }}
            >
              {showPwd ? "Cancelar" : "Cambiar"}
            </button>
          </div>

          {pwdMsg && <p className={pwdMsg.ok ? "msg-success" : "msg-error"} style={{ marginBottom: showPwd ? "16px" : "0" }}>{pwdMsg.text}</p>}

          {showPwd && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label" htmlFor="pwd-current">Contraseña actual *</label>
                <input id="pwd-current" className="input" type="password" placeholder="Tu contraseña actual"
                  value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} autoComplete="current-password" />
              </div>
              <div>
                <label className="form-label" htmlFor="pwd-new">Nueva contraseña *</label>
                <input id="pwd-new" className="input" type="password" placeholder="Mínimo 6 caracteres"
                  value={newPwd} onChange={e => setNewPwd(e.target.value)} autoComplete="new-password" />
              </div>
              <div>
                <label className="form-label" htmlFor="pwd-confirm">Confirmar nueva contraseña *</label>
                <input id="pwd-confirm" className="input" type="password" placeholder="Repite la nueva contraseña"
                  value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} autoComplete="new-password" />
              </div>
              <button className="btn btn-primary btn-sm" style={{ cursor: "pointer", marginTop: "4px" }}
                onClick={changePassword} disabled={savingPwd}>
                {savingPwd ? "Actualizando..." : "Actualizar contraseña"}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
