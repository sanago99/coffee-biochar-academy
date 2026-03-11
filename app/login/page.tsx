"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";

export default function Login() {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleLogin = async () => {

    try {

      await signInWithEmailAndPassword(auth,email,password);

      alert("Login exitoso");

      window.location.href="/dashboard";

    } catch(error){

      alert("Error en login");

    }

  }

  return (

    <main style={{
      minHeight:"100vh",
      display:"flex",
      flexDirection:"column",
      justifyContent:"center",
      alignItems:"center",
      background:"#1A1A1A",
      color:"white"
    }}>

      <h1>Coffee Biochar Academy</h1>

      <h2>Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        style={{margin:"10px",padding:"10px"}}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        style={{margin:"10px",padding:"10px"}}
      />

      <button
        onClick={handleLogin}
        style={{
          padding:"10px 20px",
          background:"#2E7D32",
          border:"none",
          color:"white"
        }}
      >
        Entrar
      </button>

    </main>

  )

}