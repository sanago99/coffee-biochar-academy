export default function Session() {
  return (
    <main style={{
      minHeight:"100vh",
      background:"#1A1A1A",
      color:"white",
      padding:"40px",
      fontFamily:"Arial"
    }}>

      <h1>Coffee Biochar Academy</h1>

      <h2>Sesión 2.1</h2>

      <h3>Cambio climático y el rol del suelo</h3>

      <p><b>Fecha:</b> 10 mayo</p>

      <p><b>Duración:</b> 2 horas</p>

      <p><b>Instructor:</b> Equipo Biodiversal</p>

     <a
  href="https://meet.google.com/"
  target="_blank"
  style={{
    marginTop:"20px",
    padding:"12px 25px",
    background:"#2E7D32",
    borderRadius:"6px",
    color:"white",
    fontSize:"16px",
    textDecoration:"none",
    display:"inline-block"
  }}
>
Join Live Session
</a>

      <h3 style={{marginTop:"40px"}}>Material de la sesión</h3>

      <ul>

        <li>Lectura – Ciclo del carbono.pdf</li>

        <li>Guía técnica Coffee Biochar.pdf</li>

      </ul>

    </main>
  )
}