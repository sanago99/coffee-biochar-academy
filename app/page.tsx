import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#111",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial",
        textAlign: "center",
        padding: "40px",
      }}
    >
      <h1 style={{ fontSize: "40px", marginBottom: "10px" }}>
        Coffee Biochar Academy
      </h1>

      <p style={{ fontSize: "18px", color: "#bbb", marginBottom: "30px" }}>
        Formación de extensionistas del proyecto Coffee Biochar
      </p>

      <div
        style={{
          display: "flex",
          gap: "40px",
          marginBottom: "40px",
          color: "#ccc",
        }}
      >
        <div>
          <h2>16</h2>
          <p>Semanas</p>
        </div>

        <div>
          <h2>34</h2>
          <p>Sesiones en vivo</p>
        </div>

        <div>
          <h2>34 h</h2>
          <p>Horas de formación</p>
        </div>
      </div>

      <Link href="/login">
        <button
          style={{
            padding: "12px 24px",
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
    </main>
  );
}