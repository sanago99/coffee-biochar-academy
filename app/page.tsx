"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

const curriculum = [
  { n: "01", title: "Habilidades del extensionista rural", weeks: "Semanas 1–2 · 4 h · 2 sesiones", desc: "Comunicación efectiva, liderazgo en territorio y manejo de resistencia al cambio. Construye confianza con productores y la disciplina que el proyecto exige." },
  { n: "02", title: "Fundamentos del proyecto y carbono", weeks: "Semanas 3–5 · 6 h · 3 sesiones", desc: "Ciclo del carbono, mercados voluntarios y el estándar Global Artisan C-Sink. El por qué profundo antes de operar el Kon-Tiki." },
  { n: "03", title: "Ciencia y tecnología del biochar", weeks: "Semanas 6–8 · 6 h · 3 sesiones", desc: "Pirólisis, variables del proceso Kon-Tiki y caracterización del biochar. La fracción PAC, el ratio H/C y los 5 parámetros de calidad." },
  { n: "04", title: "Bases agronómicas del suelo", weeks: "Semanas 9–11 · 6 h · 3 sesiones", desc: "Física, química y biología del suelo cafetero. Lee un análisis de laboratorio y diagnostica en campo sin equipo." },
  { n: "05", title: "Beneficios agronómicos del biochar", weeks: "Semanas 12–14 · 6 h · 3 sesiones", desc: "+45% nutrientes disponibles, +15% retención de agua, +39% SOC. Defiende con autoridad técnica el impacto del biochar." },
  { n: "06", title: "Disciplina operativa y dMRV", weeks: "Semanas 15–16 · 6 h · 2 sesiones + simulacro", desc: "Flujo end-to-end, app Planboo y responsabilidad legal del dato. Un registro incorrecto compromete el crédito de todo el clúster." },
];

const impact = [
  { stat: "+45%", label: "Nutrientes disponibles en suelo cafetero", source: "Ca²⁺ · Mg²⁺ · K⁺ · NH₄⁺ — Glaser & Lehr, 2019", color: "var(--amber)", accent: "bento-cell-amber" },
  { stat: "+15%", label: "Retención de agua disponible para la planta", source: "AWC — Omondi et al., 2016 · meta-análisis global", color: "var(--green)", accent: "bento-cell-green" },
  { stat: "+39%", label: "Carbono orgánico del suelo (SOC)", source: "t½ = 556 años — Wang et al., 2016 (¹³C/¹⁴C)", color: "var(--amber)", accent: "bento-cell-amber" },
  { stat: "−29%", label: "Absorción de metales pesados en el grano", source: "Cd −38% · Pb −39% — Singh et al., 2023", color: "var(--green)", accent: "bento-cell-green" },
];

function Counter({ target, suffix, visible }: { target: number; suffix: string; visible: boolean }) {
  const [count, setCount] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (!visible || done.current) return;
    done.current = true;
    const duration = 1400;
    const startTime = performance.now();
    function step(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [visible, target]);
  return <span>{count}{suffix}</span>;
}

const IconArrowDown = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 3v12M4 11l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconLeaf = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M12 2C12 2 10 7.5 7.5 9.5C5 11.5 2 10.5 2 10.5C2 10.5 3 7 6 5C9 3 12 2 12 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    <path d="M2 10.5L5.5 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToContent = useCallback(() => {
    window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
  }, []);

  return (
    <div style={{ background: "var(--bg-deep)", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(20px,4vw,40px)",
        background: scrolled ? "rgba(12,10,7,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(22px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(22px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        transition: "background 0.35s ease, border-color 0.35s ease",
      }}>
        <img src="/logo.png" alt="Coffee Biochar Academy" style={{ height: 38, width: "auto" }} />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link href="/login">
            <button className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}>Iniciar sesión</button>
          </Link>
          <Link href="/register">
            <button className="btn btn-primary btn-sm" style={{ cursor: "pointer" }}>Registrarse</button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-v2">
        <img src="/fotos/hero/hero.jpg" alt="Extensionista trabajando en producción de biochar en campo colombiano" className="hero-v2-img" />
        <div className="hero-v2-overlay" />
        <div className="hero-v2-content">
          <div className="container">
            <div style={{ maxWidth: 680 }}>
              <div className="fade-up" style={{ marginBottom: 28 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(245,166,35,0.10)", border: "1px solid var(--amber-border)",
                  borderRadius: "var(--radius-pill)", padding: "7px 15px",
                }}>
                  <IconLeaf />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--amber)" }}>
                    Biodiversal × Cirkular Agro · Colombia
                  </span>
                </div>
              </div>

              <h1 className="hero-headline fade-up-1">
                Transformando<br />
                <span className="text-gradient-amber">la zoca en carbono.</span>
              </h1>

              <p className="hero-sub fade-up-2">
                Plataforma de formación certificada para extensionistas rurales
                del proyecto Coffee Biochar — Tolima y Huila.
              </p>

              <p className="fade-up-3" style={{ fontSize: 14, color: "var(--amber)", fontStyle: "italic", marginBottom: 40, opacity: 0.8 }}>
                "Transformando extensionistas en líderes de territorio"
              </p>

              <div className="fade-up-4" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Link href="/login">
                  <button className="btn btn-primary" style={{ minWidth: 180, cursor: "pointer" }}>Iniciar sesión</button>
                </Link>
                <Link href="/register">
                  <button className="btn btn-outline" style={{ minWidth: 180, cursor: "pointer" }}>Crear cuenta</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <button onClick={scrollToContent} className="scroll-indicator" style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }} aria-label="Scroll hacia abajo">
          <span>Scroll</span>
          <IconArrowDown />
        </button>
      </section>

      {/* STATS */}
      <div ref={statsRef} style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: "var(--border)", gap: 1 }}>
            <style>{`@media(max-width:640px){.stats-row{grid-template-columns:repeat(2,1fr)!important}}`}</style>
            {[
              { n: 16, s: "",  l: "Semanas de programa" },
              { n: 34, s: "h", l: "Formación sincrónica" },
              { n: 6,  s: "",  l: "Módulos certificados" },
              { n: 70, s: "",  l: "Puntos para aprobar" },
            ].map(({ n, s, l }) => (
              <div key={l} style={{ background: "var(--bg-card)", textAlign: "center", padding: "52px 20px" }}>
                <div className="stat-num" style={{ opacity: statsVisible ? 1 : 0, transition: "opacity 0.4s" }}>
                  <Counter target={n} suffix={s} visible={statsVisible} />
                </div>
                <div className="stat-lbl" style={{ marginTop: 10 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ABOUT */}
      <section className="section">
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>
            <style>{`@media(max-width:768px){.about-grid{grid-template-columns:1fr!important;gap:40px!important}}`}</style>
            <div className="fade-up">
              <div className="amber-line" />
              <p className="eyebrow" style={{ marginBottom: 14 }}>El proyecto</p>
              <h2 className="heading-1" style={{ marginBottom: 22 }}>¿Qué es<br />Coffee Biochar?</h2>
              <p className="body-lg" style={{ marginBottom: 16 }}>
                Coffee Biochar transforma la biomasa de la <strong style={{ color: "var(--text-primary)" }}>zoca del café</strong> en biochar mediante hornos de pirólisis Kon-Tiki. El biochar aplicado al suelo genera créditos verificados bajo el estándar <strong style={{ color: "var(--text-primary)" }}>Global Artisan C-Sink</strong>.
              </p>
              <p className="body-lg" style={{ marginBottom: 36 }}>
                Operado por <strong style={{ color: "var(--text-primary)" }}>Biodiversal SAS BIC</strong> en alianza con Cirkular Agro, el proyecto trabaja con productores cafeteros en Ataco (Tolima) y Huila. Los extensionistas son el corazón del modelo.
              </p>
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                {[
                  { v: "2.1 tCO₂e", l: "por tonelada de biochar" },
                  { v: "556 años", l: "residencia del C en suelo" },
                  { v: "dMRV", l: "Monitoreo digital Planboo" },
                ].map(({ v, l }) => (
                  <div key={l}>
                    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "var(--amber)", marginBottom: 4 }}>{v}</p>
                    <p className="caption">{l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", aspectRatio: "4/5", position: "relative" }}>
              <img src="/fotos/contenido/biochar.jpg" alt="Biochar producido en horno Kon-Tiki" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.9)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "45%", background: "linear-gradient(transparent, rgba(12,10,7,0.75))" }} />
              <div style={{
                position: "absolute", bottom: 20, left: 20,
                background: "rgba(12,10,7,0.82)", backdropFilter: "blur(12px)",
                border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                padding: "8px 14px", display: "flex", alignItems: "center", gap: 8,
              }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 8px var(--green)" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>Ataco · Tolima · Colombia</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="section-rule" />

      {/* IMPACT BENTO */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="amber-line" style={{ margin: "0 auto 16px" }} />
            <p className="eyebrow" style={{ marginBottom: 12 }}>Evidencia científica</p>
            <h2 className="heading-1">Lo que hace el biochar<br />en el suelo cafetero</h2>
          </div>
          <div className="bento-grid">
            {impact.map((item) => (
              <div key={item.stat} className={`bento-cell ${item.accent}`}>
                <p className="bento-stat" style={{ color: item.color }}>{item.stat}</p>
                <p className="bento-label">{item.label}</p>
                <p className="bento-source">{item.source}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 22, fontSize: 12, color: "var(--text-muted)" }}>
            Valores registrados en suelos cafeteros colombianos · Meta-análisis revisados por pares
          </p>
        </div>
      </section>

      {/* PHOTO MOSAIC */}
      <section style={{ padding: "0 0 88px" }}>
        <div className="container">
          <div className="mosaic">
            <div className="mosaic-cell mosaic-span" style={{ aspectRatio: "3/4", gridRow: "span 2" }}>
              <img src="/fotos/galeria/training.jpg" alt="Sesión de formación en campo — Tolima" />
              <div className="mosaic-label">Formación en campo · Tolima</div>
            </div>
            <div className="mosaic-cell" style={{ aspectRatio: "1/1" }}>
              <img src="/fotos/galeria/coffee-flower.jpg" alt="Flor de café colombiano" />
              <div className="mosaic-label">Café colombiano</div>
            </div>
            <div className="mosaic-cell" style={{ aspectRatio: "1/1" }}>
              <img src="/fotos/galeria/kiln.jpg" alt="Horno Kon-Tiki de biochar" />
              <div className="mosaic-label">Horno Kon-Tiki</div>
            </div>
            <div className="mosaic-cell" style={{ aspectRatio: "1/1" }}>
              <img src="/fotos/galeria/phone.jpg" alt="Extensionista con app Planboo" />
              <div className="mosaic-label">App Planboo · dMRV</div>
            </div>
            <div className="mosaic-cell" style={{ aspectRatio: "1/1" }}>
              <img src="/fotos/galeria/session.jpg" alt="Sesión sincrónica de extensionistas" />
              <div className="mosaic-label">Formación sincrónica</div>
            </div>
          </div>
        </div>
      </section>

      {/* CURRICULUM TIMELINE */}
      <section className="section" style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container-md">
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="amber-line" style={{ margin: "0 auto 16px" }} />
            <p className="eyebrow" style={{ marginBottom: 12 }}>Programa de formación</p>
            <h2 className="heading-1">16 semanas · 6 módulos · 34 horas</h2>
            <p className="body-lg" style={{ marginTop: 14, maxWidth: 480, margin: "14px auto 0" }}>
              Evaluación de 10 preguntas al cierre de cada módulo. Nota mínima: <strong style={{ color: "var(--text-primary)" }}>70 puntos</strong>.
            </p>
          </div>
          <div className="timeline-list">
            {curriculum.map((m) => (
              <div key={m.n} className="timeline-item">
                <div className="timeline-num">{m.n}</div>
                <div className="timeline-body">
                  <p className="timeline-weeks">{m.weeks}</p>
                  <p className="timeline-title">{m.title}</p>
                  <p className="timeline-desc">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 52 }}>
            <Link href="/register">
              <button className="btn btn-primary" style={{ minWidth: 220, cursor: "pointer", gap: 10 }}>
                Comenzar formación <IconArrowRight />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* COMMUNITY BANNER */}
      <div className="photo-banner">
        <img src="/fotos/contenido/community.jpg" alt="Comunidad Coffee Biochar — productores y extensionistas colombianos" />
        <div className="photo-banner-overlay">
          <div style={{ maxWidth: 600 }}>
            <p className="eyebrow" style={{ marginBottom: 18 }}>Nuestra comunidad</p>
            <h2 className="heading-1" style={{ marginBottom: 20 }}>Extensionistas transformando<br />el campo colombiano</h2>
            <p className="body-lg" style={{ maxWidth: 440, margin: "0 auto" }}>
              Productores cafeteros de Ataco y Huila certificados como extensionistas de carbono. Cuando los KPIs se cumplen, el productor gana más.
            </p>
          </div>
        </div>
      </div>

      {/* PARTNERS */}
      <section style={{ padding: "72px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <p className="eyebrow" style={{ textAlign: "center", marginBottom: 36 }}>Aliados del proyecto</p>
          <div className="partners-strip">
            <div className="partner-item">
              <img src="/logo.png" alt="Coffee Biochar" style={{ height: 40 }} />
            </div>
            <div className="partner-item">
              <img src="/brand/biodiversal.png" alt="Biodiversal SAS BIC" style={{ height: 26, filter: "brightness(0) invert(1)" }} />
            </div>
            <div className="partner-item"><p className="partner-name">Cirkular Agro</p></div>
            <div className="partner-item"><p className="partner-name">Incofin</p></div>
            <div className="partner-item"><p className="partner-name">Planboo</p></div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="amber-line" style={{ margin: "0 auto 24px" }} />
          <h2 className="heading-1" style={{ maxWidth: 480, margin: "0 auto 18px", textAlign: "center" }}>
            ¿Listo para comenzar<br />tu formación?
          </h2>
          <p className="body-lg" style={{ maxWidth: 400, margin: "0 auto 40px", textAlign: "center" }}>
            Completa los 6 módulos y obtén tu certificado como Extensionista Certificado Coffee Biochar.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register">
              <button className="btn btn-primary" style={{ minWidth: 190, cursor: "pointer", gap: 10 }}>
                Crear cuenta <IconArrowRight />
              </button>
            </Link>
            <Link href="/login">
              <button className="btn btn-outline" style={{ minWidth: 190, cursor: "pointer" }}>Iniciar sesión</button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "40px clamp(20px,4vw,40px)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 20, background: "var(--bg-deep)",
      }}>
        <img src="/logo.png" alt="Coffee Biochar Academy" style={{ height: 44 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <img src="/brand/biodiversal.png" alt="Biodiversal" style={{ height: 26, filter: "brightness(0) invert(1)", opacity: 0.35 }} />
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Biodiversal SAS BIC · Colombia · {new Date().getFullYear()}
          </span>
        </div>
      </footer>

    </div>
  );
}
