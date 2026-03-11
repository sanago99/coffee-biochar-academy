export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#1A1A1A",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial"
    }}>

      <h1>Coffee Biochar Academy</h1>

      <p>
        Formación de extensionistas del proyecto Coffee Biochar
      </p>

      <div style={{display:"flex",gap:"40px",marginTop:"20px"}}>

        <div>
          <h2>16</h2>
          <p>Semanas</p>
        </div>

        <div>
          <h2>16</h2>
          <p>Sesiones en vivo</p>
        </div>

        <div>
          <h2>34</h2>
          <p>Horas de formación</p>
        </div>

      </div>

      <button style={{
        marginTop:"40px",
        padding:"10px 20px",
        background:"#2E7D32",
        color:"white",
        border:"none",
        borderRadius:"6px"
      }}>
        Iniciar sesión
      </button>

    </main>
  )
}