import Link from "next/link";

const curriculum = [
  { n: "01", title: "Habilidades del extensionista rural" },
  { n: "02", title: "Fundamentos del proyecto y carbono" },
  { n: "03", title: "Ciencia y tecnología del biochar" },
  { n: "04", title: "Bases agronómicas del suelo" },
  { n: "05", title: "Beneficios agronómicos del biochar" },
  { n: "06", title: "Disciplina operativa y dMRV" },
];

export default function Home() {
  return (
    <div className="page-wrap" style={{ background: "var(--bg-deep)" }}>

      {/* NAV */}
      <nav className="topnav">
        <span className="nav-logo">Coffee <span>Biochar</span></span>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/login">
            <button className="btn btn-ghost btn-sm">Iniciar sesión</button>
          </Link>
          <Link href="/register">
            <button className="btn btn-primary btn-sm">Registrarse</button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          position: "relative",
          textAlign: "center",
          overflow: "hidden",
          padding: "100px 20px 96px",
        }}
      >
        <div className="hero-glow" />

        <p className="eyebrow fade-up" style={{ marginBottom: "20px" }}>
          Programa de formación · Colombia
        </p>

        <h1
          className="display fade-up-1"
          style={{ maxWidth: "680px", margin: "0 auto" }}
        >
          Coffee Biochar<br />
          <span style={{ color: "var(--green-accent)" }}>Academy</span>
        </h1>

        <p
          className="body-lg fade-up-2"
          style={{ maxWidth: "500px", margin: "24px auto 0" }}
        >
          Formación certificada para extensionistas del proyecto Coffee Biochar
          en Colombia. Transforma el campo con ciencia y sostenibilidad.
        </p>

        <div
          className="fade-up-3"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginTop: "40px",
            flexWrap: "wrap",
          }}
        >
          <Link href="/login">
            <button className="btn btn-primary" style={{ minWidth: "160px" }}>
              Iniciar sesión
            </button>
          </Link>
          <Link href="/register">
            <button className="btn btn-outline" style={{ minWidth: "160px" }}>
              Crear cuenta
            </button>
          </Link>
        </div>
      </section>

      {/* STATS */}
      <div style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              background: "var(--border)",
              gap: "1px",
            }}
          >
            {[
              { n: "16", l: "Semanas" },
              { n: "34", l: "Horas de formación" },
              { n: "6",  l: "Módulos" },
            ].map(({ n, l }) => (
              <div
                key={l}
                className="stat-block"
                style={{ background: "var(--bg-deep)", padding: "56px 20px" }}
              >
                <div className="stat-num">{n}</div>
                <div className="stat-lbl">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CURRICULUM */}
      <section style={{ padding: "80px 0" }}>
        <div className="container-md">
          <div className="section-title">
            <p className="eyebrow" style={{ marginBottom: "14px" }}>Curriculum</p>
            <h2 className="heading-1">Programa de formación</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {curriculum.map((m, i) => (
              <div
                key={m.n}
                className="card card-hover"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "18px 20px",
                  animationDelay: `${i * 0.07}s`,
                }}
              >
                <div className="mod-num">{m.n}</div>
                <span style={{ fontSize: "15px", color: "var(--text-secondary)", fontWeight: 400 }}>
                  {m.title}
                </span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "48px" }}>
            <Link href="/register">
              <button className="btn btn-primary" style={{ minWidth: "200px" }}>
                Comenzar ahora
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "28px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <span className="nav-logo">Coffee <span>Biochar</span></span>
        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Biodiversal · {new Date().getFullYear()}
        </span>
      </footer>

    </div>
  );
}
