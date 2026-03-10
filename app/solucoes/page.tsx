import Image from "next/image";
import { getMessages } from "@/i18n";

type RandomUserResult = {
  picture: {
    large: string;
  };
};

async function fetchRandomFaces(count: number) {
  try {
    const response = await fetch(
      `https://randomuser.me/api/?results=${count}&inc=picture&noinfo=1`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return [];
    }

    const data: { results?: RandomUserResult[] } = await response.json();
    return data.results?.map((result) => result.picture.large) ?? [];
  } catch {
    return [];
  }
}

export default async function PodiumPage() {
  const { podium } = getMessages();

  const faces = await fetchRandomFaces(podium.items.length);
  const podiumWithFaces = podium.items.map((podiumStep, index) => ({
    ...podiumStep,
    avatar: faces[index],
  }));

  return (
    <div className="mx-auto h-[90vh] max-w-5xl overflow-y-hidden px-6 pt-20 text-[#0f172a]">
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-[#0f172a]">{podium.title}</h1>
        <p className="mt-3 text-lg text-[#4b5563]">{podium.description}</p>
      </div>

      <div className="mt-16 grid items-end gap-6 md:grid-cols-3">
        {podiumWithFaces.map((item) => (
          <div
            key={item.title}
            className="podium-step flex flex-col items-center gap-3 text-center text-[#6b7280]"
            style={{ animationDelay: `${item.delay}s` }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              #{item.place} {podium.stepLabel}
            </span>
            <div
              className={`podium-column flex w-full flex-col justify-end rounded-[2rem] border border-white/60 bg-gradient-to-t ${item.bg} p-5 shadow-2xl`}
              style={{
                height: item.height,
                animationDelay: `${item.delay + 0.1}s`,
              }}
            >
              <div className="mb-6 flex justify-center">
                {item.avatar ? (
                  <Image
                    src={item.avatar}
                    alt={`${item.title} - ${item.place}`}
                    className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-lg"
                    width={80}
                    height={80}
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-[#fde46b] bg-white/80 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    {podium.avatarFallback}
                  </div>
                )}
              </div>
              <h2 className="text-lg font-semibold text-[#0f172a]">{item.title}</h2>
              <p className="mt-2 text-sm text-[#475569]">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
