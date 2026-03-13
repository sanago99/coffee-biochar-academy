"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/config";

import {
collection,
getDocs,
query,
where,
doc,
getDoc
} from "firebase/firestore";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Dashboard(){

const router = useRouter();

const [modules,setModules] = useState<any[]>([]);
const [sessions,setSessions] = useState<any[]>([]);
const [completed,setCompleted] = useState<string[]>([]);
const [evaluations,setEvaluations] = useState<any[]>([]);
const [userData,setUserData] = useState<any>(null);

const [progress,setProgress] = useState(0);
const [approvedModules,setApprovedModules] = useState(0);

useEffect(()=>{

const unsubscribe =
onAuthStateChanged(auth, async(user)=>{

if(!user){

router.push("/login");
return;

}

/* USER DATA */

const q = query(
collection(db,"users"),
where("email","==",user.email)
);

const snap = await getDocs(q);

if(!snap.empty){

const data = snap.docs[0].data();
setUserData(data);

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

modulesList.sort(
(a,b)=>a.order-b.order
);

setModules(modulesList);

/* SESSIONS */

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

/* PROGRESS */

const progressQ = query(
collection(db,"progress"),
where("userId","==",user.uid)
);

const progressSnap =
await getDocs(progressQ);

const completedSessions:string[]=[];

progressSnap.forEach(doc=>{
completedSessions.push(doc.data().sessionId);
});

setCompleted(completedSessions);

/* EVALUATIONS */

const evalQ = query(
collection(db,"evaluations"),
where("userId","==",user.uid)
);

const evalSnap =
await getDocs(evalQ);

const evalList:any[]=[];

evalSnap.forEach(doc=>{
evalList.push(doc.data());
});

setEvaluations(evalList);

/* PROGRESS CALCULATION */

const totalSessions = sessionsList.length;
const completedCount = completedSessions.length;

if(totalSessions>0){

setProgress(
Math.round((completedCount/totalSessions)*100)
);

}

});

return()=>unsubscribe();

},[]);

/* APPROVED MODULES */

useEffect(()=>{

let approved = 0;

modules.forEach(module=>{

const evaluation = evaluations.find(
e=>e.moduleId === module.id && e.passed
);

if(evaluation){

approved++;

}

});

setApprovedModules(approved);

},[modules,evaluations]);

/* LOGOUT */

const logout = async()=>{

await signOut(auth);
router.push("/login");

};

/* STATUS */

const getModuleStatus = (module:any)=>{

const evaluation = evaluations.find(
e=>e.moduleId === module.id
);

if(evaluation && evaluation.passed){

return "approved";

}

const index = modules.findIndex(m=>m.id===module.id);

if(index===0){

return "available";

}

const prevModule = modules[index-1];

const prevEvaluation = evaluations.find(
e=>e.moduleId === prevModule.id && e.passed
);

if(prevEvaluation){

return "available";

}

return "locked";

};

return(

<div
style={{
background:"#111",
minHeight:"100vh",
color:"white",
padding:"30px"
}}
>

<div style={{display:"flex",justifyContent:"space-between"}}>

<div>

<h2>Coffee Biochar Academy</h2>

{userData && (
<p>Bienvenido {userData.name}</p>
)}

</div>

<button
onClick={logout}
style={{
background:"#444",
color:"white",
border:"none",
padding:"10px 15px",
borderRadius:"5px"
}}
>
Cerrar sesión
</button>

</div>

{/* PROGRESS BAR */}

<div style={{marginTop:"20px"}}>

<p>Progreso del curso</p>

<div
style={{
width:"100%",
height:"10px",
background:"#333",
borderRadius:"5px",
overflow:"hidden"
}}
>

<div
style={{
width:`${progress}%`,
height:"100%",
background:
progress>80
? "#4CAF50"
: progress>40
? "#FFC107"
: "#FF9800",
transition:"width 0.5s"
}}
/>

</div>

<p style={{marginTop:"5px"}}>

{progress}% completado

</p>

</div>

{/* MODULES APPROVED */}

<p style={{marginTop:"10px"}}>

Módulos aprobados: {approvedModules} / {modules.length}

</p>

{/* COURSE TIMELINE */}

<div
style={{
marginTop:"20px",
display:"flex",
gap:"10px",
flexWrap:"wrap"
}}
>

{modules.map((module,index)=>{

const status = getModuleStatus(module);

return(

<div
key={module.id}
style={{
padding:"6px 12px",
borderRadius:"20px",
background:
status==="approved"
? "#4CAF50"
: status==="available"
? "#FFC107"
: "#555"
}}
>

{status==="approved" && "✔"}
{status==="available" && "●"}
{status==="locked" && "🔒"}

{" "}
M{index+1}

</div>

);

})}

</div>

{/* MODULES */}

<h3 style={{marginTop:"30px"}}>

Módulos

</h3>

{modules.map(module=>{

const moduleSessions =
sessions.filter(
s=>s.moduleId===module.id
);

const status = getModuleStatus(module);

const evaluation =
evaluations.find(
e=>e.moduleId===module.id
);

return(

<div
key={module.id}
style={{
border:"1px solid #333",
borderRadius:"8px",
padding:"15px",
marginTop:"15px"
}}
>

<h4>{module.title}</h4>

{status==="approved" && (
<p style={{color:"#4CAF50"}}>
🟢 Aprobado — Score: {evaluation?.score}
</p>
)}

{status==="available" && (
<p style={{color:"#FFC107"}}>
🟡 Disponible
</p>
)}

{status==="locked" && (
<p style={{color:"#aaa"}}>
🔒 Completa el módulo anterior para desbloquear
</p>
)}

<p>{moduleSessions.length} sesiones</p>

</div>

);

})}

</div>

);

}