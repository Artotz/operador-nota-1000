export default function AboutPage() {
  const values = [
    "Lorem ipsum dolor sit amet",
    "Consectetur adipiscing elit",
    "Sed do eiusmod tempor",
  ];
  const weeks = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];
  const performance = [
    { operator: "Operador A", color: "#2563eb", values: [78, 84, 81, 89] },
    { operator: "Operador B", color: "#f97316", values: [65, 72, 70, 74] },
    { operator: "Operador C", color: "#22c55e", values: [82, 79, 85, 90] },
  ];
  const chartWidth = 640;
  const chartHeight = 240;
  const flatValues = performance.flatMap((item) => item.values);
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
                Desempenho semanal dos operadores
              </h2>
            </div>
            <span className="text-sm text-zinc-500">% de metas cumpridas</span>
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
              {performance.map((item) => (
                <g key={item.operator}>
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
                        key={`${item.operator}-${index}`}
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
            {performance.map((item) => (
              <div key={item.operator} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[#4b5563]">{item.operator}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#f2df92] bg-white shadow-sm">
          <div className="border-b border-[#f6ebbe] bg-[#fffef5] px-6 py-4">
            <h3 className="text-lg font-semibold text-[#0f172a]">
              Planilha resumida das quatro semanas
            </h3>
            <p className="text-sm text-zinc-500">
              Valores em porcentagem de entrega concluAda
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#f6ebbe] text-left text-sm">
              <thead className="bg-[#fffdf0] text-xs uppercase tracking-[0.2em] text-zinc-500">
                <tr>
                  <th className="px-6 py-3">Operador</th>
                  {weeks.map((week) => (
                    <th key={week} className="px-6 py-3">
                      {week}
                    </th>
                  ))}
                  <th className="px-6 py-3">MAdia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f6ebbe]">
                {performance.map((item) => {
                  const average =
                    item.values.reduce((sum, value) => sum + value, 0) /
                    item.values.length;
                  return (
                    <tr key={item.operator} className="text-[#4b5563]">
                      <td className="px-6 py-4 font-semibold text-[#0f172a]">
                        {item.operator}
                      </td>
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
    </div>
  );
}
