"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../firebase/config";

import {
doc,
getDoc,
collection,
getDocs
} from "firebase/firestore";

import { useParams } from "next/navigation";

export default function UserDetail(){

const params = useParams();

const userId = params.id as string;

const [user,setUser] = useState<any>(null);
const [modules,setModules] = useState<any[]>([]);

useEffect(()=>{

const loadData = async ()=>{

/* USER */

const userDoc =
await getDoc(doc(db,"users",userId));

if(userDoc.exists()){

setUser(userDoc.data());

}

/* MODULES */

const modulesSnap =
await getDocs(collection(db,"modules"));

const modulesList:any[]=[];

modulesSnap.forEach(doc=>{
modulesList.push({
id:doc.id,
...doc.data()
});
});

modulesList.sort((a,b)=>a.order - b.order);

setModules(modulesList);

};

loadData();

},[]);

if(!user){

return(
<div style={{
padding:"40px",
background:"#111",
color:"white"
}}>
Cargando usuario...
</div>
);

}

return(

<div style={{
padding:"40px",
background:"#111",
minHeight:"100vh",
color:"white"
}}>

<h1>{user.name}</h1>

<p>Cluster: {user.cluster}</p>

<p>Municipio: {user.municipio}</p>

<h2 style={{marginTop:"40px"}}>
Progreso por módulo
</h2>

<table style={{
width:"100%",
marginTop:"20px",
borderCollapse:"collapse"
}}>

<thead>

<tr style={{
borderBottom:"1px solid #444"
}}>

<th style={{textAlign:"left",padding:"10px"}}>
Módulo
</th>

<th style={{textAlign:"left",padding:"10px"}}>
Estado
</th>

<th style={{textAlign:"left",padding:"10px"}}>
Score
</th>

</tr>

</thead>

<tbody>

{modules.map((module)=>{

const score =
user.moduleScores?.[module.order];

let status = "🔒 Bloqueado";

if(score >= module.passingScore){

status = "✔ Aprobado";

}else if(module.order === 1){

status = "Disponible";

}else if(user.moduleScores?.[module.order - 1] >= 60){

status = "Disponible";

}else if(score){

status = "❌ No aprobado";

}

return(

<tr key={module.id}
style={{
borderBottom:"1px solid #333"
}}>

<td style={{padding:"10px"}}>
{module.title}
</td>

<td style={{padding:"10px"}}>
{status}
</td>

<td style={{padding:"10px"}}>
{score || "-"}
</td>

</tr>

);

})}

</tbody>

</table>

</div>

);

}