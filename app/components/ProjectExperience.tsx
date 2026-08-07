"use client";

import Image from "next/image";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RoadmapSection } from "@/app/components/RoadmapSection";
import machineReadings from "@/app/data/machine-readings.json";
import { operatorAssignments, reportingPeriods } from "@/app/data/project-data";
import { aggregateReadings, buildOperationalImpact, buildRanking, round } from "@/app/lib/analytics";
import type { MachineReading, MetricKey, PhaseKey, ReportingPeriod } from "@/app/lib/types";

const readings = machineReadings as MachineReading[];

const sections = [
  ["abertura", "Abertura"],
  ["roadmap", "Roadmap"],
  ["criterios", "Critérios"],
  ["evolucao", "Consolidado"],
  ["operadores", "Operadores"],
  ["podio", "Pódio"],
  ["economias", "Economias"],
  ["continuidade", "Próximos passos"],
  ["parceiros", "Parceiros"],
] as const;

const metricConfig = {
  consumption: {
    label: "Consumo",
    description: "Litros consumidos por hora de motor",
    color: "#f4c400",
    target: 26,
    lowerIsBetter: true,
  },
  idle: {
    label: "Ociosidade",
    description: "Tempo de motor ligado sem produção",
    color: "#f97316",
    target: 20,
    lowerIsBetter: true,
  },
  productive: {
    label: "Produtividade",
    description: "Tempo efetivamente trabalhando",
    color: "#84cc16",
    target: 80,
    lowerIsBetter: false,
  },
} satisfies Record<MetricKey, { label: string; description: string; color: string; target: number; lowerIsBetter: boolean }>;

const criteria = [
  { number: "01", title: "Consumo", points: "25 pts", rule: "Abaixo de 26 l/h vale 25 pontos; redução de 5% vale 10." },
  { number: "02", title: "Ociosidade", points: "25 pts", rule: "Até 20% vale 25 pontos; até 25% garante 10." },
  { number: "03", title: "Horas produtivas", points: "25 pts", rule: "80% ou mais vale 25 pontos; acima de 75% vale 10." },
  { number: "04", title: "Segurança", points: "10 pts", rule: "Uso correto de EPIs e respeito às normas da operação." },
  { number: "05", title: "Cuidado com o ativo", points: "10 pts", rule: "Inspeção diária, limpeza e uso correto do equipamento." },
  { number: "06", title: "Assiduidade", points: "5 pts", rule: "Presença e pontualidade mínima de 90% durante o projeto." },
];

const operatorColors = ["#f4c400", "#38bdf8", "#fb7185", "#a3e635", "#c084fc"];

function useScrollStory() {
  const [activeSection, setActiveSection] = useState("abertura");

  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.13 },
    );
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-28% 0px -52%", threshold: [0, 0.25, 0.6] },
    );

    document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
    sections.forEach(([id]) => {
      const element = document.getElementById(id);
      if (element) sectionObserver.observe(element);
    });

    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  return activeSection;
}

function metricValue(readingGroup: MachineReading[], metric: MetricKey) {
  if (!readingGroup.length) return null;
  return round(aggregateReadings(readingGroup)[metric], 2);
}

function buildPeriodSeries(metric: MetricKey, serial?: string) {
  return reportingPeriods.map((period) => {
    const matches = readings.filter(
      (reading) => reading.periodStart === period.start && (!serial || reading.serial === serial),
    );
    return {
      id: period.id,
      period: period.label,
      longLabel: period.longLabel,
      phase: period.phase,
      value: metricValue(matches, metric),
    };
  });
}

function formatMetric(value: number | null, metric: MetricKey) {
  if (value === null) return "—";
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}${
    metric === "consumption" ? " l/h" : "%"
  }`;
}

function formatHours(value: number) {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} h`;
}

function MetricToggle({ metric, onChange }: { metric: MetricKey; onChange: (metric: MetricKey) => void }) {
  return (
    <div className="metric-toggle" role="group" aria-label="Escolha o indicador">
      {(Object.keys(metricConfig) as MetricKey[]).map((key) => (
        <button
          key={key}
          type="button"
          aria-pressed={metric === key}
          className={metric === key ? "is-active" : ""}
          onClick={() => onChange(key)}
        >
          {metricConfig[key].label}
        </button>
      ))}
    </div>
  );
}

type TooltipItem = { value?: number; color?: string; name?: string; dataKey?: string };

function ChartTooltip({ active, payload, label, metric }: { active?: boolean; payload?: TooltipItem[]; label?: string; metric: MetricKey }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <span>{label}</span>
      {payload.map((item) => (
        <p key={item.dataKey ?? item.name}>
          <i style={{ background: item.color }} />
          {item.name ? `${item.name}: ` : ""}
          <strong>{formatMetric(item.value ?? null, metric)}</strong>
        </p>
      ))}
    </div>
  );
}

function StoryRail({ active }: { active: string }) {
  return (
    <nav className="story-rail" aria-label="Etapas da apresentação">
      <div className="rail-line" aria-hidden="true" />
      {sections.map(([id, label], index) => (
        <button
          key={id}
          type="button"
          className={active === id ? "is-active" : ""}
          aria-label={`Ir para ${label}`}
          aria-current={active === id ? "step" : undefined}
          onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          <b>{label}</b>
        </button>
      ))}
    </nav>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <header className="section-heading reveal">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="section-intro">{text}</p>
    </header>
  );
}

function ScoreFormula() {
  const ref = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState([0, 0, 0]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    let started = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      const targets = [75, 25, 100];
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setValues(targets);
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / 950);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValues(targets.map((target) => Math.round(target * eased)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.55 });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="score-formula reveal" ref={ref} aria-label="75 pontos de telemetria mais 25 pontos humanos, total de 100 pontos">
      <div><strong>{values[0]}</strong><span>pontos de telemetria</span></div>
      <i aria-hidden="true">+</i>
      <div><strong>{values[1]}</strong><span>pontos humanos</span></div>
      <i aria-hidden="true">=</i>
      <div className="total"><strong>{values[2]}</strong><span>pontos possíveis</span></div>
    </div>
  );
}

function PeriodStrip({ periods }: { periods: ReportingPeriod[] }) {
  return (
    <div className="period-strip reveal" aria-label="Janelas de medição do projeto">
      {(["baseline", "window1", "window2"] as PhaseKey[]).map((phase, index) => {
        const group = periods.filter((period) => period.phase === phase);
        const available = group.filter((period) => readings.some((reading) => reading.periodStart === period.start));
        const complete = available.length === group.length;
        return (
          <article key={phase} className={complete ? "" : "is-partial"}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <b>{group[0].phaseLabel}</b>
              <p>{group.map((period) => period.longLabel).join(" • ")}</p>
            </div>
            <em>{complete ? "Concluída" : `${available.length}/${group.length} recebidas`}</em>
          </article>
        );
      })}
    </div>
  );
}

function ConsolidatedSection() {
  const [metric, setMetric] = useState<MetricKey>("consumption");
  const series = useMemo(() => buildPeriodSeries(metric), [metric]);
  const config = metricConfig[metric];
  const available = series.filter((item) => item.value !== null);
  const first = available[0]?.value ?? 0;
  const latest = available.at(-1)?.value ?? 0;
  const improvement = config.lowerIsBetter ? first - latest : latest - first;
  const operation = aggregateReadings(readings);
  const availablePeriods = new Set(readings.map((reading) => reading.periodStart)).size;
  const averageHoursPerMachinePeriod = operation.engineHours / readings.length;
  const averageFleetHoursPerPeriod = operation.engineHours / availablePeriods;

  return (
    <section id="evolucao" className="story-section data-section">
      <div className="section-shell">
        <SectionHeading
          eyebrow="04 — Evolução consolidada"
          title="Cinco quinzenas. Uma operação em movimento."
          text="Os dados da frota foram ponderados pelas horas efetivamente operadas para comparar períodos de intensidades diferentes."
        />
        <PeriodStrip periods={reportingPeriods} />
        <div className="hours-kpis reveal" aria-label="Resumo das horas de operação">
          <div><span>Horas monitoradas</span><strong>{formatHours(operation.engineHours)}</strong></div>
          <div><span>Média da frota por quinzena</span><strong>{formatHours(averageFleetHoursPerPeriod)}</strong></div>
          <div><span>Média por máquina / quinzena</span><strong>{formatHours(averageHoursPerMachinePeriod)}</strong></div>
        </div>
        <div className="chart-card reveal">
          <div className="chart-card-head">
            <div>
              <span className="chart-kicker">Indicador selecionado</span>
              <h3>{config.label}</h3>
              <p>{config.description}</p>
            </div>
            <MetricToggle metric={metric} onChange={setMetric} />
          </div>
          <div className="chart-summary">
            <div><span>Início</span><strong>{formatMetric(first, metric)}</strong></div>
            <div><span>Último registro</span><strong>{formatMetric(latest, metric)}</strong></div>
            <div className={improvement >= 0 ? "positive" : "negative"}>
              <span>Ganho no período</span><strong>{improvement >= 0 ? "+" : ""}{formatMetric(improvement, metric)}</strong>
            </div>
          </div>
          <div className="main-chart" aria-label={`Gráfico consolidado de ${config.label}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 32, right: 18, left: -18, bottom: 12 }}>
                <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
                <XAxis dataKey="period" stroke="#7e8580" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis stroke="#7e8580" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
                <Tooltip content={<ChartTooltip metric={metric} />} />
                <ReferenceLine y={config.target} stroke="#f4c400" strokeDasharray="5 7" label={{ value: "Desafio", fill: "#f4c400", fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name={config.label}
                  stroke={config.color}
                  strokeWidth={4}
                  dot={{ r: 5, fill: "#111511", stroke: config.color, strokeWidth: 3 }}
                  activeDot={{ r: 8, fill: config.color, stroke: "#111511", strokeWidth: 4 }}
                  connectNulls={false}
                  animationDuration={900}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="pending-period">
            <span className="pulse-dot" />
            <div><b>30 jul–13 ago</b><p>Aguardando dados da última quinzena</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OperatorSection() {
  const [metric, setMetric] = useState<MetricKey>("idle");
  const [pinnedSerial, setPinnedSerial] = useState<string | null>(null);
  const [hoveredSerial, setHoveredSerial] = useState<string | null>(null);
  const activeSerial = pinnedSerial ?? hoveredSerial;
  const availablePeriodStarts = new Set(readings.map((reading) => reading.periodStart));
  const latestPeriod = reportingPeriods.filter((period) => availablePeriodStarts.has(period.start)).at(-1);

  const chartData = reportingPeriods.map((period) => {
    const row: Record<string, string | number | null> = { period: period.label };
    operatorAssignments.forEach((assignment) => {
      const matches = readings.filter((reading) => reading.periodStart === period.start && reading.serial === assignment.serial);
      row[assignment.alias] = metricValue(matches, metric);
    });
    return row;
  });

  return (
    <section id="operadores" className="story-section operators-section">
      <div className="section-shell">
        <SectionHeading
          eyebrow="05 — Visão individual"
          title="Cada linha conta uma história de evolução."
          text="Passe o mouse para destacar uma máquina. Clique em um cartão para fixar a seleção, comparar a série e revelar os valores sobre cada ponto."
        />
        <div className="operator-dashboard reveal">
          <div className="operator-toolbar">
            <div><span>Comparativo por participante</span><strong>{metricConfig[metric].label}</strong></div>
            <MetricToggle metric={metric} onChange={setMetric} />
          </div>
          <div className="operator-chart" aria-label={`Gráfico por operador de ${metricConfig[metric].label}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 38, right: 20, left: -22, bottom: 4 }}>
                <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
                <XAxis dataKey="period" stroke="#7e8580" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis stroke="#7e8580" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                <Tooltip content={<ChartTooltip metric={metric} />} />
                {operatorAssignments.map((assignment, index) => {
                  const isActive = !activeSerial || activeSerial === assignment.serial;
                  return (
                    <Line
                      key={assignment.alias}
                      type="monotone"
                      dataKey={assignment.alias}
                      name={assignment.alias}
                      stroke={operatorColors[index]}
                      strokeWidth={activeSerial === assignment.serial ? 4 : 2.5}
                      strokeOpacity={isActive ? 1 : 0.14}
                      dot={{ r: activeSerial === assignment.serial ? 5 : 3, fill: "#111511", strokeWidth: 2 }}
                      connectNulls={false}
                      animationDuration={750 + index * 100}
                    >
                      {activeSerial === assignment.serial && (
                        <LabelList
                          dataKey={assignment.alias}
                          position="top"
                          fill={operatorColors[index]}
                          fontSize={11}
                          fontWeight={800}
                          formatter={(value: unknown) => typeof value === "number" ? value.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : ""}
                        />
                      )}
                    </Line>
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="operator-selector" role="group" aria-label="Selecionar operador para comparação">
            {operatorAssignments.map((assignment, index) => {
              const latestReadings = latestPeriod
                ? readings.filter((reading) => reading.serial === assignment.serial && reading.periodStart === latestPeriod.start)
                : [];
              const latest = metricValue(latestReadings, metric);
              const latestHours = latestReadings.length ? aggregateReadings(latestReadings).engineHours : 0;
              const trackedStarts = new Set(reportingPeriods.filter((period) => period.phase !== "baseline").map((period) => period.start));
              const trackedHours = aggregateReadings(readings.filter((reading) => reading.serial === assignment.serial && trackedStarts.has(reading.periodStart))).engineHours;
              const isPinned = pinnedSerial === assignment.serial;
              const isFaded = Boolean(activeSerial && activeSerial !== assignment.serial);
              return (
                <button
                  type="button"
                  key={assignment.serial}
                  className={`${isPinned ? "is-pinned" : ""} ${isFaded ? "is-faded" : ""}`}
                  aria-pressed={isPinned}
                  onMouseEnter={() => setHoveredSerial(assignment.serial)}
                  onMouseLeave={() => setHoveredSerial(null)}
                  onFocus={() => setHoveredSerial(assignment.serial)}
                  onBlur={() => setHoveredSerial(null)}
                  onClick={() => setPinnedSerial((current) => current === assignment.serial ? null : assignment.serial)}
                >
                  <i style={{ backgroundColor: operatorColors[index] }} />
                  <span>{assignment.alias}</span>
                  <strong>{formatMetric(latest, metric)}</strong>
                  <small>{formatHours(latestHours)} na última quinzena</small>
                  <small>{formatHours(trackedHours)} acompanhadas</small>
                  <em>{isPinned ? "Seleção fixada" : "Clique para fixar"}</em>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Confetti() {
  return (
    <div className="confetti-burst" aria-hidden="true">
      {Array.from({ length: 54 }, (_, index) => {
        const angle = (index / 54) * Math.PI * 2;
        const distance = 90 + (index % 9) * 18;
        const style = {
          "--x": `${Math.cos(angle) * distance}px`,
          "--y": `${Math.sin(angle) * distance + 80}px`,
          "--delay": `${(index % 7) * 38}ms`,
          "--rotate": `${(index * 67) % 720}deg`,
        } as CSSProperties;
        return <i key={index} style={style} />;
      })}
    </div>
  );
}

function PodiumSection() {
  const [revealed, setRevealed] = useState(0);
  const ranking = useMemo(() => buildRanking(readings, reportingPeriods, operatorAssignments), []);
  const topThree = ranking.entries.slice(0, 3);
  const podiumOrder = [topThree[1], topThree[0], topThree[2]].filter(Boolean);
  const revealLabels = ["Revelar 3º lugar", "Revelar 2º lugar", "Revelar 1º lugar"];

  return (
    <section id="podio" className="story-section podium-section">
      <div className="podium-light" aria-hidden="true" />
      <div className="section-shell">
        <SectionHeading
          eyebrow="06 — Reconhecimento"
          title="Chegou a hora de revelar o pódio."
          text="A nota usa o último período disponível e aplica somente as faixas inteiras previstas: meta, desafio e critérios humanos."
        />
        <div className="ranking-status reveal">
          <span className={ranking.isOfficial ? "official" : "provisional"}>{ranking.isOfficial ? "Classificação oficial" : "Classificação provisória"}</span>
          <p>{ranking.isOfficial ? "Todas as janelas previstas foram recebidas." : "A última quinzena ainda está pendente; a classificação será atualizada quando os dados chegarem."}</p>
        </div>
        <div className="podium-grid reveal" aria-live="polite">
          {podiumOrder.map((entry) => {
            const place = entry.position;
            const isRevealed = revealed >= 4 - place;
            const isChampion = place === 1 && isRevealed;
            return (
              <article key={entry.serial} className={`podium-card place-${place} ${isRevealed ? "is-revealed" : ""} ${isChampion ? "is-champion" : ""}`}>
                {isChampion && <Confetti />}
                {isChampion && <div className="fireworks" aria-hidden="true"><i /><i /><i /></div>}
                <span className="place-number">{place}º</span>
                <div className="podium-machine" aria-hidden={!isRevealed}>
                  <Image src="/project-assets/brand/escavadeira.png" alt="Escavadeira do projeto" fill sizes="(max-width: 900px) 80vw, 32vw" />
                </div>
                <div className="podium-lock" aria-hidden="true"><span>{isRevealed ? "✓" : "?"}</span></div>
                <div className="podium-secret">
                  <p>{isRevealed ? entry.revealName : "Identidade protegida"}</p>
                  <h3>{isRevealed ? entry.machine : "••••••••"}</h3>
                  <strong>{isRevealed ? `${entry.score} / ${entry.maximum}` : "—"}</strong>
                </div>
                {isRevealed && (
                  <div className="score-parts">
                    <span>Consumo <b>{entry.breakdown.consumption}</b></span>
                    <span>Ociosidade <b>{entry.breakdown.idle}</b></span>
                    <span>Produtividade <b>{entry.breakdown.productive}</b></span>
                    <span>Segurança <b>{entry.breakdown.safety}</b></span>
                    <span>Cuidado <b>{entry.breakdown.assetCare}</b></span>
                    <span>Assiduidade <b>{entry.breakdown.attendance}</b></span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
        <div className="reveal-control reveal">
          {revealed < 3 ? (
            <button type="button" onClick={() => setRevealed((value) => Math.min(3, value + 1))}>
              <span>{revealLabels[revealed]}</span><i aria-hidden="true">→</i>
            </button>
          ) : (
            <p className="reveal-complete"><span>✦</span> Pódio revelado</p>
          )}
        </div>

        <div className={`ranking-table reveal ${revealed === 3 ? "is-visible-table" : "is-locked-table"}`}>
          {revealed === 3 ? (
            <>
              <div className="ranking-table-head">
                <div><span>Classificação completa</span><h3>Pontuação geral por operador</h3></div>
                <p>Último período recebido • nota inteira de 0 a 100</p>
              </div>
              <div className="table-scroll">
                <table>
                  <thead><tr><th>Posição</th><th>Operador</th><th>Máquina</th><th>Telemetria</th><th>Humano</th><th>Total</th></tr></thead>
                  <tbody>
                    {ranking.entries.map((entry) => (
                      <tr key={entry.serial}>
                        <td><b>{entry.position}º</b></td>
                        <td>{entry.revealName}</td>
                        <td>{entry.machine}</td>
                        <td>{entry.breakdown.consumption + entry.breakdown.idle + entry.breakdown.productive} / 75</td>
                        <td>{entry.breakdown.safety + entry.breakdown.assetCare + entry.breakdown.attendance} / 25</td>
                        <td><strong>{entry.score} / 100</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="table-lock-message"><span aria-hidden="true">⌁</span><p>A tabela geral aparece quando todo o pódio for revelado.</p></div>
          )}
        </div>
      </div>
    </section>
  );
}

function EconomySection() {
  const trackedStarts = new Set(reportingPeriods.filter((period) => period.phase !== "baseline").map((period) => period.start));
  const trackedReadings = readings.filter((reading) => trackedStarts.has(reading.periodStart));
  const impact = buildOperationalImpact(readings, reportingPeriods, 6);
  const consumptionReduction = impact.baseline.averageFuelRate && impact.monitoring.operatingHours
    ? (impact.avoidedLiters / (impact.monitoring.operatingHours * impact.baseline.averageFuelRate)) * 100
    : 0;

  const cards = [
    { value: `${round(impact.avoidedLiters, 0).toLocaleString("pt-BR")} L`, label: "combustível potencialmente evitado", note: "comparação com a taxa média do baseline" },
    { value: impact.estimatedDieselSavings.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }), label: "economia estimada em diesel", note: `referência de ${impact.dieselPricePerLiter.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} por litro` },
    { value: formatHours(impact.monitoring.operatingHours), label: "operação acompanhada", note: `${trackedReadings.length} leituras após o baseline` },
    { value: formatHours(impact.avoidedIdleHours), label: "ociosidade potencialmente evitada", note: `redução consolidada de ${round(consumptionReduction, 1).toLocaleString("pt-BR")}% no consumo` },
  ];

  return (
    <section id="economias" className="story-section economy-section">
      <div className="section-shell">
        <SectionHeading
          eyebrow="07 — Valor gerado"
          title="Eficiência que pode ser traduzida em economia."
          text="Uma leitura executiva do impacto do acompanhamento, comparando a taxa média das duas primeiras quinzenas com os períodos monitorados depois do início do projeto."
        />
        <ul className="economy-grid reveal">
          {cards.map((card, index) => (
            <li key={card.label}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{card.value}</strong>
              <h3>{card.label}</h3>
              <p>{card.note}</p>
            </li>
          ))}
        </ul>
        <p className="method-note reveal"><b>Metodologia:</b> estimativa técnica, não contábil. Valores positivos comparam o consumo e a ociosidade observados contra o que ocorreria mantendo as médias ponderadas do baseline.</p>
      </div>
    </section>
  );
}

function ContinuitySection() {
  return (
    <section id="continuidade" className="story-section continuity-section">
      <div className="section-shell">
        <SectionHeading
          eyebrow="08 — Não acaba por aqui"
          title="O resultado vira hábito. O projeto vira próximo passo."
          text="Recomendações diretas para sustentar o que funcionou e transformar os aprendizados em uma nova frente de valor."
        />
        <div className="continuity-grid reveal">
          <article className="tips-card">
            <span className="card-kicker">Para os operadores</span>
            <h3>Continue fazendo o que move o ponteiro.</h3>
            <ul>
              <li><b>Antes de ligar:</b> planeje a frente e evite espera com motor em funcionamento.</li>
              <li><b>Durante a operação:</b> use o modo correto e reduza acelerações e deslocamentos improdutivos.</li>
              <li><b>Ao encerrar:</b> registre desvios, faça a inspeção e deixe o ativo pronto para o próximo turno.</li>
              <li><b>Todo dia:</b> mantenha EPIs, pontualidade e boas práticas como parte da performance.</li>
            </ul>
          </article>
          <article className="sales-card">
            <span className="card-kicker">Para a empresa</span>
            <h3>O próximo ganho pode começar agora.</h3>
            <p>Converta este diagnóstico em uma agenda contínua de capacitação, acompanhamento remoto e excelência operacional.</p>
            <div className="service-tags"><span>Treinamentos personalizados</span><span>Monitoramento CSC</span><span>Nova edição em 2027</span><span>Consultoria operacional</span></div>
            <a href="#parceiros">Planejar o próximo ciclo <span aria-hidden="true">↗</span></a>
          </article>
        </div>
      </div>
    </section>
  );
}

function PartnersSection() {
  const partners = [
    { src: "/project-assets/brand/logo-csc.png", alt: "Centro de Soluções Conectadas", label: "CSC" },
    { src: "/project-assets/brand/logo-veneza.png", alt: "Veneza Equipamentos", label: "Veneza Equipamentos" },
    { src: "/project-assets/brand/logo-john-deere.png", alt: "John Deere", label: "John Deere" },
  ];
  return (
    <section id="parceiros" className="story-section partners-section">
      <div className="partners-glow" aria-hidden="true" />
      <div className="section-shell reveal">
        <p className="eyebrow">09 — Uma construção conjunta</p>
        <h2>Com você em cada parte<br />da operação.</h2>
        <div className="logo-row">
          {partners.map((partner) => (
            <div key={partner.label} className="partner-logo">
              <Image src={partner.src} alt={partner.alt} width={240} height={150} sizes="(max-width: 640px) 70vw, 30vw" />
              <small>{partner.label}</small>
            </div>
          ))}
        </div>
        <footer><span>Projeto Excelência Operacional</span><span>Operador Nota 1.000 · 2026</span></footer>
      </div>
    </section>
  );
}

export function ProjectExperience() {
  const activeSection = useScrollStory();

  return (
    <main className="project-experience">
      <StoryRail active={activeSection} />
      <section id="abertura" className="hero-section story-section">
        <Image className="hero-photo" src="/project-assets/roadmap/visit-2/visit-2-17.jpg" alt="Equipe do projeto diante de uma escavadeira em campo" fill priority sizes="100vw" />
        <div className="hero-overlay" />
        <div className="hero-grain" aria-hidden="true" />
        <div className="hero-partners">
          <span>F.P. Construtora</span>
          <Image src="/project-assets/brand/logo-csc.png" alt="CSC" width={58} height={58} priority />
        </div>
        <div className="hero-content">
          <Image className="hero-project-logo" src="/project-assets/brand/logo-operador.png" alt="Operador Nota 1.000 — Excelência Operacional" width={238} height={238} priority />
          <p className="hero-eyebrow">Projeto de Excelência Operacional</p>
          <h1>Performance que<br />{" "}deixa<br />{" "}<strong>marca na operação.</strong></h1>
          <div className="hero-footer">
            <p>Dados. Acompanhamento. Reconhecimento.</p>
            <a href="#roadmap">Conheça a jornada <span aria-hidden="true">↓</span></a>
          </div>
        </div>
      </section>

      <RoadmapSection />

      <section id="criterios" className="story-section criteria-section">
        <div className="section-shell">
          <SectionHeading
            eyebrow="03 — Critérios avaliados"
            title="Excelência é a soma de cada decisão."
            text="A nota combina eficiência da máquina com disciplina operacional. São seis critérios, uma régua transparente e 100 pontos em jogo."
          />
          <div className="criteria-grid">
            {criteria.map((criterion, index) => (
              <article key={criterion.title} className="criterion-card reveal" style={{ transitionDelay: `${index * 70}ms` }}>
                <span>{criterion.number}</span><div className="criterion-score">{criterion.points}</div>
                <h3>{criterion.title}</h3><p>{criterion.rule}</p>
              </article>
            ))}
          </div>
          <ScoreFormula />
        </div>
      </section>

      <ConsolidatedSection />
      <OperatorSection />
      <PodiumSection />
      <EconomySection />
      <ContinuitySection />
      <PartnersSection />
    </main>
  );
}
