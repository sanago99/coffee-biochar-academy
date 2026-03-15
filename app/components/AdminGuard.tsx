"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router  = useRouter();
  const [ok,    setOk]      = useState(false);
  const [ready, setReady]   = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) { router.push("/login"); return; }

      const snap = await getDocs(
        query(collection(db, "users"), where("email", "==", user.email))
      );

      if (snap.empty || snap.docs[0].data().role !== "admin") {
        router.push("/dashboard");
        return;
      }

      setOk(true);
      setReady(true);
    });

    return () => unsub();
  }, []);

  if (!ready) {
    return (
      <div
        className="page-wrap flex-center"
        style={{ minHeight: "100vh" }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              border: "2px solid var(--border)",
              borderTop: "2px solid var(--green-accent)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p className="body-sm">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!ok) return null;

  return <>{children}</>;
}
