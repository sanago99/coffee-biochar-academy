"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";

import {
collection,
getDocs
} from "firebase/firestore";

export default function AdminProgress(){

const [progressData,setProgressData] = useState<any[]>([]);
const [totalSessions,setTotalSessions] = useState(0);

const [search,setSearch] = useState("");
const [clusterFilter,setClusterFilter] = useState("");

const [stats,setStats] = useState({
users:0,
avgProgress:0,
certificates:0
});

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

/* MÉTRICAS */

const avg =
results.reduce((acc,u)=>acc+u.progress,0) /
(results.length || 1);

const certificates =
results.filter(u=>u.progress===100).length;

setStats({
users:results.length,
avgProgress:Math.round(avg),
certificates
});

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

{/* MÉTRICAS */}

<div style={{
display:"flex",
gap:"30px",
marginTop:"20px"
}}>

<div style={{
background:"#1a1a1a",
padding:"20px",
borderRadius:"8px"
}}>
<h3>👩‍🌾 Extensionistas</h3>
<p style={{fontSize:"24px"}}>{stats.users}</p>
</div>

<div style={{
background:"#1a1a1a",
padding:"20px",
borderRadius:"8px"
}}>
<h3>📊 Progreso promedio</h3>
<p style={{fontSize:"24px"}}>{stats.avgProgress}%</p>
</div>

<div style={{
background:"#1a1a1a",
padding:"20px",
borderRadius:"8px"
}}>
<h3>🎓 Certificados</h3>
<p style={{fontSize:"24px"}}>{stats.certificates}</p>
</div>

</div>

{/* FILTROS */}

<div style={{
marginTop:"30px",
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

{/* TABLA */}

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