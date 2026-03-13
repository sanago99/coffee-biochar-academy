"use client";

import { useState } from "react";
import { auth, db } from "../../firebase/config";

import {
signInWithEmailAndPassword
} from "firebase/auth";

import {
collection,
query,
where,
getDocs
} from "firebase/firestore";

import { useRouter } from "next/navigation";

export default function Login(){

const router = useRouter();

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const login = async ()=>{

try{

const userCredential =
await signInWithEmailAndPassword(
auth,
email,
password
);

const q = query(
collection(db,"users"),
where("email","==",email)
);

const snap = await getDocs(q);

if(snap.empty){

alert("Usuario no encontrado");
return;

}

const userData = snap.docs[0].data();

const role = userData.role;

/* REDIRECCION */

if(role === "admin"){

router.push("/admin");

}else{

router.push("/dashboard");

}

}catch(error){

alert("Error al iniciar sesión");

}

};

return(

<div
style={{
minHeight:"100vh",
display:"flex",
alignItems:"center",
justifyContent:"center",
background:"#111",
color:"white"
}}
>

<div style={{width:"300px"}}>

<h2>Login</h2>

<input
placeholder="Email"
value={email}
onChange={e=>setEmail(e.target.value)}
style={{width:"100%",marginTop:"10px"}}
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={e=>setPassword(e.target.value)}
style={{width:"100%",marginTop:"10px"}}
/>

<button
onClick={login}
style={{
marginTop:"20px",
width:"100%"
}}
>
Entrar
</button>

</div>

</div>

);

}