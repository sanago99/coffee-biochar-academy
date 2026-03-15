"use client";

import { usePathname, useRouter } from "next/navigation";
import { auth } from "../../firebase/config";
import { signOut } from "firebase/auth";

const links = [
  { href: "/admin",             label: "Inicio"    },
  { href: "/admin/content",     label: "Contenido" },
  { href: "/admin/users",       label: "Usuarios"  },
  { href: "/admin/create-user", label: "Crear"     },
  { href: "/admin/progress",    label: "Progreso"  },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router   = useRouter();

  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <nav className="topnav">
      <div className="nav-logo">
        <img src="/logo.png" alt="Coffee Biochar" style={{ height: "36px", width: "auto" }} />
      </div>

      <div className="nav-links">
        {links.map(l => (
          <a
            key={l.href}
            href={l.href}
            className={`nav-link${pathname === l.href ? " nav-link-active" : ""}`}
          >
            {l.label}
          </a>
        ))}
      </div>

      <button onClick={logout} className="btn btn-ghost btn-sm">
        Salir
      </button>
    </nav>
  );
}
