import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-deep)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      <div className="fade-up" style={{ textAlign: "center", maxWidth: "420px" }}>

        <img src="/logo.png" alt="Coffee Biochar" style={{ height: "56px", margin: "0 auto 32px" }} />

        {/* 404 number */}
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(72px, 15vw, 120px)",
          fontWeight: 700,
          lineHeight: 1,
          background: "linear-gradient(135deg, var(--amber-dark), var(--amber))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: "16px",
        }}>
          404
        </p>

        <h1 className="heading-3" style={{ marginBottom: "12px" }}>
          Página no encontrada
        </h1>
        <p className="body-sm" style={{ lineHeight: 1.7, marginBottom: "32px" }}>
          La página que buscas no existe o fue movida.
          Verifica la dirección o regresa al inicio.
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/dashboard">
            <button className="btn btn-primary" style={{ cursor: "pointer" }}>
              Ir al dashboard
            </button>
          </Link>
          <Link href="/login">
            <button className="btn btn-outline" style={{ cursor: "pointer" }}>
              Iniciar sesión
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
