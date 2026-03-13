import { NextResponse } from "next/server";
import { db } from "../../../firebase/config";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";

export async function POST(req: Request) {

  try {

    const data = await req.json();

    const email = data.email;
    const moduleId = data.moduleId;
    const score = data.score;
    const passed = data.passed;

    /* buscar usuario */

    const usersRef = collection(db, "users");

    const q = query(usersRef, where("email", "==", email));

    const snap = await getDocs(q);

    if (snap.empty) {

      return NextResponse.json({
        error: "Usuario no encontrado"
      });

    }

    const userDoc = snap.docs[0];

    const uid = userDoc.id;

    /* guardar evaluación */

    const evaluationId = uid + "_" + moduleId;

    await setDoc(doc(db, "evaluations", evaluationId), {

      userId: uid,
      moduleId: moduleId,
      score: score,
      passed: passed,
      createdAt: new Date()

    });

    return NextResponse.json({
      success: true
    });

  } catch (error) {

    return NextResponse.json({
      error: "Error guardando evaluación"
    });

  }

}