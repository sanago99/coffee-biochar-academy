"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";

import {
collection,
addDoc,
getDocs
} from "firebase/firestore";

import AdminGuard from "../../components/AdminGuard";

export default function AdminContent(){

const [modules,setModules] = useState<any[]>([]);
const [sessions,setSessions] = useState<any[]>([]);

/* MODULE FORM */

const [moduleTitle,setModuleTitle] = useState("");
const [moduleOrder,setModuleOrder] = useState<number>(1);
const [moduleFormLink,setModuleFormLink] = useState("");

/* SESSION FORM */

const [sessionTitle,setSessionTitle] = useState("");
const [sessionLink,setSessionLink] = useState("");
const [sessionMaterial,setSessionMaterial] = useState("");
const [selectedModule,setSelectedModule] = useState("");

/* LOAD DATA */

useEffect(()=>{

loadModules();
loadSessions();

},[]);

const loadModules = async()=>{

const snap = await getDocs(collection(db,"modules"));

const list:any[]=[];

snap.forEach(doc=>{

list.push({
id:doc.id,
...doc.data()
});

});

list.sort((a,b)=>a.order-b.order);

setModules(list);

};

const loadSessions = async()=>{

const snap = await getDocs(collection(db,"sessions"));

const list:any[]=[];

snap.forEach(doc=>{

list.push({
id:doc.id,
...doc.data()
});

});

setSessions(list);

};



/* CREATE MODULE */

const createModule = async()=>{

if(!moduleTitle){
alert("Escribe el nombre del módulo");
return;
}

await addDoc(collection(db,"modules"),{

title:moduleTitle,
order:moduleOrder,
formLink:moduleFormLink,
passingScore:60

});

setModuleTitle("");
setModuleFormLink("");

loadModules();

};



/* CREATE SESSION */

const createSession = async()=>{

if(!sessionTitle || !selectedModule){

alert("Completa los campos");
return;

}

await addDoc(collection(db,"sessions"),{

title:sessionTitle,
link:sessionLink,
material:sessionMaterial,
moduleId:selectedModule,
locked:false

});

setSessionTitle("");
setSessionLink("");
setSessionMaterial("");

loadSessions();

};



return(

<AdminGuard>

<div
style={{
background:"#111",
color:"white",
minHeight:"100vh",
padding:"40px"
}}
>

<h1>Gestión de contenido</h1>

{/* CREATE MODULE */}

<h2 style={{marginTop:"40px"}}>Crear módulo</h2>

<input
placeholder="Nombre del módulo"
value={moduleTitle}
onChange={(e)=>setModuleTitle(e.target.value)}
style={{display:"block",marginTop:"10px"}}
/>

<input
type="number"
placeholder="Orden del módulo"
value={moduleOrder}
onChange={(e)=>setModuleOrder(Number(e.target.value))}
style={{display:"block",marginTop:"10px"}}
/>

<input
placeholder="Link evaluación (Google Forms)"
value={moduleFormLink}
onChange={(e)=>setModuleFormLink(e.target.value)}
style={{display:"block",marginTop:"10px"}}
/>

<button
onClick={createModule}
style={{
marginTop:"10px",
padding:"8px 14px",
background:"#4CAF50",
border:"none",
color:"white",
borderRadius:"5px"
}}
>
Crear módulo
</button>



{/* CREATE SESSION */}

<h2 style={{marginTop:"50px"}}>Crear sesión</h2>

<input
placeholder="Título sesión"
value={sessionTitle}
onChange={(e)=>setSessionTitle(e.target.value)}
style={{display:"block",marginTop:"10px"}}
/>

<input
placeholder="Link sesión (video)"
value={sessionLink}
onChange={(e)=>setSessionLink(e.target.value)}
style={{display:"block",marginTop:"10px"}}
/>

<input
placeholder="Material adicional"
value={sessionMaterial}
onChange={(e)=>setSessionMaterial(e.target.value)}
style={{display:"block",marginTop:"10px"}}
/>

<select
value={selectedModule}
onChange={(e)=>setSelectedModule(e.target.value)}
style={{display:"block",marginTop:"10px"}}
>

<option value="">Seleccionar módulo</option>

{modules.map((m)=>(
<option key={m.id} value={m.id}>
{m.title}
</option>
))}

</select>

<button
onClick={createSession}
style={{
marginTop:"10px",
padding:"8px 14px",
background:"#FFC107",
border:"none",
borderRadius:"5px"
}}
>
Crear sesión
</button>



{/* MODULE LIST */}

<h2 style={{marginTop:"50px"}}>Módulos existentes</h2>

{modules.map((module)=>{

const moduleSessions =
sessions.filter(
s=>s.moduleId===module.id
);

return(

<div
key={module.id}
style={{
border:"1px solid #333",
padding:"15px",
borderRadius:"8px",
marginTop:"10px"
}}
>

<h3>{module.title}</h3>

<p>Orden: {module.order}</p>

<p>{moduleSessions.length} sesiones</p>

</div>

);

})}

</div>

</AdminGuard>

);

}