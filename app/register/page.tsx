"use client";

import { useState } from "react";
import { db } from "../../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Message, { MessageState } from "../components/Message";
import { inputStyle, page } from "../styles";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [finca, setFinca] = useState("");
  const [cluster, setCluster] = useState("");
  const [telefono, setTelefono] = useState("");
  const [message, setMessage] = useState<MessageState>(null);
  const [loading, setLoading] = useState(false);

  const registerUser = async () => {
    if (!name || !municipio || !cluster) {
      setMessage({ text: "Nombre, municipio y cluster son obligatorios", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await addDoc(collection(db, "users"), {
        name,
        municipio,
        finca,
        cluster,
        telefono,
        progress: 0,
      });

      setMessage({ text: "Usuario registrado correctamente", type: "success" });

      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setMessage({ text: "Error al registrar el usuario", type: "error" });
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        ...page,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1>Registro de Extensionista</h1>

      <div style={{ width: "300px" }}>
        <input
          placeholder="Nombre"
          value={name}
          onChange={e => setName(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Municipio"
          value={municipio}
          onChange={e => setMunicipio(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Finca"
          value={finca}
          onChange={e => setFinca(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Cluster"
          value={cluster}
          onChange={e => setCluster(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Teléfono"
          value={telefono}
          onChange={e => setTelefono(e.target.value)}
          style={inputStyle}
        />

        <Message message={message} />

        <button
          onClick={registerUser}
          disabled={loading}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "10px 20px",
            background: loading ? "#555" : "#2E7D32",
            border: "none",
            color: "white",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Registrando..." : "Registrar"}
        </button>
      </div>
    </main>
  );
}
