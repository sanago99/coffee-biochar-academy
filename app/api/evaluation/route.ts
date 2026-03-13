import { NextResponse } from "next/server";
import { db } from "../../../firebase/config";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";

export async function POST(req: Request) {

  const data = await req.json();

  const email = data.email;
  const moduleOrder = data.moduleOrder;
  const score = data.score;
  const passed = data.passed;

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

  const evaluationId = uid + "_" + moduleOrder;

  await setDoc(doc(db,"evaluations",evaluationId),{

    userId: uid,
    moduleOrder: moduleOrder,
    score: score,
    passed: passed,
    createdAt: new Date()

  });

  return NextResponse.json({
    success:true
  });

}