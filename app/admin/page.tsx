"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";

export default function Admin(){

  const [modules,setModules] = useState<any[]>([]);
  const [sessions,setSessions] = useState<any[]>([]);

  const [moduleTitle,setModuleTitle] = useState("");

  const [module,setModule] = useState("");
  const [title,setTitle] = useState("");
  const [date,setDate] = useState("");
  const [link,setLink] = useState("");
  const [material,setMaterial] = useState("");

  const loadData = async ()=>{

    const modulesSnapshot = await getDocs(collection(db,"modules"));
    const sessionsSnapshot = await getDocs(collection(db,"sessions"));

    const modulesList:any[]=[];
    const sessionsList:any[]=[];

    modulesSnapshot.forEach(doc=>{
      modulesList.push({id:doc.id,...doc.data()});
    });

    sessionsSnapshot.forEach(doc=>{
      sessionsList.push({id:doc.id,...doc.data()});
    });

    setModules(modulesList);
    setSessions(sessionsList);

  };

  useEffect(()=>{
    loadData();
  },[]);

  const createModule = async ()=>{

    if(!moduleTitle) return alert("Escribe el nombre del módulo");

    await addDoc(collection(db,"modules"),{
      title:moduleTitle
    });

    setModuleTitle("");

    alert("Módulo creado");

    loadData();

  };

  const createSession = async ()=>{

    if(!module) return alert("Selecciona un módulo");

    await addDoc(collection(db,"sessions"),{
      module:module,
      title:title,
      date:date,
      link:link,
      material:material,
      locked:true
    });

    setTitle("");
    setDate("");
    setLink("");
    setMaterial("");

    alert("Sesión creada");

    loadData();

  };

  const unlockSession = async (id:string)=>{

    const sessionRef = doc(db,"sessions",id);

    await updateDoc(sessionRef,{
      locked:false
    });

    alert("Sesión desbloqueada");

    loadData();

  };

  return(

    <main style={{
      minHeight:"100vh",
      background:"#1A1A1A",
      color:"white",
      padding:"40px",
      fontFamily:"Arial"
    }}>

      <h1>Coffee Biochar Academy — Admin</h1>

      {/* CREAR MODULO */}

      <h2 style={{marginTop:"30px"}}>Crear módulo</h2>

      <input
        placeholder="Nombre del módulo"
        value={moduleTitle}
        onChange={(e)=>setModuleTitle(e.target.value)}
        style={{display:"block",margin:"10px 0",padding:"10px",width:"300px"}}
      />

      <button
        onClick={createModule}
        style={{
          padding:"10px 20px",
          background:"#2E7D32",
          border:"none",
          color:"white",
          cursor:"pointer"
        }}
      >
        Crear módulo
      </button>

      {/* CREAR SESION */}

      <h2 style={{marginTop:"50px"}}>Crear sesión</h2>

      <select
        value={module}
        onChange={(e)=>setModule(e.target.value)}
        style={{display:"block",margin:"10px 0",padding:"10px",width:"320px"}}
      >

        <option value="">Seleccionar módulo</option>

        {modules.map((m)=>(
          <option key={m.id} value={m.id}>
            {m.title}
          </option>
        ))}

      </select>

      <input
        placeholder="Título sesión"
        value={title}
        onChange={(e)=>setTitle(e.target.value)}
        style={{display:"block",margin:"10px 0",padding:"10px",width:"300px"}}
      />

      <input
        placeholder="Fecha (ej: Semana 3)"
        value={date}
        onChange={(e)=>setDate(e.target.value)}
        style={{display:"block",margin:"10px 0",padding:"10px",width:"300px"}}
      />

      <input
        placeholder="Link Google Meet"
        value={link}
        onChange={(e)=>setLink(e.target.value)}
        style={{display:"block",margin:"10px 0",padding:"10px",width:"300px"}}
      />

      <input
        placeholder="Link material (Google Drive)"
        value={material}
        onChange={(e)=>setMaterial(e.target.value)}
        style={{display:"block",margin:"10px 0",padding:"10px",width:"300px"}}
      />

      <button
        onClick={createSession}
        style={{
          padding:"10px 20px",
          background:"#2E7D32",
          border:"none",
          color:"white",
          cursor:"pointer"
        }}
      >
        Crear sesión
      </button>

      {/* LISTA DE SESIONES */}

      <h2 style={{marginTop:"60px"}}>Sesiones del curso</h2>

      {sessions.map(session=>(

        <div key={session.id} style={{
          border:"1px solid #444",
          padding:"15px",
          marginTop:"10px",
          borderRadius:"6px",
          maxWidth:"500px"
        }}>

          <p><b>{session.title}</b></p>

          <p>{session.date}</p>

          {session.locked ? (

            <button
              onClick={()=>unlockSession(session.id)}
              style={{
                padding:"6px 12px",
                background:"#2E7D32",
                border:"none",
                color:"white",
                cursor:"pointer"
              }}
            >
              Desbloquear
            </button>

          ) : (

            <p style={{color:"#2E7D32"}}>Sesión abierta</p>

          )}

        </div>

      ))}

    </main>

  );

}