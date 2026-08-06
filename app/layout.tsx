import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Operador Nota 1.000 | Excelência Operacional",
  description:
    "Entrega final do Projeto de Excelência Operacional da F. P. Construtora Ltda.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
