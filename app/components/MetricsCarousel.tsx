"use client";

import { useMemo, useState } from "react";
import { getMessages } from "@/i18n";

export function MetricsCarousel() {
  const { metrics } = getMessages();
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = metrics.slides.length;

  const translate = useMemo(
    () => ({ transform: `translateX(-${currentIndex * 100}%)` }),
    [currentIndex]
  );

  const goTo = (index: number) => {
    if (index < 0) {
      setCurrentIndex(total - 1);
      return;
    }

    if (index >= total) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex(index);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 text-[#0f172a]">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">{metrics.title}</h1>
        <p className="mt-3 text-lg text-[#4b5563]">{metrics.subtitle}</p>
      </div>

      <section className="overflow-hidden rounded-3xl border border-[#f2df92] bg-white shadow-xl">
        <div className="flex transition-transform duration-500 ease-out" style={translate}>
          {metrics.slides.map((slide) => {
            const trendClass = slide.trend.startsWith("+")
              ? "text-emerald-600"
              : "text-orange-600";

            return (
              <article key={slide.title} className="w-full flex-shrink-0 p-8 sm:p-12">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                  {slide.title}
                </p>
                <p className="mt-4 text-5xl font-semibold tracking-tight text-[#0f172a]">
                  {slide.value}
                </p>
                <p className={`mt-3 text-base font-semibold ${trendClass}`}>{slide.trend}</p>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#4b5563]">
                  {slide.description}
                </p>
              </article>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#f2df92] bg-[#fffef5] px-6 py-4 sm:px-8">
          <div className="flex gap-2">
            {metrics.slides.map((slide, index) => {
              const active = index === currentIndex;
              return (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => goTo(index)}
                  className={`h-2.5 w-8 rounded-full transition-colors ${
                    active ? "bg-[#fde100]" : "bg-[#e5e7eb] hover:bg-[#d4d4d8]"
                  }`}
                  aria-label={`${slide.title} (${index + 1}/${total})`}
                />
              );
            })}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => goTo(currentIndex - 1)}
              className="rounded-full border border-[#f2df92] px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-[#fff7cf]"
            >
              {metrics.controls.prev}
            </button>
            <button
              type="button"
              onClick={() => goTo(currentIndex + 1)}
              className="rounded-full bg-[#fde100] px-4 py-2 text-sm font-medium text-[#0f172a] hover:bg-[#f8db00]"
            >
              {metrics.controls.next}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
