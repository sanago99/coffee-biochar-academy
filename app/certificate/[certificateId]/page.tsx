"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useParams } from "next/navigation";

export default function CertificatePage(){

  const params = useParams();
  const certificateId = params.certificateId;

  const [certificate,setCertificate] = useState<any>(null);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    const loadCertificate = async ()=>{

      const snapshot = await getDocs(collection(db,"certificates"));

      snapshot.forEach(doc=>{

        const data:any = doc.data();

        if(data.certificateId===certificateId){
          setCertificate(data);
        }

      });

      setLoading(false);

    };

    loadCertificate();

  },[]);

  if(loading){

    return(

      <main style={{
        minHeight:"100vh",
        background:"#111",
        color:"white",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        fontFamily:"Arial"
      }}>
        <h2>Verificando certificado...</h2>
      </main>

    );

  }

  if(!certificate){

    return(

      <main style={{
        minHeight:"100vh",
        background:"#111",
        color:"white",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        fontFamily:"Arial"
      }}>
        <h2>Certificado no encontrado</h2>
      </main>

    );

  }

  return(

    <main style={{
      minHeight:"100vh",
      background:"#111",
      color:"white",
      display:"flex",
      flexDirection:"column",
      justifyContent:"center",
      alignItems:"center",
      fontFamily:"Arial"
    }}>

      <h1>Coffee Biochar Academy</h1>

      <h2>Certificado verificado</h2>

      <p style={{marginTop:"20px"}}>
        {certificate.name}
      </p>

      <p>
        Certified Coffee Biochar Extensionist
      </p>

      <p style={{marginTop:"10px"}}>
        Certificate ID: {certificate.certificateId}
      </p>

    </main>

  );

}