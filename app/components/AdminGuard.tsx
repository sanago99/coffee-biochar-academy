"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/config";

import {
doc,
getDoc,
query,
collection,
where,
getDocs
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AdminGuard({children}:any){

const router = useRouter();

const [allowed,setAllowed] = useState(false);
const [loading,setLoading] = useState(true);

useEffect(()=>{

const unsubscribe =
onAuthStateChanged(auth, async(user)=>{

if(!user){

router.push("/login");
return;

}

const q = query(
collection(db,"users"),
where("email","==",user.email)
);

const snap = await getDocs(q);

if(snap.empty){

router.push("/dashboard");
return;

}

const data:any = snap.docs[0].data();

if(data.role !== "admin"){

router.push("/dashboard");
return;

}

setAllowed(true);
setLoading(false);

});

return ()=>unsubscribe();

},[]);

if(loading){

return(
<div style={{
background:"#111",
color:"white",
padding:"40px"
}}>
Verificando permisos...
</div>
);

}

if(!allowed){

return null;

}

return children;

}