// Design tokens — mirror of CSS variables in globals.css
// Use CSS variables (var(--name)) in inline styles when possible.
// Use these constants when you need to compute values in JS.

export const colors = {
  bgDeep:    "#080808",
  bg:        "#111111",
  bgCard:    "#181818",
  bgElevated:"#222222",

  greenDark:   "#2d6a4f",
  greenMid:    "#40916c",
  greenAccent: "#52b788",
  greenLight:  "#95d5b2",
  greenGlow:   "rgba(82,183,136,0.12)",
  greenBorder: "rgba(82,183,136,0.25)",

  amber:     "#e9c46a",
  amberWarm: "#f4a261",

  textPrimary:   "#f0efed",
  textSecondary: "#9a9a9a",
  textMuted:     "#5a5a5a",

  border:      "#252525",
  borderLight: "#2e2e2e",
};

// Keep these for legacy/transition usage
export const page = {
  background: colors.bg,
  minHeight:  "100vh",
  color:      colors.textPrimary,
  padding:    "40px 24px",
  fontFamily: "'Inter', sans-serif",
} as const;

export const card = {
  background:   colors.bgCard,
  border:       `1px solid ${colors.border}`,
  borderRadius: "12px",
  padding:      "20px",
} as const;

export const inputStyle = {
  width:        "100%",
  background:   colors.bgElevated,
  border:       `1px solid ${colors.border}`,
  color:        colors.textPrimary,
  padding:      "13px 16px",
  borderRadius: "8px",
  fontFamily:   "'Inter', sans-serif",
  fontSize:     "15px",
  outline:      "none",
  display:      "block",
  boxSizing:    "border-box" as const,
  minHeight:    "48px",
};

export const btn = (bg: string, color = "#fff") => ({
  border:       "none",
  padding:      "13px 24px",
  borderRadius: "8px",
  cursor:       "pointer",
  color,
  background:   bg,
  fontFamily:   "'Inter', sans-serif",
  fontSize:     "15px",
  fontWeight:   500,
  minHeight:    "48px",
  display:      "inline-flex",
  alignItems:   "center",
  justifyContent: "center",
  gap:          "8px",
  transition:   "all 0.2s",
} as const);

export const tableHeader = { borderBottom: `1px solid ${colors.border}` } as const;
export const tableRow    = { borderBottom: `1px solid rgba(255,255,255,0.03)` } as const;
export const th = { textAlign: "left" as const, padding: "10px 16px", fontSize: "11px", fontWeight: 700 as const, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: colors.textMuted, whiteSpace: "nowrap" as const };
export const td = { padding: "14px 16px", color: colors.textSecondary, verticalAlign: "middle" as const };
