"use client";

import AdminGuard from "../components/AdminGuard";

import { useRouter } from "next/navigation";

export default function AdminDashboard(){

const router = useRouter();

return(

<AdminGuard>

<div
style={{
minHeight:"100vh",
background:"#111",
color:"white",
padding:"40px"
}}
>

<h1>Panel Administrador</h1>

<p style={{color:"#aaa"}}>
Coffee Biochar Academy
</p>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
gap:"20px",
marginTop:"40px"
}}
>

{/* CONTENT */}

<div
onClick={()=>router.push("/admin/content")}
style={{
background:"#1a1a1a",
padding:"30px",
borderRadius:"10px",
cursor:"pointer"
}}
>

<h2>📚 Contenido</h2>

<p style={{color:"#aaa"}}>
Crear módulos y sesiones
</p>

</div>

{/* USERS */}

<div
onClick={()=>router.push("/admin/users")}
style={{
background:"#1a1a1a",
padding:"30px",
borderRadius:"10px",
cursor:"pointer"
}}
>

<h2>👩‍🌾 Extensionistas</h2>

<p style={{color:"#aaa"}}>
Gestionar usuarios
</p>

</div>

{/* PROGRESS */}

<div
onClick={()=>router.push("/admin/progress")}
style={{
background:"#1a1a1a",
padding:"30px",
borderRadius:"10px",
cursor:"pointer"
}}
>

<h2>📊 Progreso</h2>

<p style={{color:"#aaa"}}>
Ver avance del programa
</p>

</div>

{/* CREATE USER */}

<div
onClick={()=>router.push("/admin/create-user")}
style={{
background:"#1a1a1a",
padding:"30px",
borderRadius:"10px",
cursor:"pointer"
}}
>

<h2>➕ Crear usuario</h2>

<p style={{color:"#aaa"}}>
Nuevo extensionista
</p>

</div>

</div>

</div>

</AdminGuard>

)

}