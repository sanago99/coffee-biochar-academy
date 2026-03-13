"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../firebase/config";

import {
collection,
getDocs,
addDoc,
doc,
getDoc
} from "firebase/firestore";

import {
signOut,
onAuthStateChanged
} from "firebase/auth";

import { useRouter } from "next/navigation";

import jsPDF from "jspdf";
import QRCode from "qrcode";

export default function Dashboard(){

const router = useRouter();

const [modules,setModules] = useState<any[]>([]);
const [sessions,setSessions] = useState<any[]>([]);
const [completed,setCompleted] = useState<string[]>([]);

const [studentName,setStudentName] = useState("");
const [completedCount,setCompletedCount] = useState(0);

const [openModule,setOpenModule] =
useState<string | null>(null);

useEffect(()=>{

const loadUser = async (uid:string)=>{

const userDoc =
await getDoc(doc(db,"users",uid));

if(userDoc.exists()){

const data:any = userDoc.data();

setStudentName(data.name);

}

};

const loadData = async (uid:string)=>{

const modulesSnap =
await getDocs(collection(db,"modules"));

const sessionsSnap =
await getDocs(collection(db,"sessions"));

const progressSnap =
await getDocs(collection(db,"progress"));

const modulesList:any[]=[];
const sessionsList:any[]=[];
const progressList:any[]=[];

modulesSnap.forEach(doc=>{
modulesList.push({
id:doc.id,
...doc.data()
});
});

sessionsSnap.forEach(doc=>{
sessionsList.push({
id:doc.id,
...doc.data()
});
});

progressSnap.forEach(doc=>{
progressList.push(doc.data());
});

setModules(modulesList);
setSessions(sessionsList);

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

await loadUser(user.uid);
await loadData(user.uid);

});

return () => unsubscribe();

},[]);

const logout = async ()=>{

await signOut(auth);

router.push("/login");

};

const completeSession = async (sessionId:string)=>{

if(completed.includes(sessionId)){

alert("Esta sesión ya fue completada");
return;

}

await addDoc(collection(db,"progress"),{

userId:auth.currentUser?.uid,
sessionId:sessionId,
completed:true,
completedAt:new Date()

});

setCompleted([...completed,sessionId]);

setCompletedCount(completedCount+1);

alert("Sesión completada");

};

const totalSessions = sessions.length;

const progress =
totalSessions
? Math.round((completedCount/totalSessions)*100)
:0;

const generateCertificate = async ()=>{

const uid = auth.currentUser?.uid;

if(!studentName){
alert("Nombre no cargado");
return;
}

const certSnap =
await getDocs(collection(db,"certificates"));

let certificateId = "";

const existing =
certSnap.docs.find(
doc => doc.data().userId === uid
);

if(existing){

certificateId =
existing.data().certificateId;

}else{

certificateId =
"CBA-" + Date.now();

await addDoc(collection(db,"certificates"),{

certificateId,
name:studentName,
userId:uid,
date:new Date().toISOString()

});

}

const verificationUrl =
"https://coffeebiochar.academy/certificate/"
+certificateId;

const qr =
await QRCode.toDataURL(verificationUrl);

const pdf = new jsPDF("landscape");

pdf.setFontSize(28);

pdf.text(
"Coffee Biochar Academy",
148,
60,
{align:"center"}
);

pdf.setFontSize(18);

pdf.text(
"CERTIFICATE OF COMPLETION",
148,
80,
{align:"center"}
);

pdf.setFontSize(26);

pdf.text(
studentName,
148,
110,
{align:"center"}
);

pdf.setFontSize(16);

pdf.text(
"Certified Coffee Biochar Extensionist",
148,
130,
{align:"center"}
);

pdf.setFontSize(12);

pdf.text(
"Certificate ID: "+certificateId,
148,
150,
{align:"center"}
);

pdf.addImage(qr,"PNG",230,140,40,40);

pdf.save("coffee-biochar-certificate.pdf");

};

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

<h2>

Bienvenido {studentName}

</h2>

<p>

Progreso del curso: {progress}%

</p>

<p>

Sesiones completadas:
{completedCount} / {sessions.length}

</p>

<h2 style={{marginTop:"40px"}}>

Módulos

</h2>

{modules.map((module)=>{

const moduleSessions =
sessions.filter(
s=>s.module===module.id
);

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
onClick={()=>
setOpenModule(
isOpen ? null : module.id
)
}
style={{cursor:"pointer"}}
>

<h3>{module.title}</h3>

<p style={{color:"#888"}}>
{moduleSessions.length} sesiones
</p>

</div>

{isOpen &&(

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

<p>

<b>{session.title}</b>

</p>

{session.locked ?(

<p style={{color:"#777"}}>

Sesión bloqueada

</p>

):(

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

{completed.includes(session.id) ? (

<span style={{
marginLeft:"10px",
color:"#2E7D32",
fontWeight:"bold"
}}>

✓ Completada

</span>

) : (

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

)}

</div>

))}

</div>

)}

</div>

);

})}

{progress===100 &&(

<button
onClick={generateCertificate}
style={{
marginTop:"30px",
padding:"12px 24px",
background:"#2E7D32",
border:"none",
color:"white",
cursor:"pointer"
}}
>

Descargar certificado

</button>

)}

</main>

);

}