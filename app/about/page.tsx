import { getMessages } from "@/i18n";

export default function AboutPage() {
  const { about } = getMessages();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 text-[#0f172a]">
      <section className="rounded-3xl border border-[#f2df92] bg-white p-8 shadow-sm sm:p-10">
        <h1 className="text-4xl font-semibold tracking-tight">{about.title}</h1>
        <p className="mt-3 text-lg text-[#4b5563]">{about.subtitle}</p>

        <div className="mt-8 space-y-5 text-base leading-relaxed text-[#334155]">
          {about.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
