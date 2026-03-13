"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";

export default function Dashboard() {

  const router = useRouter();

  const [modules, setModules] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [openModule, setOpenModule] = useState<string | null>(null);

  const studentName = "Extensionista Coffee Biochar";

  useEffect(() => {

    const loadData = async () => {

      const modulesSnapshot = await getDocs(collection(db,"modules"));
      const sessionsSnapshot = await getDocs(collection(db,"sessions"));

      const modulesList:any[] = [];
      const sessionsList:any[] = [];

      modulesSnapshot.forEach((doc)=>{
        modulesList.push({id:doc.id,...doc.data()});
      });

      sessionsSnapshot.forEach((doc)=>{
        sessionsList.push({id:doc.id,...doc.data()});
      });

      setModules(modulesList);
      setSessions(sessionsList);

    };

    loadData();

  },[]);

  const logout = async () => {

    await signOut(auth);

    router.push("/login");

  };

  const totalSessions = sessions.length;

  const unlockedSessions = sessions.filter(
    s => !s.locked
  ).length;

  const progress = totalSessions
    ? Math.round((unlockedSessions / totalSessions) * 100)
    : 0;

  const generateCertificate = () => {

    const doc = new jsPDF();

    doc.setFontSize(24);

    doc.text(
      "Coffee Biochar Academy",
      105,
      40,
      {align:"center"}
    );

    doc.setFontSize(18);

    doc.text(
      "Certificate of Completion",
      105,
      60,
      {align:"center"}
    );

    doc.setFontSize(20);

    doc.text(
      studentName,
      105,
      90,
      {align:"center"}
    );

    doc.setFontSize(14);

    doc.text(
      "Certified Coffee Biochar Extensionist",
      105,
      110,
      {align:"center"}
    );

    doc.text(
      "Coffee Biochar Academy",
      105,
      140,
      {align:"center"}
    );

    doc.save("coffee-biochar-certificate.pdf");

  };

  return (

    <main style={{
      minHeight:"100vh",
      background:"#111",
      color:"white",
      padding:"40px",
      fontFamily:"Arial"
    }}>

      {/* BOTON CERRAR SESION */}

      <button
        onClick={logout}
        style={{
          position:"absolute",
          top:"20px",
          right:"20px",
          padding:"8px 15px",
          background:"#444",
          border:"none",
          color:"white",
          cursor:"pointer",
          borderRadius:"6px"
        }}
      >
        Cerrar sesión
      </button>

      <h1>Coffee Biochar Academy</h1>

      <h2>Certified Coffee Biochar Extensionist</h2>

      {/* PROGRESS */}

      <div style={{marginTop:"30px"}}>

        <p>Progreso del curso</p>

        <div style={{
          width:"400px",
          height:"10px",
          background:"#333",
          borderRadius:"5px"
        }}>

          <div style={{
            width:progress+"%",
            height:"10px",
            background:"#2E7D32",
            borderRadius:"5px"
          }}></div>

        </div>

        <p style={{marginTop:"5px"}}>
          {progress}% completado
        </p>

        {progress===100 &&(

          <button
            onClick={generateCertificate}
            style={{
              marginTop:"15px",
              padding:"10px 20px",
              background:"#2E7D32",
              border:"none",
              color:"white",
              cursor:"pointer"
            }}
          >
            Descargar certificado
          </button>

        )}

      </div>

      {/* MODULES */}

      <h2 style={{marginTop:"40px"}}>Módulos</h2>

      {modules.map(module=>{

        const moduleSessions = sessions.filter(
          s => s.module === module.id
        );

        const isOpen = openModule === module.id;

        return(

          <div key={module.id} style={{
            border:"1px solid #333",
            borderRadius:"8px",
            marginTop:"20px",
            padding:"15px"
          }}>

            <div
              onClick={() =>
                setOpenModule(isOpen ? null : module.id)
              }
              style={{cursor:"pointer"}}
            >

              <h3>{module.title}</h3>

              <p style={{color:"#888"}}>
                {moduleSessions.length} sesiones
              </p>

            </div>

            {isOpen &&(

              <div style={{marginTop:"10px"}}>

                {moduleSessions.map(session=>(

                  <div key={session.id} style={{
                    border:"1px solid #444",
                    borderRadius:"6px",
                    padding:"10px",
                    marginTop:"10px"
                  }}>

                    <p><b>{session.title}</b></p>

                    <p style={{color:"#888"}}>
                      {session.date}
                    </p>

                    {session.locked ?(

                      <p style={{color:"#777"}}>
                        Sesión bloqueada
                      </p>

                    ):(
                      <div style={{marginTop:"5px"}}>

                        <a
                          href={session.link}
                          target="_blank"
                          style={{
                            padding:"6px 12px",
                            background:"#2E7D32",
                            color:"white",
                            textDecoration:"none",
                            borderRadius:"4px"
                          }}
                        >
                          Join Session
                        </a>

                        {session.material &&(

                          <a
                            href={session.material}
                            target="_blank"
                            style={{
                              marginLeft:"10px",
                              padding:"6px 12px",
                              background:"#444",
                              color:"white",
                              textDecoration:"none",
                              borderRadius:"4px"
                            }}
                          >
                            Material
                          </a>

                        )}

                      </div>

                    )}

                  </div>

                ))}

              </div>

            )}

          </div>

        );

      })}

    </main>

  );

}