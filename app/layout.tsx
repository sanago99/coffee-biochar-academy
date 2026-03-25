import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coffee Biochar Academy",
  description: "Plataforma de formación certificada para extensionistas rurales del proyecto Coffee Biochar — Biodiversal SAS BIC × Cirkular Agro · Colombia",
  keywords: ["biochar", "café", "Colombia", "extensionistas", "carbono", "sostenibilidad"],
  openGraph: {
    title: "Coffee Biochar Academy",
    description: "Formación certificada para extensionistas del proyecto Coffee Biochar en Colombia",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
