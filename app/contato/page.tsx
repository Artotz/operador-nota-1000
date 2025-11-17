export default function ContactPage() {
  const weeks = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];
  const metrics = [
    {
      label: "Consumo total de combustAvel",
      color: "#f97316",
      values: [12, 11, 10, 9],
    },
    {
      label: "CAdigos de falha reportados",
      color: "#0ea5e9",
      values: [0, 2, 4, 7],
    },
    {
      label: "Ociosidade total",
      color: "#10b981",
      values: [27, 24, 21, 18],
    },
  ];
  const failureLogs = [
    { code: "F-101", name: "Falha hidrAulica leve", date: "03/11/2025" },
    { code: "F-208", name: "Sensor de temperatura", date: "07/11/2025" },
    { code: "F-312", name: "PressAo baixa no freio", date: "12/11/2025" },
    { code: "F-447", name: "OscilaAAo elAtrica", date: "17/11/2025" },
  ];

  const chartWidth = 640;
  const chartHeight = 240;
  const flatValues = metrics.flatMap((item) => item.values);
  const minValue = Math.min(...flatValues) - 5;
  const maxValue = Math.max(...flatValues) + 5;
  const xStep = chartWidth / (weeks.length - 1);
  const valueToY = (value: number) => {
    const range = maxValue - minValue || 1;
    const normalized = (value - minValue) / range;
    return chartHeight - normalized * chartHeight;
  };
  const pathFor = (values: number[]) =>
    values
      .map((value, index) => {
        const x = index * xStep;
        const y = valueToY(value);
        return `${index === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 text-[#0f172a]">
      <section className="flex flex-col gap-10">
        <div className="rounded-3xl border border-[#f2df92] bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Lorem ipsum
              </p>
              <h2 className="text-2xl font-semibold text-[#0f172a]">
                Telemetria consolidada das Altimas semanas
              </h2>
            </div>
            <span className="text-sm text-zinc-500">
              Consumo & falhas por semana
            </span>
          </div>
          <div className="overflow-hidden rounded-2xl bg-[#fffdf2] p-4">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="h-64 w-full"
              role="img"
              aria-label="GrAfico de linha semanal"
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
              {metrics.map((item) => (
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
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {metrics.map((item) => (
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
              RelatArio de cAdigos de falha reportados
            </h3>
            <p className="text-sm text-zinc-500">
              Altimas ocorrAncias registradas pelo operador
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#f6ebbe] text-left text-sm">
              <thead className="bg-[#fffdf0] text-xs uppercase tracking-[0.2em] text-zinc-500">
                <tr>
                  <th className="px-6 py-3">CAdigo</th>
                  <th className="px-6 py-3">Nome</th>
                  <th className="px-6 py-3">Data de ocorrAncia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f6ebbe]">
                {failureLogs.map((entry) => (
                  <tr key={entry.code} className="text-[#4b5563]">
                    <td className="px-6 py-4 font-semibold text-[#0f172a]">
                      {entry.code}
                    </td>
                    <td className="px-6 py-4">{entry.name}</td>
                    <td className="px-6 py-4">{entry.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
