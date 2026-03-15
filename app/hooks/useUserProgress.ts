"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import type { Evaluation } from "../types";

export function useUserProgress(userId: string | null) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetch = async () => {
      setLoading(true);
      const [progressSnap, evalSnap] = await Promise.all([
        getDocs(query(collection(db, "progress"), where("userId", "==", userId))),
        getDocs(query(collection(db, "evaluations"), where("userId", "==", userId))),
      ]);

      setCompleted(progressSnap.docs.map(doc => doc.data().sessionId as string));
      setEvaluations(evalSnap.docs.map(doc => doc.data() as Evaluation));
      setLoading(false);
    };

    fetch();
  }, [userId]);

  return { completed, setCompleted, evaluations, loading };
}
