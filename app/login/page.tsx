"use client";

import { useState } from "react";
import { auth, db } from "../../firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Message, { MessageState } from "../components/Message";
import { inputStyle } from "../styles";
import type { UserData } from "../types";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<MessageState>(null);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) {
      setMessage({ text: "Completa todos los campos", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);

      const q = query(collection(db, "users"), where("email", "==", email));
      const snap = await getDocs(q);

      if (snap.empty) {
        setMessage({ text: "Usuario no encontrado", type: "error" });
        setLoading(false);
        return;
      }

      const userData = snap.docs[0].data() as UserData;

      router.push(userData.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      setMessage({ text: "Correo o contraseña incorrectos", type: "error" });
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#111",
        color: "white",
      }}
    >
      <div style={{ width: "300px" }}>
        <h2>Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />

        <Message message={message} />

        <button
          onClick={login}
          disabled={loading}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "10px",
            background: loading ? "#555" : "#2E7D32",
            border: "none",
            color: "white",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}
