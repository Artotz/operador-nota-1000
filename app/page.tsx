import operatorHero from "./assets/Operador-de-Retroescavadeira-scaled.jpg";

export default function Home() {
  const features = [
    {
      title: "Lorem ipsum",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.",
    },
    {
      title: "Dolor sit",
      text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.",
    },
    {
      title: "Amet elit",
      text: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat.",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-[#fffdf2] via-white to-[#fff7c2] py-8 text-[#0f172a]">
      <section
        className="hero-ease-in relative mx-auto flex h-[78vh] max-w-5xl flex-col gap-8 overflow-hidden rounded-3xl border border-[#fde46b] bg-cover bg-center bg-white/80 px-6 pb-20 pt-16 text-center shadow-2xl sm:gap-10 md:pt-28"
        style={{ backgroundImage: `url(${operatorHero.src})` }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#fffef3]/95 via-white/85 to-[#ffe866]/50" />
        <span className="flex-1" />
        <span className="relative z-10 mx-auto rounded-full border border-[#fde46b] bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.2em] text-[#6f6f6f]">
          Lorem ipsum dolor
        </span>
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-semibold tracking-tight text-[#0f172a] sm:text-5xl">
            Lorem ipsum dolor sit amet
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-[#4b5563]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-5xl gap-6 px-6 pb-24 md:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-[#f2e1a1] bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="mb-3 h-1 w-10 rounded-full bg-[#fde100]" />
            <h3 className="text-lg font-semibold text-[#1f2937]">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">{feature.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
