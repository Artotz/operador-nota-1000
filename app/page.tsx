import operatorHero from "./assets/Operador-de-Retroescavadeira-scaled.jpg";
import { getMessages } from "@/i18n";

export default function Home() {
  const { home } = getMessages();

  return (
    <div className="bg-gradient-to-b from-[#fffdf2] via-white to-[#fff7c2] py-8 text-[#0f172a]">
      <section
        className="hero-ease-in relative mx-auto flex h-[80vh] max-w-5xl flex-col gap-8 overflow-hidden rounded-3xl border border-[#fde46b] bg-cover bg-center bg-white/80 px-6 pb-20 pt-16 text-center shadow-2xl sm:gap-10 md:pt-28"
        style={{ backgroundImage: `url(${operatorHero.src})` }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#fffef3]/95 via-white/85 to-[#ffe866]/50" />
        <span className="flex-1" />

        <span className="relative z-10 mx-auto rounded-full border border-[#fde46b] bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.2em] text-[#6f6f6f]">
          {home.badge}
        </span>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-semibold tracking-tight text-[#0f172a] sm:text-5xl">
            {home.title}
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-[#4b5563]">{home.description}</p>
        </div>
      </section>
    </div>
  );
}
