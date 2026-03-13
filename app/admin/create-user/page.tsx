"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../firebase/config";
import { setDoc, doc } from "firebase/firestore";

export default function CreateUser(){

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [municipio,setMunicipio] = useState("");
  const [cluster,setCluster] = useState("");

  const createUser = async ()=>{

    try{

      const userCredential =
        await createUserWithEmailAndPassword(auth,email,password);

      const uid = userCredential.user.uid;

      await setDoc(doc(db,"users",uid),{

        name:name,
        email:email,
        municipio:municipio,
        cluster:cluster,
        createdAt:new Date()

      });

      alert("Extensionista creado");

      setName("");
      setEmail("");
      setPassword("");
      setMunicipio("");
      setCluster("");

    }catch(error){

      console.error(error);
      alert("Error creando usuario");

    }

  };

  return(

    <main style={{
      minHeight:"100vh",
      background:"#111",
      color:"white",
      padding:"40px",
      fontFamily:"Arial"
    }}>

      <h1>Crear Extensionista</h1>

      <input
        placeholder="Nombre"
        value={name}
        onChange={(e)=>setName(e.target.value)}
        style={{display:"block",margin:"10px 0",padding:"10px"}}
      />

      <input
        placeholder="Correo"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        style={{display:"block",margin:"10px 0",padding:"10px"}}
      />

      <input
        placeholder="Contraseña"
        value={password}
        type="password"
        onChange={(e)=>setPassword(e.target.value)}
        style={{display:"block",margin:"10px 0",padding:"10px"}}
      />

      <input
        placeholder="Municipio"
        value={municipio}
        onChange={(e)=>setMunicipio(e.target.value)}
        style={{display:"block",margin:"10px 0",padding:"10px"}}
      />

      <input
        placeholder="Cluster"
        value={cluster}
        onChange={(e)=>setCluster(e.target.value)}
        style={{display:"block",margin:"10px 0",padding:"10px"}}
      />

      <button
        onClick={createUser}
        style={{
          marginTop:"20px",
          padding:"10px 20px",
          background:"#2E7D32",
          border:"none",
          color:"white",
          cursor:"pointer"
        }}
      >
        Crear usuario
      </button>

    </main>

  );

}