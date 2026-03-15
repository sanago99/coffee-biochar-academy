"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import type { Session } from "../types";

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "sessions"));
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
    setSessions(list);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  return { sessions, loading, refresh: fetch };
}
