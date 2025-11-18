"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Início" },
  { href: "/solucoes", label: "Pódio" },
  { href: "/sobre", label: "Desempenho do Operador" },
  { href: "/contato", label: "Desempenho da Empresa" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-[#f6e27d] bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-[#0f172a]"
        >
          Projeto de Excelência Operacional
        </Link>
        <nav className="flex gap-2 text-sm font-medium">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-full px-4 py-2 transition-colors ${
                  isActive
                    ? "bg-[#fde100] text-[#0f172a] shadow-sm"
                    : "text-zinc-600 hover:bg-[#fff5a0]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
