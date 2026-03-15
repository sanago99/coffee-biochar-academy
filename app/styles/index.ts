import type { CSSProperties } from "react";

export const colors = {
  bg: "#111",
  bgCard: "#1a1a1a",
  border: "#333",
  borderLight: "#444",
  text: "#fff",
  textMuted: "#aaa",
  green: "#4CAF50",
  greenDark: "#2E7D32",
  yellow: "#FFC107",
  blue: "#2196F3",
  orange: "#FF9800",
  gray: "#555",
};

export const page: CSSProperties = {
  background: colors.bg,
  minHeight: "100vh",
  color: colors.text,
  padding: "40px",
  fontFamily: "Arial",
};

export const card: CSSProperties = {
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "15px",
  marginTop: "15px",
};

export const inputStyle: CSSProperties = {
  display: "block",
  marginTop: "10px",
  padding: "10px",
  background: "#222",
  border: `1px solid ${colors.border}`,
  color: "white",
  borderRadius: "4px",
  width: "100%",
  boxSizing: "border-box",
};

export const btn = (bg: string): CSSProperties => ({
  border: "none",
  padding: "8px 14px",
  borderRadius: "5px",
  cursor: "pointer",
  color: "white",
  background: bg,
});

export const tableHeader: CSSProperties = {
  borderBottom: `1px solid ${colors.borderLight}`,
};

export const tableRow: CSSProperties = {
  borderBottom: `1px solid ${colors.border}`,
};

export const th: CSSProperties = {
  textAlign: "left",
  padding: "10px",
};

export const td: CSSProperties = {
  padding: "10px",
};
