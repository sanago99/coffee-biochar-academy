"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../firebase/config";
import { collection, getDocs, addDoc, doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import QRCode from "qrcode";

export default function Dashboard(){

  const router = useRouter();

  const [modules,setModules] = useState<any[]>([]);
  const [sessions,setSessions] = useState<any[]>([]);
  const [openModule,setOpenModule] = useState<string | null>(null);
  const [completed,setCompleted] = useState<string[]>([]);
  const [studentName,setStudentName] = useState("");

  useEffect(()=>{

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

    const loadUser = async ()=>{

      const uid = auth.currentUser?.uid;

      if(!uid) return;

      const userRef = doc(db,"users",uid);

      const userSnap = await getDoc(userRef);

      if(userSnap.exists()){

        const data:any = userSnap.data();

        setStudentName(data.name);

      }

    };

    loadData();
    loadUser();

  },[]);

  const logout = async ()=>{

    await signOut(auth);
    router.push("/login");

  };

  const completeSession = async (sessionId:string)=>{

    await addDoc(collection(db,"progress"),{
      userId:auth.currentUser?.uid,
      sessionId:sessionId,
      completed:true
    });

    setCompleted([...completed,sessionId]);

    alert("Sesión completada");

  };

  const totalSessions = sessions.length;

  const progress = totalSessions
    ? Math.round((completed.length / totalSessions) * 100)
    : 0;

  const generateCertificate = async ()=>{

    try{

      const certificateId = "CBA-" + Date.now();

      const verificationUrl =
        "https://coffeebiochar.academy/certificate/" + certificateId;

      await addDoc(collection(db,"certificates"),{
        certificateId: certificateId,
        name: studentName,
        userId: auth.currentUser?.uid,
        date: new Date().toISOString()
      });

      const qrImage = await QRCode.toDataURL(verificationUrl);

      const docPDF = new jsPDF("landscape");

      docPDF.setDrawColor(40,120,70);
      docPDF.setLineWidth(3);
      docPDF.rect(10,10,277,190);

      docPDF.addImage("/logo.png","PNG",130,20,40,20);

      docPDF.setFontSize(28);
      docPDF.text("Coffee Biochar Academy",148,60,{align:"center"});

      docPDF.setFontSize(18);
      docPDF.text("CERTIFICATE OF COMPLETION",148,80,{align:"center"});

      docPDF.setFontSize(26);
      docPDF.text(studentName,148,110,{align:"center"});

      docPDF.setFontSize(16);
      docPDF.text("Certified Coffee Biochar Extensionist",148,130,{align:"center"});

      docPDF.setFontSize(12);
      docPDF.text("Cohorte Coffee Biochar 2026",148,145,{align:"center"});

      docPDF.text("Certificate ID: "+certificateId,148,160,{align:"center"});

      docPDF.text("Verify:",240,150);

      docPDF.addImage(qrImage,"PNG",230,155,40,40);

      docPDF.addImage("/signature.png","PNG",40,150,60,20);

      docPDF.setFontSize(10);
      docPDF.text("Program Director",60,175);

      docPDF.save("coffee-biochar-certificate.pdf");

    }catch(error){

      console.error(error);
      alert("Error generando certificado");

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

      <h2>Bienvenido {studentName}</h2>

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

      <h2 style={{marginTop:"40px"}}>Módulos</h2>

      {modules.map(module=>{

        const moduleSessions = sessions.filter(
          s=>s.module===module.id
        );

        const isOpen = openModule===module.id;

        return(

          <div key={module.id} style={{
            border:"1px solid #333",
            borderRadius:"8px",
            marginTop:"20px",
            padding:"15px"
          }}>

            <div
              onClick={()=>setOpenModule(isOpen ? null : module.id)}
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

                        <button
                          onClick={()=>completeSession(session.id)}
                          style={{
                            marginLeft:"10px",
                            padding:"6px 12px",
                            background:"#555",
                            border:"none",
                            color:"white",
                            cursor:"pointer"
                          }}
                        >
                          Completar
                        </button>

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