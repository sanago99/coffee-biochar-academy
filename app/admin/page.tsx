"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard(){

  const router = useRouter();

  const [usersCount,setUsersCount] = useState(0);
  const [modulesCount,setModulesCount] = useState(0);
  const [sessionsCount,setSessionsCount] = useState(0);
  const [progressCount,setProgressCount] = useState(0);

  useEffect(()=>{

    const user = auth.currentUser;

    if(!user || user.email !== "santiago@biodiversal.co"){
      router.push("/login");
      return;
    }

    loadStats();

  },[]);

  const loadStats = async ()=>{

    const usersSnapshot = await getDocs(collection(db,"users"));
    const modulesSnapshot = await getDocs(collection(db,"modules"));
    const sessionsSnapshot = await getDocs(collection(db,"sessions"));
    const progressSnapshot = await getDocs(collection(db,"progress"));

    setUsersCount(usersSnapshot.size);
    setModulesCount(modulesSnapshot.size);
    setSessionsCount(sessionsSnapshot.size);
    setProgressCount(progressSnapshot.size);

  };

  return(

    <main style={{
      minHeight:"100vh",
      background:"#111",
      color:"white",
      padding:"40px",
      fontFamily:"Arial"
    }}>

      <h1>Panel de Administración</h1>

      <p style={{color:"#aaa"}}>
        Coffee Biochar Academy
      </p>

      {/* ESTADISTICAS */}

      <div style={{
        marginTop:"40px",
        display:"grid",
        gridTemplateColumns:"repeat(2,200px)",
        gap:"20px"
      }}>

        <div style={{background:"#222",padding:"20px",borderRadius:"6px"}}>
          <h2>{usersCount}</h2>
          <p>Extensionistas registrados</p>
        </div>

        <div style={{background:"#222",padding:"20px",borderRadius:"6px"}}>
          <h2>{modulesCount}</h2>
          <p>Módulos creados</p>
        </div>

        <div style={{background:"#222",padding:"20px",borderRadius:"6px"}}>
          <h2>{sessionsCount}</h2>
          <p>Sesiones creadas</p>
        </div>

        <div style={{background:"#222",padding:"20px",borderRadius:"6px"}}>
          <h2>{progressCount}</h2>
          <p>Sesiones completadas</p>
        </div>

      </div>

      {/* BOTONES ADMIN */}

      <div style={{
        marginTop:"50px",
        display:"flex",
        gap:"20px"
      }}>

        <Link href="/admin/content">
          <button style={{
            padding:"15px 25px",
            background:"#2E7D32",
            border:"none",
            color:"white",
            cursor:"pointer",
            borderRadius:"6px"
          }}>
            Gestionar módulos y sesiones
          </button>
        </Link>

        <Link href="/admin/users">
          <button style={{
            padding:"15px 25px",
            background:"#444",
            border:"none",
            color:"white",
            cursor:"pointer",
            borderRadius:"6px"
          }}>
            Ver extensionistas
          </button>
        </Link>

      </div>

    </main>

  );

}