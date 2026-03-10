import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "./components/Header";
import { getLocale, getMessages } from "@/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const { metadata: metadataText } = getMessages();

export const metadata: Metadata = {
  title: metadataText.title,
  description: metadataText.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={getLocale()}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#fffdf2] text-[#0f172a] antialiased`}
      >
        <Header />
        <main className="min-h-[90vh] bg-gradient-to-b from-[#fffdf2] via-white to-[#fff8c6] text-[#212121]">
          {children}
        </main>
      </body>
    </html>
  );
}
