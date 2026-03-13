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

const [search,setSearch] = useState("");
const [clusterFilter,setClusterFilter] = useState("");

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

setUsers(usersList);

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
sessionsSnap.size
? Math.round((completed/sessionsSnap.size)*100)
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

},[]);

const filteredData =
progressData.filter(user=>{

const matchName =
user.name?.toLowerCase()
.includes(search.toLowerCase());

const matchCluster =
clusterFilter
? user.cluster === clusterFilter
: true;

return matchName && matchCluster;

});

/* clusters únicos */

const clusters =
[...new Set(progressData.map(u=>u.cluster))];

return(

<div style={{
padding:"40px",
background:"#111",
minHeight:"100vh",
color:"white"
}}>

<h1>Panel de progreso de extensionistas</h1>

{/* filtros */}

<div style={{
marginTop:"20px",
display:"flex",
gap:"20px"
}}>

<input
placeholder="Buscar extensionista"
value={search}
onChange={(e)=>setSearch(e.target.value)}
style={{
padding:"8px",
background:"#222",
border:"1px solid #444",
color:"white"
}}
/>

<select
value={clusterFilter}
onChange={(e)=>setClusterFilter(e.target.value)}
style={{
padding:"8px",
background:"#222",
border:"1px solid #444",
color:"white"
}}
>

<option value="">Todos los clusters</option>

{clusters.map((cluster,i)=>(

<option key={i} value={cluster}>
{cluster}
</option>

))}

</select>

</div>

{/* tabla */}

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

{filteredData.map((user,i)=>(

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