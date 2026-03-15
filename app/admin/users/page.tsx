"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import AdminGuard from "../../components/AdminGuard";
import { page, colors, tableHeader, tableRow, th, td } from "../../styles";
import type { UserData } from "../../types";

type UserRow = UserData & { id: string };

export default function UsersAdmin() {
  const [users, setUsers] = useState<UserRow[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const list: UserRow[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as UserRow));
      setUsers(list);
    };

    loadUsers();
  }, []);

  return (
    <AdminGuard>
      <main style={page}>
        <h1>Extensionistas registrados</h1>

        <table style={{ width: "100%", marginTop: "30px", borderCollapse: "collapse" }}>
          <thead>
            <tr style={tableHeader}>
              <th style={th}>Nombre</th>
              <th style={th}>Municipio</th>
              <th style={th}>Cluster</th>
              <th style={th}>Progreso</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={tableRow}>
                <td style={td}>{user.name}</td>
                <td style={td}>{user.municipio}</td>
                <td style={td}>{user.cluster}</td>
                <td style={td}>
                  <div style={{ width: "150px", height: "10px", background: "#333", borderRadius: "5px" }}>
                    <div
                      style={{
                        width: `${user.progress || 0}%`,
                        height: "10px",
                        background: colors.greenDark,
                        borderRadius: "5px",
                      }}
                    />
                  </div>
                  <span style={{ marginLeft: "10px" }}>{user.progress || 0}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </AdminGuard>
  );
}
