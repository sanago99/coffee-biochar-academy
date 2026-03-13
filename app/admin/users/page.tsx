"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";

export default function UsersAdmin(){

  const [users,setUsers] = useState<any[]>([]);

  useEffect(()=>{

    const loadUsers = async ()=>{

      const snapshot = await getDocs(collection(db,"users"));

      const list:any[] = [];

      snapshot.forEach(doc=>{
        list.push({id:doc.id,...doc.data()});
      });

      setUsers(list);

    };

    loadUsers();

  },[]);

  return(

    <main style={{
      minHeight:"100vh",
      background:"#111",
      color:"white",
      padding:"40px",
      fontFamily:"Arial"
    }}>

      <h1>Extensionistas registrados</h1>

      <table style={{
        width:"100%",
        marginTop:"30px",
        borderCollapse:"collapse"
      }}>

        <thead>

          <tr style={{borderBottom:"1px solid #444"}}>

            <th style={{textAlign:"left",padding:"10px"}}>Nombre</th>
            <th style={{textAlign:"left",padding:"10px"}}>Municipio</th>
            <th style={{textAlign:"left",padding:"10px"}}>Finca</th>
            <th style={{textAlign:"left",padding:"10px"}}>Cluster</th>
            <th style={{textAlign:"left",padding:"10px"}}>Teléfono</th>

          </tr>

        </thead>

        <tbody>

          {users.map(user=>(

            <tr key={user.id} style={{borderBottom:"1px solid #333"}}>

              <td style={{padding:"10px"}}>{user.name}</td>
              <td style={{padding:"10px"}}>{user.municipio}</td>
              <td style={{padding:"10px"}}>{user.finca}</td>
              <td style={{padding:"10px"}}>{user.cluster}</td>
              <td style={{padding:"10px"}}>{user.telefono}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </main>

  );

}