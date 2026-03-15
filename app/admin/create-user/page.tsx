"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../firebase/config";
import { setDoc, doc } from "firebase/firestore";
import AdminGuard from "../../components/AdminGuard";
import Message, { MessageState } from "../../components/Message";
import { page, inputStyle, btn, colors } from "../../styles";

export default function CreateUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [cluster, setCluster] = useState("");
  const [message, setMessage] = useState<MessageState>(null);
  const [loading, setLoading] = useState(false);

  const createUser = async () => {
    if (!name || !email || !password || !municipio || !cluster) {
      setMessage({ text: "Completa todos los campos", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        municipio,
        cluster,
        role: "user",
        progress: 0,
        createdAt: new Date(),
      });

      setMessage({ text: "Extensionista creado correctamente", type: "success" });
      setName("");
      setEmail("");
      setPassword("");
      setMunicipio("");
      setCluster("");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error desconocido";
      setMessage({ text: `Error: ${msg}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <main style={page}>
        <h1>Crear Extensionista</h1>

        <div style={{ maxWidth: "400px", marginTop: "20px" }}>
          <input
            placeholder="Nombre"
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Correo"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Municipio"
            value={municipio}
            onChange={e => setMunicipio(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Cluster"
            value={cluster}
            onChange={e => setCluster(e.target.value)}
            style={inputStyle}
          />

          <Message message={message} />

          <button
            onClick={createUser}
            disabled={loading}
            style={{
              ...btn(loading ? "#555" : colors.greenDark),
              marginTop: "20px",
              padding: "10px 20px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creando..." : "Crear usuario"}
          </button>
        </div>
      </main>
    </AdminGuard>
  );
}
