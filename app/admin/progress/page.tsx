"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";

import {
collection,
getDocs
} from "firebase/firestore";

export default function AdminProgress(){

const [users,setUsers] = useState<any[]>([]);
const [progressData,setProgressData] = useState<any[]>([]);
const [totalSessions,setTotalSessions] = useState(0);

useEffect(()=>{

const loadData = async ()=>{

/* USERS */

const usersSnap =
await getDocs(collection(db,"users"));

const usersList:any[]=[];

usersSnap.forEach(doc=>{
usersList.push({
id:doc.id,
...doc.data()
});
});

/* SESSIONS */

const sessionsSnap =
await getDocs(collection(db,"sessions"));

setTotalSessions(sessionsSnap.size);

/* PROGRESS */

const progressSnap =
await getDocs(collection(db,"progress"));

const progressList:any[]=[];

progressSnap.forEach(doc=>{
progressList.push(doc.data());
});

/* CALCULAR PROGRESO */

const results:any[] = usersList.map(user=>{

const userProgress =
progressList.filter(
p=>p.userId === user.id
);

const completed =
userProgress.length;

const percentage =
totalSessions
? Math.round((completed/totalSessions)*100)
:0;

return{

name:user.name,
cluster:user.cluster,
municipio:user.municipio,
progress:percentage

};

});

setProgressData(results);

};

loadData();

},[totalSessions]);

return(

<div style={{
padding:"40px",
background:"#111",
minHeight:"100vh",
color:"white"
}}>

<h1>Panel de progreso de extensionistas</h1>

<table style={{
width:"100%",
marginTop:"30px",
borderCollapse:"collapse"
}}>

<thead>

<tr style={{
borderBottom:"1px solid #444"
}}>

<th style={{textAlign:"left",padding:"10px"}}>Extensionista</th>
<th style={{textAlign:"left",padding:"10px"}}>Cluster</th>
<th style={{textAlign:"left",padding:"10px"}}>Municipio</th>
<th style={{textAlign:"left",padding:"10px"}}>Progreso</th>
<th style={{textAlign:"left",padding:"10px"}}>Certificado</th>

</tr>

</thead>

<tbody>

{progressData.map((user,i)=>(

<tr key={i} style={{
borderBottom:"1px solid #333"
}}>

<td style={{padding:"10px"}}>
{user.name}
</td>

<td style={{padding:"10px"}}>
{user.cluster}
</td>

<td style={{padding:"10px"}}>
{user.municipio}
</td>

<td style={{padding:"10px"}}>
{user.progress}%
</td>

<td style={{padding:"10px"}}>

{user.progress === 100
? "✔"
: "❌"
}

</td>

</tr>

))}

</tbody>

</table>

</div>

);

}