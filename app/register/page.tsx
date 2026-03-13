"use client";

import { useState } from "react";
import { db } from "../../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Register() {

  const router = useRouter();

  const [name,setName] = useState("");
  const [municipio,setMunicipio] = useState("");
  const [finca,setFinca] = useState("");
  const [cluster,setCluster] = useState("");
  const [telefono,setTelefono] = useState("");

  const registerUser = async () => {

    await addDoc(collection(db,"users"),{
      name,
      municipio,
      finca,
      cluster,
      telefono,
      progress:0
    });

    alert("Usuario registrado");

    router.push("/login");

  };

  return (

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

      <h1>Registro de Extensionista</h1>

      <input
        placeholder="Nombre"
        value={name}
        onChange={(e)=>setName(e.target.value)}
        style={{margin:"10px",padding:"10px"}}
      />

      <input
        placeholder="Municipio"
        value={municipio}
        onChange={(e)=>setMunicipio(e.target.value)}
        style={{margin:"10px",padding:"10px"}}
      />

      <input
        placeholder="Finca"
        value={finca}
        onChange={(e)=>setFinca(e.target.value)}
        style={{margin:"10px",padding:"10px"}}
      />

      <input
        placeholder="Cluster"
        value={cluster}
        onChange={(e)=>setCluster(e.target.value)}
        style={{margin:"10px",padding:"10px"}}
      />

      <input
        placeholder="Teléfono"
        value={telefono}
        onChange={(e)=>setTelefono(e.target.value)}
        style={{margin:"10px",padding:"10px"}}
      />

      <button
        onClick={registerUser}
        style={{
          marginTop:"20px",
          padding:"10px 20px",
          background:"#2E7D32",
          border:"none",
          color:"white"
        }}
      >
        Registrar
      </button>

    </main>

  );

}