"use client";

import { useState } from "react";
import { db } from "../../../firebase/config";
import { addDoc, collection } from "firebase/firestore";

export default function Content(){

const [moduleTitle,setModuleTitle] = useState("");
const [moduleOrder,setModuleOrder] = useState("");
const [formLink,setFormLink] = useState("");

const [sessionTitle,setSessionTitle] = useState("");
const [sessionLink,setSessionLink] = useState("");
const [sessionMaterial,setSessionMaterial] = useState("");
const [sessionModule,setSessionModule] = useState("");

/* CREAR MODULO */

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

setModuleTitle("");
setModuleOrder("");
setFormLink("");

};

/* CREAR SESION */

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
setSessionModule("");

};

return(

<main style={{
minHeight:"100vh",
background:"#111",
color:"white",
padding:"40px",
fontFamily:"Arial"
}}>

<h1>Gestión de contenido</h1>

{/* CREAR MODULO */}

<h2 style={{marginTop:"40px"}}>Crear módulo</h2>

<input
placeholder="Título del módulo"
value={moduleTitle}
onChange={(e)=>setModuleTitle(e.target.value)}
style={input}
/>

<input
placeholder="Orden del módulo (1,2,3...)"
value={moduleOrder}
onChange={(e)=>setModuleOrder(e.target.value)}
style={input}
/>

<input
placeholder="Link del Google Form (evaluación)"
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

{/* CREAR SESION */}

<h2 style={{marginTop:"60px"}}>Crear sesión</h2>

<input
placeholder="Título de la sesión"
value={sessionTitle}
onChange={(e)=>setSessionTitle(e.target.value)}
style={input}
/>

<input
placeholder="Link de reunión (Teams/Zoom)"
value={sessionLink}
onChange={(e)=>setSessionLink(e.target.value)}
style={input}
/>

<input
placeholder="Material adicional (Drive)"
value={sessionMaterial}
onChange={(e)=>setSessionMaterial(e.target.value)}
style={input}
/>

<input
placeholder="ID del módulo (ej: M1)"
value={sessionModule}
onChange={(e)=>setSessionModule(e.target.value)}
style={input}
/>

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