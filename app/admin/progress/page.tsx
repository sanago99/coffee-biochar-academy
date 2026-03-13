"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import {
  collection,
  getDocs
} from "firebase/firestore";

export default function AdminProgress(){

  const [users,setUsers] = useState<any[]>([]);
  const [progress,setProgress] = useState<any[]>([]);
  const [certificates,setCertificates] = useState<any[]>([]);
  const [sessions,setSessions] = useState<any[]>([]);

  useEffect(()=>{

    const loadData = async ()=>{

      const usersSnap = await getDocs(collection(db,"users"));
      const progressSnap = await getDocs(collection(db,"progress"));
      const certSnap = await getDocs(collection(db,"certificates"));
      const sessionsSnap = await getDocs(collection(db,"sessions"));

      const usersList:any[]=[];
      const progressList:any[]=[];
      const certList:any[]=[];
      const sessionsList:any[]=[];

      usersSnap.forEach(doc=>{
        usersList.push({id:doc.id,...doc.data()});
      });

      progressSnap.forEach(doc=>{
        progressList.push(doc.data());
      });

      certSnap.forEach(doc=>{
        certList.push(doc.data());
      });

      sessionsSnap.forEach(doc=>{
        sessionsList.push(doc.data());
      });

      setUsers(usersList);
      setProgress(progressList);
      setCertificates(certList);
      setSessions(sessionsList);

    };

    loadData();

  },[]);

  const totalSessions = sessions.length;

  const getProgress = (userId:string)=>{

    const completed = progress.filter(
      p=>p.userId===userId
    ).length;

    if(!totalSessions) return 0;

    return Math.round((completed / totalSessions)*100);

  };

  const hasCertificate = (userId:string)=>{

    return certificates.some(
      c=>c.userId===userId
    );

  };

  return(

    <main style={{
      minHeight:"100vh",
      background:"#111",
      color:"white",
      padding:"40px",
      fontFamily:"Arial"
    }}>

      <h1>Progreso de Extensionistas</h1>

      <table style={{
        width:"100%",
        marginTop:"30px",
        borderCollapse:"collapse"
      }}>

        <thead>

          <tr style={{background:"#222"}}>

            <th style={{padding:"12px"}}>Extensionista</th>
            <th>Cluster</th>
            <th>Municipio</th>
            <th>Progreso</th>
            <th>Certificado</th>

          </tr>

        </thead>

        <tbody>

          {users.map(user=>{

            const progressPercent =
              getProgress(user.id);

            const certificate =
              hasCertificate(user.id);

            return(

              <tr
                key={user.id}
                style={{
                  borderBottom:"1px solid #333"
                }}
              >

                <td style={{padding:"12px"}}>
                  {user.name}
                </td>

                <td>
                  {user.cluster}
                </td>

                <td>
                  {user.municipio}
                </td>

                <td>
                  {progressPercent}%
                </td>

                <td>

                  {certificate ? "✔" : "—"}

                </td>

              </tr>

            );

          })}

        </tbody>

      </table>

    </main>

  );

}