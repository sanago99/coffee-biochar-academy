"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../firebase/config";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useParams } from "next/navigation";
import AdminGuard from "../../../components/AdminGuard";
import { page, colors, tableHeader, tableRow, th, td } from "../../../styles";
import type { Module, UserData } from "../../../types";

export default function UserDetail() {
  const { id: userId } = useParams() as { id: string };

  const [user, setUser] = useState<UserData | null>(null);
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [userDoc, modulesSnap] = await Promise.all([
        getDoc(doc(db, "users", userId)),
        getDocs(collection(db, "modules")),
      ]);

      if (userDoc.exists()) {
        setUser(userDoc.data() as UserData);
      }

      const list = modulesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Module));
      list.sort((a, b) => a.order - b.order);
      setModules(list);
    };

    loadData();
  }, [userId]);

  if (!user) {
    return (
      <div style={{ padding: "40px", background: colors.bg, color: "white" }}>
        Cargando usuario...
      </div>
    );
  }

  const getModuleStatus = (module: Module) => {
    const score = user.moduleScores?.[module.order];

    if (score !== undefined && score >= (module.passingScore || 60)) return "✔ Aprobado";

    if (module.order === 1) return "Disponible";

    const prevScore = user.moduleScores?.[module.order - 1];
    if (prevScore !== undefined && prevScore >= 60) return "Disponible";

    if (score !== undefined) return "❌ No aprobado";

    return "🔒 Bloqueado";
  };

  return (
    <AdminGuard>
      <div style={page}>
        <h1>{user.name}</h1>
        <p style={{ color: colors.textMuted }}>Cluster: {user.cluster}</p>
        <p style={{ color: colors.textMuted }}>Municipio: {user.municipio}</p>

        <h2 style={{ marginTop: "40px" }}>Progreso por módulo</h2>

        <table style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
          <thead>
            <tr style={tableHeader}>
              <th style={th}>Módulo</th>
              <th style={th}>Estado</th>
              <th style={th}>Score</th>
            </tr>
          </thead>
          <tbody>
            {modules.map(module => (
              <tr key={module.id} style={tableRow}>
                <td style={td}>{module.title}</td>
                <td style={td}>{getModuleStatus(module)}</td>
                <td style={td}>{user.moduleScores?.[module.order] ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminGuard>
  );
}
