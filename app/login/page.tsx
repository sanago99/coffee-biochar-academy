"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useRouter } from "next/navigation";

export default function Login(){

  const router = useRouter();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const login = async ()=>{

    try{

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // ADMIN EMAIL
      if(user.email === "santiago@biodiversal.co"){
        router.push("/admin");
      }else{
        router.push("/dashboard");
      }

    }catch(error){

      alert("Error al iniciar sesión");

    }

  };

  return(

    <main style={{
      minHeight:"100vh",
      background:"#111",
      color:"white",
      display:"flex",
      flexDirection:"column",
      alignItems:"center",
      justifyContent:"center",
      fontFamily:"Arial"
    }}>

      <h1>Iniciar sesión</h1>

      <input
        placeholder="Correo"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        style={{
          margin:"10px",
          padding:"10px",
          width:"250px"
        }}
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        style={{
          margin:"10px",
          padding:"10px",
          width:"250px"
        }}
      />

      <button
        onClick={login}
        style={{
          marginTop:"20px",
          padding:"10px 20px",
          background:"#2E7D32",
          border:"none",
          color:"white",
          cursor:"pointer"
        }}
      >
        Entrar
      </button>

    </main>

  );

}