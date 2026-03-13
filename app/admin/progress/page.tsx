"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";

import {
collection,
getDocs
} from "firebase/firestore";

import {
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer
} from "recharts";

import AdminGuard from "../../components/AdminGuard";

export default function AdminProgress(){

const [progressData,setProgressData] = useState<any[]>([]);
const [clusterStats,setClusterStats] = useState<any[]>([]);
const [moduleStats,setModuleStats] = useState<any[]>([]);

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

const totalSessions = sessionsSnap.size;

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

id:user.id,
name:user.name,
cluster:user.cluster,
municipio:user.municipio,
progress:percentage,
moduleScores:user.moduleScores || {}

};

});

setProgressData(results);

/* METRICAS */

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

/* PROGRESO POR CLUSTER */

const clusterMap:any = {};

results.forEach(u=>{

if(!clusterMap[u.cluster]){

clusterMap[u.cluster] = {
cluster:u.cluster,
total:0,
count:0
};

}

clusterMap[u.cluster].total += u.progress;
clusterMap[u.cluster].count++;

});

const clusterData =
Object.values(clusterMap).map((c:any)=>({

cluster:c.cluster,
progress:Math.round(c.total/c.count)

}));

setClusterStats(clusterData);

/* SCORE POR MODULO */

const moduleMap:any = {};

usersList.forEach(user=>{

const scores = user.moduleScores || {};

Object.keys(scores).forEach(module=>{

if(!moduleMap[module]){

moduleMap[module] = {
module:"M"+module,
total:0,
count:0
};

}

moduleMap[module].total += scores[module];
moduleMap[module].count++;

});

});

const moduleData =
Object.values(moduleMap).map((m:any)=>({

module:m.module,
score:Math.round(m.total/m.count)

}));

setModuleStats(moduleData);

};

loadData();

},[]);

return(

<AdminGuard>

<div style={{
padding:"40px",
background:"#111",
minHeight:"100vh",
color:"white"
}}>

<h1>Panel de progreso de extensionistas</h1>

{/* METRICAS */}

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
<p style={{fontSize:"24px"}}>
{stats.users}
</p>
</div>

<div style={{
background:"#1a1a1a",
padding:"20px",
borderRadius:"8px"
}}>
<h3>📊 Progreso promedio</h3>
<p style={{fontSize:"24px"}}>
{stats.avgProgress}%
</p>
</div>

<div style={{
background:"#1a1a1a",
padding:"20px",
borderRadius:"8px"
}}>
<h3>🎓 Certificados</h3>
<p style={{fontSize:"24px"}}>
{stats.certificates}
</p>
</div>

</div>

{/* GRAFICO CLUSTER */}

<h2 style={{marginTop:"40px"}}>
Progreso promedio por cluster
</h2>

<div style={{
width:"100%",
height:"300px"
}}>

<ResponsiveContainer>

<BarChart data={clusterStats}>

<XAxis dataKey="cluster"/>

<YAxis/>

<Tooltip/>

<Bar dataKey="progress"/>

</BarChart>

</ResponsiveContainer>

</div>

{/* GRAFICO MODULOS */}

<h2 style={{marginTop:"40px"}}>
Score promedio por módulo
</h2>

<div style={{
width:"100%",
height:"300px"
}}>

<ResponsiveContainer>

<BarChart data={moduleStats}>

<XAxis dataKey="module"/>

<YAxis/>

<Tooltip/>

<Bar dataKey="score"/>

</BarChart>

</ResponsiveContainer>

</div>

{/* TABLA EXTENSIONISTAS */}

<table style={{
width:"100%",
marginTop:"40px",
borderCollapse:"collapse"
}}>

<thead>

<tr style={{
borderBottom:"1px solid #444"
}}>

<th style={{padding:"10px",textAlign:"left"}}>
Extensionista
</th>

<th style={{padding:"10px",textAlign:"left"}}>
Cluster
</th>

<th style={{padding:"10px",textAlign:"left"}}>
Municipio
</th>

<th style={{padding:"10px",textAlign:"left"}}>
Progreso
</th>

<th style={{padding:"10px",textAlign:"left"}}>
Certificado
</th>

<th style={{padding:"10px",textAlign:"left"}}>
Detalle
</th>

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
{user.progress===100 ? "✔" : "❌"}
</td>

<td style={{padding:"10px"}}>

<a
href={`/admin/users/${user.id}`}
style={{
color:"#4CAF50"
}}
>
Ver progreso
</a>

</td>

</tr>

))}

</tbody>

</table>

</div>

</AdminGuard>

);

}