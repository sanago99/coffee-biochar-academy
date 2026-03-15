"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import AdminGuard from "../../components/AdminGuard";
import AdminNav from "../../components/AdminNav";
import type { UserData } from "../../types";

type UserRow = UserData & { id: string };

export default function UsersAdmin() {
  const [users,   setUsers]   = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    getDocs(collection(db, "users")).then(snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as UserRow)));
      setLoading(false);
    });
  }, []);

  const filtered = users.filter(u =>
    `${u.name} ${u.municipio} ${u.cluster}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminGuard>
      <div className="page-wrap">
        <AdminNav />
        <div className="admin-content">

          <div className="flex-between fade-up" style={{ marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 className="heading-1" style={{ marginBottom: "4px" }}>Extensionistas</h1>
              <p className="body-sm">{users.length} usuarios registrados</p>
            </div>
            <input
              className="input"
              placeholder="Buscar por nombre, municipio o cluster..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: "300px" }}
            />
          </div>

          {loading ? (
            <p className="body-sm">Cargando usuarios...</p>
          ) : (
            <div className="card fade-up-1" style={{ padding: 0, overflow: "hidden" }}>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Municipio</th>
                      <th>Cluster</th>
                      <th>Progreso</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(user => (
                      <tr key={user.id}>
                        <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                          {user.name || "—"}
                        </td>
                        <td>{user.municipio || "—"}</td>
                        <td>{user.cluster || "—"}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "140px" }}>
                            <div className="progress-track" style={{ flex: 1 }}>
                              <div
                                className="progress-fill-sm"
                                style={{ width: `${user.progress || 0}%` }}
                              />
                            </div>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)", minWidth: "32px" }}>
                              {user.progress || 0}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <a
                            href={`/admin/users/${user.id}`}
                            style={{ fontSize: "13px", color: "var(--green-accent)", fontWeight: 500 }}
                          >
                            Ver detalle →
                          </a>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                          No se encontraron usuarios
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </AdminGuard>
  );
}
