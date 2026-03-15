"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useParams } from "next/navigation";
import type { Certificate } from "../../types";
import { colors, page } from "../../styles";

export default function CertificatePage() {
  const params = useParams();
  const certificateId = params.certificateId as string;

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCertificate = async () => {
      const q = query(
        collection(db, "certificates"),
        where("certificateId", "==", certificateId)
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        setCertificate(snap.docs[0].data() as Certificate);
      }

      setLoading(false);
    };

    loadCertificate();
  }, [certificateId]);

  const centered = {
    ...page,
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
  };

  if (loading) {
    return <main style={centered}><h2>Verificando certificado...</h2></main>;
  }

  if (!certificate) {
    return <main style={centered}><h2>Certificado no encontrado</h2></main>;
  }

  return (
    <main style={centered}>
      <h1>Coffee Biochar Academy</h1>
      <h2>Certificado verificado</h2>
      <p style={{ marginTop: "20px" }}>{certificate.name}</p>
      <p>Certified Coffee Biochar Extensionist</p>
      <p style={{ marginTop: "10px", color: colors.textMuted }}>
        Certificate ID: {certificate.certificateId}
      </p>
    </main>
  );
}
