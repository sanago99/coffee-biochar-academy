"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import type { Module } from "../types";

export function useModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "modules"));
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Module));
    list.sort((a, b) => a.order - b.order);
    setModules(list);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  return { modules, loading, refresh: fetch };
}
