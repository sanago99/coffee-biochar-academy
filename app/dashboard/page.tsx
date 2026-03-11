"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";

export default function Dashboard() {

  const [modules, setModules] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [openModule, setOpenModule] = useState<string | null>(null);

  useEffect(() => {

    const loadData = async () => {

      const modulesSnapshot = await getDocs(collection(db, "modules"));
      const sessionsSnapshot = await getDocs(collection(db, "sessions"));

      const modulesList:any[] = [];
      const sessionsList:any[] = [];

      modulesSnapshot.forEach((doc) => {
        modulesList.push({ id: doc.id, ...doc.data() });
      });

      sessionsSnapshot.forEach((doc) => {
        sessionsList.push({ id: doc.id, ...doc.data() });
      });

      setModules(modulesList);
      setSessions(sessionsList);

    };

    loadData();

  }, []);

  const totalSessions = sessions.length;
  const unlockedSessions = sessions.filter(s => !s.locked).length;

  const progress = totalSessions
    ? Math.round((unlockedSessions / totalSessions) * 100)
    : 0;

  const generateCertificate = () => {

    const doc = new jsPDF();

    doc.text("Coffee Biochar Academy", 105, 40, { align: "center" });
    doc.text("Certificate of Completion", 105, 60, { align: "center" });
    doc.text("Certified Coffee Biochar Extensionist", 105, 90, { align: "center" });

    doc.save("certificate.pdf");

  };

  return (

    <main style={{
      minHeight: "100vh",
      background: "#111",
      color: "white",
      padding: "40px"
    }}>

      <h1>Coffee Biochar Academy</h1>

      <p>Progreso: {progress}%</p>

      {progress === 100 && (

        <button
          onClick={generateCertificate}
          style={{
            padding: "10px 20px",
            background: "#2E7D32",
            border: "none",
            color: "white"
          }}
        >
          Download Certificate
        </button>

      )}

      <h2 style={{marginTop:"40px"}}>Módulos</h2>

      {modules.map(module => {

        const moduleSessions = sessions.filter(
          s => s.module === module.id
        );

        const isOpen = openModule === module.id;

        return (

          <div key={module.id} style={{marginTop:"20px"}}>

            <h3
              style={{cursor:"pointer"}}
              onClick={() =>
                setOpenModule(isOpen ? null : module.id)
              }
            >
              {module.title}
            </h3>

            {isOpen && (

              <div>

                {moduleSessions.map(session => (

                  <div key={session.id} style={{marginTop:"10px"}}>

                    <p>{session.title}</p>

                    {session.locked ? (

                      <p>Sesión bloqueada</p>

                    ) : (

                      <div>

                        <a href={session.link} target="_blank">
                          Join Session
                        </a>

                        {session.material && (

                          <a
                            href={session.material}
                            target="_blank"
                            style={{marginLeft:"10px"}}
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