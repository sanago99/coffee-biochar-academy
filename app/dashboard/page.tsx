"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../firebase/config";

import {
collection,
getDocs,
addDoc,
query,
where
} from "firebase/firestore";

import {
signOut,
onAuthStateChanged
} from "firebase/auth";

import { useRouter } from "next/navigation";

export default function Dashboard(){

const router = useRouter();

const [modules,setModules] = useState<any[]>([]);
const [sessions,setSessions] = useState<any[]>([]);
const [completed,setCompleted] = useState<string[]>([]);

const [studentName,setStudentName] = useState("");
const [moduleScores,setModuleScores] = useState<any>({});

const [completedCount,setCompletedCount] = useState(0);

const [openModule,setOpenModule] =
useState<string | null>(null);

useEffect(()=>{

const loadUser = async (email:string)=>{

const q = query(
collection(db,"users"),
where("email","==",email)
);

const snap = await getDocs(q);

if(!snap.empty){

const data:any = snap.docs[0].data();

setStudentName(data.name);

setModuleScores(data.moduleScores || {});

}

};

const loadData = async (uid:string)=>{

/* módulos */

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

/* sesiones */

const sessionsSnap =
await getDocs(collection(db,"sessions"));

const sessionsList:any[]=[];

sessionsSnap.forEach(doc=>{
sessionsList.push({
id:doc.id,
...doc.data()
});
});

setSessions(sessionsList);

/* progreso */

const progressSnap =
await getDocs(collection(db,"progress"));

const progressList:any[]=[];

progressSnap.forEach(doc=>{
progressList.push(doc.data());
});

const completedSessions =
progressList.filter(p=>p.userId===uid);

setCompletedCount(completedSessions.length);

setCompleted(
completedSessions.map(p=>p.sessionId)
);

};

const unsubscribe =
onAuthStateChanged(auth, async (user)=>{

if(!user){

router.push("/login");
return;

}

await loadUser(user.email || "");

await loadData(user.uid);

});

return () => unsubscribe();

},[]);

const logout = async ()=>{

await signOut(auth);

router.push("/login");

};

const completeSession = async (sessionId:string)=>{

if(completed.includes(sessionId)) return;

await addDoc(collection(db,"progress"),{

userId:auth.currentUser?.uid,
sessionId:sessionId,
completed:true,
completedAt:new Date()

});

setCompleted([...completed,sessionId]);

setCompletedCount(completedCount+1);

};

const totalSessions = sessions.length;

const progress =
totalSessions
? Math.round((completedCount/totalSessions)*100)
:0;

return(

<main style={{
minHeight:"100vh",
background:"#111",
color:"white",
padding:"40px",
fontFamily:"Arial"
}}>

<button
onClick={logout}
style={{
position:"absolute",
right:"20px",
top:"20px",
padding:"8px 16px",
background:"#444",
border:"none",
color:"white",
cursor:"pointer",
borderRadius:"6px"
}}
>
Cerrar sesión
</button>

<h1>Coffee Biochar Academy</h1>

<h2>Bienvenido {studentName}</h2>

<p>Progreso del curso: {progress}%</p>

<p>
Sesiones completadas:
{completedCount} / {sessions.length}
</p>

<h2 style={{marginTop:"40px"}}>Módulos</h2>

{modules.map((module)=>{

const moduleSessions =
sessions.filter(
s=>s.module===module.id
);

/* desbloqueo */

let unlocked = false;

if(module.order === 1){

unlocked = true;

}else{

const previousScore =
Number(moduleScores[String(module.order - 1)] || 0);

unlocked = previousScore >= 60;

}

/* score actual */

const score =
Number(moduleScores[String(module.order)] || 0);

/* estado módulo */

let status = "locked";

if(score >= module.passingScore){

status = "approved";

}else if(module.order === 1){

status = "available";

}else if(unlocked){

status = "available";

}

const isOpen =
openModule===module.id;

return(

<div
key={module.id}
style={{
border:"1px solid #333",
borderRadius:"8px",
marginTop:"20px",
padding:"15px"
}}
>

<div
onClick={()=>setOpenModule(
isOpen ? null : module.id
)}
style={{cursor:"pointer"}}
>

<h3>{module.title}</h3>

{status==="approved" &&(

<p style={{color:"#4CAF50"}}>
🟢 Aprobado — Score: {score}
</p>

)}

{status==="available" &&(

<p style={{color:"#FFC107"}}>
🟡 Disponible
</p>

)}

{status==="locked" &&(

<p style={{color:"#777"}}>
🔒 Completa el módulo anterior para desbloquear
</p>

)}

<p style={{color:"#888"}}>
{moduleSessions.length} sesiones
</p>

</div>

{isOpen && unlocked &&(

<div style={{marginTop:"10px"}}>

{moduleSessions.map((session)=>(

<div
key={session.id}
style={{
border:"1px solid #444",
borderRadius:"6px",
padding:"10px",
marginTop:"10px"
}}
>

<p><b>{session.title}</b></p>

<div>

<a
href={session.link}
target="_blank"
style={{
padding:"6px 12px",
background:"#2E7D32",
color:"white",
textDecoration:"none",
borderRadius:"4px"
}}
>
Join Session
</a>

{session.material &&(

<a
href={session.material}
target="_blank"
style={{
marginLeft:"10px",
padding:"6px 12px",
background:"#1E88E5",
color:"white",
textDecoration:"none",
borderRadius:"4px"
}}
>
Material adicional
</a>

)}

{completed.includes(session.id)?(

<span
style={{
marginLeft:"10px",
color:"#2E7D32",
fontWeight:"bold"
}}
>
✓ Completada
</span>

):(

<button
onClick={()=>completeSession(session.id)}
style={{
marginLeft:"10px",
padding:"6px 12px",
background:"#555",
border:"none",
color:"white",
cursor:"pointer"
}}
>
Completar
</button>

)}

</div>

</div>

))}

{module.formLink && status!=="approved" &&(

<a
href={module.formLink}
target="_blank"
style={{
display:"inline-block",
marginTop:"15px",
padding:"10px 18px",
background:"#FF9800",
color:"white",
textDecoration:"none",
borderRadius:"6px"
}}
>
Tomar evaluación del módulo
</a>

)}

</div>

)}

</div>

);

})}

</main>

);

}