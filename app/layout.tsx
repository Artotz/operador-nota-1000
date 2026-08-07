import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Operador Nota 1.000 | Excelência Operacional",
  description:
    "Resultados, evolução e reconhecimento do Projeto Operador Nota 1.000 da F. P. Construtora.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
