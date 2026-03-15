import Link from "next/link";

const curriculum = [
  { n: "01", title: "Habilidades del extensionista rural",     desc: "Comunicación, liderazgo y trabajo comunitario en el campo." },
  { n: "02", title: "Fundamentos del proyecto y carbono",      desc: "Créditos de carbono, mercados voluntarios y el rol del biochar." },
  { n: "03", title: "Ciencia y tecnología del biochar",        desc: "Pirólisis, tipos de biomasa y control del proceso de producción." },
  { n: "04", title: "Bases agronómicas del suelo",             desc: "Estructura del suelo, microbioma y nutrición de cultivos." },
  { n: "05", title: "Beneficios agronómicos del biochar",      desc: "Retención de agua, fertilidad y aplicación práctica." },
  { n: "06", title: "Disciplina operativa y dMRV",             desc: "Registro digital, monitoreo y reporte de impacto." },
];

export default function Home() {
  return (
    <div className="page-wrap" style={{ background: "var(--bg-deep)" }}>

      {/* ── NAV ──────────────────────────────────────── */}
      <nav className="topnav">
        <div className="nav-logo">
          <img src="/logo.png" alt="Coffee Biochar" style={{ height: "40px", width: "auto" }} />
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link href="/login">
            <button className="btn btn-ghost btn-sm">Iniciar sesión</button>
          </Link>
          <Link href="/register">
            <button className="btn btn-primary btn-sm">Registrarse</button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────── */}
      <div className="hero-photo" style={{ minHeight: "100vh" }}>
        <img
          src="/fotos/hero.jpg"
          alt="Extensionista trabajando en producción de biochar"
          className="hero-photo-img"
        />
        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="container">

            {/* Logo grande */}
            <div className="fade-up" style={{ marginBottom: "32px" }}>
              <img
                src="/logo.png"
                alt="Coffee Biochar — A Carbon Removal Program"
                style={{ height: "130px", width: "auto", filter: "drop-shadow(0 4px 24px rgba(245,166,35,0.3))" }}
              />
            </div>

            <p className="eyebrow fade-up-1" style={{ marginBottom: "16px" }}>
              Plataforma de formación · Colombia
            </p>

            <h1 className="display fade-up-2" style={{ maxWidth: "680px", marginBottom: "20px" }}>
              Academy
            </h1>

            <p
              className="body-lg fade-up-3"
              style={{ maxWidth: "520px", marginBottom: "40px" }}
            >
              Formación certificada para extensionistas rurales del proyecto
              Coffee Biochar. Transforma el campo colombiano con ciencia
              y agricultura regenerativa.
            </p>

            <div className="fade-up-4" style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <Link href="/login">
                <button className="btn btn-primary" style={{ minWidth: "170px" }}>
                  Iniciar sesión
                </button>
              </Link>
              <Link href="/register">
                <button className="btn btn-outline" style={{ minWidth: "170px" }}>
                  Crear cuenta
                </button>
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* ── STATS ────────────────────────────────────── */}
      <div style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
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
              { n: "16", l: "Semanas de programa" },
              { n: "34", l: "Horas de formación" },
              { n: "6",  l: "Módulos certificados" },
            ].map(({ n, l }) => (
              <div
                key={l}
                style={{
                  background: "var(--bg-card)",
                  textAlign: "center",
                  padding: "56px 20px",
                }}
              >
                <div className="stat-num">{n}</div>
                <div className="stat-lbl" style={{ marginTop: "10px" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ABOUT ────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <style>{`@media(max-width:768px){ .about-grid { grid-template-columns:1fr !important; gap:32px !important; } }`}</style>
          <div
            className="about-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "64px",
              alignItems: "center",
            }}
          >
            {/* Text */}
            <div>
              <div className="amber-line" />
              <p className="eyebrow" style={{ marginBottom: "12px" }}>El proyecto</p>
              <h2 className="heading-1" style={{ marginBottom: "20px" }}>
                ¿Qué es<br />Coffee Biochar?
              </h2>
              <p className="body-lg" style={{ marginBottom: "16px" }}>
                Coffee Biochar es un programa de remoción de carbono que transforma
                residuos de biomasa de fincas cafeteras en biochar — un carbón vegetal
                estable que mejora el suelo y captura CO₂ por siglos.
              </p>
              <p className="body-lg" style={{ marginBottom: "32px" }}>
                Los extensionistas son el corazón del proyecto. Esta academia los
                forma para producir, aplicar y registrar el biochar con precisión técnica
                y científica en campo.
              </p>
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                <div>
                  <p style={{ fontSize: "28px", fontFamily: "'Playfair Display',serif", fontWeight: 700, color: "var(--amber)" }}>CO₂</p>
                  <p className="caption">Remoción verificada</p>
                </div>
                <div>
                  <p style={{ fontSize: "28px", fontFamily: "'Playfair Display',serif", fontWeight: 700, color: "var(--green)" }}>dMRV</p>
                  <p className="caption">Monitoreo digital</p>
                </div>
              </div>
            </div>

            {/* Photo */}
            <div
              style={{
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                aspectRatio: "4/5",
                position: "relative",
              }}
            >
              <img
                src="/fotos/biochar.jpg"
                alt="Extensionistas trabajando con biochar"
                style={{
                  width: "100%", height: "100%",
                  objectFit: "cover", objectPosition: "center",
                  filter: "saturate(0.9)",
                }}
              />
              <div
                style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: "40%",
                  background: "linear-gradient(transparent, rgba(12,10,7,0.7))",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── PHOTOS GRID ──────────────────────────────── */}
      <section style={{ padding: "0 0 88px" }}>
        <div className="container">
          <div className="photo-grid-responsive" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "12px" }}>
            <style>{`@media(max-width:768px){ .photo-grid-responsive { grid-template-columns:1fr 1fr !important; } .photo-grid-responsive .span-col { grid-row:auto !important; } }`}</style>
            <div className="photo-card" style={{ aspectRatio: "16/10", gridRow: "span 2" }}>
              <img src="/fotos/training.jpg" alt="Sesión de formación en campo" />
              <div className="photo-card-label">Formación en campo</div>
            </div>
            <div className="photo-card" style={{ aspectRatio: "1/1" }}>
              <img src="/fotos/coffee-flower.jpg" alt="Flor de café" />
              <div className="photo-card-label">Café colombiano</div>
            </div>
            <div className="photo-card" style={{ aspectRatio: "1/1" }}>
              <img src="/fotos/kiln.jpg" alt="Horno de biochar" />
              <div className="photo-card-label">Producción de biochar</div>
            </div>
            <div className="photo-card" style={{ aspectRatio: "1/1" }}>
              <img src="/fotos/phone.jpg" alt="Extensionista usando la app" />
              <div className="photo-card-label">Registro digital</div>
            </div>
            <div className="photo-card" style={{ aspectRatio: "1/1" }}>
              <img src="/fotos/session.jpg" alt="Sesión de extensionistas" />
              <div className="photo-card-label">Trabajo comunitario</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CURRICULUM ───────────────────────────────── */}
      <section className="section" style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container-md">
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <div className="amber-line" style={{ margin: "0 auto 16px" }} />
            <p className="eyebrow" style={{ marginBottom: "12px" }}>Curriculum</p>
            <h2 className="heading-1">Programa de formación</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {curriculum.map((m, i) => (
              <div
                key={m.n}
                className="card card-hover"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "18px",
                  padding: "20px 22px",
                  animationDelay: `${i * 0.07}s`,
                }}
              >
                <div className="mod-num" style={{ marginTop: "2px" }}>{m.n}</div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "15px", marginBottom: "4px", color: "var(--text-primary)" }}>
                    {m.title}
                  </p>
                  <p className="body-sm">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "48px" }}>
            <Link href="/register">
              <button className="btn btn-primary" style={{ minWidth: "220px" }}>
                Comenzar formación
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY PHOTO ──────────────────────────── */}
      <div className="full-photo">
        <img src="/fotos/community.jpg" alt="Comunidad Coffee Biochar" />
        <div className="full-photo-overlay">
          <div style={{ textAlign: "center", padding: "0 24px" }}>
            <p className="eyebrow" style={{ marginBottom: "16px" }}>Nuestra comunidad</p>
            <h2 className="heading-1" style={{ maxWidth: "560px" }}>
              Más de 50 extensionistas<br />transformando el campo
            </h2>
            <p className="body-lg" style={{ marginTop: "16px", maxWidth: "440px", margin: "16px auto 0" }}>
              Campesinos cafeteros de diferentes municipios de Colombia
              certificados como extensionistas de carbono.
            </p>
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ────────────────────────────────── */}
      <section className="section">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="amber-line" style={{ margin: "0 auto 20px" }} />
          <h2 className="heading-1" style={{ maxWidth: "480px", margin: "0 auto 20px" }}>
            ¿Listo para comenzar tu formación?
          </h2>
          <p className="body-lg" style={{ maxWidth: "400px", margin: "0 auto 36px" }}>
            Accede al programa, completa los módulos y obtén tu certificado
            como extensionista Coffee Biochar.
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register">
              <button className="btn btn-primary" style={{ minWidth: "180px" }}>Crear cuenta</button>
            </Link>
            <Link href="/login">
              <button className="btn btn-outline" style={{ minWidth: "180px" }}>Iniciar sesión</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "36px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          background: "var(--bg-deep)",
        }}
      >
        <img src="/logo.png" alt="Coffee Biochar" style={{ height: "44px", width: "auto" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <img
            src="/brand/biodiversal.png"
            alt="Biodiversal"
            style={{ height: "32px", width: "auto", filter: "brightness(0) invert(1)", opacity: 0.45 }}
          />
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Agricultura Regenerativa · Colombia · {new Date().getFullYear()}
          </span>
        </div>
      </footer>

    </div>
  );
}
