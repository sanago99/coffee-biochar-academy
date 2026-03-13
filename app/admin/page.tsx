"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminPage(){

  const router = useRouter();

  const [usersCount,setUsersCount] = useState(0);
  const [modulesCount,setModulesCount] = useState(0);
  const [sessionsCount,setSessionsCount] = useState(0);
  const [certificatesCount,setCertificatesCount] = useState(0);

  useEffect(()=>{

    const checkAdmin = async ()=>{

      const user = auth.currentUser;

      if(!user){
        router.push("/login");
        return;
      }

      loadStats();

    };

    checkAdmin();

  },[]);

  const loadStats = async ()=>{

    const usersSnap = await getDocs(collection(db,"users"));
    const modulesSnap = await getDocs(collection(db,"modules"));
    const sessionsSnap = await getDocs(collection(db,"sessions"));
    const certSnap = await getDocs(collection(db,"certificates"));

    setUsersCount(usersSnap.size);
    setModulesCount(modulesSnap.size);
    setSessionsCount(sessionsSnap.size);
    setCertificatesCount(certSnap.size);

  };

  const logout = async ()=>{

    await signOut(auth);
    router.push("/login");

  };

  return(

    <main style={{
      minHeight:"100vh",
      background:"#111",
      color:"white",
      padding:"40px",
      fontFamily:"Arial"
    }}>

      <button
        onClick={logout}
        style={{
          position:"absolute",
          right:"20px",
          top:"20px",
          padding:"8px 16px",
          background:"#444",
          border:"none",
          color:"white",
          cursor:"pointer",
          borderRadius:"6px"
        }}
      >
        Cerrar sesión
      </button>

      <h1>Admin Panel</h1>

      <p style={{color:"#aaa"}}>
        Coffee Biochar Academy
      </p>

      {/* Estadísticas */}

      <div style={{
        marginTop:"40px",
        display:"grid",
        gridTemplateColumns:"repeat(2,220px)",
        gap:"20px"
      }}>

        <div style={card}>
          <h2>{usersCount}</h2>
          <p>Extensionistas</p>
        </div>

        <div style={card}>
          <h2>{modulesCount}</h2>
          <p>Módulos</p>
        </div>

        <div style={card}>
          <h2>{sessionsCount}</h2>
          <p>Sesiones</p>
        </div>

        <div style={card}>
          <h2>{certificatesCount}</h2>
          <p>Certificados emitidos</p>
        </div>

      </div>

      {/* Navegación */}

      <div style={{
        marginTop:"50px",
        display:"flex",
        gap:"20px",
        flexWrap:"wrap"
      }}>

        <Link href="/admin/create-user">
          <button style={btn}>
            Crear extensionista
          </button>
        </Link>

        <Link href="/admin/users">
          <button style={btn}>
            Ver extensionistas
          </button>
        </Link>

        <Link href="/admin/content">
          <button style={btn}>
            Gestionar módulos y sesiones
          </button>
        </Link>

        <Link href="/admin/progress">
          <button style={btnGreen}>
            Progreso extensionistas
          </button>
        </Link>

      </div>

    </main>

  );

}

const card = {
  background:"#222",
  padding:"20px",
  borderRadius:"8px"
};

const btn = {
  padding:"14px 24px",
  background:"#444",
  border:"none",
  color:"white",
  cursor:"pointer",
  borderRadius:"6px"
};

const btnGreen = {
  padding:"14px 24px",
  background:"#2E7D32",
  border:"none",
  color:"white",
  cursor:"pointer",
  borderRadius:"6px"
};