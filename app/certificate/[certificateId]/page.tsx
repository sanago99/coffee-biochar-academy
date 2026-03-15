"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useParams } from "next/navigation";
import type { Certificate } from "../../types";

export default function CertificatePage() {
  const { certificateId } = useParams() as { certificateId: string };

  const [cert,    setCert]    = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(
        query(collection(db, "certificates"), where("certificateId", "==", certificateId))
      );
      if (!snap.empty) setCert(snap.docs[0].data() as Certificate);
      setLoading(false);
    })();
  }, [certificateId]);

  if (loading) {
    return (
      <div className="auth-wrap">
        <p className="body-sm">Verificando certificado...</p>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="auth-wrap" style={{ background: "var(--bg-deep)" }}>
        <div className="auth-card fade-up" style={{ textAlign: "center" }}>
          <img src="/logo.png" alt="Coffee Biochar" style={{ height: "56px", margin: "0 auto 20px" }} />
          <div style={{
            width: "48px", height: "48px", borderRadius: "50%",
            background: "rgba(192,74,42,0.1)", border: "1px solid rgba(192,74,42,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", color: "#e06040",
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 7v5M11 15v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <h2 className="heading-3" style={{ marginBottom: "8px" }}>Certificado no encontrado</h2>
          <p className="body-sm" style={{ marginBottom: "24px" }}>
            El ID del certificado no es válido o no existe en nuestros registros.
          </p>
          <a href="/dashboard">
            <button className="btn btn-outline btn-full" style={{ cursor: "pointer" }}>
              Ir al dashboard
            </button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-deep)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      {/* Verified pill */}
      <div
        className="fade-up"
        style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "8px 20px", borderRadius: "var(--radius-pill)",
          background: "var(--green-glow)", border: "1px solid var(--green-border)",
          marginBottom: "32px",
        }}
      >
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
        <span style={{ fontSize: "13px", color: "var(--green)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Certificado verificado
        </span>
      </div>

      {/* Certificate card */}
      <div
        className="card fade-up-1"
        style={{
          maxWidth: "600px",
          width: "100%",
          padding: "52px 48px",
          textAlign: "center",
          borderColor: "rgba(245,166,35,0.18)",
          background: "linear-gradient(160deg, var(--bg-card) 0%, var(--bg-deep) 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background watermark */}
        <div
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            opacity: 0.03, pointerEvents: "none",
          }}
        >
          <img src="/logo.png" alt="" style={{ width: "300px" }} />
        </div>

        {/* Top bar */}
        <div style={{
          height: "3px", borderRadius: "2px",
          background: "linear-gradient(90deg, var(--amber-dark), var(--amber), var(--green))",
          marginBottom: "40px",
        }} />

        {/* Logos */}
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          gap: "24px", marginBottom: "32px", flexWrap: "wrap",
        }}>
          <img src="/logo.png" alt="Coffee Biochar" style={{ height: "72px", width: "auto" }} />
          <div style={{ width: "1px", height: "48px", background: "var(--border)" }} />
          <img
            src="/brand/biodiversal.png"
            alt="Biodiversal"
            style={{ height: "32px", filter: "brightness(0) invert(1)", opacity: 0.5 }}
          />
        </div>

        <p className="eyebrow" style={{ marginBottom: "20px" }}>
          Certifica que
        </p>

        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(28px,5vw,42px)",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "16px",
            lineHeight: 1.2,
          }}
        >
          {cert.name}
        </h1>

        <p className="body-lg" style={{ margin: "0 auto 28px", maxWidth: "420px" }}>
          Ha completado satisfactoriamente el programa de formación
        </p>

        <div
          style={{
            display: "inline-block",
            padding: "10px 24px",
            borderRadius: "var(--radius-sm)",
            background: "var(--amber-glow)",
            border: "1px solid var(--amber-border)",
            marginBottom: "32px",
          }}
        >
          <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--amber)", fontFamily: "'Playfair Display',serif" }}>
            Certified Coffee Biochar Extensionist
          </p>
        </div>

        <div className="divider-sm" />

        <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "20px" }}>
          ID de Certificado
        </p>
        <p style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--text-secondary)", marginTop: "4px", letterSpacing: "0.05em" }}>
          {cert.certificateId}
        </p>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
          Emitido por Biodiversal · Agricultura Regenerativa · Colombia
        </p>

        {/* Bottom bar */}
        <div style={{
          height: "2px", borderRadius: "1px",
          background: "linear-gradient(90deg, var(--rust), var(--amber))",
          marginTop: "32px",
        }} />
      </div>

      <p className="fade-up-2" style={{ marginTop: "24px", fontSize: "13px", color: "var(--text-muted)" }}>
        Este certificado fue verificado exitosamente.
      </p>
    </div>
  );
}
