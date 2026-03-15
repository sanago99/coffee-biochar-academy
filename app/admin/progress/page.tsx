"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import AdminGuard from "../../components/AdminGuard";
import { page, colors, tableHeader, tableRow, th, td } from "../../styles";
import type { UserData } from "../../types";

interface UserProgress {
  id: string;
  name: string;
  cluster: string;
  municipio: string;
  progress: number;
  moduleScores: Record<number, number>;
}

interface ClusterStat {
  cluster: string;
  progress: number;
}

interface ModuleStat {
  module: string;
  score: number;
}

interface Stats {
  users: number;
  avgProgress: number;
  certificates: number;
}

export default function AdminProgress() {
  const [progressData, setProgressData] = useState<UserProgress[]>([]);
  const [clusterStats, setClusterStats] = useState<ClusterStat[]>([]);
  const [moduleStats, setModuleStats] = useState<ModuleStat[]>([]);
  const [stats, setStats] = useState<Stats>({ users: 0, avgProgress: 0, certificates: 0 });

  useEffect(() => {
    const loadData = async () => {
      const [usersSnap, sessionsSnap, progressSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "sessions")),
        getDocs(collection(db, "progress")),
      ]);

      const usersList = usersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as UserData & { id: string }));

      const totalSessions = sessionsSnap.size;

      const progressList = progressSnap.docs.map(doc => doc.data() as { userId: string });

      /* USER PROGRESS */

      const results: UserProgress[] = usersList.map(user => {
        const completedCount = progressList.filter(p => p.userId === user.id).length;
        const percentage = totalSessions ? Math.round((completedCount / totalSessions) * 100) : 0;

        return {
          id: user.id,
          name: user.name,
          cluster: user.cluster,
          municipio: user.municipio,
          progress: percentage,
          moduleScores: user.moduleScores ?? {},
        };
      });

      setProgressData(results);

      /* STATS */

      const avg = results.reduce((acc, u) => acc + u.progress, 0) / (results.length || 1);
      const certificates = results.filter(u => u.progress === 100).length;

      setStats({ users: results.length, avgProgress: Math.round(avg), certificates });

      /* CLUSTER STATS */

      const clusterMap: Record<string, { total: number; count: number }> = {};

      results.forEach(u => {
        if (!clusterMap[u.cluster]) clusterMap[u.cluster] = { total: 0, count: 0 };
        clusterMap[u.cluster].total += u.progress;
        clusterMap[u.cluster].count++;
      });

      setClusterStats(
        Object.entries(clusterMap).map(([cluster, { total, count }]) => ({
          cluster,
          progress: Math.round(total / count),
        }))
      );

      /* MODULE STATS */

      const moduleMap: Record<string, { total: number; count: number }> = {};

      usersList.forEach(user => {
        Object.entries(user.moduleScores ?? {}).forEach(([mod, score]) => {
          if (!moduleMap[mod]) moduleMap[mod] = { total: 0, count: 0 };
          moduleMap[mod].total += score as number;
          moduleMap[mod].count++;
        });
      });

      setModuleStats(
        Object.entries(moduleMap).map(([mod, { total, count }]) => ({
          module: `M${mod}`,
          score: Math.round(total / count),
        }))
      );
    };

    loadData();
  }, []);

  return (
    <AdminGuard>
      <div style={page}>
        <h1>Panel de progreso de extensionistas</h1>

        {/* METRICS */}

        <div style={{ display: "flex", gap: "30px", marginTop: "20px", flexWrap: "wrap" }}>
          {[
            { label: "👩‍🌾 Extensionistas", value: stats.users },
            { label: "📊 Progreso promedio", value: `${stats.avgProgress}%` },
            { label: "🎓 Certificados", value: stats.certificates },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: colors.bgCard, padding: "20px", borderRadius: "8px" }}>
              <h3>{label}</h3>
              <p style={{ fontSize: "24px" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* CLUSTER CHART */}

        <h2 style={{ marginTop: "40px" }}>Progreso promedio por cluster</h2>

        <div style={{ width: "100%", height: "300px" }}>
          <ResponsiveContainer>
            <BarChart data={clusterStats}>
              <XAxis dataKey="cluster" stroke={colors.textMuted} />
              <YAxis stroke={colors.textMuted} />
              <Tooltip />
              <Bar dataKey="progress" fill={colors.greenDark} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* MODULE CHART */}

        <h2 style={{ marginTop: "40px" }}>Score promedio por módulo</h2>

        <div style={{ width: "100%", height: "300px" }}>
          <ResponsiveContainer>
            <BarChart data={moduleStats}>
              <XAxis dataKey="module" stroke={colors.textMuted} />
              <YAxis stroke={colors.textMuted} />
              <Tooltip />
              <Bar dataKey="score" fill={colors.blue} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* USER TABLE */}

        <table style={{ width: "100%", marginTop: "40px", borderCollapse: "collapse" }}>
          <thead>
            <tr style={tableHeader}>
              <th style={th}>Extensionista</th>
              <th style={th}>Cluster</th>
              <th style={th}>Municipio</th>
              <th style={th}>Progreso</th>
              <th style={th}>Certificado</th>
              <th style={th}>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {progressData.map(user => (
              <tr key={user.id} style={tableRow}>
                <td style={td}>{user.name}</td>
                <td style={td}>{user.cluster}</td>
                <td style={td}>{user.municipio}</td>
                <td style={td}>{user.progress}%</td>
                <td style={td}>{user.progress === 100 ? "✔" : "❌"}</td>
                <td style={td}>
                  <a href={`/admin/users/${user.id}`} style={{ color: colors.green }}>
                    Ver progreso
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminGuard>
  );
}
