import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        color: "white",
        fontFamily: "Arial",
      }}
    >
      {/* HERO */}

      <section
        style={{
          textAlign: "center",
          padding: "120px 20px",
        }}
      >
        <h1 style={{ fontSize: "48px", marginBottom: "10px" }}>
          Coffee Biochar Academy
        </h1>

        <p style={{ fontSize: "20px", color: "#bbb", marginBottom: "40px" }}>
          Formación de extensionistas del proyecto Coffee Biochar
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
          
          <Link href="/login">
            <button
              style={{
                padding: "14px 28px",
                fontSize: "16px",
                background: "#2E7D32",
                border: "none",
                borderRadius: "6px",
                color: "white",
                cursor: "pointer",
              }}
            >
              Iniciar sesión
            </button>
          </Link>

          <Link href="/register">
            <button
              style={{
                padding: "14px 28px",
                fontSize: "16px",
                background: "#444",
                border: "none",
                borderRadius: "6px",
                color: "white",
                cursor: "pointer",
              }}
            >
              Registrarse
            </button>
          </Link>

        </div>
      </section>

      {/* STATS */}

      <section
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "80px",
          padding: "60px 20px",
          borderTop: "1px solid #222",
          borderBottom: "1px solid #222",
        }}
      >
        <div>
          <h2 style={{ fontSize: "32px" }}>16</h2>
          <p style={{ color: "#aaa" }}>Semanas</p>
        </div>

        <div>
          <h2 style={{ fontSize: "32px" }}>34</h2>
          <p style={{ color: "#aaa" }}>Horas de formación</p>
        </div>

        <div>
          <h2 style={{ fontSize: "32px" }}>6</h2>
          <p style={{ color: "#aaa" }}>Módulos</p>
        </div>
      </section>

      {/* PROGRAM */}

      <section
        style={{
          padding: "80px 20px",
          maxWidth: "900px",
          margin: "auto",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "40px" }}>
          Programa de formación
        </h2>

        <ul style={{ lineHeight: "2", color: "#ccc" }}>
          <li>M1 — Habilidades del extensionista rural</li>
          <li>M2 — Fundamentos del proyecto y carbono</li>
          <li>M3 — Ciencia y tecnología del biochar</li>
          <li>M4 — Bases agronómicas del suelo</li>
          <li>M5 — Beneficios agronómicos del biochar</li>
          <li>M6 — Disciplina operativa y dMRV</li>
        </ul>
      </section>

      {/* FOOTER */}

      <footer
        style={{
          textAlign: "center",
          padding: "40px",
          borderTop: "1px solid #222",
          color: "#777",
        }}
      >
        Coffee Biochar Academy — Biodiversal
      </footer>
    </main>
  );
}