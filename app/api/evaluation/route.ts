import { NextResponse } from "next/server";
import { db } from "../../../firebase/config";

import {
collection,
query,
where,
getDocs,
doc,
updateDoc
} from "firebase/firestore";

export async function POST(req: Request){

try{

const data = await req.json();

const email = data.email;
const moduleOrder = data.moduleOrder;
const score = data.score;

/* buscar usuario */

const usersRef = collection(db,"users");

const q = query(usersRef, where("email","==",email));

const snap = await getDocs(q);

if(snap.empty){

return NextResponse.json({
error:"user not found"
});

}

const userDoc = snap.docs[0];

const uid = userDoc.id;

/* guardar score en usuario */

const field = `moduleScores.${moduleOrder}`;

await updateDoc(doc(db,"users",uid),{

[field]: score

});

return NextResponse.json({
success:true
});

}catch(error){

return NextResponse.json({
error:"evaluation error"
});

}

}