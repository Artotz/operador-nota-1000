type PodiumItem = {
  place: number;
  title: string;
  description: string;
  height: string;
  delay: number;
  bg: string;
};

export default function SolutionsPage() {
  const podium: PodiumItem[] = [
    {
      place: 3,
      title: "Lorem podium",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.",
      height: "12rem",
      delay: 0.05,
      bg: "from-sky-50 via-white to-blue-100",
    },
    {
      place: 1,
      title: "Ipsum prime",
      description:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.",
      height: "16rem",
      delay: 0.25,
      bg: "from-[#fde100] via-white to-[#ffed8c]",
    },
    {
      place: 2,
      title: "Dolor duo",
      description:
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
      height: "14rem",
      delay: 0.15,
      bg: "from-violet-50 via-white to-purple-100",
    },
  ];

  const modules = [
    {
      title: "Lorem module",
      detail: "Lorem ipsum dolor sit amet consectetur adipiscing elit.",
    },
    {
      title: "Ipsum block",
      detail: "Sed do eiusmod tempor incididunt ut labore et dolore magna.",
    },
    {
      title: "Dolor desk",
      detail: "Ut enim ad minim veniam quis nostrud exercitation ullamco.",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 text-[#0f172a]">
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Lorem ipsum
        </span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#0f172a]">
          Lorem ipsum dolor sit amet consectetur
        </h1>
        <p className="mt-3 text-lg text-[#4b5563]">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>
      </div>

      <div className="mt-16 grid items-end gap-6 md:grid-cols-3">
        {podium.map((item) => (
          <div
            key={item.title}
            className="podium-step flex flex-col items-center gap-3 text-center text-[#6b7280]"
            style={{ animationDelay: `${item.delay}s` }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              #{item.place} lorem
            </span>
            <div
              className={`podium-column flex w-full flex-col justify-end rounded-[2rem] border border-white/60 bg-gradient-to-t ${item.bg} p-5 shadow-2xl`}
              style={{ height: item.height, animationDelay: `${item.delay + 0.1}s` }}
            >
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-[#fde46b] bg-white/80 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Lorem
                </div>
              </div>
              <h2 className="text-lg font-semibold text-[#0f172a]">
                {item.title}
              </h2>
              <p className="mt-2 text-sm text-[#475569]">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-5 md:grid-cols-3">
        {modules.map((module) => (
          <div
            key={module.title}
            className="rounded-2xl border border-[#f3e49a] bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              lorem
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[#0f172a]">
              {module.title}
            </h3>
            <p className="mt-2 text-sm text-[#4b5563]">
              {module.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
