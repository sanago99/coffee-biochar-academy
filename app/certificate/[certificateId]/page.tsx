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
      <div className="auth-wrap">
        <div className="auth-card fade-up" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "40px", marginBottom: "16px" }}>🔍</p>
          <h2 className="heading-3">Certificado no encontrado</h2>
          <p className="body-sm" style={{ marginTop: "8px" }}>
            El ID del certificado no es válido o no existe.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="page-wrap flex-center"
      style={{ minHeight: "100vh", padding: "40px 20px" }}
    >
      <div
        className="fade-up"
        style={{
          maxWidth: "560px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Verified badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            borderRadius: "100px",
            background: "rgba(82,183,136,0.12)",
            border: "1px solid rgba(82,183,136,0.25)",
            marginBottom: "32px",
          }}
        >
          <span className="green-dot" />
          <span style={{ fontSize: "13px", color: "var(--green-accent)", fontWeight: 600 }}>
            Certificado verificado
          </span>
        </div>

        {/* Certificate card */}
        <div
          className="card"
          style={{
            padding: "48px 40px",
            borderColor: "rgba(82,183,136,0.2)",
            background: "linear-gradient(160deg, #181818 0%, #111 100%)",
          }}
        >
          {/* Decorative top line */}
          <div style={{
            height: "3px",
            borderRadius: "2px",
            background: "linear-gradient(90deg, var(--green-dark), var(--green-accent), var(--amber))",
            marginBottom: "36px",
          }} />

          <p className="eyebrow" style={{ marginBottom: "16px" }}>Coffee Biochar Academy</p>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(28px,5vw,40px)",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "8px",
              lineHeight: 1.2,
            }}
          >
            {cert.name}
          </h1>

          <p className="body-lg" style={{ margin: "16px 0 24px" }}>
            Ha completado satisfactoriamente el programa de formación<br />
            <strong style={{ color: "var(--green-accent)" }}>Certified Coffee Biochar Extensionist</strong>
          </p>

          <div className="divider-sm" />

          <p style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.08em", marginTop: "20px" }}>
            CERTIFICADO ID
          </p>
          <p style={{ fontSize: "13px", fontFamily: "monospace", color: "var(--text-secondary)", marginTop: "4px" }}>
            {cert.certificateId}
          </p>

          {cert.issuedAt && (
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
              Emitido por Biodiversal · Colombia
            </p>
          )}
        </div>

        <p style={{ marginTop: "24px", fontSize: "13px", color: "var(--text-muted)" }}>
          Este certificado fue verificado exitosamente.
        </p>
      </div>
    </div>
  );
}
