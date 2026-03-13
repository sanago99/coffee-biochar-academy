import Link from "next/link";

export default function AdminDashboard(){

  return(

    <main style={{
      minHeight:"100vh",
      background:"#111",
      color:"white",
      padding:"40px",
      fontFamily:"Arial"
    }}>

      <h1>Panel de Administración</h1>

      <p style={{color:"#aaa"}}>
        Coffee Biochar Academy
      </p>

      <div style={{
        marginTop:"40px",
        display:"flex",
        gap:"20px"
      }}>

        <Link href="/admin/content">
          <button style={{
            padding:"15px 25px",
            background:"#2E7D32",
            border:"none",
            color:"white",
            cursor:"pointer",
            borderRadius:"6px"
          }}>
            Gestionar módulos y sesiones
          </button>
        </Link>

        <Link href="/admin/users">
          <button style={{
            padding:"15px 25px",
            background:"#444",
            border:"none",
            color:"white",
            cursor:"pointer",
            borderRadius:"6px"
          }}>
            Ver extensionistas
          </button>
        </Link>

      </div>

    </main>

  );

}