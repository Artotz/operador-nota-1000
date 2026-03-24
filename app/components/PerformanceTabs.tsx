"use client";

import { useMemo, useState } from "react";
import { getMessages } from "@/i18n";

type SeriesItem = {
  label: string;
  color: string;
  values: ReadonlyArray<number>;
};

function LineChart({
  weeks,
  data,
  ariaLabel,
}: {
  weeks: ReadonlyArray<string>;
  data: ReadonlyArray<SeriesItem>;
  ariaLabel: string;
}) {
  const chartWidth = 640;
  const chartHeight = 240;
  const flatValues = data.flatMap((item) => item.values);
  const minValue = Math.min(...flatValues) - 5;
  const maxValue = Math.max(...flatValues) + 5;
  const xStep = chartWidth / (weeks.length - 1);

  const valueToY = (value: number) => {
    const range = maxValue - minValue || 1;
    const normalized = (value - minValue) / range;
    return chartHeight - normalized * chartHeight;
  };

  const pathFor = (values: ReadonlyArray<number>) =>
    values
      .map((value, index) => {
        const x = index * xStep;
        const y = valueToY(value);
        return `${index === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");

  return (
    <div className="overflow-hidden rounded-2xl bg-[#fffdf2] p-4">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="h-64 w-full"
        role="img"
        aria-label={ariaLabel}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = ratio * chartHeight;
          return (
            <line
              key={ratio}
              x1={0}
              y1={y}
              x2={chartWidth}
              y2={y}
              stroke="#e4e4e7"
              strokeDasharray="4 6"
              strokeWidth={1}
              opacity={0.7}
            />
          );
        })}

        {weeks.map((week, index) => (
          <text
            key={week}
            x={index * xStep}
            y={chartHeight + 18}
            fill="#71717a"
            fontSize="12"
            textAnchor="middle"
          >
            {week}
          </text>
        ))}

        {data.map((item) => (
          <g key={item.label}>
            <path
              d={pathFor(item.values)}
              fill="none"
              stroke={item.color}
              strokeWidth={3}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {item.values.map((value, index) => {
              const x = index * xStep;
              const y = valueToY(value);
              return (
                <circle
                  key={`${item.label}-${index}`}
                  cx={x}
                  cy={y}
                  r={5}
                  fill="#fff"
                  stroke={item.color}
                  strokeWidth={3}
                />
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}

function OperatorPanel() {
  const { desempenho } = getMessages();

  return (
    <section className="flex flex-col gap-10">
      <div className="rounded-3xl border border-[#f2df92] bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              {desempenho.operador.eyebrow}
            </p>
            <h2 className="text-2xl font-semibold text-[#0f172a]">
              {desempenho.operador.title}
            </h2>
          </div>
          <span className="text-sm text-zinc-500">{desempenho.operador.subtitle}</span>
        </div>

        <LineChart
          weeks={desempenho.weeks}
          data={desempenho.operador.series}
          ariaLabel={desempenho.operador.chartAria}
        />

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {desempenho.operador.series.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[#4b5563]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[#f2df92] bg-white shadow-sm">
        <div className="border-b border-[#f6ebbe] bg-[#fffef5] px-6 py-4">
          <h3 className="text-lg font-semibold text-[#0f172a]">
            {desempenho.operador.tableTitle}
          </h3>
          <p className="text-sm text-zinc-500">{desempenho.operador.tableSubtitle}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#f6ebbe] text-left text-sm">
            <thead className="bg-[#fffdf0] text-xs uppercase tracking-[0.2em] text-zinc-500">
              <tr>
                <th className="px-6 py-3">{desempenho.operador.headers.operador}</th>
                {desempenho.weeks.map((week) => (
                  <th key={week} className="px-6 py-3">
                    {week}
                  </th>
                ))}
                <th className="px-6 py-3">{desempenho.operador.headers.media}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f6ebbe]">
              {desempenho.operador.series.map((item) => {
                const average =
                  item.values.reduce((sum, value) => sum + value, 0) /
                  item.values.length;

                return (
                  <tr key={item.label} className="text-[#4b5563]">
                    <td className="px-6 py-4 font-semibold text-[#0f172a]">{item.label}</td>
                    {item.values.map((value, index) => (
                      <td key={index} className="px-6 py-4">
                        {value}%
                      </td>
                    ))}
                    <td className="px-6 py-4 font-medium text-[#0f172a]">
                      {average.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function CompanyPanel() {
  const { desempenho } = getMessages();

  return (
    <section className="flex flex-col gap-10">
      <div className="rounded-3xl border border-[#f2df92] bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              {desempenho.empresa.eyebrow}
            </p>
            <h2 className="text-2xl font-semibold text-[#0f172a]">
              {desempenho.empresa.title}
            </h2>
          </div>
          <span className="text-sm text-zinc-500">{desempenho.empresa.subtitle}</span>
        </div>

        <LineChart
          weeks={desempenho.weeks}
          data={desempenho.empresa.metrics}
          ariaLabel={desempenho.empresa.chartAria}
        />

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {desempenho.empresa.metrics.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[#4b5563]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[#f2df92] bg-white shadow-sm">
        <div className="border-b border-[#f6ebbe] bg-[#fffef5] px-6 py-4">
          <h3 className="text-lg font-semibold text-[#0f172a]">
            {desempenho.empresa.logsTitle}
          </h3>
          <p className="text-sm text-zinc-500">{desempenho.empresa.logsSubtitle}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#f6ebbe] text-left text-sm">
            <thead className="bg-[#fffdf0] text-xs uppercase tracking-[0.2em] text-zinc-500">
              <tr>
                <th className="px-6 py-3">{desempenho.empresa.headers.codigo}</th>
                <th className="px-6 py-3">{desempenho.empresa.headers.nome}</th>
                <th className="px-6 py-3">{desempenho.empresa.headers.data}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f6ebbe]">
              {desempenho.empresa.failureLogs.map((entry) => (
                <tr key={entry.code} className="text-[#4b5563]">
                  <td className="px-6 py-4 font-semibold text-[#0f172a]">{entry.code}</td>
                  <td className="px-6 py-4">{entry.name}</td>
                  <td className="px-6 py-4">{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function PerformanceTabs() {
  const { desempenho } = getMessages();
  const [activeTab, setActiveTab] = useState<"operador" | "empresa">("operador");

  const tabs = useMemo(
    () => [
      { id: "operador" as const, label: desempenho.tabs.operador },
      { id: "empresa" as const, label: desempenho.tabs.empresa },
    ],
    [desempenho.tabs.empresa, desempenho.tabs.operador]
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 text-[#0f172a]">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-[#0f172a]">
          {desempenho.title}
        </h1>
        <p className="mt-3 text-lg text-[#4b5563]">{desempenho.description}</p>
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-[#fde100] text-[#0f172a] shadow-sm"
                  : "border border-[#f2df92] bg-white text-zinc-600 hover:bg-[#fff7cf]"
              }`}
              aria-pressed={isActive}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "operador" ? <OperatorPanel /> : <CompanyPanel />}
    </div>
  );
}
