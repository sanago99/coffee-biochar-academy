"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";

import {
collection,
addDoc,
getDocs
} from "firebase/firestore";

export default function Content(){

const [modules,setModules] = useState<any[]>([]);

/* MODULE */

const [moduleTitle,setModuleTitle] = useState("");
const [moduleOrder,setModuleOrder] = useState("");
const [formLink,setFormLink] = useState("");

/* SESSION */

const [sessionTitle,setSessionTitle] = useState("");
const [sessionLink,setSessionLink] = useState("");
const [sessionMaterial,setSessionMaterial] = useState("");
const [sessionModule,setSessionModule] = useState("");

/* LOAD MODULES */

useEffect(()=>{

const loadModules = async ()=>{

const snap = await getDocs(collection(db,"modules"));

const list:any[]=[];

snap.forEach(doc=>{

list.push({
id:doc.id,
...doc.data()
});

});

setModules(list);

};

loadModules();

},[]);


/* CREATE MODULE */

const createModule = async ()=>{

if(!moduleTitle || !moduleOrder){

alert("Completa los campos del módulo");
return;

}

await addDoc(collection(db,"modules"),{

title:moduleTitle,
order:Number(moduleOrder),
formLink:formLink,
passingScore:60

});

alert("Módulo creado");

location.reload();

};


/* CREATE SESSION */

const createSession = async ()=>{

if(!sessionTitle || !sessionModule){

alert("Completa los campos de la sesión");
return;

}

await addDoc(collection(db,"sessions"),{

title:sessionTitle,
link:sessionLink,
material:sessionMaterial,
module:sessionModule,
locked:false

});

alert("Sesión creada");

setSessionTitle("");
setSessionLink("");
setSessionMaterial("");

};


/* UI */

return(

<main style={{
minHeight:"100vh",
background:"#111",
color:"white",
padding:"40px",
fontFamily:"Arial"
}}>

<h1>Gestión de contenido</h1>

{/* CREATE MODULE */}

<h2 style={{marginTop:"40px"}}>Crear módulo</h2>

<input
placeholder="Título del módulo"
value={moduleTitle}
onChange={(e)=>setModuleTitle(e.target.value)}
style={input}
/>

<input
placeholder="Orden del módulo"
value={moduleOrder}
onChange={(e)=>setModuleOrder(e.target.value)}
style={input}
/>

<input
placeholder="Link del Google Form"
value={formLink}
onChange={(e)=>setFormLink(e.target.value)}
style={input}
/>

<button
onClick={createModule}
style={btn}
>

Crear módulo

</button>


{/* CREATE SESSION */}

<h2 style={{marginTop:"60px"}}>Crear sesión</h2>

<input
placeholder="Título de la sesión"
value={sessionTitle}
onChange={(e)=>setSessionTitle(e.target.value)}
style={input}
/>

<input
placeholder="Link de reunión"
value={sessionLink}
onChange={(e)=>setSessionLink(e.target.value)}
style={input}
/>

<input
placeholder="Material adicional"
value={sessionMaterial}
onChange={(e)=>setSessionMaterial(e.target.value)}
style={input}
/>


{/* MODULE DROPDOWN */}

<select
value={sessionModule}
onChange={(e)=>setSessionModule(e.target.value)}
style={input}
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
style={btn}
>

Crear sesión

</button>

</main>

);

}

const input = {

display:"block",
marginTop:"10px",
padding:"10px",
width:"400px",
background:"#222",
border:"1px solid #444",
color:"white"

};

const btn = {

marginTop:"15px",
padding:"10px 20px",
background:"#2E7D32",
border:"none",
color:"white",
cursor:"pointer"

};